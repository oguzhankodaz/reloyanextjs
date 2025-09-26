/** @format */
"use client";

import React from "react";
import { Product } from "@/lib/types";

type Props = {
  companyId: string;
  initialProducts: Product[];
};

export default function CompanyProductsClient({
  companyId,
  initialProducts,
}: Props) {
  return (
    <div className="max-w-5xl mx-auto">
      {initialProducts.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">
          Bu şirkete ait ürün bulunamadı 🙁
        </p>
      ) : (
        <div className="h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 rounded-xl p-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {initialProducts.map((product) => (
              <div
                key={product.id}
                className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg hover:shadow-yellow-400/10 transition-all duration-200 flex flex-col justify-between"
              >
                {/* Ürün adı */}
                <h2 className="text-lg font-semibold text-white mb-2 truncate">
                  {product.name}
                </h2>

                {/* Ürün Fiyatı */}
                <p className="text-gray-300 mb-1">
                  💵 <span className="font-semibold">Ürün Fiyatı:</span>{" "}
                  <span className="font-bold text-yellow-400">
                    {product.price} ₺
                  </span>
                </p>

                {/* Kazanılacak TL */}
                <p className="text-green-400 font-medium">
                  🎯 Kazanılacak iade:{" "}
                  <span className="font-bold">
                    {product.cashback.toFixed(2)} ₺
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
