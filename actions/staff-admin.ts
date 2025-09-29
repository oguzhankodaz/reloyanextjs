// actions/staff-admin.ts
"use server";

import prisma from "@/lib/prisma";

// ✅ Personel sil
export async function deleteStaffAction(id: string) {
  try {
    await prisma.companyStaff.delete({ where: { id } });
    return { success: true, message: "Personel silindi." };
  } catch (e: any) {
    return { success: false, message: "Silinemedi: " + e.message };
  }
}

// ✅ Personel aktif/pasif yap
export async function toggleStaffActiveAction(id: string, isActive: boolean) {
  try {
    await prisma.companyStaff.update({
      where: { id },
      data: { isActive },
    });
    return {
      success: true,
      message: isActive ? "Pasifleştirildi." : "Aktifleştirildi.",
    };
  } catch (e: any) {
    return { success: false, message: "Güncellenemedi: " + e.message };
  }
}
