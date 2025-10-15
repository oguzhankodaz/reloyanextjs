/** @format */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

const MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY;
const MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT;

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
        // Order ID'den company ID'yi çıkar (ORDER{companyId}{timestamp} formatından)
        const orderIdStr = merchantOid.toString();
        const companyIdMatch = orderIdStr.match(/^ORDER([a-zA-Z0-9]+)\d+$/);
        
        if (!companyIdMatch) {
          console.error("Company ID could not be extracted from order ID:", merchantOid);
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${request.nextUrl.origin}`;
          return NextResponse.redirect(`${baseUrl}/company/profile?payment=error&reason=invalid_order_id`);
        }

        const companyId = companyIdMatch[1];
        const amount = parseFloat(totalAmount.toString()) / 100; // Kuruştan TL'ye çevir
        
        // Pending kayıttan planType'ı oku (idempotent upsert)
        const pending = await prisma.companySubscription.findUnique({ where: { orderId: merchantOid.toString() } });
        const planType = pending?.planType || (amount >= 899.99 ? "yearly" : amount >= 499.99 ? "6months" : "monthly");

        // Abonelik bitiş tarihini hesapla
        const paymentDate = new Date();
        const expiresAt = new Date();
        
        if (planType === "monthly") {
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        } else if (planType === "6months") {
          expiresAt.setMonth(expiresAt.getMonth() + 6);
        } else if (planType === "yearly") {
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
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
            status: "active",
            paymentDate: paymentDate,
            expiresAt: expiresAt,
          },
          create: {
            companyId: companyId,
            orderId: merchantOid.toString(),
            planType: planType,
            amount: amount,
            status: "active",
            paymentDate: paymentDate,
            expiresAt: expiresAt,
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

        const paymentDate = new Date();
        const expiresAt = new Date();
        if (planType === "monthly") {
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        } else if (planType === "6months") {
          expiresAt.setMonth(expiresAt.getMonth() + 6);
        } else if (planType === "yearly") {
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        }

        await prisma.companySubscription.create({
          data: {
            companyId,
            orderId: merchantOid.toString(),
            planType,
            amount,
            status: "active",
            paymentDate,
            expiresAt,
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