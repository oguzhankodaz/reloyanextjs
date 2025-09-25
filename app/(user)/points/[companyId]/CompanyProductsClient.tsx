"use client";

import { getCompanyProducts } from "@/actions/product";
import { useQuery } from "@tanstack/react-query";

type Product = {
  id: number;
  name: string;
  price: number;
  pointsOnSell: number;
  pointsToBuy: number;
};

export default function CompanyProductsClient({
  companyId,
  initialProducts,
}: {
  companyId: string;
  initialProducts: Product[];
}) {
  // ✅ React Query ile cache’e alıyoruz
  const { data: products } = useQuery({
    queryKey: ["company-products", companyId],
    queryFn: async () => await getCompanyProducts(companyId),
    initialData: initialProducts, // 👈 Server’dan gelen veriyi kullan
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="max-w-3xl mx-auto">
      {products.length === 0 ? (
        <p className="text-gray-500">Bu şirkete ait ürün bulunamadı.</p>
      ) : (
        <div className="h-[70vh] overflow-y-auto pr-2">
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
        </div>
      )}
    </div>
  );
}
