/* scripts/seedTickets.js */
require("dotenv/config");

const { Client } = require("pg");
const crypto = require("crypto");

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  const DATABASE_URL = process.env.DATABASE_URL;
  const SEED_USER_ID = process.env.SEED_USER_ID;
  const COUNT = Number(process.env.SEED_TICKETS_COUNT || "10000");
  const ORG_NAME = process.env.SEED_ORG_NAME || "Seed Org";

  if (!DATABASE_URL) throw new Error("DATABASE_URL is required");
  if (!SEED_USER_ID) throw new Error("SEED_USER_ID is required (auth user uuid)");
  if (!Number.isFinite(COUNT) || COUNT < 1) throw new Error("SEED_TICKETS_COUNT must be >= 1");

  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  // Use a transaction for consistency
  await client.query("begin");
  try {
    // 1) Create org
    const orgRes = await client.query(
      `
      insert into public.organizations (id, name, created_by, created_at, updated_at)
      values (gen_random_uuid(), $1, $2, now(), now())
      returning id
      `,
      [ORG_NAME, SEED_USER_ID]
    );
    const orgId = orgRes.rows[0].id;

    // 2) Add membership (OWNER)
    await client.query(
      `
      insert into public.org_memberships (id, org_id, user_id, role, created_at)
      values (gen_random_uuid(), $1, $2, 'OWNER'::public.org_role, now())
      on conflict (org_id, user_id) do update set role = excluded.role
      `,
      [orgId, SEED_USER_ID]
    );

    // 3) Bulk insert tickets
    const statuses = ["OPEN", "INVESTIGATING", "MITIGATED", "RESOLVED"];
    const words = ["Login", "Billing", "UI", "Crash", "Performance", "Export", "Search", "Upload", "Sync", "Webhook"];

    const batchSize = 1000;
    let inserted = 0;

    while (inserted < COUNT) {
      const batchCount = Math.min(batchSize, COUNT - inserted);

      // Build VALUES with parameter placeholders
      // columns: id, org_id, title, description, severity, status, created_by, assignee_id, created_at, updated_at, search_tsv
      const values = [];
      const params = [];
      let p = 1;

      for (let i = 0; i < batchCount; i++) {
        const id = crypto.randomUUID();
        const title = `${pick(words)} issue #${inserted + i + 1}`;
        const desc = `Seeded ticket generated for load testing. Ref=${inserted + i + 1}`;
        const severity = randInt(1, 5);
        const status = pick(statuses);
        const createdAt = daysAgo(randInt(0, 90));
        const updatedAt = new Date(createdAt.getTime() + randInt(0, 10) * 3600 * 1000);

        // search_tsv is optional; we populate it to match your GIN index use-case
        values.push(
          `(
            $${p++}::uuid,  -- id
            $${p++}::uuid,  -- org_id
            $${p++}::text,  -- title
            $${p++}::text,  -- description
            $${p++}::int,   -- severity
            $${p++}::public.ticket_status, -- status
            $${p++}::uuid,  -- created_by
            null::uuid,     -- assignee_id
            $${p++}::timestamptz, -- created_at
            $${p++}::timestamptz, -- updated_at
            to_tsvector('english', $${p++}::text) -- search_tsv
          )`
        );

        const searchText = `${title} ${desc}`;

        params.push(
          id,
          orgId,
          title,
          desc,
          severity,
          status,
          SEED_USER_ID,
          createdAt.toISOString(),
          updatedAt.toISOString(),
          searchText
        );
      }

      await client.query(
        `
        insert into public.tickets
          (id, org_id, title, description, severity, status, created_by, assignee_id, created_at, updated_at, search_tsv)
        values
          ${values.join(",\n")}
        `,
        params
      );

      inserted += batchCount;
      process.stdout.write(`Inserted ${inserted}/${COUNT}\r`);
    }

    await client.query("commit");

    console.log("\nSeed complete:");
    console.log("org_id:", orgId);
    console.log("tickets:", COUNT);
    console.log("login user:", SEED_USER_ID);
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
