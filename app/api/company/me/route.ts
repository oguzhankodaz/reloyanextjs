import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

interface CompanyPayload extends jwt.JwtPayload {
  companyId: string;
  email: string;
  name: string;
}

export async function GET() {
  const store = await cookies();
  const cookie = store.get("cmp_sess_z71f8")?.value;

  if (!cookie) {
    return NextResponse.json({ company: null });
  }

  try {
    const decoded = jwt.verify(
      cookie,
      process.env.JWT_SECRET!
    ) as CompanyPayload;

    return NextResponse.json({
      company: {
        companyId: decoded.companyId,
        email: decoded.email,
        name: decoded.name,
      },
    });
  } catch (err) {
    return NextResponse.json({ company: null });
  }
}
