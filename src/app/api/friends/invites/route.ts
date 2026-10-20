import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

async function handle(request: Request, respond: boolean) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  let payload;
  try { payload = await request.json(); } catch { return NextResponse.json({ error: "Invalid invitation." }, { status: 400 }); }
  if (!payload || (respond
    ? typeof payload.id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.id) || !["accept", "reject"].includes(payload.action)
    : typeof payload.username !== "string" || !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(payload.username))) {
    return NextResponse.json({ error: "Invalid invitation." }, { status: 400 });
  }
  const { data, error } = respond
    ? await getSupabaseAdmin().rpc("respond_to_friend_invite", { p_actor: session.username, p_invite_id: payload.id, p_accept: payload.action === "accept" })
    : await getSupabaseAdmin().rpc("send_friend_invite", { p_actor: session.username, p_recipient: payload.username });
  if (error) {
    const status = error.code === "22023" ? 400 : error.code === "P0002" ? 404 : error.code === "23505" ? 409 : 503;
    if (status === 503) console.error(error);
    return NextResponse.json({ error: status === 409 ? "You’re already friends or have a pending invite. Refresh to see the latest status." : status === 400 ? "You can’t invite yourself." : status === 404 ? "User not found." : "Could not update the invitation." }, { status });
  }
  if (respond && !data) return NextResponse.json({ error: "This invite is no longer available." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) { return handle(request, false); }
export async function PATCH(request: Request) { return handle(request, true); }
