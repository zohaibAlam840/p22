import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const encoder = new TextEncoder();

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing");
  return encoder.encode(secret);
}

export type SessionPayload = {
  userId: string;
  email: string;
};

export async function signSession(payload: SessionPayload) {
  const secret = getSecret();

  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySession(token: string): Promise<JWTPayload> {
  const secret = getSecret();
  const { payload } = await jwtVerify(token, secret);
  return payload;
}
