/** @format */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkSession } from "@/actions/auth";

// GET - Kullanıcının onaylarını getir
export async function GET() {
  try {
    const session = await checkSession();
    
    if (!session || session.type !== "user") {
      return NextResponse.json(
        { success: false, message: "Yetkisiz erişim" },
        { status: 401 }
      );
    }

    const userId = session.data.userId;

    // Kullanıcının tüm onaylarını getir
    const consents = await prisma.userConsent.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      consents,
    });
  } catch (error) {
    console.error("Get consents error:", error);
    return NextResponse.json(
      { success: false, message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT - Kullanıcının onayını güncelle (rıza geri çekme)
export async function PUT(req: Request) {
  try {
    const session = await checkSession();
    
    if (!session || session.type !== "user") {
      return NextResponse.json(
        { success: false, message: "Yetkisiz erişim" },
        { status: 401 }
      );
    }

    const userId = session.data.userId;
    const { consentType, granted } = await req.json();

    if (!consentType || typeof granted !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Geçersiz istek" },
        { status: 400 }
      );
    }

    // terms ve privacy zorunlu olduğu için geri çekilemez
    if (["terms", "privacy"].includes(consentType) && !granted) {
      return NextResponse.json(
        { success: false, message: "Zorunlu onaylar geri çekilemez" },
        { status: 400 }
      );
    }

    const now = new Date();

    // Onayı güncelle veya oluştur
    const consent = await prisma.userConsent.upsert({
      where: {
        userId_consentType: {
          userId,
          consentType,
        },
      },
      update: {
        granted,
        grantedAt: granted ? now : undefined,
        revokedAt: !granted ? now : null,
      },
      create: {
        userId,
        consentType,
        granted,
        grantedAt: granted ? now : undefined,
        revokedAt: !granted ? now : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: granted ? "Onay verildi" : "Onay geri çekildi",
      consent,
    });
  } catch (error) {
    console.error("Update consent error:", error);
    return NextResponse.json(
      { success: false, message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

