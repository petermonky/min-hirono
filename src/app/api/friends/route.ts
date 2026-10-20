import { NextResponse } from "next/server";
import { getFriendsDirectory } from "@/lib/friends-store";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  try {
    return NextResponse.json(await getFriendsDirectory(session.username));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load your friends." }, { status: 503 });
  }
}
