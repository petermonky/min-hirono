import { NextResponse } from "next/server";
import { getOwnedCollectibleIds } from "@/lib/collection-store";
import {
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
  verifyPasscode,
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

  let passcode = "";
  try {
    const payload = await request.json();
    if (typeof payload.passcode === "string" && payload.passcode.length <= 256) passcode = payload.passcode;
  } catch {
    return NextResponse.json({ error: "Enter the archive passcode." }, { status: 400 });
  }

  try {
    if (!verifyPasscode(passcode)) {
      state.count += 1;
      await new Promise((resolve) => setTimeout(resolve, 450));
      return NextResponse.json({ error: "That passcode is not quite right." }, { status: 401 });
    }

    attempts.delete(id);
    await getOwnedCollectibleIds();
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, createSessionToken(), sessionCookieOptions);
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
