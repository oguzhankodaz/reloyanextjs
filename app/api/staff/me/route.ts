/** @format */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

interface StaffPayload extends jwt.JwtPayload {
  staffId: string;
  email: string;
  name: string;
  companyId: string; // 👈 burada var
}

export async function GET() {
  const store = await cookies();
  const cookie = store.get("stf_sess_91kd2")?.value;

  if (!cookie) {
    return NextResponse.json({ staff: null });
  }

  // ✅ JWT_SECRET kontrolü
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("❌ JWT_SECRET environment variable is not set");
    return NextResponse.json({ staff: null });
  }

  try {
    const decoded = jwt.verify(cookie, secret) as StaffPayload;

    return NextResponse.json({
      staff: {
        staffId: decoded.staffId,
        email: decoded.email,
        name: decoded.name,
        companyId: decoded.companyId,
      },
    });
  } catch {
    return NextResponse.json({ staff: null });
  }
}
