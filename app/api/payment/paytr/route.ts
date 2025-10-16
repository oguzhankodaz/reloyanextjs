/** @format
 *  Token endpoint (PayTR get-token)
 *  Path: app/api/payment/paytr/route.ts
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

/* Next.js – crypto için Node runtime kullan */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ==== CONFIG ==== */
const MERCHANT_ID  = process.env.PAYTR_MERCHANT_ID!;
const MERCHANT_KEY = (process.env.PAYTR_MERCHANT_KEY || "").trim(); // boşluk temizle
const MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT!;
const PAYTR_URL = process.env.PAYTR_URL || "https://www.paytr.com/odeme/api/get-token";

/* Geliştirmede IP fallback */
const TEST_PUBLIC_IP = process.env.TEST_PUBLIC_IP || "84.51.26.82";

/* Plan fiyatları (TL) */
const PLAN_PRICES = {
  monthly: 99.99,
  "6months": 499.99,
  yearly: 899.99,
} as const;

type PlanKey = keyof typeof PLAN_PRICES;

/* ---- Helpers ---- */
function getClientIPv4(req: NextRequest): string {
  const cf = req.headers.get("cf-connecting-ip");          // Cloudflare
  const trueClient = req.headers.get("true-client-ip");     // bazı proxyler
  const fwd = req.headers.get("x-forwarded-for");           // "ip1, ip2"
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

  if (isIPv6 || isLocal) ip = TEST_PUBLIC_IP; // PayTR IPv4 ister
  return ip;
}

function makeOrderId(companyId: string) {
  const safe = String(companyId).replace(/[^a-zA-Z0-9_]/g, "");
  return `ORDER${safe}${Date.now()}`;
}

/* ---- Handler ---- */
export async function POST(request: NextRequest) {
  try {
    /* Body */
    const body = await request.json().catch(() => null);
    const planType = (body?.planType as PlanKey) || null;
    const companyId = body?.companyId as string | null;

    if (!planType || !companyId)
      return NextResponse.json({ success: false, error: "Plan türü ve şirket ID'si gerekli" }, { status: 400 });

    if (!(planType in PLAN_PRICES))
      return NextResponse.json({ success: false, error: "Geçersiz plan türü" }, { status: 400 });

    if (!MERCHANT_ID || !MERCHANT_KEY || !MERCHANT_SALT)
      return NextResponse.json(
        { success: false, error: "PAYTR config eksik (MERCHANT_ID/KEY/SALT)" },
        { status: 500 }
      );

    /* Base URL (OK/FAIL için) */
    const origin = request.nextUrl.origin;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || origin;

    /* IP */
    const userIp = getClientIPv4(request);

    /* Sipariş */
    const amount = PLAN_PRICES[planType];
    const orderId = makeOrderId(companyId);

    /* Sepet */
    const basket = [[`${planType.toUpperCase()} Plan`, "1", amount.toFixed(2)]];
    const basketBase64 = Buffer.from(JSON.stringify(basket)).toString("base64");

    /* PayTR parametreleri */
    const p: Record<string, string> = {
      merchant_id: MERCHANT_ID,
      user_ip: userIp,
      merchant_oid: orderId,
      email: "company@example.com",              // TODO: gerçek e-posta
      payment_amount: Math.round(amount * 100).toString(), // kuruş
      user_basket: basketBase64,
      no_installment: "0",
      max_installment: "0",
      currency: "TL",
      test_mode: "1",                            // canlıda 0 yap
      user_name: "Company User",
      user_address: "Turkey",
      user_phone: "5555555555",
      merchant_ok_url: `${baseUrl}/company/profile?payment=success`,
      merchant_fail_url: `${baseUrl}/company/profile?payment=failed`,
      timeout_limit: "30",
      debug_on: "1",
      lang: "tr",
      paytr_token: "", // birazdan hesaplanacak
    };

    /* Token (HMAC-SHA256 base64) */
    const tokenStr =
      `${MERCHANT_ID}${p.user_ip}${p.merchant_oid}${p.email}${p.payment_amount}` +
      `${p.user_basket}${p.no_installment}${p.max_installment}${p.currency}${p.test_mode}${MERCHANT_SALT}`;

    p.paytr_token = crypto.createHmac("sha256", MERCHANT_KEY).update(tokenStr).digest("base64");

    /* İstek */
    const res = await fetch(PAYTR_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(p).toString(),
      // Next.js fetch cache kapalı olsun
      cache: "no-store",
    });

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      const text = await res.text();
      return NextResponse.json(
        { success: false, error: "PayTR yanıtı JSON değil", details: text },
        { status: 502 }
      );
    }

    if (data?.status !== "success") {
      // PayTR detaylarını logla ama kullanıcıya minimal döndür
      console.error("PayTR token failed:", data);
      return NextResponse.json(
        { success: false, error: data?.reason || "PayTR ödeme başlatılamadı", details: data },
        { status: 400 }
      );
    }

    /* DB: pending upsert (idempotent) */
    try {
      await prisma.companySubscription.upsert({
        where: { orderId },
        create: {
          companyId: companyId,
          orderId,
          planType,
          amount,
          status: "pending",
          // başarı callback’inde kesinlenecek
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
        update: {
          status: "pending",
          updatedAt: new Date(),
        },
      });
    } catch (e) {
      console.error("Pending subscription upsert error:", e);
      // ödeme yine de başlatılacak; devam.
    }

    return NextResponse.json({
      success: true,
      token: data.token,
      orderId,
      amount,
      planType,
    });
  } catch (err) {
    console.error("PayTR token endpoint error:", err);
    return NextResponse.json({ success: false, error: "Ödeme işlemi başlatılamadı" }, { status: 500 });
  }
}
