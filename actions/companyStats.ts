/** @format */
"use server";

import prisma from "@/lib/prisma";
import { ReportData } from "@/lib/types";

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
    throw new Error("Şirket istatistikleri alınamadı.");
  }
}

export async function getReportData(companyId: string): Promise<ReportData> {
  try {
    // Toplam müşteri (sadece bu şirketin müşterileri)
    const totalCustomers = await prisma.userPoints.count({
      where: { companyId },
    });

    // Dağıtılan puan
    const pointsAgg = await prisma.purchase.aggregate({
      where: { companyId }, // 👈 filtre eklendi
      _sum: { pointsEarned: true },
    });

    // En aktif işletme (bu şirkete özel raporda aslında bu tek şirket olacak)
    const mostActiveCompany = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        _count: { select: { purchases: true } },
      },
    });

    // Müşteri Puanları
    const customerPoints = await prisma.userPoints.findMany({
      where: { companyId },
      include: { user: true },
      orderBy: { totalPoints: "desc" },
      take: 10,
    });

    // Son işlem bilgisi
    const purchases = await prisma.purchase.findMany({
      where: { companyId }, // 👈 filtre
      orderBy: { purchaseDate: "desc" },
      include: { user: true, product: true },
    });

    const customerPointsWithLast = customerPoints.map((cp) => {
      const lastPurchase = purchases.find((p) => p.userId === cp.userId);
      return {
        id: cp.id,
        userId: cp.userId,
        totalPoints: cp.totalPoints,
        user: cp.user,
        lastAction: lastPurchase
          ? `${lastPurchase.product?.name ?? "Toplam Harcama"} (+${
              lastPurchase.pointsEarned
            })`
          : null,
      };
    });

    // Aylık Puan Dağılımı
    const monthlyRaw = await prisma.$queryRaw<{ month: string; total: any }[]>`
      SELECT TO_CHAR("purchaseDate", 'YYYY-MM') as month, SUM("pointsEarned") as total
      FROM "Purchase"
      WHERE "companyId" = ${companyId}   -- 👈 filtre
      GROUP BY 1
      ORDER BY 1
    `;

    const monthlyPoints = monthlyRaw.map((m) => ({
      month: m.month,
      points: Number(m.total),
    }));

    // Puanla alınan ürünler
    const pointsUsageAgg = await prisma.pointsUsage.aggregate({
      where: { companyId }, // 👈 filtre
      _sum: { price: true },
    });

    return {
      totalCustomers,
      totalPointsGiven: pointsAgg._sum.pointsEarned ?? 0,
      mostActiveCompany,
      customerPoints: customerPointsWithLast,
      monthlyPoints,
      pointsUsageTotal: pointsUsageAgg._sum.price ?? 0,
    };
  } catch (err) {
    console.error("getReportData error:", err);
    throw new Error("Rapor verileri alınamadı.");
  }
}
