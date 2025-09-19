/** @format */

"use server";
/** @format */

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers"; // Next.js 13+

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, message: "Email ve şifre gerekli", user: null };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { success: false, message: "Kullanıcı bulunamadı", user: null };
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return { success: false, message: "Geçersiz bilgiler", user: null };
  }

  // ✅ JWT oluştur
  const token = jwt.sign(
    {
       type: "user",
      userId: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  const store = await cookies();

  store.set("usr_sess_x92h1", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return {
    success: true,
    message: "Giriş başarılı",
    user: {
      id: user.id,
      name: user.name,
      surname: user.surname,
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
      message: "Şirket bulunamadı",
      company: null,
    };
  }

  const isValid = await bcrypt.compare(password, company.password);
  if (!isValid) {
    return {
      success: false,
      message: "Geçersiz bilgiler",
      company: null,
    };
  }

  // ✅ JWT oluştur
  const token = jwt.sign(
    {
      type: "company",
      companyId: company.id,
      email: company.email,
      name: company.name,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  // ✅ Cookie’ye yaz
  const store = await cookies();
  store.set("cmp_sess_z71f8", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return {
    success: true,
    message: "Giriş başarılı",
    company: {
      companyId: company.id, // 👈 id yer
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




export async function checkSession() {
  const store = await cookies();

  const userToken = store.get("usr_sess_x92h1")?.value;
  const companyToken = store.get("cmp_sess_z71f8")?.value;

  try {
    if (userToken) {
      const decoded: any = jwt.verify(userToken, process.env.JWT_SECRET!);
      return { type: "user", data: decoded };
    }
    if (companyToken) {
      const decoded: any = jwt.verify(companyToken, process.env.JWT_SECRET!);
      return { type: "company", data: decoded };
    }
  } catch {
    return null;
  }

  return null;
}
