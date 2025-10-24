/** @format */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

// GET - Şirket ayarlarını getir (hem company hem staff erişebilir)
export async function GET() {
  try {
    const store = await cookies();
    const companyToken = store.get("cmp_sess_z71f8")?.value;
    const staffToken = store.get("stf_sess_91kd2")?.value;

    // ✅ JWT_SECRET kontrolü
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("❌ JWT_SECRET environment variable is not set");
      return NextResponse.json(
        { success: false, message: "Sunucu yapılandırma hatası" },
        { status: 500 }
      );
    }

    let companyId: string | null = null;

    if (companyToken) {
      const decoded = jwt.verify(companyToken, secret) as {
        companyId: string;
      };
      companyId = decoded.companyId;
    } else if (staffToken) {
      const decoded = jwt.verify(staffToken, secret) as {
        companyId: string;
      };
      companyId = decoded.companyId;
    }

    if (!companyId) {
      return NextResponse.json(
        { success: false, message: "Yetkisiz erişim" },
        { status: 401 }
      );
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        cashbackPercentage: true,
      },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, message: "Şirket bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: {
        cashbackPercentage: company.cashbackPercentage,
      },
    });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

// PUT - Şirket ayarlarını güncelle
export async function PUT(req: Request) {
  try {
    const store = await cookies();
    const token = store.get("cmp_sess_z71f8")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Yetkisiz erişim" },
        { status: 401 }
      );
    }

    // ✅ JWT_SECRET kontrolü
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("❌ JWT_SECRET environment variable is not set");
      return NextResponse.json(
        { success: false, message: "Sunucu yapılandırma hatası" },
        { status: 500 }
      );
    }

    const decoded = jwt.verify(token, secret) as {
      companyId: string;
    };

    const body = await req.json();
    const { cashbackPercentage } = body;

    if (
      typeof cashbackPercentage !== "number" ||
      cashbackPercentage < 0 ||
      cashbackPercentage > 100
    ) {
      return NextResponse.json(
        { success: false, message: "Geçersiz yüzde değeri" },
        { status: 400 }
      );
    }

    // Şirket ayarlarını güncelle
    await prisma.company.update({
      where: { id: decoded.companyId },
      data: { cashbackPercentage },
    });

    // Tüm ürünlerin cashback değerlerini yeni orana göre güncelle
    const products = await prisma.product.findMany({
      where: { companyId: decoded.companyId },
      select: { id: true, price: true },
    });

    // Her ürün için yeni cashback değerini hesapla ve güncelle
    for (const product of products) {
      const newCashback = (product.price * cashbackPercentage) / 100;
      await prisma.product.update({
        where: { id: product.id },
        data: { cashback: newCashback },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Ayarlar güncellendi. ${products.length} ürünün cashback değeri yeniden hesaplandı.`,
      updatedProducts: products.length,
    });
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json(
      { success: false, message: "Sunucu hatası" },
      { status: 500 }
    );
  }
}

