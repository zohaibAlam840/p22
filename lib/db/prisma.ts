// import { PrismaClient } from "@prisma/client";
// import { PrismaPg } from "@prisma/adapter-pg";
// import { Pool } from "pg";
// import fs from "fs";
// import path from "path";

// const globalForPrisma = globalThis as unknown as {
//   prisma?: PrismaClient;
//   pgPool?: Pool;
// };

// function loadPem(): string {
//   // Prefer env var (Vercel)
//   const envPem = process.env.RDS_CA_PEM;
//   if (envPem && envPem.trim().length > 0) return envPem;

//   // Prefer region bundle (local)
//   const regionPath = path.join(process.cwd(), "certs", "eu-north-1-bundle.pem");
//   if (fs.existsSync(regionPath)) return fs.readFileSync(regionPath, "utf8");

//   // Fallback: global bundle (local)
//   const globalPath = path.join(process.cwd(), "certs", "global-bundle.pem");
//   if (fs.existsSync(globalPath)) return fs.readFileSync(globalPath, "utf8");

//   throw new Error("Missing RDS CA bundle. Add certs/eu-north-1-bundle.pem or set RDS_CA_PEM.");
// }

// // Split bundle into array of PEM certs (more reliable)
// function pemToCaArray(pem: string): string[] {
//   const normalized = pem.replace(/\r\n/g, "\n").trim();
//   const parts = normalized
//     .split(/(?=-----BEGIN CERTIFICATE-----)/g)
//     .map((p) => p.trim())
//     .filter(Boolean);

//   // sanity check
//   if (parts.length === 0 || !parts[0].includes("BEGIN CERTIFICATE")) {
//     throw new Error("CA bundle parse failed (no certificates found). Check PEM encoding/contents.");
//   }
//   return parts;
// }

// const caPem = loadPem();
// const ca = pemToCaArray(caPem);

// // IMPORTANT: keep DATABASE_URL clean (no sslmode params needed)
// const pgPool =
//   globalForPrisma.pgPool ??
//   new Pool({
//     connectionString: process.env.DATABASE_URL,
//     ssl: {
//       ca,
//       rejectUnauthorized: true,
//     },
//   });

// if (process.env.NODE_ENV !== "production") globalForPrisma.pgPool = pgPool;

// export const prisma =
//   globalForPrisma.prisma ??
//   new PrismaClient({
//     adapter: new PrismaPg(pgPool),
//     log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
//   });

// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;


import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import fs from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

function loadPemBundle(): string {
  // 1) Vercel recommended: base64-encoded bundle
  const b64 = process.env.RDS_CA_PEM_B64;
  if (b64 && b64.trim().length > 0) {
    return Buffer.from(b64, "base64").toString("utf8");
  }

  // 2) Optional: raw PEM (if you decide to store it directly)
  const raw = process.env.RDS_CA_PEM;
  if (raw && raw.trim().length > 0) {
    // Support env values saved with literal "\n"
    return raw.includes("\\n") ? raw.replace(/\\n/g, "\n") : raw;
  }

  // 3) Local dev fallback: read from repo files
  const regionPath = path.join(process.cwd(), "certs", "eu-north-1-bundle.pem");
  if (fs.existsSync(regionPath)) return fs.readFileSync(regionPath, "utf8");

  const globalPath = path.join(process.cwd(), "certs", "global-bundle.pem");
  if (fs.existsSync(globalPath)) return fs.readFileSync(globalPath, "utf8");

  throw new Error(
    "Missing RDS CA bundle. Set RDS_CA_PEM_B64 (recommended) or RDS_CA_PEM, or add certs/*.pem locally."
  );
}

// Split bundle into an array of PEM certs (pg is happier with this)
function pemToCaArray(pem: string): string[] {
  const normalized = pem.replace(/\r\n/g, "\n").trim();
  const parts = normalized
    .split(/(?=-----BEGIN CERTIFICATE-----)/g)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 0 || !parts[0].includes("BEGIN CERTIFICATE")) {
    throw new Error("CA bundle parse failed. Check PEM encoding/contents.");
  }
  return parts;
}

const caBundle = loadPemBundle();
const ca = pemToCaArray(caBundle);

// IMPORTANT: keep DATABASE_URL clean (no sslmode required here)
const pgPool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      ca,
      rejectUnauthorized: true,
    },
    // Optional tuning for serverless:
    max: 5,
    idleTimeoutMillis: 10_000,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.pgPool = pgPool;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(pgPool),
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
