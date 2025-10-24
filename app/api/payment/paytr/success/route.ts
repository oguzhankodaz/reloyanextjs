/** @format */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { addMonths, addYears } from "date-fns";

export const runtime = "nodejs";

const MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY;
const MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT;

// Plan fiyatları (kuruş cinsinden)
const PLAN_PRICES = {
  monthly: 64900, // 649 TL
  "6months": 299900, // 2999 TL
  yearly: 899900 // 8999 TL
} as const;

// Plan doğrulama fonksiyonu
function validatePlanAmount(planType: string, amount: number): boolean {
  const expectedAmount = PLAN_PRICES[planType as keyof typeof PLAN_PRICES];
  return expectedAmount === amount;
}

// Plan süre hesaplama fonksiyonu (date-fns ile)
function calculatePlanExpiration(baseDate: Date, planType: string): Date {
  switch (planType) {
    case "monthly":
      return addMonths(baseDate, 1);
    case "6months":
      return addMonths(baseDate, 6);
    case "yearly":
      return addYears(baseDate, 1);
    default:
      return addMonths(baseDate, 1); // varsayılan 1 ay
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

    // Timing-safe hash karşılaştırması
    const calculatedHashBuffer = Buffer.from(calculatedHash, 'base64');
    const receivedHashBuffer = Buffer.from(hash, 'base64');
    
    if (calculatedHashBuffer.length !== receivedHashBuffer.length || 
        !crypto.timingSafeEqual(calculatedHashBuffer, receivedHashBuffer)) {
      console.error("Hash doğrulama hatası - güvenlik ihlali");
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${request.nextUrl.origin}`;
      return NextResponse.redirect(`${baseUrl}/company/profile?payment=error&reason=hash_mismatch`);
    }

    // Ödeme başarılı mı kontrol et
    if (status === "success") {
      try {
        const amount = parseFloat(totalAmount.toString()); // Kuruş cinsinden
        const amountInTL = amount / 100; // TL'ye çevir
        
        // Plan türünü tutardan belirle
        const planType = amountInTL >= 899.99 ? "yearly" : amountInTL >= 499.99 ? "6months" : "monthly";
        
        // Plan tutarını doğrula
        if (!validatePlanAmount(planType, amount)) {
          console.error("Plan amount validation failed:", { planType, amount, expected: PLAN_PRICES[planType as keyof typeof PLAN_PRICES] });
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${request.nextUrl.origin}`;
          return NextResponse.redirect(`${baseUrl}/company/profile?payment=error&reason=amount_mismatch`);
        }

        // Tek transaction içinde tüm işlemleri yap
        const result = await prisma.$transaction(async (tx) => {
          // 1. Pending kaydı çek
          const pending = await tx.companySubscription.findUnique({ 
            where: { orderId: merchantOid.toString() } 
          });
          
          if (!pending) {
            throw new Error("Pending subscription not found");
          }
          
          // 2. Idempotency kontrolü - zaten completed ise erken çık
          if (pending.status === "completed") {
            console.log("Payment already processed for order:", merchantOid);
            return { alreadyProcessed: true };
          }

          // 3. Şirketin son completed aboneliğini bul
          const lastCompletedSubscription = await tx.companySubscription.findFirst({
            where: { 
              companyId: pending.companyId,
              status: "completed",
              orderId: { not: merchantOid.toString() } // Yeni ödeme hariç
            },
            orderBy: { expiresAt: 'desc' } // En son biten
          });

          const paymentDate = new Date();
          
          // 4. Baz tarihini hesapla: max(şu an, son tamamlanan aboneliğin bitiş tarihi)
          const baseDate = lastCompletedSubscription 
            ? new Date(Math.max(paymentDate.getTime(), lastCompletedSubscription.expiresAt.getTime()))
            : paymentDate;
          
          // 5. Süreyi date-fns ile ekle
          const expiresAt = calculatePlanExpiration(baseDate, planType);
          
          if (lastCompletedSubscription) {
            console.log(`Abonelik uzatılıyor: ${lastCompletedSubscription.expiresAt.toISOString()} -> ${expiresAt.toISOString()}`);
          } else {
            console.log(`Yeni abonelik başlatılıyor: ${expiresAt.toISOString()}`);
          }

          // 6. Kaydı completed yap
          await tx.companySubscription.update({
            where: { orderId: merchantOid.toString() },
            data: {
              status: "completed",
              paymentDate: paymentDate,
              expiresAt: expiresAt,
              updatedAt: new Date(),
            }
          });

          return { 
            alreadyProcessed: false, 
            companyId: pending.companyId,
            planType,
            amount,
            expiresAt 
          };
        });

        // Zaten işlenmişse erken çık
        if (result.alreadyProcessed) {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${request.nextUrl.origin}`;
          return NextResponse.redirect(`${baseUrl}/company/profile?payment=success&order=${merchantOid}&already_processed=true`);
        }

        console.log("✅ Abonelik kaydı başarıyla oluşturuldu:", {
          merchantOid,
          companyId: result.companyId,
          planType: result.planType,
          amount: result.amount,
          expiresAt: result.expiresAt,
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
        const amount = parseFloat(totalAmount.toString()); // Kuruş cinsinden
        const amountInTL = amount / 100; // TL'ye çevir

        let planType = "monthly";
        if (amountInTL >= 899.99) {
          planType = "yearly";
        } else if (amountInTL >= 499.99) {
          planType = "6months";
        }
        
        // Plan tutarını doğrula
        if (!validatePlanAmount(planType, amount)) {
          console.error("POST Callback - Plan amount validation failed:", { planType, amount, expected: PLAN_PRICES[planType as keyof typeof PLAN_PRICES] });
          return new Response("FAILED", { status: 400 });
        }

        // Tek transaction içinde tüm işlemleri yap
        const result = await prisma.$transaction(async (tx) => {
          // 1. Pending kaydı çek
          const pending = await tx.companySubscription.findUnique({ 
            where: { orderId: merchantOid.toString() } 
          });
          
          if (!pending) {
            throw new Error("Pending subscription not found");
          }
          
          // 2. Idempotency kontrolü - zaten completed ise erken çık
          if (pending.status === "completed") {
            console.log("POST Callback - Payment already processed for order:", merchantOid);
            return { alreadyProcessed: true };
          }

          // 3. Şirketin son completed aboneliğini bul
          const lastCompletedSubscription = await tx.companySubscription.findFirst({
            where: { 
              companyId: pending.companyId,
              status: "completed",
              orderId: { not: merchantOid.toString() } // Yeni ödeme hariç
            },
            orderBy: { expiresAt: 'desc' } // En son biten
          });

          const paymentDate = new Date();
          
          // 4. Baz tarihini hesapla: max(şu an, son tamamlanan aboneliğin bitiş tarihi)
          const baseDate = lastCompletedSubscription 
            ? new Date(Math.max(paymentDate.getTime(), lastCompletedSubscription.expiresAt.getTime()))
            : paymentDate;
          
          // 5. Süreyi date-fns ile ekle
          const expiresAt = calculatePlanExpiration(baseDate, planType);
          
          if (lastCompletedSubscription) {
            console.log(`POST Callback - Abonelik uzatılıyor: ${lastCompletedSubscription.expiresAt.toISOString()} -> ${expiresAt.toISOString()}`);
          } else {
            console.log(`POST Callback - Yeni abonelik başlatılıyor: ${expiresAt.toISOString()}`);
          }

          // 6. Kaydı completed yap
          await tx.companySubscription.update({
            where: { orderId: merchantOid.toString() },
            data: {
              status: "completed",
              paymentDate: paymentDate,
              expiresAt: expiresAt,
              updatedAt: new Date(),
            }
          });

          return { 
            alreadyProcessed: false, 
            companyId: pending.companyId,
            planType,
            amount,
            expiresAt 
          };
        });

        // Zaten işlenmişse sadece OK dön
        if (result.alreadyProcessed) {
          return new Response("OK");
        }

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