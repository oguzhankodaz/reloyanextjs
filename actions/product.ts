
'use server'
/** @format */

import prisma from "@/lib/prisma";


// Ürün oluştur
export async function createProduct(data: {
  name: string;
  price: number;
  cashback: number;
  companyId: string;
}) {
  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        price: data.price,
        cashback: data.cashback,
        companyId: data.companyId,
      },
    });
    return { success: true, product };
  } catch (error) {
    console.error("createProduct error:", error);
    return { success: false, message: "Ürün eklenemedi." };
  }
}

// Şirket ürünleri
export async function getProductsByCompanyAction(companyId: string) {
  try {
    const products = await prisma.product.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, products };
  } catch (error) {
    console.error("getProductsByCompanyAction error:", error);
    return { success: false, products: [] };
  }
}

// Ürün sil
export async function deleteProductAction(productId: number) {
  try {
    await prisma.product.delete({ where: { id: productId } });
    return { success: true };
  } catch (error) {
    console.error("deleteProductAction error:", error);
    return { success: false, message: "Ürün silinemedi." };
  }
}


