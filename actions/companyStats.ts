/** @format */
"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

import { ReportData, ReportFilter } from "@/lib/types";
import { startOfDay, startOfMonth, startOfYear } from "date-fns";

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

export async function getReportData(
  companyId: string,
  filter: ReportFilter = "all"
): Promise<ReportData> {
  try {
    const now = new Date();
    let since: Date | null = null;
    let until: Date | null = null;
    let groupByFormat = "YYYY";

    if (filter === "day") {
      groupByFormat = "HH24"; // saat
      since = startOfDay(now);
      until = new Date(since);
      until.setDate(until.getDate() + 1);
    } else if (filter === "month") {
      groupByFormat = "YYYY-MM-DD"; // gün
      since = startOfMonth(now);
      until = new Date(since);
      until.setMonth(until.getMonth() + 1);
    } else if (filter === "year") {
      groupByFormat = "YYYY-MM"; // ay
      since = startOfYear(now);
      until = new Date(since);
      until.setFullYear(until.getFullYear() + 1);
    } else {
      groupByFormat = "YYYY"; // yıl
    }

    // ---- 1) Özet --------------------------------------------------------
    const purchaseWhere: any = { companyId };
    if (since) purchaseWhere.purchaseDate = { gte: since };

    const usageWhere: any = { companyId };
    if (since) usageWhere.usedAt = { gte: since };

    const distinctCustomers = await prisma.purchase.groupBy({
      by: ["userId"],
      where: purchaseWhere,
    });

    const cashbackAgg = await prisma.purchase.aggregate({
      where: purchaseWhere,
      _sum: { cashbackEarned: true },
    });

    const cashbackUsageAgg = await prisma.pointsUsage.aggregate({
      where: usageWhere,
      _sum: { amount: true },
    });

    // ---- 2) Tablo: En çok cashback alan müşteriler (ALL-TIME) -----------
    const topAllTime = await prisma.purchase.groupBy({
      by: ["userId"],
      where: { companyId },
      _sum: { cashbackEarned: true },
      orderBy: { _sum: { cashbackEarned: "desc" } },
      take: 10,
    });

    const customerCashback = await Promise.all(
      topAllTime.map(async (c) => {
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
            ? `${lastPurchase.product?.name ?? "Toplam Harcama"} (+${
                lastPurchase.cashbackEarned
              }₺)`
            : null,
        };
      })
    );

    // ---- 3) Grafik ------------------------------------------------------
    const chartRaw = await prisma.$queryRaw<{ label: string; total: any }[]>`
      SELECT TO_CHAR("purchaseDate", ${Prisma.sql`${groupByFormat}`}) as label, 
             SUM("cashbackEarned") as total
      FROM "Purchase"
      WHERE "companyId" = ${companyId}
        ${since ? Prisma.sql`AND "purchaseDate" >= ${since}` : Prisma.empty}
        ${until ? Prisma.sql`AND "purchaseDate" < ${until}` : Prisma.empty}
      GROUP BY 1
      ORDER BY 1
    `;

    let chartData = chartRaw.map((r) => ({
      label: r.label,
      cashback: Number(r.total),
    }));

    // ---- 4) Eksik değerleri doldur --------------------------------------
    if (filter === "day") {
      const hours = Array.from({ length: 24 }, (_, i) => ({
        label: i.toString().padStart(2, "0"),
        cashback: 0,
      }));
      chartData.forEach((row) => {
        const idx = hours.findIndex((x) => x.label === row.label.padStart(2, "0"));
        if (idx !== -1) hours[idx].cashback = row.cashback;
      });
      chartData = hours;
    } else if (filter === "month") {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const days = Array.from({ length: daysInMonth }, (_, i) => ({
        label: (i + 1).toString().padStart(2, "0"),
        cashback: 0,
      }));
      chartData.forEach((row) => {
        const day = row.label.split("-")[2]; // YYYY-MM-DD → DD
        const idx = days.findIndex((x) => x.label === day);
        if (idx !== -1) days[idx].cashback = row.cashback;
      });
      chartData = days;
    } else if (filter === "year") {
      const months = Array.from({ length: 12 }, (_, i) => ({
        label: (i + 1).toString().padStart(2, "0"),
        cashback: 0,
      }));
      chartData.forEach((row) => {
        const month = row.label.split("-")[1]; // YYYY-MM → MM
        const idx = months.findIndex((x) => x.label === month);
        if (idx !== -1) months[idx].cashback = row.cashback;
      });
      chartData = months;
    }

    // ---- 5) Return ------------------------------------------------------
    return {
      success: true,
      totalCustomers: distinctCustomers.length,
      totalCashbackGiven: cashbackAgg._sum.cashbackEarned ?? 0,
      cashbackUsageTotal: cashbackUsageAgg._sum.amount ?? 0,
      customerCashback,
      chartData,
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
