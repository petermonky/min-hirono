import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "hirono_archive_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

function sessionSecret() {
  const value = process.env.HIRONO_SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("HIRONO_SESSION_SECRET must be at least 32 characters long.");
  }
  return value;
}

function signature(expiresAt: string) {
  return createHmac("sha256", sessionSecret())
    .update(`hirono-archive:${expiresAt}`)
    .digest("base64url");
}

export function createSessionToken() {
  const expiresAt = String(Math.floor(Date.now() / 1000) + SESSION_MAX_AGE);
  return `${expiresAt}.${signature(expiresAt)}`;
}

export function verifySessionToken(token?: string) {
  if (!token) return false;
  const [expiresAt, providedSignature, extra] = token.split(".");
  if (!expiresAt || !providedSignature || extra) return false;

  const expiry = Number(expiresAt);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isSafeInteger(expiry) || expiry <= now || expiry > now + SESSION_MAX_AGE + 60) return false;

  try {
    const expected = Buffer.from(signature(expiresAt));
    const provided = Buffer.from(providedSignature);
    return expected.length === provided.length && timingSafeEqual(expected, provided);
  } catch {
    return false;
  }
}

export async function hasValidSession() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export function verifyPasscode(passcode: string) {
  const expected = process.env.HIRONO_ACCESS_PASSCODE;
  if (!expected) throw new Error("HIRONO_ACCESS_PASSCODE is not configured.");

  const providedHash = createHash("sha256").update(passcode).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(providedHash, expectedHash);
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
  priority: "high" as const,
};
