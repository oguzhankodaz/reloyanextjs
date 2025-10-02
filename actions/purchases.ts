/** @format */
"use server";

import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

async function getCurrentStaffId(): Promise<string | null> {
  try {
    const store = await cookies();
    const token = store.get("stf_sess_91kd2")?.value;
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { type: string; staffId: string };
    if (decoded?.type !== "staff") return null;
    return decoded.staffId as string;
  } catch {
    return null;
  }
}

/**
 * Satın alma kaydı ekle
 */
export async function addPurchaseAction(
  userId: string,
  companyId: string,
  items: { productId?: number; quantity: number; totalPrice: number; cashbackEarned: number }[]
) {
  try {
    const staffId = await getCurrentStaffId();
    await prisma.$transaction(async (tx) => {
      let totalCashbackEarned = 0;
      
      for (const item of items) {
        await tx.purchase.create({
          data: {
            userId,
            companyId,
            productId: item.productId ?? null,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            cashbackEarned: item.cashbackEarned,
            // Eğer personel oturumu varsa kaydı ona ata
            createdByStaffId: staffId ?? undefined,
          },
        });
        
        totalCashbackEarned += item.cashbackEarned;
      }

      // 🏆 Kullanıcının toplam kazancını güncelle (rozet sistemi için)
      await tx.user.update({
        where: { id: userId },
        data: {
          totalEarnings: {
            increment: totalCashbackEarned
          }
        }
      });
    });

    return { success: true, message: "Satın alma kaydedildi" };
  } catch (err) {
    console.error("addPurchaseAction error:", err);
    return { success: false, message: "Satın alma kaydedilemedi" };
  }
}


/**
 * Kullanıcının net bakiye (kazanç - harcama) bilgisini getirir
 */
export async function getUserCashbackAction(userId: string, companyId: string) {
  try {
    // Kullanıcının toplam kazandığı cashback
    const earnedAgg = await prisma.purchase.aggregate({
      where: { userId, companyId },
      _sum: { cashbackEarned: true },
    });

    // Kullanıcının toplam harcadığı cashback
    const spentAgg = await prisma.pointsUsage.aggregate({
      where: { userId, companyId },
      _sum: { amount: true },
    });

    const totalCashback =
      (earnedAgg._sum.cashbackEarned ?? 0) - (spentAgg._sum.amount ?? 0);

    return { success: true, totalCashback };
  } catch (error) {
    console.error("getUserCashbackAction error:", error);
    return { success: false, totalCashback: 0 };
  }
}




/**
 * Cashback harcama (kullanıcının bakiyesinden düş)
 */
export async function spendCashbackAction(
  userId: string,
  companyId: string,
  amount: number,
  productId?: number,
  quantity?: number,
  price?: number
) {
  if (!userId || !companyId || amount <= 0) {
    return { success: false, message: "Geçersiz işlem" };
  }

  try {
    const staffId = await getCurrentStaffId();
    // Mevcut bakiyeyi hesapla (kazanç - harcama)
    const earnedAgg = await prisma.purchase.aggregate({
      where: { userId, companyId },
      _sum: { cashbackEarned: true },
    });

    const spentAgg = await prisma.pointsUsage.aggregate({
      where: { userId, companyId },
      _sum: { amount: true },
    });

    const currentCashback =
      (earnedAgg._sum.cashbackEarned ?? 0) - (spentAgg._sum.amount ?? 0);

    if (currentCashback < amount) {
      return { success: false, message: "Yetersiz bakiye" };
    }

    // Harcamayı kaydet
    await prisma.pointsUsage.create({
      data: {
        amount,
        quantity: quantity ?? 1,
        price: price ?? 0,
        userId,
        companyId,
        productId: productId ?? null,
        createdByStaffId: staffId ?? undefined,
      },
    });

    // Güncel bakiye tekrar hesapla
    const newCashback = currentCashback - amount;

    return {
      success: true,
      message: "Para puan kullanıldı",
      totalCashback: newCashback,
    };
  } catch (err) {
    console.error("spendCashbackAction error:", err);
    return { success: false, message: "Bir hata oluştu" };
  }
}
