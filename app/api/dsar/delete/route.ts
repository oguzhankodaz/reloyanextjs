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
import { LEGAL_CONFIG } from "@/legal/config";

/**
 * DSAR Delete - Kullanıcının verilerinin silinmesi talebi
 * KVKK m.7 - Kişisel verilerin silinmesini/yok edilmesini isteme hakkı
 * 
 * NOT: Bu endpoint hemen hard-delete yapmaz, silme talebini kaydeder.
 * İş kurallarına göre:
 * 1. Yasal saklama yükümlülüğü varsa veri anonimleştirilir
 * 2. Muhasebe/vergi kayıtları korunur (10 yıl)
 * 3. Admin onayı gerekebilir
 */
export async function POST(request: NextRequest) {
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

    // 3. Parse request body
    const body = await request.json().catch(() => ({}));
    const reason = body.reason || "Kullanıcı talebi";

    // 4. Check for existing pending delete request
    const existingRequest = await prisma.dsarRequest.findFirst({
      where: {
        userId: user.userId,
        requestType: "delete",
        status: {
          in: ["pending", "processing"],
        },
      },
    });

    if (existingRequest) {
      return new Response(
        JSON.stringify({
          error: "Zaten bekleyen bir silme talebiniz var",
          requestId: existingRequest.id,
          requestedAt: existingRequest.requestedAt,
          status: existingRequest.status,
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    // 5. Create delete request
    const deleteRequest = await prisma.dsarRequest.create({
      data: {
        userId: user.userId,
        requestType: "delete",
        status: "pending",
        ipAddress: clientIp,
        details: JSON.stringify({
          reason,
          requestedBy: user.email,
          requestDate: new Date().toISOString(),
        }),
        requestedAt: new Date(),
      },
    });

    // 6. Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: "dsar.delete.requested",
        entityType: "DsarRequest",
        entityId: deleteRequest.id,
        changes: JSON.stringify({
          reason,
          email: user.email,
        }),
        ipAddress: clientIp,
        userAgent: request.headers.get("user-agent") || undefined,
      },
    });

    // 7. Return response with SLA information
    return new Response(
      JSON.stringify({
        success: true,
        message: "Silme talebiniz alınmıştır",
        requestId: deleteRequest.id,
        requestedAt: deleteRequest.requestedAt,
        sla: {
          processingDays: LEGAL_CONFIG.data.dsarSla,
          expectedCompletionDate: new Date(
            Date.now() + LEGAL_CONFIG.data.dsarSla * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        notice: {
          title: "Önemli Bilgilendirme",
          points: [
            "Talebiniz en geç 30 gün içinde değerlendirilecektir",
            "Yasal saklama yükümlülüğü olan veriler (satın alma kayıtları) 10 yıl boyunca anonimleştirilmiş olarak saklanacaktır",
            "Hesabınız silindikten sonra bu işlem geri alınamaz",
            "Tüm sadakat puanlarınız silinecektir",
            "İşlem tamamlandığında e-posta ile bilgilendirileceksiniz",
          ],
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": new Date(rateLimit.resetAt).toISOString(),
        },
      }
    );
  } catch (error) {
    console.error("DSAR Delete error:", error);
    return new Response(
      JSON.stringify({
        error: "Silme talebi oluşturulurken bir hata oluştu",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * GET - Silme talebi durumunu sorgula
 */
export async function GET(_request: NextRequest) {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Oturum açmanız gerekiyor" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const deleteRequests = await prisma.dsarRequest.findMany({
      where: {
        userId: user.userId,
        requestType: "delete",
      },
      select: {
        id: true,
        status: true,
        requestedAt: true,
        processedAt: true,
        completedAt: true,
        response: true,
      },
      orderBy: { requestedAt: "desc" },
      take: 5,
    });

    return new Response(JSON.stringify({ requests: deleteRequests }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("DSAR Delete GET error:", error);
    return new Response(
      JSON.stringify({ error: "Sorgu sırasında bir hata oluştu" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

