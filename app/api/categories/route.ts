import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

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
    return NextResponse.json({ categories: [] }, { status: 200 });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("❌ JWT_SECRET environment variable is not set");
    return NextResponse.json({ categories: [] }, { status: 500 });
  }

  try {
    const decoded = jwt.verify(token, secret) as CompanyPayload;
    const companyId = decoded.companyId;

    const categories = await prisma.category.findMany({
      where: { companyId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("❌ Token verification failed:", error);
    return NextResponse.json({ categories: [] }, { status: 401 });
  }
}

export async function POST(req: Request) {
  const store = await cookies();
  const token = store.get("cmp_sess_z71f8")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("❌ JWT_SECRET environment variable is not set");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  try {
    const decoded = jwt.verify(token, secret) as CompanyPayload;
    const companyId = decoded.companyId;

    const { name } = await req.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Kategori adı gereklidir" },
        { status: 400 }
      );
    }

    // Aynı şirkette aynı isimde kategori var mı kontrol et
    const existingCategory = await prisma.category.findFirst({
      where: {
        companyId,
        name: name.trim(),
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Bu isimde bir kategori zaten mevcut" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        companyId,
      },
    });

    return NextResponse.json({ category });
  } catch (error) {
    console.error("❌ Category creation failed:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
