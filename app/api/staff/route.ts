/** @format */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

interface CompanyPayload extends jwt.JwtPayload {
  type: string;
  companyId: string;
  email: string;
  name: string;
}

export async function GET() {
  const store = await cookies();
  const token = store.get("cmp_sess_z71f8")?.value;

  if (!token) {
    return NextResponse.json({ staff: [] }, { status: 200 });
  }

  // ✅ JWT_SECRET kontrolü
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("❌ JWT_SECRET environment variable is not set");
    return NextResponse.json({ staff: [] }, { status: 500 });
  }

  try {
    const decoded = jwt.verify(token, secret) as CompanyPayload;
    const companyId = decoded.companyId;

    const staff = await prisma.companyStaff.findMany({
      where: { companyId },
      select: { id: true, name: true, email: true, isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ staff }, { status: 200 });
  } catch {
    return NextResponse.json({ staff: [] }, { status: 200 });
  }
}


