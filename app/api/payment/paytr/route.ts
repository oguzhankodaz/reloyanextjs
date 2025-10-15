/** @format */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// PayTR API bilgileri
const MERCHANT_ID = process.env.PAYTR_MERCHANT_ID;
const MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY;
const MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT;
const PAYTR_URL = process.env.PAYTR_URL || "https://www.paytr.com/odeme/api/get-token";

// Plan fiyatları (TL cinsinden)
const PLAN_PRICES = {
  monthly: 99.99,
  "6months": 499.99,
  yearly: 899.99,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planType, companyId } = body;

    if (!planType || !companyId) {
      return NextResponse.json(
        { success: false, error: "Plan türü ve şirket ID'si gerekli" },
        { status: 400 }
      );
    }

    // Plan türünü kontrol et
    if (!PLAN_PRICES[planType as keyof typeof PLAN_PRICES]) {
      return NextResponse.json(
        { success: false, error: "Geçersiz plan türü" },
        { status: 400 }
      );
    }

    // Validate required envs
    if (!MERCHANT_ID || !MERCHANT_KEY || !MERCHANT_SALT) {
      return NextResponse.json(
        { success: false, error: "PAYTR config eksik: MERCHANT_ID/KEY/SALT tanımlı değil" },
        { status: 500 }
      );
    }

    const merchantId = MERCHANT_ID;
    const merchantKey = MERCHANT_KEY;
    const merchantSalt = MERCHANT_SALT;

    const amount = PLAN_PRICES[planType as keyof typeof PLAN_PRICES];
    const sanitizedCompanyId = String(companyId).replace(/[^a-zA-Z0-9]/g, "");
    const orderId = `ORDER${sanitizedCompanyId}${Date.now()}`; // Alfanumerik, ayraç yok

    // Base URL (fallback to request origin if env is not set)
    const origin = request.nextUrl.origin;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || origin;

    // Resolve IP address
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const userIp = (forwardedFor?.split(",")[0] || realIp || "127.0.0.1").trim();
    
    // PayTR için gerekli parametreler
    const basket = [
      [
        `${planType.toUpperCase()} Plan`,
        "1", // Adet string olmalı
        amount.toFixed(2), // Birim fiyat TL string
      ],
    ];
    const basketBase64 = Buffer.from(JSON.stringify(basket)).toString("base64");

    const paytrParams: Record<string, string> = {
      merchant_id: merchantId,
      user_ip: userIp,
      merchant_oid: orderId,
      email: "company@example.com", // Şirket email'i burada olacak
      payment_amount: Math.round(amount * 100).toString(), // Kuruş cinsinden
      paytr_token: "",
      user_basket: basketBase64,
      currency: "TL",
      test_mode: "1",
      no_installment: "0",
      max_installment: "0",
      user_name: "Company User",
      user_address: "Turkey",
      user_phone: "5555555555",
      // Browser OK/FAIL: kullanıcıyı bilgi sayfasına götürür (DB yazımı panelde tanımlı S2S callback ile yapılır)
      merchant_ok_url: `${baseUrl}/company/profile?payment=success`,
      merchant_fail_url: `${baseUrl}/company/profile?payment=failed`,
      timeout_limit: "30",
      debug_on: "1",
      lang: "tr",
    };

    // Token oluşturma
    const hashString =
      `${merchantId}${paytrParams.user_ip}${paytrParams.merchant_oid}${paytrParams.email}${paytrParams.payment_amount}${paytrParams.user_basket}${paytrParams.no_installment}${paytrParams.max_installment}${paytrParams.currency}${paytrParams.test_mode}${merchantSalt}`;
    
    const token = crypto.createHmac("sha256", merchantKey).update(hashString).digest("base64");
    paytrParams.paytr_token = token;

    // PayTR'ye istek gönder
    const paytrResponse = await fetch(PAYTR_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(paytrParams).toString(),
    });

    const paytrResult = await paytrResponse.json();

    if (paytrResult.status === "success") {
      // Başarılı response: DB'de pending kayıt aç (idempotent)
      try {
        const { default: prisma } = await import("@/lib/prisma");
        await prisma.companySubscription.upsert({
          where: { orderId },
          create: {
            companyId: sanitizedCompanyId,
            orderId,
            planType,
            amount,
            status: "pending",
            // paymentDate default now(), expiresAt şimdilik plan bazlı tahmini yazmayalım; success callback'te kesinleştiririz
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // geçici; success'te güncellenecek
          },
          update: {},
        });
      } catch (dbErr) {
        console.error("Pending subscription create failed:", dbErr);
        // Devam et; ödeme yine de başlatılacak
      }

      return NextResponse.json({
        success: true,
        token: paytrResult.token,
        orderId,
        amount,
        planType,
      });
    } else {
      // PayTR hatası
      return NextResponse.json(
        { 
          success: false, 
          error: paytrResult.reason || "PayTR ödeme başlatılamadı",
          details: paytrResult
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("PayTR payment error:", error);
    return NextResponse.json(
      { success: false, error: "Ödeme işlemi başlatılamadı" },
      { status: 500 }
    );
  }
}
