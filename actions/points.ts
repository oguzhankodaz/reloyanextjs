/** @format */

"use server";

import prisma from "@/lib/prisma";

export async function getUserPointsAction(userId: string) {
  try {
    const points = await prisma.userPoints.findMany({
      where: { userId },
      include: {
        company: {
          select: { id: true, name: true }, // işletme bilgisi
        },
      },
      orderBy: {
        totalPoints: "desc", // en çok puanlı şirket üstte
      },
    });

    return { success: true, points };
  } catch (error) {
    console.error("getUserPointsAction error:", error);
    return { success: false, points: [] };
  }
}

export async function usePointsAction(
  userId: string,
  companyId: string,
  pointsToUse: number
) {
  if (!userId || !companyId || pointsToUse <= 0) {
    return { success: false, message: "Geçersiz işlem" };
  }

  try {
    const userPoints = await prisma.userPoints.findUnique({
      where: { userId_companyId: { userId, companyId } },
    });

    if (!userPoints || userPoints.totalPoints < pointsToUse) {
      return { success: false, message: "Yetersiz puan" };
    }

    const updated = await prisma.userPoints.update({
      where: { userId_companyId: { userId, companyId } },
      data: {
        totalPoints: { decrement: pointsToUse },
      },
    });

    // ✅ Kullanım kaydını ekle
    await prisma.pointsUsage.create({
      data: {
        amount: pointsToUse,
        userId,
        companyId,
      },
    });

    return {
      success: true,
      message: "Puan kullanıldı",
      totalPoints: updated.totalPoints,
    };
  } catch (err) {
    console.error("usePointsAction error:", err);
    return { success: false, message: "Bir hata oluştu" };
  }
}




export async function getUserHistoryAction(userId: string, companyId: string) {
  try {
    const purchases = await prisma.purchase.findMany({
      where: { userId, companyId },
      include: { product: true },
    });

    const usages = await prisma.pointsUsage.findMany({
      where: { userId, companyId },
    });

    const history = [
      ...purchases.map((p) => ({
        id: `purchase-${p.id}`,
        type: "purchase",
        product: p.product.name,
        quantity: p.quantity,
        totalPrice: p.totalPrice,
        points: p.pointsEarned,
        date: p.purchaseDate,
      })),
      ...usages.map((u) => ({
        id: `usage-${u.id}`,
        type: "usage",
        product: "🎯 Puan Kullanımı",
        quantity: null,
        totalPrice: null,
        points: -u.amount, // negatif göster
        date: u.usedAt ?? u.usedAt, // kolon adına göre
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { success: true, history };
  } catch (err) {
    console.error("getUserHistoryAction error:", err);
    return { success: false, history: [] };
  }
}
