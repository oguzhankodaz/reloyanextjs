/** @format
 *  Token endpoint (PayTR get-token)
 *  Path: app/api/payment/paytr/route.ts
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { addMonths, addYears } from "date-fns";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ==== CONFIG ==== */
const MERCHANT_ID = process.env.PAYTR_MERCHANT_ID!;
const MERCHANT_KEY = (process.env.PAYTR_MERCHANT_KEY || "").trim();
const MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT!;
const PAYTR_URL = process.env.PAYTR_URL || "https://www.paytr.com/odeme/api/get-token";

/* Plan fiyatları (TL) */
const PLAN_PRICES = {
  monthly: 649,
  "6months": 2999,
  yearly: 4999,
} as const;

type PlanKey = keyof typeof PLAN_PRICES;

/* ---- PayTR response tipi ---- */
type PaytrSuccess = {
  status: "success";
  token: string;
};
type PaytrFailure = {
  status: "failed" | "error";
  reason?: string;
  err_msg?: string;
  [k: string]: unknown;
};
type PaytrResponse = PaytrSuccess | PaytrFailure;

/* ---- PayTR Callback Handler ---- */
async function handlePaytrCallback(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const callbackData = Object.fromEntries(formData.entries());
    
    
    const {
      hash,
      merchant_oid,
      status,
      total_amount,
      payment_type,
      payment_amount,
      currency,
      installment_count,
      merchant_id,
      test_mode
    } = callbackData;
    
    // Temel alan kontrolü
    if (!hash || !merchant_oid || !status || !total_amount) {
      console.error("Missing required callback fields");
      return NextResponse.json({ success: false, error: "Eksik callback parametreleri" }, { status: 400 });
    }

    // Hash doğrulaması (PayTR güvenlik kontrolü)
    if (!MERCHANT_KEY || !MERCHANT_SALT) {
      console.error("PAYTR config missing for callback hash validation");
      return NextResponse.json({ success: false, error: "Sunucu yapılandırma hatası" }, { status: 500 });
    }

    const hashMessage = `${merchant_oid}${MERCHANT_SALT}${status}${total_amount}`;
    const calculatedHash = crypto
      .createHmac("sha256", MERCHANT_KEY)
      .update(hashMessage)
      .digest("base64");

    // Timing-safe hash karşılaştırması
    const calculatedHashBuffer = Buffer.from(calculatedHash, 'base64');
    const receivedHashBuffer = Buffer.from(hash.toString(), 'base64');
    
    if (calculatedHashBuffer.length !== receivedHashBuffer.length || 
        !crypto.timingSafeEqual(calculatedHashBuffer, receivedHashBuffer)) {
      console.error("Hash doğrulama hatası - güvenlik ihlali");
      return NextResponse.json({ success: false, error: "Güvenlik doğrulama hatası" }, { status: 403 });
    }
    
    // Ödeme başarılı mı kontrol et
    if (status !== "success") {
      console.error("Payment failed:", status);
      return NextResponse.json({ success: false, error: "Ödeme başarısız" }, { status: 400 });
    }
    
    // Subscription'ı güncelle veya uzat
    try {
      const orderId = merchant_oid as string;
      const amount = parseFloat(total_amount as string) / 100; // PayTR kuruş cinsinden gönderir
      
      // Pending subscription'ı al (yeni ödeme için)
      const pendingSubscription = await prisma.companySubscription.findUnique({
        where: { orderId }
      });
      
      if (!pendingSubscription) {
        console.error("Pending subscription not found:", orderId);
        return NextResponse.json({ success: false, error: "Abonelik bulunamadı" }, { status: 404 });
      }

      const companyId = pendingSubscription.companyId;
      const planType = pendingSubscription.planType;
      
      // Mevcut aktif aboneliği bul
      const existingActiveSubscription = await prisma.companySubscription.findFirst({
        where: { 
          companyId: companyId,
            status: "completed",
          expiresAt: { gt: new Date() }, // Hala aktif olan
          orderId: { not: orderId } // Yeni ödeme hariç
        },
        orderBy: { expiresAt: 'desc' } // En uzun süreli
      });

      
      const now = new Date();
      
      // Plan tipine göre süre hesapla
      let planDurationMs = 0;
      switch (planType) {
        case "monthly":
          planDurationMs = 30 * 24 * 60 * 60 * 1000; // 30 gün
          break;
        case "6months":
          planDurationMs = 180 * 24 * 60 * 60 * 1000; // 6 ay
          break;
        case "yearly":
          planDurationMs = 365 * 24 * 60 * 60 * 1000; // 1 yıl
          break;
        default:
          planDurationMs = 30 * 24 * 60 * 60 * 1000; // varsayılan 30 gün
      }
      
      // Mevcut abonelik bitiş tarihini kontrol et
      let newExpirationDate: Date;
      
      if (existingActiveSubscription) {
        // Mevcut aktif abonelik var - süreyi uzat
        newExpirationDate = new Date(existingActiveSubscription.expiresAt.getTime() + planDurationMs);
        console.log(`Abonelik uzatılıyor: ${existingActiveSubscription.expiresAt.toISOString()} -> ${newExpirationDate.toISOString()}`);
      } else {
        // Mevcut aktif abonelik yok - şu andan itibaren başlat
        newExpirationDate = new Date(now.getTime() + planDurationMs);
        console.log(`Yeni abonelik başlatılıyor: ${newExpirationDate.toISOString()}`);
      }

      await prisma.companySubscription.update({
        where: { orderId },
        data: {
            status: "completed",
          updatedAt: new Date(),
          expiresAt: newExpirationDate,
        },
      });
      
      
      // PayTR'ye başarılı response döndür (PayTR bunu bekler)
      return new NextResponse("OK", { status: 200 });
      
    } catch (dbError) {
      console.error("Database update error:", dbError);
      // Veritabanı hatası durumunda ödeme işlemini iptal et
      return NextResponse.json({ 
        success: false, 
        error: "Ödeme işlemi tamamlanamadı. Lütfen tekrar deneyin." 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error("PayTR callback error:", error);
    return NextResponse.json({ success: false, error: "Callback işleme hatası" }, { status: 500 });
  }
}

/* ---- Helpers ---- */
function getClientIPv4(req: NextRequest): string {
  const cf = req.headers.get("cf-connecting-ip");
  const trueClient = req.headers.get("true-client-ip");
  const fwd = req.headers.get("x-forwarded-for");
  const real = req.headers.get("x-real-ip");

  let ip = (cf || trueClient || (fwd ? fwd.split(",")[0] : "") || real || "").trim();

  // IPv6 adreslerini handle et
  if (ip.includes(":")) {
    // IPv6 adresini IPv4'e çevirmeye çalış
    if (ip.startsWith("::ffff:")) {
      ip = ip.substring(7); // ::ffff: prefix'ini kaldır
    } else {
      // Diğer IPv6 adresleri için varsayılan IP kullan
      console.warn("IPv6 address detected, using fallback IP:", ip);
      return "127.0.0.1";
    }
  }

  // Geçersiz IP'ler için kontrol
  if (!ip || ip === "::1" || ip === "localhost") {
    console.warn("Invalid IP address, using fallback IP:", ip);
    return "127.0.0.1";
  }

  // Private IP'ler için sadece development ortamında varsayılan kullan
  const isPrivateIP = ip.startsWith("10.") || 
                     ip.startsWith("192.168.") || 
                     ip.startsWith("172.16.") || 
                     ip.startsWith("172.17.") || 
                     ip.startsWith("172.18.") || 
                     ip.startsWith("172.19.") || 
                     ip.startsWith("172.20.") || 
                     ip.startsWith("172.21.") || 
                     ip.startsWith("172.22.") || 
                     ip.startsWith("172.23.") || 
                     ip.startsWith("172.24.") || 
                     ip.startsWith("172.25.") || 
                     ip.startsWith("172.26.") || 
                     ip.startsWith("172.27.") || 
                     ip.startsWith("172.28.") || 
                     ip.startsWith("172.29.") || 
                     ip.startsWith("172.30.") || 
                     ip.startsWith("172.31.");

  if (isPrivateIP && process.env.NODE_ENV === "production") {
    console.warn("Private IP in production, using fallback IP:", ip);
    return "127.0.0.1";
  }

  return ip;
}

function makeOrderId(companyId: string) {
  const safe = String(companyId).replace(/[^a-zA-Z0-9_]/g, "");
  return `ORDER${safe}${Date.now()}`;
}

function calculateExpirationDate(planType: PlanKey): Date {
  const now = new Date();
  
  switch (planType) {
    case "monthly":
      return addMonths(now, 1);
    case "6months":
      return addMonths(now, 6);
    case "yearly":
      return addYears(now, 1);
    default:
      return addMonths(now, 1); // Varsayılan 1 ay
  }
}

// Abonelik uzatma hesaplama fonksiyonu (date-fns ile)
function calculateExtensionDate(currentExpiration: Date, planType: PlanKey): Date {
  switch (planType) {
    case "monthly":
      return addMonths(currentExpiration, 1);
    case "6months":
      return addMonths(currentExpiration, 6);
    case "yearly":
      return addYears(currentExpiration, 1);
    default:
      return addMonths(currentExpiration, 1);
  }
}

/* ---- Handler ---- */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type");
    
    // PayTR callback mi yoksa token request mi kontrol et
    if (contentType?.includes("application/x-www-form-urlencoded")) {
      return await handlePaytrCallback(request);
    }
    
    // Rate limiting kontrolü (sadece token request'ler için)
    const clientIp = getClientIp(request);
    const rateLimitResult = checkRateLimit(clientIp, "api");
    
    if (!rateLimitResult.allowed) {
      console.warn(`Rate limit exceeded for IP: ${clientIp}`);
      return NextResponse.json(
        { 
          success: false, 
          error: "Çok fazla istek gönderildi. Lütfen biraz bekleyin.",
          retryAfter: rateLimitResult.retryAfter
        }, 
        { 
          status: 429,
          headers: {
            "Retry-After": rateLimitResult.retryAfter?.toString() || "60"
          }
        }
      );
    }
    
    // JSON request (token creation)
    
    let body: { planType?: PlanKey; companyId?: string } | null = null;
    
    try {
      const text = await request.text();
      
      if (!text || text.trim() === "") {
        return NextResponse.json({ 
          success: false, 
          error: "Request body boş"
        }, { status: 400 });
      }
      
      body = JSON.parse(text);
      
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json({ 
        success: false, 
        error: "Geçersiz JSON formatı"
      }, { status: 400 });
    }

    const planType = body?.planType as PlanKey || null;
    const companyId = body?.companyId ?? null;

    if (!planType || !companyId) {
      return NextResponse.json({ 
        success: false, 
        error: "Plan türü ve şirket ID'si gerekli"
      }, { status: 400 });
    }

    if (!(planType in PLAN_PRICES))
      return NextResponse.json({ success: false, error: "Geçersiz plan türü" }, { status: 400 });

    // PayTR konfigürasyon kontrolü
    if (!MERCHANT_ID || !MERCHANT_KEY || !MERCHANT_SALT) {
      console.error("PAYTR configuration missing:", {
        hasMerchantId: !!MERCHANT_ID,
        hasMerchantKey: !!MERCHANT_KEY,
        hasMerchantSalt: !!MERCHANT_SALT
      });
      return NextResponse.json(
        { success: false, error: "Ödeme sistemi yapılandırma hatası" },
        { status: 500 }
      );
    }

    // Merchant key ve salt güçlülük kontrolü
    if (MERCHANT_KEY.length < 16 || MERCHANT_SALT.length < 16) {
      console.error("PAYTR credentials too weak");
      return NextResponse.json(
        { success: false, error: "Ödeme sistemi güvenlik hatası" },
        { status: 500 }
      );
    }

    const origin = request.nextUrl.origin;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || origin;

    // Şirket bilgilerini al
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true, email: true }
    });

    if (!company) {
      return NextResponse.json({ success: false, error: "Şirket bulunamadı" }, { status: 404 });
    }

    const userIp = getClientIPv4(request);
    const amount = PLAN_PRICES[planType];
    const orderId = makeOrderId(companyId);

    const basket = [[`${planType.toUpperCase()} Plan`, "1", amount.toFixed(2)]];
    const basketBase64 = Buffer.from(JSON.stringify(basket)).toString("base64");

    const p: Record<string, string> = {
      merchant_id: MERCHANT_ID,
      user_ip: userIp,
      merchant_oid: orderId,
      email: company.email,
      payment_amount: Math.round(amount * 100).toString(),
      user_basket: basketBase64,
      no_installment: "0",
      max_installment: "0",
      currency: "TL",
      test_mode: "1",
      user_name: company.name,
      user_address: "Turkey",
      user_phone: "5555555555",
      merchant_ok_url: `${baseUrl}/company/profile?payment=success`,
      merchant_fail_url: `${baseUrl}/company/profile?payment=failed`,
      timeout_limit: "30",
      debug_on: "1",
      lang: "tr",
      paytr_token: "",
    };

    const tokenStr =
      `${MERCHANT_ID}${p.user_ip}${p.merchant_oid}${p.email}${p.payment_amount}` +
      `${p.user_basket}${p.no_installment}${p.max_installment}${p.currency}${p.test_mode}${MERCHANT_SALT}`;

    p.paytr_token = crypto.createHmac("sha256", MERCHANT_KEY).update(tokenStr).digest("base64");

    const res = await fetch(PAYTR_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(p).toString(),
      cache: "no-store",
    });

    // Response body'sini text olarak oku, sonra JSON parse et
    const responseText = await res.text();
    
    let data: PaytrResponse;
    
    try {
      data = JSON.parse(responseText) as PaytrResponse;
    } catch {
      return NextResponse.json(
        { success: false, error: "PayTR yanıtı JSON değil" },
        { status: 502 }
      );
    }

    if (data.status !== "success") {
      console.error("PayTR token failed:", data);
      return NextResponse.json(
        { success: false, error: ("reason" in data && data.reason) || "PayTR ödeme başlatılamadı", details: data },
        { status: 400 }
      );
    }

    // Mevcut aktif aboneliği kontrol et
    const existingActiveSubscription = await prisma.companySubscription.findFirst({
      where: { 
        companyId: companyId,
            status: "completed",
        expiresAt: { gt: new Date() } // Hala aktif olan
      },
      orderBy: { expiresAt: 'desc' } // En son biten
    });

    let subscriptionInfo = {
      isExtension: false,
      currentExpiration: null as Date | null,
      newExpiration: null as Date | null
    };

    if (existingActiveSubscription) {
      // Mevcut abonelik var - uzatma yapılacak
      const newExpiration = calculateExtensionDate(existingActiveSubscription.expiresAt, planType);
      
      subscriptionInfo = {
        isExtension: true,
        currentExpiration: existingActiveSubscription.expiresAt,
        newExpiration: newExpiration
      };
      
      console.log(`Abonelik uzatma işlemi: ${existingActiveSubscription.expiresAt.toISOString()} -> ${newExpiration.toISOString()}`);
    }

    try {
      await prisma.companySubscription.upsert({
        where: { orderId },
        create: {
          companyId,
          orderId,
          planType,
          amount,
          status: "pending",
          expiresAt: calculateExpirationDate(planType),
        },
        update: {
          status: "pending",
          updatedAt: new Date(),
        },
      });
    } catch (e) {
      // tip belirtelim ki any olmasın
      // eslint-disable-next-line no-console
      console.error("Pending subscription upsert error:", e as unknown);
    }

    return NextResponse.json({
      success: true,
      token: (data as PaytrSuccess).token,
      orderId,
      amount,
      planType,
      subscriptionInfo: {
        isExtension: subscriptionInfo.isExtension,
        currentExpiration: subscriptionInfo.currentExpiration?.toISOString() || null,
        newExpiration: subscriptionInfo.newExpiration?.toISOString() || null
      }
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("PayTR token endpoint error:", err as unknown);
    return NextResponse.json({ success: false, error: "Ödeme işlemi başlatılamadı" }, { status: 500 });
  }
}
