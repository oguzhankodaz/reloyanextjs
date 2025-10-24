import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

interface CompanyPayload extends jwt.JwtPayload {
  companyId: string;
  email: string;
  name: string;
}

export async function GET() {
  const store = await cookies();
  const cookie = store.get("cmp_sess_z71f8")?.value;

  if (!cookie) {
    return NextResponse.json({ company: null });
  }

  // ✅ JWT_SECRET kontrolü
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("❌ JWT_SECRET environment variable is not set");
    return NextResponse.json({ company: null });
  }

  try {
    const decoded = jwt.verify(cookie, secret) as CompanyPayload;

    return NextResponse.json({
      company: {
        companyId: decoded.companyId,
        email: decoded.email,
        name: decoded.name,
      },
    });
  } catch {
    return NextResponse.json({ company: null });
  }
}

export async function PUT(request: Request) {
  const store = await cookies();
  const cookie = store.get("cmp_sess_z71f8")?.value;

  if (!cookie) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ✅ JWT_SECRET kontrolü
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("❌ JWT_SECRET environment variable is not set");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    const decoded = jwt.verify(cookie, secret) as CompanyPayload;

    const { name } = await request.json();

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Şirket adı en az 2 karakter olmalıdır" },
        { status: 400 }
      );
    }

    // Veritabanında şirket adını güncelle
    const updatedCompany = await prisma.company.update({
      where: { id: decoded.companyId },
      data: { name: name.trim() },
    });

    // Yeni JWT token oluştur (güncel bilgilerle)
    const newToken = jwt.sign(
      {
        companyId: updatedCompany.id,
        email: updatedCompany.email,
        name: updatedCompany.name,
      },
      secret,
      { expiresIn: "7d" }
    );

    // Cookie'yi güncelle
    const response = NextResponse.json({
      success: true,
      company: {
        companyId: updatedCompany.id,
        email: updatedCompany.email,
        name: updatedCompany.name,
      },
    });

    response.cookies.set("cmp_sess_z71f8", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 gün
    });

    return response;
  } catch (error) {
    console.error("Company update error:", error);
    return NextResponse.json(
      { error: "Şirket bilgileri güncellenirken hata oluştu" },
      { status: 500 }
    );
  }
}
