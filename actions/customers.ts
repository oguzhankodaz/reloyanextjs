"use server";

import prisma from "@/lib/prisma";
import { CompanyCustomer } from "@/lib/types";

export async function getCompanyCustomersAction(
  companyId: string
): Promise<{ success: boolean; customers: CompanyCustomer[] }> {
  try {
    const customers = await prisma.userPoints.findMany({
      where: { companyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            surname: true,
            email: true,
          },
        },
      },
      orderBy: {
        totalPoints: "desc",
      },
    });

    return { success: true, customers };
  } catch (error) {
    console.error("getCompanyCustomersAction error:", error);
    return { success: false, customers: [] };
  }
}

