import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const SESSION_COOKIE = "hirono_archive_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export type AccountSession = {
  username: string;
};

function sessionSecret() {
  const value = process.env.HIRONO_SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("HIRONO_SESSION_SECRET must be at least 32 characters long.");
  }
  return value;
}

function signature(encodedUsername: string, expiresAt: string) {
  return createHmac("sha256", sessionSecret())
    .update(`hirono-archive:${encodedUsername}:${expiresAt}`)
    .digest("base64url");
}

export function createSessionToken(username: string) {
  const encodedUsername = Buffer.from(username).toString("base64url");
  const expiresAt = String(Math.floor(Date.now() / 1000) + SESSION_MAX_AGE);
  return `${encodedUsername}.${expiresAt}.${signature(encodedUsername, expiresAt)}`;
}

export function verifySessionToken(token?: string): AccountSession | null {
  if (!token) return null;
  const [encodedUsername, expiresAt, providedSignature, extra] = token.split(".");
  if (!encodedUsername || !expiresAt || !providedSignature || extra) return null;

  const expiry = Number(expiresAt);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isSafeInteger(expiry) || expiry <= now || expiry > now + SESSION_MAX_AGE + 60) return null;

  try {
    const expected = Buffer.from(signature(encodedUsername, expiresAt));
    const provided = Buffer.from(providedSignature);
    if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) return null;

    const username = Buffer.from(encodedUsername, "base64url").toString("utf8");
    if (!username || username.length > 64) return null;
    return { username };
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (!session) return null;

  const { data, error } = await getSupabaseAdmin()
    .from("accounts")
    .select("username")
    .eq("username", session.username)
    .maybeSingle();
  if (error) throw new Error(`Unable to validate the account: ${error.message}`);
  return data ? session : null;
}

export async function verifyCredentials(username: string, password: string) {
  const { data, error } = await getSupabaseAdmin().rpc("verify_account_credentials", {
    p_username: username,
    p_password: password,
  });
  if (error) throw new Error(`Unable to verify the account: ${error.message}`);
  return typeof data === "string" && data ? data : null;
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
  priority: "high" as const,
};
