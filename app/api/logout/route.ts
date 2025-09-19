import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const store = await cookies();

  // User session temizle
  store.set("usr_sess_x92h1", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0), // hemen geçersiz olsun
    maxAge: 0,
    path: "/",
  });

  // Company session temizle
  store.set("cmp_sess_z71f8", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    maxAge: 0,
    path: "/",
  });

  return NextResponse.json({ success: true });
}
