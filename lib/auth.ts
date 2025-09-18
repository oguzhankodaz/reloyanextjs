import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

interface UserPayload extends jwt.JwtPayload {
  userId: string;
  email: string;
  name: string;
  surname: string;
}

export async function getUserFromCookie(): Promise<UserPayload | null> {
  const store = await cookies();
  const cookie = store.get("session")?.value;
  if (!cookie) return null;

  try {
    const decoded = jwt.verify(cookie, process.env.JWT_SECRET!) as UserPayload;
    return {
      userId: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      surname: decoded.surname,
    };
  } catch {
    return null;
  }
}
