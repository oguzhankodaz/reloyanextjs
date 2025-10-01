// actions/staff-admin.ts
"use server";

import prisma from "@/lib/prisma";

// ✅ Personel sil
export async function deleteStaffAction(id: string) {
  try {
    await prisma.companyStaff.delete({ where: { id } });
    return { success: true, message: "Personel silindi." };
  } catch (e: unknown) {
    return { success: false, message: "Silinemedi: " + (e instanceof Error ? e.message : String(e)) };
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
  } catch (e: unknown) {
    return { success: false, message: "Güncellenemedi: " + (e instanceof Error ? e.message : String(e)) };
  }
}
