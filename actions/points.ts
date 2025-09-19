/** @format */

"use server";

import prisma from "@/lib/prisma";
import { UserHistory } from "@/lib/types";

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

export async function spendPointsAction(
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

    const history: UserHistory[] = [
      ...purchases.map((p) => ({
        type: "purchase" as const,
        id: p.id,
        product: p.product.name,
        quantity: p.quantity,
        totalPrice: p.totalPrice,
        points: p.pointsEarned,
        date: p.purchaseDate,
      })),
      ...usages.map((u) => ({
        type: "usage" as const,
        id: u.id,
        amount: u.amount,
        points: -u.amount, // negatif puan
        date: u.usedAt,
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    return { success: true, history };
  } catch (err) {
    console.error("getUserHistoryAction error:", err);
    return { success: false, history: [] };
  }
}
