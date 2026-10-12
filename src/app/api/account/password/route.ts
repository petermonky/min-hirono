import { NextResponse } from "next/server";
import { getSession, updateAccountPassword } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Archive locked." }, { status: 401 });

  try {
    const payload = await request.json();
    const password = typeof payload.password === "string" ? payload.password : "";
    const confirmation = typeof payload.confirmPassword === "string" ? payload.confirmPassword : "";

    if (password.length < 6 || password.length > 256) {
      return NextResponse.json({ error: "Password must be between 6 and 256 characters." }, { status: 400 });
    }
    if (password !== confirmation) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    await updateAccountPassword(session.username, password);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not change your password." }, { status: 503 });
  }
}
