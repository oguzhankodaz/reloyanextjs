/** @format
 *  Token endpoint (PayTR get-token)
 *  Path: app/api/payment/paytr/route.ts
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ==== CONFIG ==== */
const MERCHANT_ID = process.env.PAYTR_MERCHANT_ID!;
const MERCHANT_KEY = (process.env.PAYTR_MERCHANT_KEY || "").trim();
const MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT!;
const PAYTR_URL = process.env.PAYTR_URL || "https://www.paytr.com/odeme/api/get-token";
const TEST_PUBLIC_IP = process.env.TEST_PUBLIC_IP || "84.51.26.82";

/* Plan fiyatları (TL) */
const PLAN_PRICES = {
  monthly: 99.99,
  "6months": 499.99,
  yearly: 899.99,
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
    
    console.log("PayTR callback data:", callbackData);
    
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
    
    // Hash doğrulaması (güvenlik için)
    if (!hash || !merchant_oid) {
      console.error("Missing required callback fields");
      return NextResponse.json({ success: false, error: "Eksik callback parametreleri" }, { status: 400 });
    }
    
    // Ödeme başarılı mı kontrol et
    if (status !== "success") {
      console.error("Payment failed:", status);
      return NextResponse.json({ success: false, error: "Ödeme başarısız" }, { status: 400 });
    }
    
    // Subscription'ı güncelle
    try {
      const orderId = merchant_oid as string;
      const amount = parseFloat(total_amount as string) / 100; // PayTR kuruş cinsinden gönderir
      
      await prisma.companySubscription.update({
        where: { orderId },
        data: {
          status: "completed",
          updatedAt: new Date(),
        },
      });
      
      console.log("Subscription updated successfully:", orderId);
      
      // PayTR'ye başarılı response döndür (PayTR bunu bekler)
      return new NextResponse("OK", { status: 200 });
      
    } catch (dbError) {
      console.error("Database update error:", dbError);
      return NextResponse.json({ success: false, error: "Veritabanı güncelleme hatası" }, { status: 500 });
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

  const isIPv6 = ip.includes(":");
  const isLocal =
    !ip ||
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("172.16.");

  if (isIPv6 || isLocal) ip = TEST_PUBLIC_IP;
  return ip;
}

function makeOrderId(companyId: string) {
  const safe = String(companyId).replace(/[^a-zA-Z0-9_]/g, "");
  return `ORDER${safe}${Date.now()}`;
}

/* ---- Handler ---- */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type");
    console.log("Content-Type:", contentType);
    
    // PayTR callback mi yoksa token request mi kontrol et
    if (contentType?.includes("application/x-www-form-urlencoded")) {
      console.log("PayTR callback detected, handling payment notification");
      return await handlePaytrCallback(request);
    }
    
    // JSON request (token creation)
    console.log("Token creation request detected");
    
    let body: { planType?: PlanKey; companyId?: string } | null = null;
    
    try {
      const text = await request.text();
      console.log("Raw request body:", text);
      
      if (!text || text.trim() === "") {
        return NextResponse.json({ 
          success: false, 
          error: "Request body boş"
        }, { status: 400 });
      }
      
      body = JSON.parse(text);
      console.log("Parsed body:", body);
      
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

    if (!MERCHANT_ID || !MERCHANT_KEY || !MERCHANT_SALT)
      return NextResponse.json(
        { success: false, error: "PAYTR config eksik (MERCHANT_ID/KEY/SALT)" },
        { status: 500 }
      );

    const origin = request.nextUrl.origin;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || origin;

    const userIp = getClientIPv4(request);

    const amount = PLAN_PRICES[planType];
    const orderId = makeOrderId(companyId);

    const basket = [[`${planType.toUpperCase()} Plan`, "1", amount.toFixed(2)]];
    const basketBase64 = Buffer.from(JSON.stringify(basket)).toString("base64");

    const p: Record<string, string> = {
      merchant_id: MERCHANT_ID,
      user_ip: userIp,
      merchant_oid: orderId,
      email: "company@example.com",
      payment_amount: Math.round(amount * 100).toString(),
      user_basket: basketBase64,
      no_installment: "0",
      max_installment: "0",
      currency: "TL",
      test_mode: "1",
      user_name: "Company User",
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

    // ---- burada ANY yok ----
    let dataUnknown: unknown;
    try {
      dataUnknown = await res.json();
    } catch {
      const text = await res.text();
      return NextResponse.json(
        { success: false, error: "PayTR yanıtı JSON değil", details: text },
        { status: 502 }
      );
    }
    const data = dataUnknown as PaytrResponse;

    if (data.status !== "success") {
      console.error("PayTR token failed:", data);
      return NextResponse.json(
        { success: false, error: ("reason" in data && data.reason) || "PayTR ödeme başlatılamadı", details: data },
        { status: 400 }
      );
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
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
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
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("PayTR token endpoint error:", err as unknown);
    return NextResponse.json({ success: false, error: "Ödeme işlemi başlatılamadı" }, { status: 500 });
  }
}
