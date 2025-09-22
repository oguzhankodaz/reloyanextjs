/** @format */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCompanyProducts } from "@/actions/product";

type PageProps = {
  params: { companyId: string };
};

export default async function CompanyProductsPage({ params }: PageProps) {
  const products = await getCompanyProducts(params.companyId);

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

      {/* Ürün Listesi */}
      <div className="max-w-3xl mx-auto">
        {products.length === 0 ? (
          <p className="text-gray-500">Bu şirkete ait ürün bulunamadı.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg hover:shadow-yellow-400/10 transition-shadow"
              >
                <h2 className="text-xl font-semibold text-white mb-2">
                  {product.name}
                </h2>

                <div className="text-sm space-y-1">
                  <p className="text-gray-400">
                    💰 Fiyat:{" "}
                    <span className="text-white">
                      {product.price.toFixed(2)} ₺
                    </span>
                  </p>
                  <p className="text-green-400">
                    🎯 Kazanılacak Puan: {product.pointsOnSell}
                  </p>
                  <p className="text-yellow-400">
                    🛒 Puanla Almak İçin: {product.pointsToBuy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
