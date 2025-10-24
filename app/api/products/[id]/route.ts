import { NextRequest, NextResponse } from "next/server";
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Company token doğrulama
    const store = await cookies();
    const token = store.get("cmp_sess_z71f8")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }

    const decoded = jwt.verify(token, secret) as CompanyPayload;
    if (decoded.type !== "company") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const productId = parseInt(id);
    const body = await request.json();
    const { name, description, price, cashback, categoryId } = body;

    // Validation
    if (!name || !price || !cashback) {
      return NextResponse.json(
        { error: "Name, price, and cashback are required" },
        { status: 400 }
      );
    }

    // Ürünün şirkete ait olduğunu kontrol et
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        companyId: decoded.companyId,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found or not authorized" },
        { status: 404 }
      );
    }

    // Kategori kontrolü (eğer categoryId verilmişse)
    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          companyId: decoded.companyId,
        },
      });

      if (!category) {
        return NextResponse.json(
          { error: "Category not found or not authorized" },
          { status: 404 }
        );
      }
    }

    // Ürünü güncelle
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        cashback: parseFloat(cashback),
        categoryId: categoryId || null,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
