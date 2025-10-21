import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
  }

  try {
    // Şirket var mı ve doğrulanmış mı kontrol et
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, verified: true },
    });

    if (!company) {
      return NextResponse.json({ error: "Şirket bulunamadı" }, { status: 404 });
    }

    if (!company.verified) {
      return NextResponse.json({ error: "Bu şirket henüz doğrulanmamış" }, { status: 403 });
    }

    const categories = await prisma.category.findMany({
      where: { companyId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Public categories fetch error:", error);
    return NextResponse.json({ error: "Kategoriler getirilemedi" }, { status: 500 });
  }
}
