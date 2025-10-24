import { Suspense } from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { CompanyMenuSkeleton } from "./CompanyMenuSkeleton";
import { CompanyMenu } from "./CompanyMenu";
import { checkMenuRateLimit } from "./rate-limit";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";

interface MenuPageProps {
  params: Promise<{ companyId: string }>;
}

async function getCompanyData(companyId: string) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        verified: true,
        cashbackPercentage: true,
      },
    });

    if (!company || !company.verified) {
      return null;
    }

  const categories = await prisma.category.findMany({
    where: { companyId },
    select: {
      id: true,
      name: true,
      products: {
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          cashback: true,
        },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { id: "asc" }, // İlk eklenen en üstte (id'ye göre)
  });

    return { company, categories };
  } catch (error) {
    console.error("Error fetching company data:", error);
    return null;
  }
}

export default async function MenuPage({ params }: MenuPageProps) {
  const { companyId } = await params;
  
  // Rate limiting kontrolü
  const headersList = await headers();
  const request = new Request('http://localhost', { headers: headersList }) as NextRequest;
  const rateLimit = checkMenuRateLimit(request);
  
  if (!rateLimit.allowed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Çok Fazla İstek</h1>
          <p className="text-gray-600">
            Lütfen {rateLimit.retryAfter} saniye sonra tekrar deneyin.
          </p>
        </div>
      </div>
    );
  }
  
  const data = await getCompanyData(companyId);
  
  if (!data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<CompanyMenuSkeleton />}>
        <CompanyMenu 
          company={data.company} 
          categories={data.categories} 
        />
      </Suspense>
    </div>
  );
}

export async function generateMetadata({ params }: MenuPageProps) {
  const { companyId } = await params;
  
  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true, verified: true },
    });

    if (!company || !company.verified) {
      return {
        title: "Menü Bulunamadı",
        description: "Aradığınız menü bulunamadı veya şirket doğrulanmamış.",
      };
    }

    return {
      title: `${company.name} - Menü`,
      description: `${company.name} şirketinin ürün menüsü. Tüm ürünleri inceleyin ve sadakat puanları kazanın.`,
    };
  } catch (error) {
    return {
      title: "Menü Bulunamadı",
      description: "Aradığınız menü bulunamadı.",
    };
  }
}
