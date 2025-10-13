/** @format */
"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

interface UserPayload {
  type: "user";
  userId: string;
  email: string;
}

interface CompanyPayload {
  type: "company";
  companyId: string;
  email: string;
}

interface StaffPayload {
  type: "staff";
  staffId: string;
  companyId: string;
  email: string;
}

type AuthPayload = UserPayload | CompanyPayload | StaffPayload;

/**
 * Kullanıcı authentication kontrolü
 */
export async function requireUser(): Promise<UserPayload> {
  const store = await cookies();
  const token = store.get("usr_sess_x92h1")?.value;

  if (!token) {
    throw new Error("Oturum açmanız gerekiyor");
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET not configured");
  }

  try {
    const decoded = jwt.verify(token, secret) as AuthPayload;
    
    if (decoded.type !== "user") {
      throw new Error("Yetkisiz erişim");
    }

    return decoded as UserPayload;
  } catch (error) {
    throw new Error("Geçersiz oturum");
  }
}

/**
 * Şirket authentication kontrolü
 */
export async function requireCompany(): Promise<CompanyPayload> {
  const store = await cookies();
  const token = store.get("cmp_sess_z71f8")?.value;

  if (!token) {
    throw new Error("Oturum açmanız gerekiyor");
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET not configured");
  }

  try {
    const decoded = jwt.verify(token, secret) as AuthPayload;
    
    if (decoded.type !== "company") {
      throw new Error("Yetkisiz erişim");
    }

    return decoded as CompanyPayload;
  } catch (error) {
    throw new Error("Geçersiz oturum");
  }
}

/**
 * Staff authentication kontrolü
 */
export async function requireStaff(): Promise<StaffPayload> {
  const store = await cookies();
  const token = store.get("stf_sess_91kd2")?.value;

  if (!token) {
    throw new Error("Oturum açmanız gerekiyor");
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET not configured");
  }

  try {
    const decoded = jwt.verify(token, secret) as AuthPayload;
    
    if (decoded.type !== "staff") {
      throw new Error("Yetkisiz erişim");
    }

    return decoded as StaffPayload;
  } catch (error) {
    throw new Error("Geçersiz oturum");
  }
}

/**
 * Şirket veya Staff authentication (QR okuma için)
 */
export async function requireCompanyOrStaff(): Promise<CompanyPayload | StaffPayload> {
  try {
    return await requireCompany();
  } catch {
    return await requireStaff();
  }
}

/**
 * Şirket yetkisi kontrolü - Sadece kendi verilerine erişebilir
 */
export async function verifyCompanyOwnership(companyId: string): Promise<void> {
  const company = await requireCompany();
  
  if (company.companyId !== companyId) {
    throw new Error("Bu işlem için yetkiniz yok");
  }
}

/**
 * Staff yetkisi kontrolü - Sadece kendi şirketinin verilerine erişebilir
 */
export async function verifyStaffCompanyAccess(companyId: string): Promise<void> {
  const staff = await requireStaff();
  
  if (staff.companyId !== companyId) {
    throw new Error("Bu işlem için yetkiniz yok");
  }

  // Staff'ın aktif olup olmadığını kontrol et
  const staffRecord = await prisma.companyStaff.findUnique({
    where: { id: staff.staffId },
    select: { isActive: true },
  });

  if (!staffRecord?.isActive) {
    throw new Error("Hesabınız pasif durumda");
  }
}

/**
 * Ürün yetkisi kontrolü - Sadece ürün sahibi şirket değiştirebilir
 */
export async function verifyProductOwnership(productId: number): Promise<string> {
  const company = await requireCompany();
  
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { companyId: true },
  });

  if (!product) {
    throw new Error("Ürün bulunamadı");
  }

  if (product.companyId !== company.companyId) {
    throw new Error("Bu ürün üzerinde yetkiniz yok");
  }

  return company.companyId;
}

/**
 * Müşteri verisi erişim kontrolü
 */
export async function verifyCustomerDataAccess(userId: string, companyId: string): Promise<void> {
  const auth = await requireCompanyOrStaff();
  
  let authorizedCompanyId: string;
  
  if (auth.type === "company") {
    authorizedCompanyId = auth.companyId;
  } else {
    authorizedCompanyId = auth.companyId;
    
    // Staff'ın aktif olduğunu kontrol et
    const staff = await prisma.companyStaff.findUnique({
      where: { id: auth.staffId },
      select: { isActive: true },
    });
    
    if (!staff?.isActive) {
      throw new Error("Hesabınız pasif durumda");
    }
  }

  if (authorizedCompanyId !== companyId) {
    throw new Error("Bu müşteri verilerine erişim yetkiniz yok");
  }

  // Müşterinin bu şirketten alışveriş yaptığını kontrol et
  const hasPurchase = await prisma.purchase.findFirst({
    where: {
      userId,
      companyId,
    },
  });

  if (!hasPurchase) {
    throw new Error("Bu kullanıcı sizin müşteriniz değil");
  }
}


