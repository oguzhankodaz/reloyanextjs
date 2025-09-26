/** @format */
"use server";

import prisma from "@/lib/prisma";
import { UserDashboardData } from "@/lib/types";

/**
 * Kullanıcı Dashboard verileri
 */
export async function getUserDashboard(userId: string): Promise<UserDashboardData> {
  try {
    // ✅ Toplam nakit iade
    const totalAgg = await prisma.purchase.aggregate({
      where: { userId },
      _sum: { cashbackEarned: true },
    });

    // ✅ Şirketlere göre nakit iade
    const companyCashbackRaw = await prisma.purchase.groupBy({
      by: ["companyId"],
      where: { userId },
      _sum: { cashbackEarned: true },
    });

    const companyCashback = await Promise.all(
      companyCashbackRaw.map(async (c) => {
        const company = await prisma.company.findUnique({
          where: { id: c.companyId },
          select: { id: true, name: true },
        });

        return {
          companyId: c.companyId,
          companyName: company?.name ?? "Bilinmeyen",
          cashback: c._sum.cashbackEarned ?? 0,
        };
      })
    );

    // ✅ Son alışverişler
    const lastPurchasesRaw = await prisma.purchase.findMany({
      where: { userId },
      orderBy: { purchaseDate: "desc" },
      take: 5,
      include: { company: true, product: true },
    });

    const lastPurchases = lastPurchasesRaw.map((p) => ({
      id: p.id,
      product: p.product?.name ?? "Toplam Harcama",
      company: p.company.name,
      cashbackEarned: p.cashbackEarned,
      date: p.purchaseDate,
    }));

    // ✅ Aktif kampanyalar
    const campaigns = await prisma.campaign.findMany({
      where: {
        companyId: { in: companyCashbackRaw.map((c) => c.companyId) },
        endDate: { gte: new Date() },
      },
      include: { company: true },
    });

    return {
      totalCashback: totalAgg._sum.cashbackEarned ?? 0,
      companyCashback,
      lastPurchases,
      campaigns,
    };
  } catch (err) {
    console.error("getUserDashboard error:", err);
    return {
      totalCashback: 0,
      companyCashback: [],
      lastPurchases: [],
      campaigns: [],
    };
  }
}
