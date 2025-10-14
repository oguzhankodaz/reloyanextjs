/** @format */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const merchantOid = formData.get("merchant_oid");
    const status = formData.get("status");
    const totalAmount = formData.get("total_amount");
    const hash = formData.get("hash");

    if (!merchantOid || !status || !totalAmount || !hash) {
      return NextResponse.json(
        { success: false, error: "Eksik parametreler" },
        { status: 400 }
      );
    }

    // Hash doğrulama
    const hashString = `${merchantOid}${MERCHANT_KEY}${status}${totalAmount}`;
    const calculatedHash = crypto.createHmac("sha256", MERCHANT_KEY!).update(hashString).digest("base64");

    if (calculatedHash !== hash) {
      return NextResponse.json(
        { success: false, error: "Hash doğrulama hatası" },
        { status: 400 }
      );
    }

    // Ödeme başarılı mı kontrol et
    if (status === "success") {
      // Burada veritabanında abonelik kaydını oluştur
      // Şimdilik sadece log yazalım
      console.log("Ödeme başarılı:", {
        merchantOid,
        totalAmount,
        status,
      });

      // TODO: Veritabanında abonelik kaydını oluştur
      // await createSubscription({
      //   orderId: merchantOid,
      //   amount: totalAmount,
      //   status: 'active',
      //   companyId: extractCompanyIdFromOrderId(merchantOid)
      // });

      // Başarı sayfasına yönlendir
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/company/profile?payment=success&order=${merchantOid}`);
    } else {
      // Ödeme başarısız
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/company/profile?payment=failed&order=${merchantOid}`);
    }

  } catch (error) {
    console.error("PayTR success callback error:", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/company/profile?payment=error`);
  }
}
