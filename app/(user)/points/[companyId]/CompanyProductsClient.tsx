/** @format */
"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getProductsByCompanyAction } from "@/actions/product";
import { Product } from "@/lib/types";

type Props = {
  companyId: string;
};

export default function CompanyProductsClient({
  companyId,
}: Props) {
  const { data: products, isLoading, isError } = useQuery<Product[]>({
    queryKey: ["company-products", companyId],
    queryFn: async () => {
      const res = await getProductsByCompanyAction(companyId);
      return res.success ? res.products : [];
    },
    staleTime: 1000 * 60 * 5, // 5 dakika
    gcTime: 1000 * 60 * 10, // 10 dakika
  });
  if (isLoading) {
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
          <h1 className="text-3xl font-bold text-green-400">Şirket Ürünleri</h1>
          <p className="text-gray-400 text-sm mt-1">
            Bu sayfada, seçtiğiniz işletmeye ait ürünlerin fiyatlarını ve
            alışverişinizde kazanacağınız para puanları görebilirsiniz.
          </p>
        </div>

        {/* Loading Skeleton */}
        <div className="max-w-5xl mx-auto">
          <div className="h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 rounded-xl p-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg flex flex-col justify-between"
                >
                  <div className="h-6 bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded animate-pulse mb-1"></div>
                  <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
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
          <h1 className="text-3xl font-bold text-green-400">Şirket Ürünleri</h1>
          <p className="text-gray-400 text-sm mt-1">
            Bu sayfada, seçtiğiniz işletmeye ait ürünlerin fiyatlarını ve
            alışverişinizde kazanacağınız para puanları görebilirsiniz.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <p className="text-red-400 text-center mt-10">
            Ürünler yüklenirken hata oluştu. Lütfen tekrar deneyin.
          </p>
        </div>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-green-400">Şirket Ürünleri</h1>
        <p className="text-gray-400 text-sm mt-1">
          Bu sayfada, seçtiğiniz işletmeye ait ürünlerin fiyatlarını ve
          alışverişinizde kazanacağınız para puanları görebilirsiniz.
        </p>
      </div>

      {/* Ürünler */}
      <div className="max-w-5xl mx-auto">
        {!products || products.length === 0 ? (
          <p className="text-gray-400 text-center mt-10">
            Bu şirkete ait ürün bulunamadı 🙁
          </p>
        ) : (
          <div className="h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 rounded-xl p-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
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
                  <p className="font-medium text-gray-300 mb-1">
                    🎯 Kazanılacak Para Puan:{" "}
                    <span className=" text-green-400 font-medium">
                      {product.cashback.toFixed(2)} ₺
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
