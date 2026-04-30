import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      return NextResponse.json({ success: false, error: "Admin credentials not configured." }, { status: 500 });
    }

    if (username === adminUsername && password === adminPassword) {
      // Simple token: base64 of username:timestamp (MVP — not cryptographic)
      const token = Buffer.from(`${username}:${Date.now()}`).toString("base64");
      return NextResponse.json({ success: true, token });
    }

    return NextResponse.json({ success: false, error: "Kullanıcı adı veya şifre hatalı." }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, error: "Sunucu hatası." }, { status: 500 });
  }
}
