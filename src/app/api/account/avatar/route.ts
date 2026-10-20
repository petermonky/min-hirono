import { createHash, randomUUID } from "node:crypto";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
const MAX_UPLOAD = 1024 * 1024;

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return new NextResponse(null, { status: 401 });
  let avatarPath = session.avatarPath;
  const params = new URL(request.url).searchParams;
  const username = params.get("username");
  if (username && username !== session.username) {
    if (!/^[a-z0-9][a-z0-9_-]{0,63}$/.test(username)) return new NextResponse(null, { status: 400 });
    // Profile photos are discoverable by signed-in users through user search.
    // Detailed collections still require a mutual friendship.
    const account = await getSupabaseAdmin().from("accounts").select("avatar_path").eq("username", username).maybeSingle();
    if (account.error) return new NextResponse(null, { status: 503 });
    avatarPath = account.data?.avatar_path ?? null;
  }
  if (!avatarPath) return new NextResponse(null, { status: 404 });
  const version = params.get("v");
  // Never cache a newer photo under a stale version's URL.
  if (version && version !== avatarPath) return new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  const etag = `"${createHash("sha256").update(avatarPath).digest("hex")}"`;
  const headers = {
    "Content-Type": "image/webp",
    "Cache-Control": version ? "private, max-age=86400, must-revalidate" : "private, no-cache",
    "ETag": etag,
    "X-Content-Type-Options": "nosniff",
  };
  // Authenticate first, but avoid downloading from Storage again on revalidation.
  if (request.headers.get("if-none-match")?.split(",").some((value) => {
    const tag = value.trim().replace(/^W\//, "");
    return tag === etag || tag === "*";
  })) return new NextResponse(null, { status: 304, headers });
  const { data, error } = await getSupabaseAdmin().storage.from("avatars").download(avatarPath);
  if (error || !data) return new NextResponse(null, { status: 404 });
  return new NextResponse(data, {
    headers,
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  if (Number(request.headers.get("content-length")) > MAX_UPLOAD + 65536) {
    return NextResponse.json({ error: "Image is too large." }, { status: 413 });
  }

  let image: Buffer;
  try {
    const form = await request.formData();
    const file = form.get("image");
    if (!(file instanceof File) || !file.size || file.size > MAX_UPLOAD) throw new Error("Invalid file");
    const input = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 16_777_216 });
    const metadata = await input.metadata();
    if (!metadata.width || metadata.width !== metadata.height || metadata.pages && metadata.pages > 1) throw new Error("Invalid crop");
    image = await input.rotate().resize(512, 512).webp({ quality: 85 }).toBuffer();
  } catch {
    return NextResponse.json({ error: "Choose a valid image and try cropping it again." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const bucket = admin.storage.from("avatars");
  const path = `${session.username}/${randomUUID()}.webp`;
  try {
    const uploaded = await bucket.upload(path, image, { contentType: "image/webp", upsert: false });
    if (uploaded.error) throw uploaded.error;
    let update = admin.from("accounts").update({ avatar_path: path, updated_at: new Date().toISOString() }).eq("username", session.username);
    update = session.avatarPath ? update.eq("avatar_path", session.avatarPath) : update.is("avatar_path", null);
    const saved = await update.select("username").maybeSingle();
    if (saved.error || !saved.data) {
      await bucket.remove([path]);
      throw saved.error || new Error("Profile changed in another tab. Try again.");
    }
    if (session.avatarPath) {
      const removed = await bucket.remove([session.avatarPath]);
      if (removed.error) console.error("Unable to remove previous avatar", removed.error);
    }
    return NextResponse.json({ avatarPath: path });
  } catch (error) {
    console.error("Unable to save avatar", error);
    return NextResponse.json({ error: "Could not save your profile picture. Please try again." }, { status: 503 });
  }
}
