import { NextResponse } from "next/server";
import { getOwnedCollectibleIds } from "@/lib/collection-store";
import {
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
  verifyCredentials,
} from "@/lib/session";

const attempts = new Map<string, { count: number; resetAt: number }>();
const ATTEMPT_WINDOW = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function requesterId(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "local";
}

function attemptState(id: string) {
  const now = Date.now();
  const current = attempts.get(id);
  if (!current || current.resetAt <= now) {
    const fresh = { count: 0, resetAt: now + ATTEMPT_WINDOW };
    attempts.set(id, fresh);
    return fresh;
  }
  return current;
}

export async function POST(request: Request) {
  const id = requesterId(request);
  const state = attemptState(id);
  if (state.count >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429 });
  }

  let username = "";
  let password = "";
  try {
    const payload = await request.json();
    if (typeof payload.username === "string" && payload.username.length <= 64) username = payload.username;
    if (typeof payload.password === "string" && payload.password.length <= 256) password = payload.password;
  } catch {
    return NextResponse.json({ error: "Enter your username and password." }, { status: 400 });
  }

  try {
    const authenticatedUsername = username && password ? await verifyCredentials(username, password) : null;
    if (!authenticatedUsername) {
      state.count += 1;
      await new Promise((resolve) => setTimeout(resolve, 450));
      return NextResponse.json({ error: "Username or password is incorrect." }, { status: 401 });
    }

    attempts.delete(id);
    await getOwnedCollectibleIds(authenticatedUsername);
    const response = NextResponse.json({ ok: true, username: authenticatedUsername });
    response.cookies.set(SESSION_COOKIE, createSessionToken(authenticatedUsername), sessionCookieOptions);
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "The archive is not configured yet." }, { status: 503 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  return response;
}
