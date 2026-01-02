# Next.js + Supabase Take-Home (Org-Scoped Ticketing)

This project is a multi-tenant (organization-scoped) ticketing app built with Next.js (App Router) and Supabase Postgres. Data isolation is enforced at the database level using Row Level Security (RLS). Realtime and reads are scoped by `org_id`.

## Screenshots / Visuals

### Schema 
![Schema](./docs/assets/p3.png)

### App UI
![Dashboard](./docs/assets/p1.png)
![Dashboard](./docs/assets/p2.png)

## Tech Stack

- Next.js (App Router)
- Supabase (Postgres + Auth )
- Postgres RLS policies for tenant isolation
- SQL migrations under `supabase/migrations/`
- Node seed script to generate >= 10,000 tickets

---

## Features Implemented

- Organizations and memberships (roles: OWNER, ADMIN, MEMBER, VIEWER)
- Tickets with status transitions (OPEN → INVESTIGATING → MITIGATED → RESOLVED)
- Tags
- Ticket timeline/events and tag linking (ticket_tags)
- Attachments metadata table (storage integration depends on your UI)
- Audit logs (append-only via triggers; viewable via RLS)

> Note: Organization creation must be performed via server-side logic or RPC if you keep no INSERT policy on `organizations`.

---

## Repository Structure (typical)

- `app/` – Next.js routes and pages
- `components/` – UI components and dialogs
- `lib/` – Supabase client wrappers, API helpers, validators
- `supabase/migrations/` – SQL migrations (schema, functions, triggers, RLS, indexes)
- `scripts/seedTickets.js` – Seed script to generate >= 10,000 tickets

---

## Prerequisites

- Node.js 18+ (recommended)
- A Supabase project (hosted) OR Supabase CLI for local development
- Access to your Supabase Postgres connection string (DATABASE_URL)

---

## Environment Variables

Create a `.env.local` (for Next.js) and a `.env` (for scripts), or use one file if you prefer.

### `.env.example`

```env
# Next.js
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase client (browser)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

# Server-only (do NOT expose to browser)
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

# Postgres connection string (used by seed script and/or prisma tools if applicable)
# Important: include sslmode=require for Supabase hosted
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/postgres?schema=public&sslmode=require

# Seeding
# Use a real auth user UUID from Supabase Auth -> Users (so seeded tickets are visible via RLS)
SEED_USER_ID=00000000-0000-0000-0000-000000000000
SEED_TICKETS_COUNT=10000
SEED_ORG_NAME="Seed Org"

# If using NextAuth (only if your repo uses it)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace_with_a_long_random_string
