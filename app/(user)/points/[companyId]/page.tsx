/** @format */
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCompanyProducts } from "@/actions/product";
import CompanyProductsClient from "./CompanyProductsClient";

export default async function CompanyProductsPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const products = await getCompanyProducts(companyId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white px-4 py-6">
      {/* Geri Butonu */}
      <div className="max-w-3xl mx-auto mb-6">
        <Link
          href="/points"
          className="flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">Geri</span>
        </Link>
      </div>

      {/* Başlık */}
      <div className="max-w-3xl mx-auto mb-6">
        <h1 className="text-3xl font-bold text-yellow-400">Şirket Ürünleri</h1>
        <p className="text-gray-400 text-sm mt-1">
          Bu sayfada, seçtiğiniz işletmeye ait tüm ürünleri görebilirsiniz.
        </p>
      </div>

      {/* Client component */}
      <CompanyProductsClient companyId={companyId} initialProducts={products} />
    </div>
  );
}
