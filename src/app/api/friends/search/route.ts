import { NextResponse } from "next/server";
import { searchUsers } from "@/lib/friends-store";
import { getSession } from "@/lib/session";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const query = (new URL(request.url).searchParams.get("q") || "").trim().toLowerCase();
  if (query.length < 2) return NextResponse.json({ users: [] });
  if (!/^[a-z0-9_-]{2,64}$/.test(query)) return NextResponse.json({ error: "Search using letters, numbers, hyphens, or underscores." }, { status: 400 });
  try {
    return NextResponse.json({ users: await searchUsers(session.username, query) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not search for users." }, { status: 503 });
  }
}
