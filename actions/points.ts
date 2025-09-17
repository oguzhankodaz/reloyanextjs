"use server";

import prisma from "@/lib/prisma";

export async function getUserPointsAction(userId: string) {
  try {
    const points = await prisma.userPoints.findMany({
      where: { userId },
      include: {
        company: {
          select: { id: true, name: true }, // işletme bilgisi
        },
      },
      orderBy: {
        totalPoints: "desc", // en çok puanlı şirket üstte
      },
    });

    return { success: true, points };
  } catch (error) {
    console.error("getUserPointsAction error:", error);
    return { success: false, points: [] };
  }
}
