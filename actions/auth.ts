/** @format */

"use server";
/** @format */

import prisma from "@/lib/prisma";
import { toTitleCase } from "@/lib/helpers";
import bcrypt from "bcryptjs";
import { isValidEmail, isValidPassword, isValidName, isValidCompanyName } from "@/lib/helpers";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers"; // Next.js 13+

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, message: "Email ve şifre gerekli", user: null };
  }
  if (!isValidEmail(email)) {
    return { success: false, message: "Geçersiz e-posta formatı", user: null };
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
    message: "Giriş Yapılıyor...",
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
  if (!isValidName(name) || !isValidName(surname)) {
    return { success: false, message: "Ad ve soyad en az 2 karakter olmalı", user: null };
  }
  if (!isValidEmail(email)) {
    return { success: false, message: "Geçersiz e-posta formatı", user: null };
  }
  if (!isValidPassword(password)) {
    return { success: false, message: "Şifre en az 8 karakter, harf ve rakam içermeli", user: null };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, message: "Bu eposta zaten kayıtlı", user: null };
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: toTitleCase(name),
      surname: toTitleCase(surname),
      email: email.trim().toLowerCase(),
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
  if (!isValidEmail(email)) {
    return {
      success: false,
      message: "Geçersiz e-posta formatı",
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
    message: "Giriş Yapılıyor...",
    company: {
      companyId: company.id, // 👈 id yer
      name: toTitleCase(company.name),
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

  if (!isValidCompanyName(name)) {
    return { success: false, message: "Geçerli bir şirket adı girin", user: null };
  }
  if (!isValidEmail(email)) {
    return { success: false, message: "Geçersiz e-posta formatı", user: null };
  }
  if (!isValidPassword(password)) {
    return { success: false, message: "Şifre en az 8 karakter, harf ve rakam içermeli", user: null };
  }
  const existing = await prisma.company.findUnique({ where: { email } });

  if (existing) {
    return { success: false, message: "Bu eposta zaten kayıtlı", user: null };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const company = await prisma.company.create({
    data: {
      name: toTitleCase(name),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
    },
  });

  return { success: true, message: "Kayıt Başarılı" };
}

export async function checkSession() {
  const store = await cookies();

  const userToken = store.get("usr_sess_x92h1")?.value;
  const companyToken = store.get("cmp_sess_z71f8")?.value;
  const staffToken = store.get("stf_sess_91kd2")?.value;

  try {
    if (userToken) {
      const decoded: any = jwt.verify(userToken, process.env.JWT_SECRET!);
      return { type: "user", data: decoded };
    }
    if (companyToken) {
      const decoded: any = jwt.verify(companyToken, process.env.JWT_SECRET!);
      return { type: "company", data: decoded };
    }
    if (staffToken) {
      const decoded: any = jwt.verify(staffToken, process.env.JWT_SECRET!);
      return { type: "staff", data: decoded };
    }
  } catch {
    return null;
  }

  return null;
}

// ✅ Staff register (Admin dashboard'tan personel ekleme)
export async function registerStaffAction(formData: FormData) {
  try {
    const companyId = String(formData.get("companyId")); // admin context'inden gelecek
    const name = String(formData.get("name"));
    const email = String(formData.get("email"));
    const passwordRaw = String(formData.get("password"));

    if (!companyId || !name || !email || !passwordRaw) {
      return { success: false, message: "Tüm alanlar gerekli." };
    }

    if (!isValidName(name)) {
      return { success: false, message: "Geçerli bir ad girin." };
    }
    if (!isValidEmail(email)) {
      return { success: false, message: "Geçersiz e-posta formatı." };
    }
    if (!isValidPassword(passwordRaw)) {
      return { success: false, message: "Şifre en az 8 karakter, harf ve rakam içermeli" };
    }

    const existing = await prisma.companyStaff.findUnique({ where: { email } });
    if (existing) {
      return { success: false, message: "Bu e-posta zaten kayıtlı." };
    }

    const hashedPassword = await bcrypt.hash(passwordRaw, 10);

    const staff = await prisma.companyStaff.create({
      data: { companyId, name: toTitleCase(name), email: email.trim().toLowerCase(), password: hashedPassword },
      select: {
        id: true,
        name: true,
        email: true,
        companyId: true,
        isActive: true,
      },
    });

    return { success: true, message: "Personel eklendi.", staff };
  } catch (e: any) {
    return { success: false, message: "Personel eklenemedi: " + e.message };
  }
}

// ✅ Staff login
export async function loginStaffAction(prevState: any, formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  if (!email || !password) {
    return { success: false, message: "Email ve şifre gerekli", staff: null };
  }

  const staff = await prisma.companyStaff.findUnique({
    where: { email },
  });

  if (!staff || !staff.isActive) {
    return {
      success: false,
      message: "Kullanıcı bulunamadı veya pasif.",
      staff: null,
    };
  }

  const ok = await bcrypt.compare(password, staff.password);
  if (!ok) {
    return { success: false, message: "Şifre hatalı.", staff: null };
  }

  // ✅ JWT oluştur
  const token = jwt.sign(
    {
      type: "staff",
      staffId: staff.id,
      companyId: staff.companyId,
      email: staff.email,
      name: staff.name,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  // ✅ Cookie’ye yaz
  const store = await cookies();
  store.set("stf_sess_91kd2", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return {
    success: true,
    message: "Giriş başarılı.",
    staff: {
      id: staff.id,
      name: staff.name,
      email: staff.email,
      companyId: staff.companyId,
    },
  };
}

// ✅ Staff logout
export async function logoutStaffAction() {
  const store = await cookies();
  store.set("stf_sess_91kd2", "", { path: "/", maxAge: 0 });
  return { success: true };
}
