/** @format */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

interface CompanyPayload extends jwt.JwtPayload {
  companyId: string;
  email: string;
  name: string;
}

export async function GET(request: NextRequest) {
  const store = await cookies();
  const cookie = store.get("cmp_sess_z71f8")?.value;

  if (!cookie) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // JWT_SECRET kontrolü
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("❌ JWT_SECRET environment variable is not set");
    return NextResponse.json({ success: false, error: "Server configuration error" }, { status: 500 });
  }

  try {
    const decoded = jwt.verify(cookie, secret) as CompanyPayload;
    const companyId = decoded.companyId;

    // URL'den companyId parametresini al (fallback)
    const url = new URL(request.url);
    const urlCompanyId = url.searchParams.get("companyId");
    const finalCompanyId = urlCompanyId || companyId;

    // En uzun süreli aktif aboneliği bul
    const activeSubscription = await prisma.companySubscription.findFirst({
      where: {
        companyId: finalCompanyId,
        status: "completed",
        expiresAt: { gt: new Date() } // Hala aktif olan
      },
      orderBy: { expiresAt: 'desc' } // En uzun süreli olanı al
    });

    // Eğer aktif abonelik yoksa, en son completed aboneliği kontrol et
    let subscription = activeSubscription;
    if (!subscription) {
      subscription = await prisma.companySubscription.findFirst({
        where: {
          companyId: finalCompanyId,
          status: "completed"
        },
        orderBy: { expiresAt: 'desc' }
      });
    }

    // Deneme süresi bilgilerini hesapla
    const company = await prisma.company.findUnique({
      where: { id: finalCompanyId },
      select: { createdAt: true }
    });

    let trialInfo = null;
    if (company) {
      const trialStartDate = new Date(company.createdAt);
      const trialEndDate = new Date(trialStartDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 gün deneme
      const now = new Date();
      
      const daysLeft = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      trialInfo = {
        isActive: !subscription && daysLeft > 0,
        daysLeft: Math.max(0, daysLeft),
        startDate: trialStartDate.toISOString(),
        endDate: trialEndDate.toISOString(),
        hasExpired: daysLeft <= 0
      };
    }

    return NextResponse.json({
      success: true,
      subscription: subscription ? {
        planType: subscription.planType,
        expiresAt: subscription.expiresAt.toISOString(),
        status: subscription.status,
        amount: subscription.amount,
        createdAt: subscription.createdAt.toISOString(),
        orderId: subscription.orderId
      } : null,
      trial: trialInfo
    });

  } catch (error) {
    console.error("Subscription fetch error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch subscription" }, { status: 500 });
  }
}