/** @format */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { checkRateLimit, getClientIp, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    // ✅ Rate limiting
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(`password-reset:${clientIp}`, "passwordReset");
    
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.retryAfter || 60);
    }

    const { email, type } = await req.json();

    if (!email || !type || (type !== "user" && type !== "company")) {
      return NextResponse.json(
        { success: false, message: "Geçersiz istek" },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul
    const record = type === "user"
      ? await prisma.user.findUnique({ where: { email } })
      : await prisma.company.findUnique({ where: { email } });

    // Güvenlik: Email bulunamasa bile başarılı mesajı göster (email enumeration önleme)
    if (!record) {
      return NextResponse.json({
        success: true,
        message: "Eğer bu email kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.",
      });
    }

    // Token oluştur
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 saat

    // Eski tokenları temizle
    if (type === "user") {
      await prisma.passwordResetToken.deleteMany({
        where: { userId: record.id },
      });
      
      // Yeni token oluştur
      await prisma.passwordResetToken.create({
        data: {
          token,
          userId: record.id,
          expires,
        },
      });
    } else {
      await prisma.companyPasswordResetToken.deleteMany({
        where: { companyId: record.id },
      });
      
      await prisma.companyPasswordResetToken.create({
        data: {
          token,
          companyId: record.id,
          expires,
        },
      });
    }

    // Email gönder
    try {
      await sendPasswordResetEmail(email, token, type);
    } catch (error) {
      console.error("Password reset email error:", error);
      // Email gönderilemese bile kullanıcıya hata verme (güvenlik)
    }

    return NextResponse.json({
      success: true,
      message: "Eğer bu email kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

