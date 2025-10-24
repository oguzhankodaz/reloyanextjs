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

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
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
    const { id } = await context.params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: "Geçersiz kategori ID" },
        { status: 400 }
      );
    }

    // Kategoriyi ve bağlı ürünleri sil
    await prisma.$transaction(async (tx) => {
      // Önce bu kategorideki tüm ürünleri sil
      await tx.product.deleteMany({
        where: {
          categoryId: categoryId,
          companyId: companyId,
        },
      });

      // Sonra kategoriyi sil
      await tx.category.delete({
        where: {
          id: categoryId,
          companyId: companyId,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Category deletion failed:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
