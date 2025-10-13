import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

interface UserPayload extends jwt.JwtPayload {
  userId: string;
  email: string;
  name: string;
  surname: string;
  phone?: string;
}

export async function getUserFromCookie(): Promise<UserPayload | null> {
  const store = await cookies();
  const cookie = store.get("usr_sess_x92h1")?.value;
  if (!cookie) return null;

  // ✅ JWT_SECRET kontrolü
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("❌ JWT_SECRET environment variable is not set");
    return null;
  }

  try {
    const decoded = jwt.verify(cookie, secret) as UserPayload;
    return {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      surname: decoded.surname,
      phone: decoded.phone,
    };
  } catch {
    return null;
  }
}
