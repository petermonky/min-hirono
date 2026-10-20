import { NextResponse } from "next/server";
import { releases } from "@/lib/catalog";
import { getSession } from "@/lib/session";
import { getWishlistItemIds, setItemWishlisted } from "@/lib/wishlist-store";

const validIds = new Set(releases.flatMap((release) => release.items.map((item) => item.id)));

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  try {
    return NextResponse.json({ wishlist: await getWishlistItemIds(session.username) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load your wishlist." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  let payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid wishlist update." }, { status: 400 });
  }
  if (!payload || typeof payload.itemId !== "string" || !validIds.has(payload.itemId) || typeof payload.wishlisted !== "boolean") {
    return NextResponse.json({ error: "Invalid wishlist update." }, { status: 400 });
  }
  try {
    await setItemWishlisted(session.username, payload.itemId, payload.wishlisted);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not update your wishlist." }, { status: 503 });
  }
}
