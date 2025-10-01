/** @format */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password, type } = await req.json();

    if (!token || !password || !type || (type !== "user" && type !== "company")) {
      return NextResponse.json(
        { success: false, message: "Geçersiz istek" },
        { status: 400 }
      );
    }

    // Şifre validasyonu
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Şifre en az 8 karakter olmalıdır" },
        { status: 400 }
      );
    }

    // Token'ı bul ve doğrula
    let userId: string | null = null;
    let companyId: string | null = null;

    if (type === "user") {
      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!resetToken || resetToken.expires < new Date()) {
        return NextResponse.json(
          { success: false, message: "Geçersiz veya süresi dolmuş token" },
          { status: 400 }
        );
      }

      userId = resetToken.userId;

      // Token'ı kullanıldı olarak işaretle (sil)
      await prisma.passwordResetToken.delete({
        where: { token },
      });
    } else {
      const resetToken = await prisma.companyPasswordResetToken.findUnique({
        where: { token },
        include: { company: true },
      });

      if (!resetToken || resetToken.expires < new Date()) {
        return NextResponse.json(
          { success: false, message: "Geçersiz veya süresi dolmuş token" },
          { status: 400 }
        );
      }

      companyId = resetToken.companyId;

      await prisma.companyPasswordResetToken.delete({
        where: { token },
      });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Şifreyi güncelle
    if (type === "user" && userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });
    } else if (type === "company" && companyId) {
      await prisma.company.update({
        where: { id: companyId },
        data: { password: hashedPassword },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Şifreniz başarıyla güncellendi",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, message: "Bir hata oluştu" },
      { status: 500 }
    );
  }
}

