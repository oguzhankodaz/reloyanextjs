"use server";

import prisma from "@/lib/prisma";

export async function addPurchaseAction(
  userId: string,
  companyId: string,
  items: { productId: number; quantity: number }[]
) {
  try {
    return await prisma.$transaction(async (tx) => {
      // ürünleri DB’den çek
      const products = await tx.product.findMany({
        where: { id: { in: items.map((i) => i.productId) } },
        select: { id: true, price: true, pointsOnSell: true },
      });

      // satın alma kayıtları
      const purchaseData = items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) throw new Error("Ürün bulunamadı");

        return {
          userId,
          companyId,
          productId: product.id,
          quantity: item.quantity,
          totalPrice: product.price * item.quantity,
          pointsEarned: product.pointsOnSell * item.quantity,
        };
      });

      // toplu ekleme
      await tx.purchase.createMany({ data: purchaseData });

      // toplam puanı hesapla
      const totalEarned = purchaseData.reduce(
        (sum, p) => sum + p.pointsEarned,
        0
      );

      // puan güncelle
      await tx.userPoints.upsert({
        where: { userId_companyId: { userId, companyId } },
        update: { totalPoints: { increment: totalEarned } },
        create: { userId, companyId, totalPoints: totalEarned },
      });

      return { success: true, earned: totalEarned };
    });
  } catch (error) {
    console.error("addPurchaseAction error", error);
    return { success: false, message: "Satın alma işlemi başarısız oldu." };
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