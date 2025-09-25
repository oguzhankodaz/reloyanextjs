/** @format */

"use server";
import prisma from "@/lib/prisma";

// ✅ React Query için kullanılacak helper
export async function createProduct(data: {
  name: string;
  price: number;
  pointsToBuy?: number;
  pointsOnSell?: number;
  categoryId?: number | null;
  companyId: string;
}) {
  try {
    const { name, price, pointsToBuy = 0, pointsOnSell = 0, categoryId = null, companyId } = data;

    if (!name || isNaN(price) || !companyId) {
      return { success: false, message: "Zorunlu alanlar eksik" };
    }

    await prisma.product.create({
      data: { name, price, pointsToBuy, pointsOnSell, companyId, categoryId },
    });

    return { success: true, message: "Ürün başarıyla eklendi 🎉" };
  } catch (error) {
    console.error("createProduct error:", error);
    return { success: false, message: "Ürün eklenirken hata oluştu" };
  }
}

// ✅ Server Action (FormData ile kullanılacak)
export async function createProductAction(prevState: any, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const pointsToBuy = parseInt(formData.get("pointsToBuy") as string) || 0;
    const pointsOnSell = parseInt(formData.get("pointsOnSell") as string) || 0;
    const categoryId = formData.get("categoryId")
      ? parseInt(formData.get("categoryId") as string)
      : null;
    const companyId = formData.get("companyId") as string;

    return await createProduct({ name, price, pointsToBuy, pointsOnSell, categoryId, companyId });
  } catch (error) {
    console.error("createProductAction error:", error);
    return { success: false, message: "Ürün eklenirken hata oluştu" };
  }
}

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

export async function deleteProductAction(productId: number) {
  try {
    await prisma.product.delete({ where: { id: productId } });
    return { success: true, message: "Ürün silindi ✅" };
  } catch (error) {
    console.error("deleteProductAction error:", error);
    return { success: false, message: "Ürün silinemedi ❌" };
  }
}


export async function getCompanyProducts(companyId: string) {
  try {
    return await prisma.product.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        price: true,
        pointsOnSell: true,
        pointsToBuy: true,
      },
    });
  } catch (error) {
    console.error("❌ getCompanyProducts error:", error);
    return [];
  }
}
