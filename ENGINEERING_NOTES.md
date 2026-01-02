# ENGINEERING_NOTES.md

## 1) How RLS is structured and how I validated it

I treated RLS as the “real backend.” The UI and API are not trusted for security, so every tenant-owned row is protected by Postgres rules using `org_id`.

I kept it simple and consistent across tables by using two helper functions:

- `is_org_member(org_id, auth.uid())` → used for reads
- `has_org_role_at_least(org_id, auth.uid(), <ROLE>)` → used for writes

Then I followed the same pattern everywhere:

- **SELECT** is allowed if you are a member of that org.
- **INSERT / UPDATE / DELETE** are allowed only if your role meets the minimum required role for that action.
- For inserts, I used **WITH CHECK** for “don’t trust the client” cases. The best example is `tickets`: the policy requires `created_by = auth.uid()`. That prevented a real bug I hit early on where I accidentally inserted tickets on behalf of a different user when testing.

How I validated it (what I actually did, not theoretical):
- I created **two orgs** and used **two different accounts**.
- I logged in as user A and tried to query org B data using guessed UUIDs. It returned nothing (and in some cases threw RLS errors), which is what I wanted.
- I tested the “annoying” cases that usually break systems:
  - user is authenticated but not a member → blocked
  - user is a member but role too low (VIEWER) → blocked
  - ticket insert where `created_by` is not the logged-in user → blocked
- For audit logs, I tested update/delete directly in SQL (and also by mistakes in code). Both were blocked by the append-only trigger, so I couldn’t accidentally “edit history.”

The main thing I learned while building it: if RLS is not consistent across tables, you end up with weird gaps where one join leaks or a detail view fails. Reusing the same functions everywhere kept it stable.

---

## 2) How realtime subscriptions avoid leaking data across organizations

The short version: realtime doesn’t magically become secure just because it’s realtime. It’s secure because the subscription still depends on Postgres reads, and Postgres still enforces RLS.

What I did in practice:
- I only use realtime on tables where the **SELECT policy is strict** (based on `is_org_member(org_id, auth.uid())`).
- In the client, I subscribe using an **org filter** (like “tickets where org_id = currentOrgId”). That’s not the security boundary (RLS is), but it prevents noisy subscriptions and reduces the chance of me subscribing to “everything” by mistake.

How I validated it:
- I opened two browser sessions (incognito helps) logged in as two different users in two different orgs.
- I created tickets in org A and watched org B: nothing showed up.
- I also tried subscribing broadly (no filter) during debugging. Even then, org B still didn’t receive org A rows because RLS blocked them. The filter just makes it cleaner and cheaper.

The main failure mode I’ve seen in other projects is when someone enables realtime but forgets to enable/select policies properly. I avoided that by treating realtime as “SELECT, but live.”

---

## 3) Search strategy and indexes added (and why)

I implemented search the way I usually do for Postgres when the dataset can get large: `tsvector + GIN`.

- `tickets.search_tsv` holds the full-text representation
- `tickets_search_tsv_idx` is a GIN index on that column

Reason: if you try to do `ILIKE '%something%'` at 10k+ rows, it feels okay. At 100k+ it starts feeling slow. At 1M it becomes painful. Full-text search stays usable much longer.

Indexes I added based on the pages I was actually building:
- `tickets_org_id_updated_idx (org_id, updated_at DESC, id DESC)`  
  Because the main listing screens are “tickets for org X ordered by recent activity,” and I needed this for stable cursor pagination too.
- `tickets_org_id_status_idx (org_id, status)`  
  Status filtering is common and it avoids scanning a large org ticket table.
- `tickets_org_id_severity_idx (org_id, severity)` and `tickets_org_id_assignee_idx (org_id, assignee_id)`  
  Same reasoning: common filters, always org-scoped.

For comments search I used:
- `ticket_events_comment_search_idx` as a partial GIN index only for `type='COMMENT'`  
  This is one of those “real-world” tweaks: it keeps the index smaller and stops non-text event rows from bloating it.

If I had more time, I’d also add a computed trigger to keep `search_tsv` updated automatically whenever title/description changes (right now the seed script fills it, and app logic can do it too). But the core index strategy is there.

---

## 4) Cursor pagination design (cursor fields and edge cases)

I used cursor pagination because offset pagination starts to feel slow and inconsistent once you have lots of rows and users are actively writing.

Ordering:
- `updated_at DESC`
- tie-breaker `id DESC`

Cursor payload:
- `cursor_updated_at`
- `cursor_id`

Next page query:
- fetch where `(updated_at, id) < (cursor_updated_at, cursor_id)` with the same ordering

Edge cases I actually ran into while testing:
- A bunch of rows end up with the same `updated_at` (especially during seeding). Without the `id` tie-breaker, pagination duplicated rows between pages.
- Tickets can “jump” between pages if they’re updated while you’re paging (because updated_at changes). That’s expected. If we wanted a paging experience that never changes, we’d paginate on `created_at` or use a snapshot timestamp. For this take-home, stable ordering with tie-breaker is enough.

---

## 5) Where I expect bottlenecks at larger scale and what I’d improve next

If this system grows, these are the first things I’d watch:

- **Audit logs growth**: it’s append-only, which is correct, but it will grow forever. Even with `org_id, created_at` index, large orgs will eventually have heavy audit tables. Next step would be retention/archival or partitioning by time.
- **Search**: GIN is good, but full-text queries plus filters need to be written carefully (org_id first, limit results, avoid returning heavy payloads).
- **Hot lists + realtime**: “tickets updated recently” is a hotspot. If many users are subscribed and updates are frequent, you can create unnecessary load. Next improvement would be smarter subscription scopes and a small caching layer for the top-N lists per org.
- **Join-heavy queries**: ticket timeline + tags + attachments can become expensive if we do it all in one request without careful indexes and limits. Next step would be query tuning and maybe denormalized summary fields for list views.

If I had another iteration, I’d do:
- Partition or archive audit logs
- Add automated `search_tsv` maintenance
- Add a couple more “query-shape” indexes based on real usage (e.g., `(org_id, status, updated_at DESC)` if status pages dominate)
- Add lightweight performance checks in scripts (simple explain/analyze for the most common queries)

---

## 6) What I intentionally did not build within the timeline and why

I focused on the stuff that is painful to retrofit later: RLS correctness, schema, indexes, stable pagination, and audit immutability. Some things I intentionally left incomplete because they expand scope fast:

- **Invite acceptance flow end-to-end**: the table is there (`org_invites`), but a real invite flow needs email delivery, token verification, expiry handling, and UX around it. That’s a whole feature on its own.
- **100% audit coverage**: I added audit capability and made logs append-only, but I didn’t wire audit events into every possible action (tag changes, attachment add/remove, status transitions, etc.). In a real product I’d enforce that via RPCs or triggers so it’s consistent.
- **Full storage upload pipeline**: attachments table exists and is RLS-protected, but production uploads usually require signed URLs, cleanup jobs, and safety checks. For the time limit, I kept it to metadata + policy structure.
- **Rate limiting / abuse controls**: not hard, but it’s another “production hardening” layer that wasn’t required to demonstrate the core architecture.

Basically: I built the secure foundation first. The missing pieces are mostly feature polish and production hardening, which are easier to add once the data model and access control are correct.
