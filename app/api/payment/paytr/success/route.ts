/** @format */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

const MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY;

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

    // Hash doğrulama
    const hashString = `${merchantOid}${MERCHANT_KEY}${status}${totalAmount}`;
    const calculatedHash = crypto.createHmac("sha256", MERCHANT_KEY!).update(hashString).digest("base64");

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
        
        // Plan türünü belirle
        let planType = "monthly";
        if (amount >= 899.99) {
          planType = "yearly";
        } else if (amount >= 499.99) {
          planType = "6months";
        }

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

        // Veritabanında abonelik kaydını oluştur
        await prisma.companySubscription.create({
          data: {
            companyId: companyId,
            orderId: merchantOid.toString(),
            planType: planType,
            amount: amount,
            status: "active",
            paymentDate: paymentDate,
            expiresAt: expiresAt,
          },
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

    return await handleCallback(merchantOid, status, totalAmount, hash, request);
  } catch (error) {
    console.error("PayTR POST callback error:", error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${request.nextUrl.origin}`;
    return NextResponse.redirect(`${baseUrl}/company/profile?payment=error`);
  }
}