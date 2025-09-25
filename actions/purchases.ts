"use server";
// purchases.ts
import prisma from "@/lib/prisma";

export async function addPurchaseAction(
  userId: string,
  companyId: string,
  purchases: { productId?: number; quantity?: number; totalSpend?: number; points?: number }[]
) {
  try {
    return await prisma.$transaction(async (tx) => {
      for (const p of purchases) {
        if (p.productId) {
          // ✅ Ürün bazlı satın alma
          const product = await tx.product.findUnique({
            where: { id: p.productId },
          });
          if (!product) throw new Error("Ürün bulunamadı");

          const qty = p.quantity ?? 1;
          const totalPrice = product.price * qty;
          const earned = product.pointsOnSell * qty;

          await tx.purchase.create({
            data: {
              userId,
              companyId,
              productId: p.productId,
              quantity: qty,
              totalPrice,
              pointsEarned: earned,
            },
          });

          await tx.userPoints.upsert({
            where: { userId_companyId: { userId, companyId } },
            create: { userId, companyId, totalPoints: earned },
            update: { totalPoints: { increment: earned } },
          });
        } else if (p.totalSpend && p.points) {
          // ✅ Toplam harcama bazlı kayıt
          await tx.purchase.create({
            data: {
              userId,
              companyId,
              totalPrice: p.totalSpend,
              pointsEarned: p.points,
              quantity: 1, // default
            },
          });

          await tx.userPoints.upsert({
            where: { userId_companyId: { userId, companyId } },
            create: { userId, companyId, totalPoints: p.points },
            update: { totalPoints: { increment: p.points } },
          });
        }
      }

      return { success: true };
    });
  } catch (err) {
    console.error("addPurchaseAction error:", err);
    return { success: false, message: "Satın alma kaydedilemedi." };
  }
}
