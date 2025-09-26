/** @format */
"use server";

import prisma from "@/lib/prisma";

/**
 * Satın alma kaydı ekle
 */
export async function addPurchaseAction(
  userId: string,
  companyId: string,
  items: { productId?: number; quantity: number; totalPrice: number; cashbackEarned: number }[]
) {
  try {
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.purchase.create({
          data: {
            userId,
            companyId,
            productId: item.productId ?? null,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            cashbackEarned: item.cashbackEarned,
          },
        });
      }
    });

    return { success: true, message: "Satın alma kaydedildi" };
  } catch (err) {
    console.error("addPurchaseAction error:", err);
    return { success: false, message: "Satın alma kaydedilemedi" };
  }
}

/**
 * Kullanıcının toplam cashback miktarını getir
 */
export async function getUserCashbackAction(userId: string, companyId: string) {
  try {
    const total = await prisma.purchase.aggregate({
      where: { userId, companyId },
      _sum: { cashbackEarned: true },
    });

    return { success: true, totalCashback: total._sum.cashbackEarned ?? 0 };
  } catch (error) {
    console.error("getUserCashbackAction error:", error);
    return { success: false, totalCashback: 0 };
  }
}

/**
 * Cashback harcama (kullanıcının bakiyesinden düş)
 */
export async function spendCashbackAction(
  userId: string,
  companyId: string,
  amount: number,
  productId?: number,
  quantity?: number,
  price?: number
) {
  if (!userId || !companyId || amount <= 0) {
    return { success: false, message: "Geçersiz işlem" };
  }

  try {
    const total = await prisma.purchase.aggregate({
      where: { userId, companyId },
      _sum: { cashbackEarned: true },
    });

    const currentCashback = total._sum.cashbackEarned ?? 0;

    if (currentCashback < amount) {
      return { success: false, message: "Yetersiz bakiye" };
    }

    await prisma.pointsUsage.create({
      data: {
        amount,
        quantity: quantity ?? 1,
        price: price ?? 0,
        userId,
        companyId,
        productId: productId ?? null,
      },
    });

    return {
      success: true,
      message: "Nakit iade kullanıldı",
      totalCashback: currentCashback - amount,
    };
  } catch (err) {
    console.error("spendCashbackAction error:", err);
    return { success: false, message: "Bir hata oluştu" };
  }
}
