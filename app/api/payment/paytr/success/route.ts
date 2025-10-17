/** @format */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

const MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY;
const MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT;

// Plan süre hesaplama fonksiyonu
function calculatePlanDuration(planType: string): number {
  switch (planType) {
    case "monthly":
      return 30 * 24 * 60 * 60 * 1000; // 30 gün
    case "6months":
      return 180 * 24 * 60 * 60 * 1000; // 6 ay
    case "yearly":
      return 365 * 24 * 60 * 60 * 1000; // 1 yıl
    default:
      return 30 * 24 * 60 * 60 * 1000; // varsayılan 30 gün
  }
}

// Ortak callback işleme fonksiyonu
async function handleCallback(merchantOid: string | null, status: string | null, totalAmount: string | null, hash: string | null, request: NextRequest) {
  try {
    console.log("PayTR Callback received:", { merchantOid, status, totalAmount, hash });

    if (!merchantOid || !status || !totalAmount || !hash) {
      console.error("Eksik parametreler:", { merchantOid, status, totalAmount, hash });
      
      // Fallback URL oluştur
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${request.nextUrl.origin}`;
      return NextResponse.redirect(`${baseUrl}/company/profile?payment=error&reason=missing_params`);
    }

    // Hash doğrulama (PayTR: HMAC-SHA256 with key=MERCHANT_KEY over merchant_oid + MERCHANT_SALT + status + total_amount)
    if (!MERCHANT_KEY || !MERCHANT_SALT) {
      console.error("PAYTR config missing for callback hash validation");
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${request.nextUrl.origin}`;
      return NextResponse.redirect(`${baseUrl}/company/profile?payment=error&reason=config_missing`);
    }

    const hashMessage = `${merchantOid}${MERCHANT_SALT}${status}${totalAmount}`;
    const calculatedHash = crypto
      .createHmac("sha256", MERCHANT_KEY)
      .update(hashMessage)
      .digest("base64");

    console.log("Hash comparison:", { calculatedHash, receivedHash: hash });

    if (calculatedHash !== hash) {
      console.error("Hash doğrulama hatası");
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${request.nextUrl.origin}`;
      return NextResponse.redirect(`${baseUrl}/company/profile?payment=error&reason=hash_mismatch`);
    }

    // Ödeme başarılı mı kontrol et
    if (status === "success") {
      try {
        // Pending kaydı getir; companyId ve planType buradan alınır
        const pending = await prisma.companySubscription.findUnique({ where: { orderId: merchantOid.toString() } });
        if (!pending) {
          console.error("Pending subscription not found for:", merchantOid);
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${request.nextUrl.origin}`;
          return NextResponse.redirect(`${baseUrl}/company/profile?payment=error&reason=pending_not_found`);
        }

        const companyId = pending.companyId;
        const amount = parseFloat(totalAmount.toString()) / 100; // Kuruştan TL'ye çevir
        
        // Plan türü pending kayıttan
        const planType = pending.planType || (amount >= 899.99 ? "yearly" : amount >= 499.99 ? "6months" : "monthly");

        // Mevcut aktif aboneliği kontrol et (yeni ödeme kaydı hariç)
        const existingActiveSubscription = await prisma.companySubscription.findFirst({
          where: { 
            companyId: companyId,
            status: "completed",
            expiresAt: { gt: new Date() }, // Hala aktif olan
            orderId: { not: merchantOid.toString() } // Yeni ödeme hariç
          },
          orderBy: { expiresAt: 'desc' } // En uzun süreli
        });


        const paymentDate = new Date();
        let expiresAt = new Date();
        
        // Plan süresini hesapla
        if (planType === "monthly") {
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        } else if (planType === "6months") {
          expiresAt.setMonth(expiresAt.getMonth() + 6);
        } else if (planType === "yearly") {
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        }

        // Eğer mevcut aktif abonelik varsa, süreyi uzat
        if (existingActiveSubscription) {
          const planDurationMs = calculatePlanDuration(planType);
          expiresAt = new Date(existingActiveSubscription.expiresAt.getTime() + planDurationMs);
          console.log(`Mevcut abonelik uzatılıyor: ${existingActiveSubscription.expiresAt.toISOString()} -> ${expiresAt.toISOString()}`);
        } else {
          console.log(`Yeni abonelik başlatılıyor: ${expiresAt.toISOString()}`);
        }

        console.log("Creating subscription:", {
          companyId,
          orderId: merchantOid,
          planType,
          amount,
          expiresAt
        });

        // Idempotent: varsa güncelle, yoksa oluştur
        await prisma.companySubscription.upsert({
          where: { orderId: merchantOid.toString() },
          update: {
            companyId: companyId,
            planType: planType,
            amount: amount,
            status: "completed",
            paymentDate: paymentDate,
            expiresAt: expiresAt,
            updatedAt: new Date(),
          },
          create: {
            companyId: companyId,
            orderId: merchantOid.toString(),
            planType: planType,
            amount: amount,
            status: "completed",
            paymentDate: paymentDate,
            expiresAt: expiresAt,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        });

        console.log("✅ Abonelik kaydı başarıyla oluşturuldu:", {
          merchantOid,
          companyId,
          planType,
          amount,
          expiresAt,
        });

        // Başarı sayfasına yönlendir
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${request.nextUrl.origin}`;
        return NextResponse.redirect(`${baseUrl}/company/profile?payment=success&order=${merchantOid}`);
      } catch (dbError) {
        console.error("❌ Veritabanı kaydı oluşturulamadı:", dbError);
        // Veritabanı hatası olsa bile ödeme başarılı, kullanıcıyı bilgilendir
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${request.nextUrl.origin}`;
        return NextResponse.redirect(`${baseUrl}/company/profile?payment=success&order=${merchantOid}&warning=db_error`);
      }
    } else {
      // Ödeme başarısız
      console.log("❌ Ödeme başarısız:", status);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${request.nextUrl.origin}`;
      return NextResponse.redirect(`${baseUrl}/company/profile?payment=failed&order=${merchantOid}`);
    }

  } catch (error) {
    console.error("❌ PayTR callback error:", error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${request.nextUrl.origin}`;
    return NextResponse.redirect(`${baseUrl}/company/profile?payment=error`);
  }
}

