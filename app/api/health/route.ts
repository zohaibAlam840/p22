import { NextResponse } from "next/server";

export const runtime = "nodejs";

function decodeCaBundle() {
  const b64 = process.env.RDS_CA_PEM_B64;
  if (!b64) return null;

  // Trim to avoid accidental leading/trailing whitespace
  const decoded = Buffer.from(b64.trim(), "base64").toString("utf8");
  return decoded;
}

export async function GET() {
  const caBundle = decodeCaBundle();

  return NextResponse.json({
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasJwtSecret: Boolean(process.env.JWT_SECRET),
    hasRdsCaPemB64: Boolean(process.env.RDS_CA_PEM_B64),
    nodeEnv: process.env.NODE_ENV,

    // TLS diagnostics (safe-ish)
    caDecoded: Boolean(caBundle),
    caLength: caBundle?.length ?? 0,
    caStartsWith: caBundle ? caBundle.slice(0, 30) : null, // should be "-----BEGIN CERTIFICATE-----"
    caHasBegin: caBundle ? caBundle.includes("BEGIN CERTIFICATE") : false,
    certCount: caBundle ? (caBundle.match(/BEGIN CERTIFICATE/g) || []).length : 0,
  });
}
