/** @format */
"use server";

import prisma from "@/lib/prisma";
import { UserDashboardData } from "@/lib/types";

export async function getUserDashboard(userId: string): Promise<UserDashboardData> {
  try {
    // Kazanılan toplam cashback
    const earnedAgg = await prisma.purchase.aggregate({
      where: { userId },
      _sum: { cashbackEarned: true },
    });

    // Harcanan toplam cashback
    const spentAgg = await prisma.pointsUsage.aggregate({
      where: { userId },
      _sum: { amount: true },
    });

    const totalCashback =
      (earnedAgg._sum.cashbackEarned ?? 0) - (spentAgg._sum.amount ?? 0);

    // Şirketlere göre bakiye (earned - spent)
    const earnedByCompany = await prisma.purchase.groupBy({
      by: ["companyId"],
      where: { userId },
      _sum: { cashbackEarned: true },
    });

    const spentByCompany = await prisma.pointsUsage.groupBy({
      by: ["companyId"],
      where: { userId },
      _sum: { amount: true },
    });

    const companyCashback = await Promise.all(
      earnedByCompany.map(async (e) => {
        const spent =
          spentByCompany.find((s) => s.companyId === e.companyId)?._sum.amount ??
          0;

        const company = await prisma.company.findUnique({
          where: { id: e.companyId },
          select: { id: true, name: true },
        });

        return {
          companyId: company?.id ?? "",
          companyName: company?.name ?? "Bilinmeyen",
          cashback: (e._sum.cashbackEarned ?? 0) - spent, // ✅ net bakiye
        };
      })
    );

    // Son işlemler (purchase + usage birleşik)
    const purchases = await prisma.purchase.findMany({
      where: { userId },
      include: { company: true, product: true },
      orderBy: { purchaseDate: "desc" },
      take: 5,
    });

    const usages = await prisma.pointsUsage.findMany({
      where: { userId },
      include: { company: true, product: true },
      orderBy: { usedAt: "desc" },
      take: 5,
    });

    const lastPurchases = [
      ...purchases.map((p) => ({
        type: "purchase" as const,
        id: p.id,
        product: p.product?.name ?? "Toplam Harcama",
        company: p.company?.name ?? "-",  // ✅ eklendi
        quantity: p.quantity,
        totalPrice: p.totalPrice,
        cashbackEarned: p.cashbackEarned,
        date: p.purchaseDate,
      })),
      ...usages.map((u) => ({
        type: "usage" as const,
        id: u.id,
        product: u.product?.name ?? "Para Puan Kullanımı",
        company: u.company?.name ?? "-",  // ✅ eklendi
        quantity: u.quantity,
        totalPrice: u.price,
        amount: u.amount,
        cashbackEarned: -u.amount, // harcama → negatif
        date: u.usedAt,
      })),
    ]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);
    
    

    // Kampanyalar
    const campaigns = await prisma.campaign.findMany({
      where: {
        companyId: { in: companyCashback.map((c) => c.companyId) },
      },
      include: { company: true },
      orderBy: { startDate: "desc" },
      take: 5,
    });

    return {
      totalCashback,
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