// PayTR hem GET hem POST ile callback gönderebilir
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const merchantOid = url.searchParams.get("merchant_oid");
    const status = url.searchParams.get("status");
    const totalAmount = url.searchParams.get("total_amount");
    const hash = url.searchParams.get("hash");
    
    return await handleCallback(merchantOid, status, totalAmount, hash, request);
  } catch (error) {
    console.error("PayTR GET callback error:", error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${request.nextUrl.origin}`;
    return NextResponse.redirect(`${baseUrl}/company/profile?payment=error`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const merchantOid = formData.get("merchant_oid")?.toString() || null;
    const status = formData.get("status")?.toString() || null;
    const totalAmount = formData.get("total_amount")?.toString() || null;
    const hash = formData.get("hash")?.toString() || null;

    // S2S callback: PayTR 'OK' bekler
    if (!merchantOid || !status || !totalAmount || !hash) {
      console.error("Eksik callback parametreleri", { merchantOid, status, totalAmount, hash });
      return new Response("FAILED", { status: 400 });
    }

    if (!MERCHANT_KEY || !MERCHANT_SALT) {
      console.error("PAYTR config missing for callback hash validation");
      return new Response("FAILED", { status: 500 });
    }

    const hashMessage = `${merchantOid}${MERCHANT_SALT}${status}${totalAmount}`;
    const calculatedHash = crypto
      .createHmac("sha256", MERCHANT_KEY)
      .update(hashMessage)
      .digest("base64");

    if (calculatedHash !== hash) {
      console.error("Hash doğrulama hatası (callback)");
      return new Response("FAILED", { status: 403 });
    }

    if (status === "success") {
      try {
        const orderIdStr = merchantOid.toString();
        const companyIdMatch = orderIdStr.match(/^ORDER([a-zA-Z0-9]+)\d+$/);
        if (!companyIdMatch) {
          console.error("Company ID could not be extracted from order ID:", merchantOid);
          return new Response("FAILED", { status: 400 });
        }

        const companyId = companyIdMatch[1];
        const amount = parseFloat(totalAmount.toString()) / 100;

        let planType = "monthly";
        if (amount >= 899.99) {
          planType = "yearly";
        } else if (amount >= 499.99) {
          planType = "6months";
        }

        // Mevcut aktif aboneliği kontrol et (yeni ödeme kaydı hariç)
        const existingActiveSubscription = await prisma.companySubscription.findFirst({
          where: { 
            companyId: companyId,
            status: "completed",
            expiresAt: { gt: new Date() }, // Hala aktif olan
            orderId: { not: merchantOid.toString() } // Yeni ödeme hariç
          },
          orderBy: { expiresAt: 'desc' } // En uzun süreli
        });


        const paymentDate = new Date();
        let expiresAt = new Date();
        
        // Plan süresini hesapla
        if (planType === "monthly") {
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        } else if (planType === "6months") {
          expiresAt.setMonth(expiresAt.getMonth() + 6);
        } else if (planType === "yearly") {
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        }

        // Eğer mevcut aktif abonelik varsa, süreyi uzat
        if (existingActiveSubscription) {
          const planDurationMs = calculatePlanDuration(planType);
          expiresAt = new Date(existingActiveSubscription.expiresAt.getTime() + planDurationMs);
          console.log(`POST Callback - Mevcut abonelik uzatılıyor: ${existingActiveSubscription.expiresAt.toISOString()} -> ${expiresAt.toISOString()}`);
        } else {
          console.log(`POST Callback - Yeni abonelik başlatılıyor: ${expiresAt.toISOString()}`);
        }

        await prisma.companySubscription.upsert({
          where: { orderId: merchantOid.toString() },
          update: {
            companyId,
            planType,
            amount,
            status: "completed",
            paymentDate,
            expiresAt,
            updatedAt: new Date(),
          },
          create: {
            companyId,
            orderId: merchantOid.toString(),
            planType,
            amount,
            status: "completed",
            paymentDate,
            expiresAt,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        // PayTR'e başarıyı bildir
        return new Response("OK");
      } catch (dbError) {
        console.error("Subscription create failed:", dbError);
        // Yine de OK döndürmek PayTR tekrar denemelerini engelleyebilir; ancak başarısızlığı bildirmek için FAILED dönüyoruz.
        return new Response("FAILED", { status: 500 });
      }
    }

    // status !== success
    return new Response("OK"); // PayTR'e alındı bilgisi
  } catch (error) {
    console.error("PayTR POST callback error:", error);
    return new Response("FAILED", { status: 500 });
  }
}