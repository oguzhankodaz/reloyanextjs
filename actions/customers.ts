"use server";

import prisma from "@/lib/prisma";

export async function getCompanyCustomersAction(companyId: string) {
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
        totalPoints: "desc", // çok puanı olan en üstte
      },
    });

    return { success: true, customers };
  } catch (error) {
    console.error("getCompanyCustomersAction error:", error);
    return { success: false, customers: [] };
  }
}
