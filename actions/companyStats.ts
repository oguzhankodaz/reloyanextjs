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

    const mostActiveCompany = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        _count: { select: { purchases: true } },
      },
    });

    const customerCashback = await prisma.purchase.groupBy({
      by: ["userId"],
      where: { companyId },
      _sum: { cashbackEarned: true },
      orderBy: { _sum: { cashbackEarned: "desc" } },
      take: 10,
    });

    // ✅ User objesini tipine uygun şekilde map et
    const customerCashbackWithUser = await Promise.all(
      customerCashback.map(async (c) => {
        const user = await prisma.user.findUnique({
          where: { id: c.userId },
          select: { name: true, surname: true }, // sadece gerekli alanlar
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
          user: user ?? { name: "Bilinmiyor", surname: null }, // null kontrolü
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
      mostActiveCompany,
      customerCashback: customerCashbackWithUser,
      monthlyCashback,
      cashbackUsageTotal: cashbackUsageAgg._sum.amount ?? 0,
    };
  } catch (err) {
    console.error("getReportData error:", err);
    throw new Error("Rapor verileri alınamadı.");
  }
}
