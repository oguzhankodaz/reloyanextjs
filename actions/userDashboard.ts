"use server";

import prisma from "@/lib/prisma";

export async function getUserDashboard(userId: string) {
  // ⭐ Toplam Puan
  const userPoints = await prisma.userPoints.findMany({
    where: { userId },
    include: { company: true },
  });

  const totalPoints = userPoints.reduce((sum, p) => sum + p.totalPoints, 0);

  // 🏢 İşletmelere Göre Puan
  const companyPoints = userPoints.map((p) => ({
    companyId: p.companyId,
    companyName: p.company.name,
    points: p.totalPoints,
  }));


  // 📜 Son İşlemler
  const purchases = await prisma.purchase.findMany({
    where: { userId },
    orderBy: { purchaseDate: "desc" },
    include: { product: true, company: true },
    take: 5,
  });


  const lastPurchases = purchases.map((p) => ({
    id: p.id,
    product: p.product.name,
    company: p.company.name,
    points: p.pointsEarned,
    date: p.purchaseDate,
  }));

  // 🎁 Kampanyalar (kullanıcının bağlı olduğu şirketlerden aktif olanlar)
  const now = new Date();
  const campaigns = await prisma.campaign.findMany({
    where: {
      companyId: { in: companyPoints.map((c) => c.companyId) },
      startDate: { lte: now },
      endDate: { gte: now },
    },
    include: { company: true },
    take: 5,
  });

  return {
    totalPoints,
    companyPoints,
    lastPurchases,
    campaigns,
  };
}
