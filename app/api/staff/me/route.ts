/** @format */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

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

  try {
    const decoded = jwt.verify(cookie, process.env.JWT_SECRET!) as StaffPayload;

    return NextResponse.json({
      staff: {
        staffId: decoded.staffId,
        email: decoded.email,
        name: decoded.name,
        companyId: decoded.companyId, // 👈 burayı ekledik
      },
    });
  } catch {
    return NextResponse.json({ staff: null });
  }
}
