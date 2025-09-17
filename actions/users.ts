"use server";
import prisma from "@/lib/prisma";

export async function getUserByIdAction(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, surname: true, email: true }, // sadece lazım olan alanlar
    });

    if (!user) {
      return { success: false, message: "Kullanıcı bulunamadı", user: null };
    }

    return { success: true, user };
  } catch (error) {
    console.error("getUserByIdAction error:", error);
    return { success: false, message: "Sunucu hatası", user: null };
  }
}
