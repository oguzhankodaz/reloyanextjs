// actions/customers.ts
"use server";

import prisma from "@/lib/prisma";

export async function getCompanyCustomersAction(companyId: string) {
  try {
    const users = await prisma.user.findMany({
      where: {
        purchases: { some: { companyId } },
      },
      select: {
        id: true,
        name: true,
        surname: true,
        email: true,
        purchases: {
          where: { companyId },
          select: { cashbackEarned: true },
        },
        pointsUsages: {
          where: { companyId },
          select: { amount: true },
        },
      },
    });

    const customers = users.map((u) => {
      const earned = u.purchases.reduce((sum, p) => sum + p.cashbackEarned, 0);
      const spent = u.pointsUsages.reduce((sum, p) => sum + p.amount, 0);

      return {
        user: {
          id: u.id,
          name: u.name,
          surname: u.surname,
          email: u.email,
        },
        totalCashback: earned - spent, // ✅ net bakiye
      };
    });

    return { success: true, customers };
  } catch (err) {
    console.error("getCompanyCustomersAction error:", err);
    return { success: false, customers: [] };
  }
}
