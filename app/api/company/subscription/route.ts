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

    // Aktif aboneliği getir
    const activeSubscription = await prisma.companySubscription.findFirst({
      where: {
        companyId: companyId,
        status: "active",
        expiresAt: {
          gt: new Date(), // Henüz süresi dolmamış
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      subscription: activeSubscription,
    });

  } catch (error) {
    console.error("Subscription fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Abonelik bilgisi alınamadı" },
      { status: 500 }
    );
  }
}
