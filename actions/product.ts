
'use server'
/** @format */

import prisma from "@/lib/prisma";
import { requireCompany, verifyCompanyOwnership } from "@/lib/authorization";


// Ürün oluştur
export async function createProduct(data: {
  name: string;
  description?: string;
  categoryId?: number | null;
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

    // Eğer kategori seçildiyse, kategori şirkete ait mi kontrol et
    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: data.categoryId,
          companyId: data.companyId,
        },
      });
      
      if (!category) {
        return { success: false, message: "Geçersiz kategori seçimi." };
      }
    }

    const product = await prisma.product.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        categoryId: data.categoryId || null,
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

// Şirket ürünleri (şirket oturumu gerektirir)
export async function getProductsByCompanyAction(companyId: string) {
  try {
    // ✅ Authorization kontrolü
    await verifyCompanyOwnership(companyId);

    const products = await prisma.product.findMany({
      where: { companyId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, products };
  } catch (error) {
    console.error("getProductsByCompanyAction error:", error);
    const message = error instanceof Error ? error.message : "Ürünler getirilemedi.";
    return { success: false, products: [], message };
  }
}

// Kullanıcılar için şirket ürünleri (oturum gerektirmez)
export async function getCompanyProductsForUsers(companyId: string) {
  try {
    // Şirket var mı kontrol et
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, verified: true },
    });

    if (!company) {
      return { success: false, products: [], message: "Şirket bulunamadı." };
    }

    if (!company.verified) {
      return { success: false, products: [], message: "Bu şirket henüz doğrulanmamış." };
    }

    const products = await prisma.product.findMany({
      where: { companyId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, products, companyName: company.name };
  } catch (error) {
    console.error("getCompanyProductsForUsers error:", error);
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


