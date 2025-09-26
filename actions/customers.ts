// actions/customers.ts
"use server";

import prisma from "@/lib/prisma";

export async function getCompanyCustomersAction(companyId: string) {
  try {
    // Şirketin tüm müşterilerini getir (önce purchase ile kimler işlem yapmış bulalım)
    const purchases = await prisma.purchase.groupBy({
      by: ["userId"],
      where: { companyId },
      _sum: { cashbackEarned: true },
    });

    // Kullanıcı bilgilerini + net cashback hesapla
    const customers = await Promise.all(
      purchases.map(async (p) => {
        const user = await prisma.user.findUnique({
          where: { id: p.userId },
          select: { id: true, name: true, surname: true, email: true },
        });

        // toplam kullanılan cashback
        const usageAgg = await prisma.pointsUsage.aggregate({
          where: { companyId, userId: p.userId },
          _sum: { amount: true },
        });

        // net bakiye = kazanılan - kullanılan
        const totalCashback =
          (p._sum.cashbackEarned ?? 0) - (usageAgg._sum.amount ?? 0);

        return {
          user: user!,
          totalCashback,
        };
      })
    );

    return { success: true, customers };
  } catch (err) {
    console.error("getCompanyCustomersAction error:", err);
    return { success: false, customers: [] };
  }
}
