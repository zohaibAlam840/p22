# ENGINEERING_NOTES.md

## 1) How RLS is structured and how I validated it

I structured RLS around a single rule: every row that belongs to a tenant must be scoped by `org_id`, and access decisions must be made inside Postgres (not in the UI). I implemented two helper functions that all policies reuse:

- `is_org_member(org_id, auth.uid())` for read access
- `has_org_role_at_least(org_id, auth.uid(), <ROLE>)` for write access

From there, each table has a consistent pattern:

- **SELECT**: allowed if the user is a member of the row’s org (`is_org_member`)
- **INSERT/UPDATE/DELETE**: allowed only if the user has the required minimum role (`has_org_role_at_least`)
- Extra “safety checks” are enforced using `WITH CHECK` (e.g., for `tickets`, insert requires `created_by = auth.uid()`)

Validation:
- I tested with **two different users** in **two different orgs**.
- I confirmed that a user can’t read tickets/tags/audit logs from another org even if they guess UUIDs.
- I also tested negative cases (inserts/updates) to confirm Postgres blocks them with an RLS error when:
  - the user is not a member of the org
  - the user is a member but does not have the required role
  - `created_by` doesn’t match `auth.uid()` for ticket creation
- For audit logs, I verified that UPDATE/DELETE are blocked by triggers, so logs stay append-only.

## 2) How realtime subscriptions avoid leaking data across organizations

Realtime isolation is handled the same way as normal reads: by RLS. Since the subscription reads rows from Postgres, any row that fails the SELECT policy will not be visible to the subscriber.

Practically:
- I only subscribe to tables that have a strict `SELECT` policy using `is_org_member(org_id, auth.uid())`.
- On the client, I scope subscriptions by org (for example, subscribe to `tickets` where `org_id = currentOrgId`). This is not the main security control (RLS is), but it reduces noise and avoids accidentally listening to the whole table.
- If a user is not in an org, they simply receive no events for that org, because the database won’t allow those rows to be read.

I validated this by running two sessions (two users, two orgs) and confirming that realtime events from org A never appear in org B’s session, even when both users are subscribed at the same time.

## 3) Search strategy and indexes added (and why)

Search is implemented using a `tsvector` column on `tickets` (`search_tsv`) and a GIN index. The goal is to keep searches fast even when there are tens of thousands of rows.

Indexes used for search and common filters:
- `tickets_search_tsv_idx` (GIN on `tickets.search_tsv`)  
  This supports full-text search across the ticket content.
- `tickets_org_id_updated_idx` (BTREE on `(org_id, updated_at DESC, id DESC)`)  
  This supports “latest tickets” and stable cursor pagination.
- Filter indexes:
  - `(org_id, status)`
  - `(org_id, severity)`
  - `(org_id, assignee_id)`

For comments, I also used a partial GIN index:
- `ticket_events_comment_search_idx` on `to_tsvector(body)` where `type = 'COMMENT'`  
  This keeps the index smaller and focused on the only event type that needs text search.

The reason for these indexes is that the most common query shapes are org-scoped and then filtered/sorted (status/severity/assignee, ordered by updated date). Without org-first compound indexes, Postgres ends up scanning too much.

## 4) Cursor pagination design (cursor fields and edge cases)

I used a cursor approach that is stable under inserts/updates by ordering with a deterministic tuple:

- Primary sort: `updated_at DESC`
- Tie-breaker: `id DESC`

The cursor includes both values: `(updated_at, id)`.  
For “next page,” the query uses a strict boundary:

- Fetch rows where `(updated_at, id) < (cursor_updated_at, cursor_id)` in the same ordering.

This avoids duplicates and missing rows in most normal situations.

Edge cases:
- **Many rows with same updated_at**: handled by the `id` tie-breaker.
- **Rows updated while paging**: because tickets can move in ordering, you can see a ticket again if it gets updated between page requests. That’s expected behavior in cursor pagination for mutable sorts. If this becomes an issue, I would paginate on immutable `(created_at, id)` for list views where “updated order” isn’t required, or I would store a “list snapshot” timestamp.
- **Deleted rows**: not a correctness issue; it just reduces results.
- **Status transitions**: changing status can move tickets between filtered lists; the cursor remains correct per list query, but a ticket may “disappear” from one list and show up in another (expected).

## 5) Expected bottlenecks at larger scale and next improvements

Where I expect pressure at higher scale:
- **Ticket search**: full-text search can get heavy with millions of tickets. The GIN index helps a lot, but query design matters (org_id filtering, limiting returned fields).
- **Audit logs growth**: `audit_logs` is append-only; it will grow indefinitely. Even with `(org_id, created_at)` index, large orgs could accumulate a lot of rows.
- **Realtime fan-out**: if many users subscribe to high-churn tables (tickets/events), it can increase load.
- **Joins for derived views**: `ticket_tags` joins and event timelines can get expensive if not queried carefully.

Improvements I would do next:
- Partition `audit_logs` by time (monthly) or by org (if needed), or implement retention policies (e.g., archive after N days).
- Add more targeted indexes based on observed query patterns (for example `(org_id, status, updated_at DESC)` if that’s the most common list view).
- For search, consider prefix search strategy or trigram index (`pg_trgm`) if users expect partial keyword matching and performance degrades.
- Add caching for “hot” lists (like top 50 recent tickets per org).
- Improve seed tooling and add performance test queries into scripts.

## 6) What I intentionally did not build within the timeline and why

To keep the scope realistic, I focused on correctness, tenant isolation, and core flows. Things I intentionally did not complete:

- **Full org invitation acceptance flow** (email delivery, token verification UI): the DB table exists (`org_invites`), but production-grade email invite flows take more time to implement and test.
- **Fine-grained permissions beyond role thresholds**: roles are enough for the take-home; a real system might need per-resource or per-field permissions.
- **Comprehensive audit coverage for every write action**: I set up the audit table + append-only guard and added creation audits via RPC, but I did not instrument every possible update path (tags change, status change, attachment add/remove) to emit audit entries in all cases.
- **File uploads to Supabase Storage end-to-end**: the attachments table and RLS are prepared, but a production upload pipeline (signed URLs, antivirus, lifecycle cleanup) is larger than the take-home timeframe.
- **Hardening for abuse limits** (rate limiting, spam protection): this is important in production, but out of scope for the time limit.

The main reason is time: I prioritized the pieces that are hardest to retrofit later (schema, RLS, indexes, and safe server-side writes) over UI polish and optional flows.
