/** @format */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Company auth kontrolü yapılmalı, şimdilik basit implementasyon
    const url = new URL(request.url);
    const companyId = url.searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: "Company ID gerekli" },
        { status: 400 }
      );
    }

    // Şirket bilgilerini al (kayıt tarihi için)
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { createdAt: true }
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Şirket bulunamadı" },
        { status: 404 }
      );
    }


    // Aktif veya tamamlanmış aboneliği getir
    const activeSubscription = await prisma.companySubscription.findFirst({
      where: {
        companyId: companyId,
        status: {
          in: ["active", "completed"] // Hem aktif hem tamamlanmış abonelikleri getir
        },
        // expiresAt kontrolünü geçici olarak kaldırdık - debug için
        // expiresAt: {
        //   gt: new Date(), // Henüz süresi dolmamış
        // },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Eğer aktif abonelik yoksa, en son tamamlanmış aboneliği getir
    const latestSubscription = activeSubscription || await prisma.companySubscription.findFirst({
      where: {
        companyId: companyId,
        status: "completed",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Deneme süresi hesaplama
    const trialStartDate = company.createdAt;
    const trialEndDate = new Date(trialStartDate.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 gün
    const now = new Date();
    const isTrialActive = now < trialEndDate;
    const trialDaysLeft = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    // Response oluştur
    const response = {
      success: true,
      subscription: latestSubscription,
      trial: {
        isActive: isTrialActive,
        daysLeft: trialDaysLeft,
        startDate: trialStartDate,
        endDate: trialEndDate,
        hasExpired: !isTrialActive
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Subscription fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Abonelik bilgisi alınamadı" },
      { status: 500 }
    );
  }
}
