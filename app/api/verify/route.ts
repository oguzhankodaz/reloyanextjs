import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const type = searchParams.get("type"); // "user" veya "company"

  if (!token || !type) {
    return NextResponse.json({ success: false, message: "Eksik parametre" }, { status: 400 });
  }

  try {
    if (type === "user") {
      const record = await prisma.verificationToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!record || record.expires < new Date()) {
        return NextResponse.json({ success: false, message: "Token geçersiz veya süresi dolmuş" }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: record.userId },
        data: { verified: true },
      });

      await prisma.verificationToken.delete({ where: { id: record.id } });

      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-success?type=user`;
      return NextResponse.redirect(redirectUrl);
    }

    if (type === "company") {
      const record = await prisma.companyVerificationToken.findUnique({
        where: { token },
        include: { company: true },
      });

      if (!record || record.expires < new Date()) {
        return NextResponse.json({ success: false, message: "Token geçersiz veya süresi dolmuş" }, { status: 400 });
      }

      await prisma.company.update({
        where: { id: record.companyId },
        data: { verified: true },
      });

      await prisma.companyVerificationToken.delete({ where: { id: record.id } });

      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-success?type=company`;
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.json({ success: false, message: "Geçersiz tip" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Sunucu hatası" }, { status: 500 });
  }
}
