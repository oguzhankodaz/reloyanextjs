/** @format */

"use server";
/** @format */

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {
      success: false,
      message: "Email ve şifre gerekli",
      user: null,
    };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return {
      success: false,
      message: "Kullanıcı bulunamadı",
      user: null,
    };
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    {
      return {
        success: false,
        message: "Geçersiz bilgiler",
        user: null,
      };
    }
  }

  return {
    success: true,
    message: "Giriş başarılı",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}
export async function registerAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const surname = formData.get("surname") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password || !name || !surname) {
    return {
      success: false,
      message: "Tüm Alanları doldurun",
      user: null,
    };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, message: "Bu eposta zaten kayıtlı", user: null };
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      surname,
      email,
      password: hashedPassword,
      qrCode: crypto.randomUUID(),
    },
  });

  return { success: true, message: "Kayıt Başarılı" };
}

export async function loginCompanyAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {
      success: false,
      message: "Email ve şifre gerekli",
      company: null,
    };
  }

  const company = await prisma.company.findUnique({
    where: { email },
  });

  if (!company) {
    return {
      success: false,
      message: "Kullanıcı bulunamadı",
      company: null,
    };
  }

  const isValid = await bcrypt.compare(password, company.password);

  if (!isValid) {
    {
      return {
        success: false,
        message: "Geçersiz bilgiler",
        user: null,
      };
    }
  }

  return {
    success: true,
    message: "Giriş başarılı",
    company: {
      id: company.id,
      name: company.name,
      email: company.email,
    },
  };
}

export async function registerCompanyAction(
  prevState: any,
  formData: FormData
) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const existing = await prisma.company.findUnique({ where: { email } });

  if (existing) {
    return { success: false, message: "Bu eposta zaten kayıtlı", user: null };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const company = await prisma.company.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  return { success: true, message: "Kayıt Başarılı" };
}
