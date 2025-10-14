/** @format */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const merchantOid = formData.get("merchant_oid");
    const status = formData.get("status");
    const failedReasonCode = formData.get("failed_reason_code");
    const failedReasonMsg = formData.get("failed_reason_msg");

    console.log("PayTR payment failed:", {
      merchantOid,
      status,
      failedReasonCode,
      failedReasonMsg,
    });

    // Başarısız ödeme sayfasına yönlendir
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/company/profile?payment=failed&order=${merchantOid}&reason=${failedReasonMsg}`);

  } catch (error) {
    console.error("PayTR fail callback error:", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/company/profile?payment=error`);
  }
}
