import { Suspense } from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { CompanyMenuSkeleton } from "./CompanyMenuSkeleton";
import { CompanyMenu } from "./CompanyMenu";

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
      orderBy: { name: "asc" },
    });

    return { company, categories };
  } catch (error) {
    console.error("Error fetching company data:", error);
    return null;
  }
}

export default async function MenuPage({ params }: MenuPageProps) {
  const { companyId } = await params;
  
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
