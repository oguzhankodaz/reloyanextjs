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
import { isValidEmail, isValidName } from "@/lib/helpers";

/**
 * DSAR Rectify - Kullanıcının yanlış/eksik verilerini düzeltme talebi
 * KVKK m.11 - Kişisel verilerin düzeltilmesini isteme hakkı
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

    // 3. Parse and validate request body
    const body = await request.json();
    const { name, surname, email, phone, requestType } = body;

    // Determine if this is a direct update or a request
    const isDirect = requestType === "direct"; // Bazı alanlar direkt güncellenebilir
    const changes: Record<string, any> = {};

    // Validate and collect changes
    if (name !== undefined) {
      if (!isValidName(name)) {
        return new Response(
          JSON.stringify({
            error: "Geçersiz ad formatı (min. 2 karakter)",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      changes.name = name;
    }

    if (surname !== undefined) {
      if (!isValidName(surname)) {
        return new Response(
          JSON.stringify({
            error: "Geçersiz soyad formatı (min. 2 karakter)",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      changes.surname = surname;
    }

    if (email !== undefined) {
      // Email değişikliği daha hassas - talep olarak kaydedilir
      if (!isValidEmail(email)) {
        return new Response(
          JSON.stringify({ error: "Geçersiz e-posta formatı" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser && existingUser.id !== user.userId) {
        return new Response(
          JSON.stringify({ error: "Bu e-posta zaten kullanımda" }),
          { status: 409, headers: { "Content-Type": "application/json" } }
        );
      }

      changes.email = email.toLowerCase();
    }

    if (phone !== undefined) {
      changes.phone = phone;
    }

    if (Object.keys(changes).length === 0) {
      return new Response(
        JSON.stringify({
          error: "Düzeltilecek bir alan belirtilmedi",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. Get current user data for audit
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { name: true, surname: true, email: true, phone: true },
    });

    if (!currentUser) {
      return new Response(
        JSON.stringify({ error: "Kullanıcı bulunamadı" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // 5. For direct updates (name, surname) - update immediately
    if (isDirect && !changes.email) {
      // Update user
      await prisma.user.update({
        where: { id: user.userId },
        data: changes,
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: "user.update.direct",
          entityType: "User",
          entityId: user.userId,
          changes: JSON.stringify({
            before: currentUser,
            after: changes,
          }),
          ipAddress: clientIp,
          userAgent: request.headers.get("user-agent") || undefined,
        },
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Bilgileriniz güncellendi",
          updated: changes,
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
    }

    // 6. For sensitive changes (email, phone) - create a request
    const rectifyRequest = await prisma.dsarRequest.create({
      data: {
        userId: user.userId,
        requestType: "rectify",
        status: "pending",
        ipAddress: clientIp,
        details: JSON.stringify({
          requestedChanges: changes,
          currentValues: currentUser,
          requestedBy: user.email,
          requestDate: new Date().toISOString(),
        }),
        requestedAt: new Date(),
      },
    });

    // 7. Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.userId,
        action: "dsar.rectify.requested",
        entityType: "DsarRequest",
        entityId: rectifyRequest.id,
        changes: JSON.stringify({
          before: currentUser,
          requested: changes,
        }),
        ipAddress: clientIp,
        userAgent: request.headers.get("user-agent") || undefined,
      },
    });

    // 8. Return response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Düzeltme talebiniz alınmıştır",
        requestId: rectifyRequest.id,
        requestedAt: rectifyRequest.requestedAt,
        requestedChanges: changes,
        sla: {
          processingDays: LEGAL_CONFIG.data.dsarSla,
          expectedCompletionDate: new Date(
            Date.now() + LEGAL_CONFIG.data.dsarSla * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        notice:
          "E-posta gibi hassas bilgilerin değiştirilmesi için kimlik doğrulama gerekebilir. Talebiniz en geç 30 gün içinde değerlendirilecektir.",
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
    console.error("DSAR Rectify error:", error);
    return new Response(
      JSON.stringify({
        error: "Düzeltme talebi oluşturulurken bir hata oluştu",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * GET - Düzeltme talepleri geçmişini sorgula
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Oturum açmanız gerekiyor" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const rectifyRequests = await prisma.dsarRequest.findMany({
      where: {
        userId: user.userId,
        requestType: "rectify",
      },
      select: {
        id: true,
        status: true,
        details: true,
        requestedAt: true,
        processedAt: true,
        completedAt: true,
        response: true,
      },
      orderBy: { requestedAt: "desc" },
      take: 10,
    });

    return new Response(JSON.stringify({ requests: rectifyRequests }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("DSAR Rectify GET error:", error);
    return new Response(
      JSON.stringify({ error: "Sorgu sırasında bir hata oluştu" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

