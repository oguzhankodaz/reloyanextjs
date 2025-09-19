"use server";

import prisma from "@/lib/prisma";

export async function addPurchaseAction(
  userId: string,
  companyId: string,
  items: { productId: number; quantity: number }[]
) {
  try {
    if (!items || items.length === 0) {
      return { success: false, message: "Ürün seçilmedi" };
    }

    // Seçilen ürünleri DB’den al
    const products = await prisma.product.findMany({
      where: { id: { in: items.map((i) => i.productId) }, companyId },
    });

    if (products.length === 0) {
      return { success: false, message: "Ürün bulunamadı veya şirkete ait değil" };
    }

    let totalPoints = 0;
    let totalPrice = 0;

    // Transaction başlat
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const product = products.find((p) => p.id === item.productId);
        if (!product) continue;

        const points = product.pointsOnSell * item.quantity;
        const price = product.price * item.quantity;

        totalPoints += points;
        totalPrice += price;

        // Purchase kaydı
        await tx.purchase.create({
          data: {
            userId,
            companyId,
            productId: product.id,
            quantity: item.quantity,
            totalPrice: price,
            pointsEarned: points,
          },
        });
      }

      // UserPoints güncelle veya oluştur
      await tx.userPoints.upsert({
        where: { userId_companyId: { userId, companyId } },
        update: { totalPoints: { increment: totalPoints } },
        create: { userId, companyId, totalPoints },
      });
    });

    return {
      success: true,
      message: "Satın alma kaydedildi ✅",
      totalPoints,
      totalPrice,
    };
  } catch (error) {
    console.error("addPurchaseAction error:", error);
    return { success: false, message: "Satın alma sırasında hata oluştu" };
  }
}


export async function getUserPurchasesAction(userId: string, companyId: string) {
  try {
    const purchases = await prisma.purchase.findMany({
      where: { userId, companyId },
      include: { product: true }, // ürün bilgisi gelsin
      orderBy: { purchaseDate: "desc" },
    });

    return { success: true, purchases };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Satın alımlar alınamadı" };
  }
}