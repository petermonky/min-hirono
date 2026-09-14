import { NextResponse } from "next/server";
import { allReleasedItemIds } from "@/lib/catalog";
import {
  addOwnedCollectibles,
  getOwnedCollectibleIds,
  removeOwnedCollectibles,
  setCollectibleOwned,
} from "@/lib/collection-store";
import { hasValidSession } from "@/lib/session";

const unauthorized = () => NextResponse.json({ error: "Archive locked." }, { status: 401 });
const invalid = () => NextResponse.json({ error: "Invalid collection update." }, { status: 400 });

function validItemIds(value: unknown) {
  if (!Array.isArray(value) || value.length > allReleasedItemIds.size) return null;
  if (!value.every((id): id is string => typeof id === "string" && allReleasedItemIds.has(id))) return null;
  return [...new Set(value)];
}
export async function GET() {
  if (!(await hasValidSession())) return unauthorized();
  try {
    return NextResponse.json({ owned: await getOwnedCollectibleIds() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load the collection." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  if (!(await hasValidSession())) return unauthorized();
  try {
    const payload = await request.json();
    if (typeof payload.itemId !== "string" || !allReleasedItemIds.has(payload.itemId) || typeof payload.owned !== "boolean") return invalid();
    await setCollectibleOwned(payload.itemId, payload.owned);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not save that collectible." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!(await hasValidSession())) return unauthorized();
  try {
    const payload = await request.json();
    const itemIds = validItemIds(payload.owned);
    if (!itemIds) return invalid();
    await addOwnedCollectibles(itemIds);
    return NextResponse.json({ owned: await getOwnedCollectibleIds() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not move the saved collection." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  if (!(await hasValidSession())) return unauthorized();
  try {
    const payload = await request.json();
    if (payload.all === true) {
      await removeOwnedCollectibles();
    } else {
      const itemIds = validItemIds(payload.itemIds);
      if (!itemIds) return invalid();
      await removeOwnedCollectibles(itemIds);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not clear the collection." }, { status: 503 });
  }
}
