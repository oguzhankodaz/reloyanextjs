/** @format */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { toTitleCase } from "@/lib/helpers";
import { toZonedTime, fromZonedTime } from "date-fns-tz";
import { startOfDay } from "date-fns";

export const runtime = "nodejs";

// Türkiye saat dilimi
const TIMEZONE = "Europe/Istanbul";

type ActivityItem =
  | {
      kind: "purchase";
      id: number;
      at: Date;
      userId: string;
      userName: string;
      totalPrice: number;
      cashbackEarned: number;
      createdByStaffId: string | null;
    }
  | {
      kind: "usage";
      id: number;
      at: Date;
      userId: string;
      userName: string;
      amount: number;
      price: number | null;
      createdByStaffId: string | null;
    };

function formatDateKey(d: Date): string {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
    .toISOString()
    .slice(0, 10);
}

async function getStaffFromCookie() {
  const store = await cookies();
  const token = store.get("stf_sess_91kd2")?.value;
  if (!token) throw new Error("Unauthorized");
  
  // ✅ JWT_SECRET kontrolü
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("❌ JWT_SECRET environment variable is not set");
    throw new Error("Server configuration error");
  }
  
  const decoded = jwt.verify(token, secret) as {
    type: string;
    staffId: string;
    companyId: string;
    email: string;
    name: string;
  };
  if (decoded.type !== "staff") throw new Error("Invalid token");
  return decoded as {
    staffId: string;
    companyId: string;
    email: string;
    name: string;
  };
}

export async function GET() {
  try {
    const staff = await getStaffFromCookie();

    const company = await prisma.company.findUnique({
      where: { id: staff.companyId },
      select: { id: true, name: true },
    });

    // Türkiye saatine göre bugünün başlangıcı (00:00) itibarıyla yapılan işlemler
    const nowInTurkey = toZonedTime(new Date(), TIMEZONE);
    const todayStartInTurkey = startOfDay(nowInTurkey);
    const since = fromZonedTime(todayStartInTurkey, TIMEZONE);

    const purchases = await prisma.purchase.findMany({
      where: { companyId: staff.companyId, purchaseDate: { gte: since } },
      select: {
        id: true,
        userId: true,
        user: { select: { name: true, surname: true } },
        totalPrice: true,
        cashbackEarned: true,
        purchaseDate: true,
        createdByStaffId: true,
      },
      orderBy: { purchaseDate: "desc" },
      take: 200,
    });

    const usages = await prisma.pointsUsage.findMany({
      where: { companyId: staff.companyId, usedAt: { gte: since } },
      select: {
        id: true,
        userId: true,
        user: { select: { name: true, surname: true } },
        amount: true,
        price: true,
        usedAt: true,
        createdByStaffId: true,
      },
      orderBy: { usedAt: "desc" },
      take: 200,
    });

    const merged: ActivityItem[] = [
      ...purchases.map((p) => ({
        kind: "purchase" as const,
        id: p.id,
        at: p.purchaseDate,
        userId: p.userId,
        userName: toTitleCase(
          `${p.user?.name ?? ""} ${p.user?.surname ?? ""}`.trim()
        ),
        totalPrice: p.totalPrice,
        cashbackEarned: p.cashbackEarned,
        createdByStaffId: p.createdByStaffId,
      })),
      ...usages.map((u) => ({
        kind: "usage" as const,
        id: u.id,
        at: u.usedAt,
        userId: u.userId,
        userName: toTitleCase(
          `${u.user?.name ?? ""} ${u.user?.surname ?? ""}`.trim()
        ),
        amount: u.amount,
        price: u.price,
        createdByStaffId: u.createdByStaffId,
      })),
    ];

    const byDate: Record<string, ActivityItem[]> = {};
    for (const item of merged) {
      const key = formatDateKey(item.at);
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push(item);
    }

    // Her gün için en yeni kayıt en üstte olacak şekilde sırala
    for (const key of Object.keys(byDate)) {
      byDate[key].sort((a, b) => b.at.getTime() - a.at.getTime());
    }

    return NextResponse.json({
      staff: { name: staff.name, email: staff.email },
      company: {
        id: company?.id ?? staff.companyId,
        name: company?.name ?? "",
      },
      activitiesByDate: byDate,
    });
  } catch (_e) {
    return NextResponse.json(
      { staff: null, company: null, activitiesByDate: {} },
      { status: 200 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const staff = await getStaffFromCookie();
    const body = await req.json();
    const kind: "purchase" | "usage" = body.kind;
    const id: number = body.id;

    if (kind === "purchase") {
      await prisma.$transaction(async (tx) => {
        const p = await tx.purchase.findUnique({
          where: { id },
          select: {
            userId: true,
            companyId: true,
            cashbackEarned: true,
            createdByStaffId: true,
          },
        });
        if (!p) throw new Error("Satış bulunamadı");
        if (p.companyId !== staff.companyId) throw new Error("Yetkisiz işlem");

        const up = await tx.userPoints.findUnique({
          where: {
            userId_companyId: { userId: p.userId, companyId: p.companyId },
          },
          select: { id: true },
        });
        if (p.cashbackEarned > 0 && up) {
          await tx.userPoints.update({
            where: { id: up.id },
            data: { totalPoints: { decrement: Math.round(p.cashbackEarned) } },
          });
        }
        await tx.purchase.delete({ where: { id } });
      });
      return NextResponse.json({
        success: true,
        message: "Satış geri alındı.",
      });
    }

    // usage
    await prisma.$transaction(async (tx) => {
      const u = await tx.pointsUsage.findUnique({
        where: { id },
        select: {
          userId: true,
          companyId: true,
          amount: true,
          createdByStaffId: true,
        },
      });
      if (!u) throw new Error("Kayıt bulunamadı");
      if (u.companyId !== staff.companyId) throw new Error("Yetkisiz işlem");

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
      await tx.pointsUsage.delete({ where: { id } });
    });
    return NextResponse.json({
      success: true,
      message: "Puan harcama geri alındı.",
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Geri alma başarısız";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
