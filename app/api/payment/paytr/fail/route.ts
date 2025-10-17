/** @format */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY;
const MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT;

// Hash doğrulama fonksiyonu
function validateHash(merchantOid: string, status: string, totalAmount: string, hash: string): boolean {
  if (!MERCHANT_KEY || !MERCHANT_SALT) {
    console.error("PAYTR config missing for hash validation");
    return false;
  }

  const hashMessage = `${merchantOid}${MERCHANT_SALT}${status}${totalAmount}`;
  const calculatedHash = crypto
    .createHmac("sha256", MERCHANT_KEY)
    .update(hashMessage)
    .digest("base64");

  // Timing-safe hash karşılaştırması
  const calculatedHashBuffer = Buffer.from(calculatedHash, 'base64');
  const receivedHashBuffer = Buffer.from(hash, 'base64');
  
  return calculatedHashBuffer.length === receivedHashBuffer.length && 
         crypto.timingSafeEqual(calculatedHashBuffer, receivedHashBuffer);
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const merchantOid = formData.get("merchant_oid")?.toString();
    const status = formData.get("status")?.toString();
    const totalAmount = formData.get("total_amount")?.toString();
    const hash = formData.get("hash")?.toString();
    const failedReasonCode = formData.get("failed_reason_code");
    const failedReasonMsg = formData.get("failed_reason_msg");

    // Temel alan kontrolü
    if (!merchantOid || !status) {
      console.error("Missing required fields in fail callback");
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/company/profile?payment=error&reason=missing_params`);
    }

    // Hash doğrulaması (eğer hash mevcutsa)
    if (hash && totalAmount && !validateHash(merchantOid, status, totalAmount, hash)) {
      console.error("Hash validation failed in fail callback");
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/company/profile?payment=error&reason=hash_mismatch`);
    }

    console.log("PayTR payment failed:", {
      merchantOid,
      status,
      failedReasonCode,
      failedReasonMsg,
    });

    // Başarısız ödeme sayfasına yönlendir
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    return NextResponse.redirect(`${baseUrl}/company/profile?payment=failed&order=${merchantOid}&reason=${encodeURIComponent(failedReasonMsg?.toString() || "Başarısız işlem")}`);

  } catch (error) {
    console.error("PayTR fail callback error:", error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
    return NextResponse.redirect(`${baseUrl}/company/profile?payment=error`);
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const merchantOid = url.searchParams.get("merchant_oid") || "";
    const failedReasonMsg = url.searchParams.get("reason") || "Başarısız işlem";
    const base = process.env.NEXT_PUBLIC_BASE_URL || `${url.origin}`;
    return NextResponse.redirect(`${base}/company/profile?payment=failed&order=${merchantOid}&reason=${failedReasonMsg}`);
  } catch (error) {
    console.error("PayTR fail GET error:", error);
    const url = new URL(request.url);
    const base = process.env.NEXT_PUBLIC_BASE_URL || `${url.origin}`;
    return NextResponse.redirect(`${base}/company/profile?payment=error`);
  }
}