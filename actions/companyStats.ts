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

export async function getReportData() {
  try {
    // Toplam müşteri
    const totalCustomers = await prisma.user.count();

    // Dağıtılan puan
    const pointsAgg = await prisma.purchase.aggregate({
      _sum: { pointsEarned: true },
    });

    // En aktif işletme
    const mostActiveCompany = await prisma.company.findFirst({
      orderBy: {
        purchases: {
          _count: "desc",
        },
      },
      include: {
        _count: { select: { purchases: true } },
      },
    });

    // Müşteri Puanları (ilk 10 kişi)
    const customerPoints = await prisma.userPoints.findMany({
      include: { user: true },
      orderBy: { totalPoints: "desc" },
      take: 10,
    });

    // Son işlem bilgisi
    const purchases = await prisma.purchase.findMany({
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
          ? `${lastPurchase.product?.name ?? "Toplam Harcama"} (+${lastPurchase.pointsEarned})`
          : null,
      };
    });

    // Aylık Puan Dağılımı
    const monthlyRaw = await prisma.$queryRaw<{ month: string; total: any }[]>`
      SELECT TO_CHAR("purchaseDate", 'YYYY-MM') as month, SUM("pointsEarned") as total
      FROM "Purchase"
      GROUP BY 1
      ORDER BY 1
    `;

    const monthlyPoints = monthlyRaw.map((m) => ({
      month: m.month,
      points: Number(m.total),
    }));

    // ✅ Puanla alınan ürünlerin toplam fiyatı
    const pointsUsageAgg = await prisma.pointsUsage.aggregate({
      _sum: { price: true },
    });

    return {
      success: true,
      totalCustomers,
      totalPointsGiven: pointsAgg._sum.pointsEarned ?? 0,
      mostActiveCompany,
      customerPoints: customerPointsWithLast,
      monthlyPoints,
      pointsUsageTotal: pointsUsageAgg._sum.price ?? 0,
    };
  } catch (err) {
    console.error("getReportData error:", err);
    return { success: false, message: "Rapor verileri alınamadı." };
  }
}
