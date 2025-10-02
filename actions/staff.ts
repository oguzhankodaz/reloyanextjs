/** @format */

// actions/staff.ts
"use server";

import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// ✅ Staff kimliği cookie’den JWT decode ederek alınıyor
async function getStaffFromCookie() {
  const store = await cookies(); // 👈 önce await et
  const token = store.get("stf_sess_91kd2")?.value;
  if (!token) throw new Error("Yetkisiz (personel oturumu yok).");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { type: string; staffId: string; companyId: string; email: string; name: string };
    if (decoded.type !== "staff") throw new Error("Geçersiz token tipi.");
    return decoded as {
      staffId: string;
      companyId: string;
      email: string;
      name: string;
    };
  } catch {
    throw new Error("Geçersiz veya süresi dolmuş token.");
  }
}

// ✅ Personel satış (puan kazandırma)
export async function addPurchaseByStaffAction(formData: FormData) {
  try {
    const staff = await getStaffFromCookie(); // 👈 artık await gerekiyor
    const staffId = staff.staffId;
    const companyId = staff.companyId;

    const userId = String(formData.get("userId"));
    const totalPrice = Number(formData.get("totalPrice"));
    const cashbackEarned = Number(formData.get("cashbackEarned") ?? 0);
    const productIdRaw = formData.get("productId");
    const productId = productIdRaw ? Number(productIdRaw) : null;

    await prisma.$transaction(async (tx) => {
      await tx.purchase.create({
        data: {
          userId,
          companyId,
          productId,
          totalPrice,
          cashbackEarned,
          createdByStaffId: staffId,
        },
      });

      await tx.userPoints.upsert({
        where: { userId_companyId: { userId, companyId } },
        update: { totalPoints: { increment: Math.round(cashbackEarned) } },
        create: { userId, companyId, totalPoints: Math.round(cashbackEarned) },
      });

      // 🏆 Kullanıcının toplam kazancını güncelle (rozet sistemi için)
      await tx.user.update({
        where: { id: userId },
        data: {
          totalEarnings: {
            increment: cashbackEarned
          }
        }
      });
    });

    return { success: true, message: "Satış ve puan artışı kaydedildi." };
  } catch (e: unknown) {
    return { success: false, message: (e instanceof Error ? e.message : String(e)) ?? "İşlem başarısız." };
  }
}

// ✅ Personel puan harcama
export async function spendPointsByStaffAction(formData: FormData) {
  try {
    const staff = await getStaffFromCookie(); // 👈 artık await gerekiyor
    const staffId = staff.staffId;
    const companyId = staff.companyId;

    const userId = String(formData.get("userId"));
    const amount = Number(formData.get("amount"));
    const priceRaw = formData.get("price");
    const price = priceRaw ? Number(priceRaw) : 0;
    const productIdRaw = formData.get("productId");
    const productId = productIdRaw ? Number(productIdRaw) : null;

    await prisma.$transaction(async (tx) => {
      const up = await tx.userPoints.findUnique({
        where: { userId_companyId: { userId, companyId } },
        select: { id: true, totalPoints: true },
      });
      if (!up || up.totalPoints < amount) throw new Error("Yetersiz puan.");

      await tx.userPoints.update({
        where: { id: up.id },
        data: { totalPoints: { decrement: amount } },
      });

      await tx.pointsUsage.create({
        data: {
          userId,
          companyId,
          productId,
          amount,
          price,
          createdByStaffId: staffId,
        },
      });
    });

    return { success: true, message: "Puan düşüldü." };
  } catch (e: unknown) {
    return { success: false, message: (e instanceof Error ? e.message : String(e)) ?? "İşlem başarısız." };
  }
}

// ✅ Son işlemi iptal (sadece kendi yaptığı, son 2 dk içindeki en yeni işlem)
export async function undoLastActionByStaffAction() {
  try {
    const staff = await getStaffFromCookie(); // 👈 artık await gerekiyor
    const staffId = staff.staffId;


    const now = new Date();
    const cutoff = new Date(now.getTime() - 2 * 60 * 1000); // 2 dakika

    // En son yapılan işlemi al
    const [lastPurchase] = await prisma.$queryRaw<
      { id: number; at: Date; type: "p" }[]
    >`
      SELECT id::int, "purchaseDate" as at, 'p'::text as type
      FROM "Purchase"
      WHERE "createdByStaffId" = ${staffId} AND "purchaseDate" >= ${cutoff}
      ORDER BY "purchaseDate" DESC
      LIMIT 1
    `;
    const [lastUsage] = await prisma.$queryRaw<
      { id: number; at: Date; type: "u" }[]
    >`
      SELECT id::int, "usedAt" as at, 'u'::text as type
      FROM "PointsUsage"
      WHERE "createdByStaffId" = ${staffId} AND "usedAt" >= ${cutoff}
      ORDER BY "usedAt" DESC
      LIMIT 1
    `;

    let choice: { kind: "purchase" | "usage"; id: number } | null = null;
    if (lastPurchase && lastUsage) {
      choice =
        lastPurchase.at > lastUsage.at
          ? { kind: "purchase", id: lastPurchase.id }
          : { kind: "usage", id: lastUsage.id };
    } else if (lastPurchase) choice = { kind: "purchase", id: lastPurchase.id };
    else if (lastUsage) choice = { kind: "usage", id: lastUsage.id };

    if (!choice)
      return {
        success: false,
        message: "Geri alınacak işlem bulunamadı (süre dolmuş olabilir).",
      };

    if (choice.kind === "purchase") {
      // ✅ Satışı geri al
      await prisma.$transaction(async (tx) => {
        const p = await tx.purchase.findUnique({
          where: { id: choice!.id },
          select: { userId: true, companyId: true, cashbackEarned: true },
        });
        if (!p) throw new Error("Satış bulunamadı.");

        const up = await tx.userPoints.findUnique({
          where: {
            userId_companyId: { userId: p.userId, companyId: p.companyId },
          },
          select: { id: true, totalPoints: true },
        });

        if (p.cashbackEarned > 0 && up) {
          await tx.userPoints.update({
            where: { id: up.id },
            data: { totalPoints: { decrement: Math.round(p.cashbackEarned) } },
          });
        }

        // 🏆 Kullanıcının toplam kazancını düşür (rozet sistemi için)
        await tx.user.update({
          where: { id: p.userId },
          data: {
            totalEarnings: {
              decrement: p.cashbackEarned
            }
          }
        });

        await tx.purchase.delete({ where: { id: choice!.id } });
      });

      return { success: true, message: "Satış geri alındı." };
    } else {
      // ✅ Puan kullanımını geri al
      await prisma.$transaction(async (tx) => {
        const u = await tx.pointsUsage.findUnique({
          where: { id: choice!.id },
          select: { userId: true, companyId: true, amount: true },
        });
        if (!u) throw new Error("Kayıt bulunamadı.");

        const up = await tx.userPoints.findUnique({
          where: {
            userId_companyId: { userId: u.userId, companyId: u.companyId },
          },
          select: { id: true },
        });

        if (up) {
          await tx.userPoints.update({
            where: { id: up.id },
            data: { totalPoints: { increment: u.amount } },
          });
        } else {
          await tx.userPoints.create({
            data: {
              userId: u.userId,
              companyId: u.companyId,
              totalPoints: u.amount,
            },
          });
        }

        await tx.pointsUsage.delete({ where: { id: choice!.id } });
      });

      return { success: true, message: "Puan harcama geri alındı." };
    }
  } catch (e: unknown) {
    return { success: false, message: (e instanceof Error ? e.message : String(e)) ?? "Geri alma başarısız." };
  }
}
