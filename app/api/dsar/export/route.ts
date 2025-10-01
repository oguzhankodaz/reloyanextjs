/** @format */

import { getUserFromCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  checkRateLimit,
  createDsarIdentifier,
  getClientIp,
  rateLimitResponse,
} from "@/lib/rateLimit";
import { NextRequest } from "next/server";

/**
 * DSAR Export - Kullanıcının tüm verilerini dışa aktarma
 * KVKK m.11 - Kişisel verilerin bir kopyasını talep etme hakkı
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authentication check
    const user = await getUserFromCookie();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Oturum açmanız gerekiyor" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Rate limiting
    const clientIp = getClientIp(request);
    const identifier = createDsarIdentifier(clientIp, user.userId);
    const rateLimit = checkRateLimit(identifier, "dsar");

    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.retryAfter || 60);
    }

    // 3. Fetch all user data
    const [
      userData,
      purchases,
      userPoints,
      pointsUsages,
      consents,
      dsarRequests,
    ] = await Promise.all([
      // User basic info
      prisma.user.findUnique({
        where: { id: user.userId },
        select: {
          id: true,
          name: true,
          surname: true,
          email: true,
          phone: true,
          qrCode: true,
          createdAt: true,
          verified: true,
        },
      }),

      // Purchase history
      prisma.purchase.findMany({
        where: { userId: user.userId },
        select: {
          id: true,
          quantity: true,
          totalPrice: true,
          cashbackEarned: true,
          purchaseDate: true,
          product: {
            select: {
              name: true,
              price: true,
            },
          },
          company: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { purchaseDate: "desc" },
      }),

      // Points balance
      prisma.userPoints.findMany({
        where: { userId: user.userId },
        select: {
          totalPoints: true,
          company: {
            select: {
              name: true,
            },
          },
        },
      }),

      // Points usage history
      prisma.pointsUsage.findMany({
        where: { userId: user.userId },
        select: {
          amount: true,
          quantity: true,
          price: true,
          usedAt: true,
          product: {
            select: {
              name: true,
            },
          },
          company: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { usedAt: "desc" },
      }),

      // Consent records
      prisma.userConsent.findMany({
        where: { userId: user.userId },
        select: {
          consentType: true,
          granted: true,
          grantedAt: true,
          revokedAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),

      // Previous DSAR requests
      prisma.dsarRequest.findMany({
        where: { userId: user.userId },
        select: {
          requestType: true,
          status: true,
          requestedAt: true,
          processedAt: true,
          completedAt: true,
        },
        orderBy: { requestedAt: "desc" },
      }),
    ]);

    if (!userData) {
      return new Response(
        JSON.stringify({ error: "Kullanıcı bulunamadı" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. Create DSAR request record
    await prisma.dsarRequest.create({
      data: {
        userId: user.userId,
        requestType: "export",
        status: "completed",
        ipAddress: clientIp,
        requestedAt: new Date(),
        completedAt: new Date(),
        response: "Data exported successfully",
      },
    });

    // 5. Prepare export data
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        dataSubject: {
          userId: userData.id,
          email: userData.email,
        },
        legalBasis: "KVKK m.11 - İlgili kişinin kişisel verilerinin bir kopyasını talep etme hakkı",
      },
      personalData: {
        profile: userData,
        statistics: {
          totalPurchases: purchases.length,
          totalPointsUsed: pointsUsages.reduce(
            (sum, usage) => sum + usage.amount,
            0
          ),
          accountAge: Math.floor(
            (Date.now() - new Date(userData.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
          ),
        },
      },
      transactionHistory: {
        purchases: purchases.map((p) => ({
          id: p.id,
          company: p.company.name,
          product: p.product?.name || "Ürün silinmiş",
          quantity: p.quantity,
          totalPrice: p.totalPrice,
          cashbackEarned: p.cashbackEarned,
          date: p.purchaseDate,
        })),
        pointsUsages: pointsUsages.map((u) => ({
          company: u.company.name,
          product: u.product?.name || "Ürün silinmiş",
          pointsUsed: u.amount,
          quantity: u.quantity,
          price: u.price,
          date: u.usedAt,
        })),
      },
      loyaltyProgram: {
        currentPoints: userPoints.map((p) => ({
          company: p.company.name,
          points: p.totalPoints,
        })),
      },
      consents: consents.map((c) => ({
        type: c.consentType,
        granted: c.granted,
        grantedAt: c.grantedAt,
        revokedAt: c.revokedAt,
        createdAt: c.createdAt,
      })),
      dsarHistory: dsarRequests.map((r) => ({
        type: r.requestType,
        status: r.status,
        requestedAt: r.requestedAt,
        processedAt: r.processedAt,
        completedAt: r.completedAt,
      })),
    };

    // 6. Return data as JSON
    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="reloya-data-export-${user.userId}-${Date.now()}.json"`,
        "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        "X-RateLimit-Reset": new Date(rateLimit.resetAt).toISOString(),
      },
    });
  } catch (error) {
    console.error("DSAR Export error:", error);
    return new Response(
      JSON.stringify({
        error: "Veri dışa aktarma sırasında bir hata oluştu",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

