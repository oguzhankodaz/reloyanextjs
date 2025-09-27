/** @format */
"use server";

import prisma from "@/lib/prisma";
import { ReportData } from "@/lib/types";


export async function getCompanyStatsAction(companyId: string) {
  try {
    const totalCustomers = await prisma.purchase.groupBy({
      by: ["userId"],
      where: { companyId },
    });

    const todaySales = await prisma.purchase.aggregate({
      where: {
        companyId,
        purchaseDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // gün başı
        },
      },
      _sum: { totalPrice: true },
    });

    const totalCashback = await prisma.purchase.aggregate({
      where: { companyId },
      _sum: { cashbackEarned: true },
    });

    const productCount = await prisma.product.count({ where: { companyId } });

    return {
      success: true,
      stats: {
        totalCustomers: totalCustomers.length,
        todaySales: todaySales._sum.totalPrice ?? 0,
        totalCashback: totalCashback._sum.cashbackEarned ?? 0,
        productCount,
      },
    };
  } catch (err) {
    console.error("getCompanyStatsAction error:", err);
    return { success: false, stats: null };
  }
}

export async function getReportData(companyId: string): Promise<ReportData> {
  try {
    const totalCustomers = await prisma.purchase.groupBy({
      by: ["userId"],
      where: { companyId },
    });

    const cashbackAgg = await prisma.purchase.aggregate({
      where: { companyId },
      _sum: { cashbackEarned: true },
    });

    const customerCashback = await prisma.purchase.groupBy({
      by: ["userId"],
      where: { companyId },
      _sum: { cashbackEarned: true },
      orderBy: { _sum: { cashbackEarned: "desc" } },
      take: 10,
    });

    const customerCashbackWithUser = await Promise.all(
      customerCashback.map(async (c) => {
        const user = await prisma.user.findUnique({
          where: { id: c.userId },
          select: { name: true, surname: true },
        });

        const lastPurchase = await prisma.purchase.findFirst({
          where: { userId: c.userId, companyId },
          orderBy: { purchaseDate: "desc" },
          include: { product: true },
        });

        return {
          id: c.userId,
          userId: c.userId,
          totalCashback: c._sum.cashbackEarned ?? 0,
          user: user ?? { name: "Bilinmiyor", surname: null },
          lastAction: lastPurchase
            ? `${lastPurchase.product?.name ?? "Toplam Harcama"} (+${lastPurchase.cashbackEarned}₺)`
            : null,
        };
      })
    );

    const monthlyRaw = await prisma.$queryRaw<{ month: string; total: any }[]>`
      SELECT TO_CHAR("purchaseDate", 'YYYY-MM') as month, SUM("cashbackEarned") as total
      FROM "Purchase"
      WHERE "companyId" = ${companyId}
      GROUP BY 1
      ORDER BY 1
    `;

    const monthlyCashback = monthlyRaw.map((m) => ({
      month: m.month,
      cashback: Number(m.total),
    }));

    const cashbackUsageAgg = await prisma.pointsUsage.aggregate({
      where: { companyId },
      _sum: { amount: true },
    });

    return {
      success: true,
      totalCustomers: totalCustomers.length,
      totalCashbackGiven: cashbackAgg._sum.cashbackEarned ?? 0,
      customerCashback: customerCashbackWithUser,
      monthlyCashback,
      cashbackUsageTotal: cashbackUsageAgg._sum.amount ?? 0,
    };
  } catch (err) {
    console.error("getReportData error:", err);
    throw new Error("Rapor verileri alınamadı.");
  }
}



export async function getCompanyMiniStatsAction(companyId: string) {
  try {
    if (!companyId) {
      return { success: false, stats: null };
    }

    // Bugün tarih aralığı
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Bugünkü müşteri sayısı (benzersiz userId)
    const todayCustomers = await prisma.purchase.groupBy({
      by: ["userId"],
      where: {
        companyId,
        purchaseDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    // Bugünkü satış toplamı
    const todaySalesAgg = await prisma.purchase.aggregate({
      where: {
        companyId,
        purchaseDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      _sum: { totalPrice: true },
    });
    const todayUsedCashbackAgg = await prisma.pointsUsage.aggregate({
      where: {
        companyId,
        usedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
      _sum: { amount: true },
    });

    // Bugünkü nakit iade toplamı
    const todayCashbackAgg = await prisma.purchase.aggregate({
      where: {
        companyId,
        purchaseDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      _sum: { cashbackEarned: true },
    });

    return {
      success: true,
      stats: {
        todayCustomers: todayCustomers.length,
        todaySales: todaySalesAgg._sum.totalPrice ?? 0,
        todayCashback: todayCashbackAgg._sum.cashbackEarned ?? 0,
        todayUsedCashback: todayUsedCashbackAgg._sum.amount ?? 0, // ✅ yeni eklendi

      },
    };
  } catch (err) {
    console.error("getCompanyMiniStatsAction error:", err);
    return { success: false, stats: null };
  }
}
