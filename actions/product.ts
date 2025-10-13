
'use server'
/** @format */

import prisma from "@/lib/prisma";
import { requireCompany, verifyCompanyOwnership } from "@/lib/authorization";


// Ürün oluştur
export async function createProduct(data: {
  name: string;
  price: number;
  cashback: number;
  companyId: string;
}) {
  try {
    // ✅ Authorization kontrolü
    await verifyCompanyOwnership(data.companyId);

    // ✅ Input validation
    if (!data.name || data.name.trim().length < 2) {
      return { success: false, message: "Ürün adı en az 2 karakter olmalıdır." };
    }
    if (data.price <= 0) {
      return { success: false, message: "Fiyat 0'dan büyük olmalıdır." };
    }
    if (data.cashback < 0) {
      return { success: false, message: "Cashback negatif olamaz." };
    }

    const product = await prisma.product.create({
      data: {
        name: data.name.trim(),
        price: data.price,
        cashback: data.cashback,
        companyId: data.companyId,
      },
    });
    return { success: true, product };
  } catch (error) {
    console.error("createProduct error:", error);
    const message = error instanceof Error ? error.message : "Ürün eklenemedi.";
    return { success: false, message };
  }
}

// Şirket ürünleri
export async function getProductsByCompanyAction(companyId: string) {
  try {
    // ✅ Authorization kontrolü
    await verifyCompanyOwnership(companyId);

    const products = await prisma.product.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, products };
  } catch (error) {
    console.error("getProductsByCompanyAction error:", error);
    const message = error instanceof Error ? error.message : "Ürünler getirilemedi.";
    return { success: false, products: [], message };
  }
}

// Ürün sil
export async function deleteProductAction(productId: number) {
  try {
    // ✅ Authorization kontrolü - Sadece ürün sahibi silebilir
    const company = await requireCompany();
    
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { companyId: true },
    });

    if (!product) {
      return { success: false, message: "Ürün bulunamadı." };
    }

    if (product.companyId !== company.companyId) {
      return { success: false, message: "Bu ürünü silme yetkiniz yok." };
    }

    await prisma.product.delete({ where: { id: productId } });
    return { success: true };
  } catch (error) {
    console.error("deleteProductAction error:", error);
    const message = error instanceof Error ? error.message : "Ürün silinemedi.";
    return { success: false, message };
  }
}


