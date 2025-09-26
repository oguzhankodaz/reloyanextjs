/** @format */

"use server";

import prisma from "@/lib/prisma";
import { UserHistory } from "@/lib/types";

/**
 * Kullanıcının toplam nakit iadesini getirir
 */
export async function getUserCashbackAction(userId: string) {
  try {
    // Kazanılan
    const earned = await prisma.purchase.groupBy({
      by: ["companyId"],
      where: { userId },
      _sum: { cashbackEarned: true },
    });

    // Harcanan
    const spent = await prisma.pointsUsage.groupBy({
      by: ["companyId"],
      where: { userId },
      _sum: { amount: true },
    });

    const cashback = await Promise.all(
      earned.map(async (e) => {
        const company = await prisma.company.findUnique({
          where: { id: e.companyId },
          select: { id: true, name: true },
        });

        const spentAmount =
          spent.find((s) => s.companyId === e.companyId)?._sum.amount ?? 0;

        return {
          companyId: e.companyId,
          companyName: company?.name ?? "Bilinmeyen Şirket",
          totalCashback: (e._sum.cashbackEarned ?? 0) - spentAmount, // ✅ net bakiye
        };
      })
    );

    return { success: true, cashback };
  } catch (error) {
    console.error("getUserCashbackAction error:", error);
    return { success: false, cashback: [] };
  }
}

/**
 * Cashback harcama (müşteri TL bakiyesinden düşme)
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
    // Kullanıcının mevcut toplam iadesini hesapla
    const total = await prisma.purchase.aggregate({
      where: { userId, companyId },
      _sum: { cashbackEarned: true },
    });

    const currentCashback = total._sum.cashbackEarned ?? 0;

    if (currentCashback < amount) {
      return { success: false, message: "Yetersiz bakiye" };
    }

    // Cashback harcamasını kaydet (PointsUsage yerine ayrı tabloya taşınabilirdi)
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
      message: "Para puan kullanıldı",
      totalCashback: currentCashback - amount,
    };
  } catch (err) {
    console.error("spendCashbackAction error:", err);
    return { success: false, message: "Bir hata oluştu" };
  }
}

/**
 * Kullanıcının geçmişini getir (alış + iade kullanımı)
 */
export async function getUserHistoryAction(userId: string, companyId: string) {
  try {
    const purchases = await prisma.purchase.findMany({
      where: { userId, companyId },
      include: { product: true, company: true }, // ✅ company eklendi
    });

    const usages = await prisma.pointsUsage.findMany({
      where: { userId, companyId },
      include: { product: true, company: true }, // ✅ company eklendi
    });

    const history: UserHistory[] = [
      ...purchases.map((p) => ({
        type: "purchase" as const,
        id: p.id,
        product: p.product?.name ?? "Toplam Harcama",
        company: p.company?.name ?? "-", // ✅ artık var
        quantity: p.quantity,
        totalPrice: p.totalPrice,
        cashbackEarned: p.cashbackEarned,
        date: p.purchaseDate,
      })),
      ...usages.map((u) => ({
        type: "usage" as const,
        id: u.id,
        product: u.product?.name ?? "Para Puan Kullanımı",
        company: u.company?.name ?? "-", // ✅ artık var
        quantity: u.quantity,
        totalPrice: u.price,
        amount: u.amount,
        cashbackEarned: -u.amount,
        date: u.usedAt,
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    return { success: true, history };
  } catch (err) {
    console.error("getUserHistoryAction error:", err);
    return { success: false, history: [] };
  }
}

