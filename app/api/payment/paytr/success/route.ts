/** @format */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";

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
      try {
        // Order ID'den company ID'yi çıkar (ORDER{companyId}{timestamp} formatından)
        const orderIdStr = merchantOid.toString();
        const companyIdMatch = orderIdStr.match(/^ORDER([a-zA-Z0-9]+)\d+$/);
        
        if (!companyIdMatch) {
          console.error("Company ID could not be extracted from order ID:", merchantOid);
          return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/company/profile?payment=error&reason=invalid_order_id`);
        }

        const companyId = companyIdMatch[1];
        const amount = parseFloat(totalAmount.toString()) / 100; // Kuruştan TL'ye çevir
        
        // Plan türünü belirle (order ID'den veya amount'tan)
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

        console.log("Abonelik kaydı oluşturuldu:", {
          merchantOid,
          companyId,
          planType,
          amount,
          expiresAt,
        });

        // Başarı sayfasına yönlendir
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/company/profile?payment=success&order=${merchantOid}`);
      } catch (dbError) {
        console.error("Veritabanı kaydı oluşturulamadı:", dbError);
        // Veritabanı hatası olsa bile ödeme başarılı, kullanıcıyı bilgilendir
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/company/profile?payment=success&order=${merchantOid}&warning=db_error`);
      }
    } else {
      // Ödeme başarısız
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/company/profile?payment=failed&order=${merchantOid}`);
    }

  } catch (error) {
    console.error("PayTR success callback error:", error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/company/profile?payment=error`);
  }
}
