import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const user = await getUserFromCookie();
  if (!user) {
    return NextResponse.json({ user: null });
  }

  // Fetch complete user data from database including phone
  const userData = await prisma.user.findUnique({
    where: { id: user.userId },
    select: {
      id: true,
      name: true,
      surname: true,
      email: true,
      phone: true,
    },
  });

  return NextResponse.json({ user: userData });
}
