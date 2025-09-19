/** @format */
"use server";

import prisma from "@/lib/prisma";

export async function getCompanyStatsAction(companyId: string) {
  try {
    const totalCustomers = await prisma.userPoints.count({
      where: { companyId },
    });

    const todaySales = await prisma.purchase.count({
      where: {
        companyId,
        purchaseDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // Bugünün başı
          lt: new Date(new Date().setHours(23, 59, 59, 999)), // Bugünün sonu
        },
      },
    });

    const totalPoints = await prisma.userPoints.aggregate({
      where: { companyId },
      _sum: { totalPoints: true },
    });

    const productCount = await prisma.product.count({
      where: { companyId },
    });

    return {
      success: true,
      stats: {
        totalCustomers,
        todaySales,
        totalPoints: totalPoints._sum.totalPoints ?? 0,
        productCount,
      },
    };
  } catch (err) {
    console.error("getCompanyStatsAction error:", err);
    return { success: false, stats: null };
  }
}
