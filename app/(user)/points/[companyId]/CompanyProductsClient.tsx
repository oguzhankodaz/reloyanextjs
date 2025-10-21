/** @format */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCompanyProductsForUsers } from "@/actions/product";
import { Product } from "@/lib/types";

interface Category {
  id: number;
  name: string;
}

type Props = {
  companyId: string;
};

export default function CompanyProductsClient({
  companyId,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showFullDescription, setShowFullDescription] = useState<{ [key: number]: boolean }>({});

  const { data, isLoading, isError } = useQuery({
    queryKey: ["company-products", companyId],
    queryFn: async () => {
      const res = await getCompanyProductsForUsers(companyId);
      return res;
    },
    staleTime: 1000 * 60 * 5, // 5 dakika
    gcTime: 1000 * 60 * 10, // 10 dakika
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["public-categories", companyId],
    queryFn: async () => {
      const response = await fetch(`/api/categories/public?companyId=${companyId}`);
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 dakika
  });

  const products = data?.success ? data.products : [];
  const companyName = data?.companyName;
  const categories: Category[] = categoriesData?.categories || [];

  // Kategoriye göre filtreleme
  const filteredProducts = selectedCategory 
    ? products.filter(product => product.category?.id === selectedCategory)
    : products;

  const toggleDescription = (productId: number) => {
    setShowFullDescription(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };
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
          <h1 className="text-3xl font-bold text-green-400">
            {companyName ? `${companyName} - Ürünler` : "Şirket Ürünleri"}
          </h1>
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
          <h1 className="text-3xl font-bold text-green-400">
            {companyName ? `${companyName} - Ürünler` : "Şirket Ürünleri"}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Bu sayfada, seçtiğiniz işletmeye ait ürünlerin fiyatlarını ve
            alışverişinizde kazanacağınız para puanları görebilirsiniz.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <p className="text-red-400 text-center mt-10">
            {data?.message || "Ürünler yüklenirken hata oluştu. Lütfen tekrar deneyin."}
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
          {/* Kategori Filtreleri */}
          {categories.length > 0 && (
            <div className="mb-6">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                    selectedCategory === null
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Tümü ({products.length})
                </button>
                {categories.map((category) => {
                  const categoryProductCount = products.filter(p => p.category?.id === category.id).length;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                        selectedCategory === category.id
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {category.name} ({categoryProductCount})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!products || products.length === 0 ? (
            <p className="text-gray-400 text-center mt-10">
              Bu şirkete ait ürün bulunamadı 🙁
            </p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-gray-400 text-center mt-10">
              Bu kategoride ürün bulunamadı 🙁
            </p>
          ) : (
            <div className="h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 rounded-xl p-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg hover:shadow-yellow-400/10 transition-all duration-200 flex flex-col justify-between"
                >
                  {/* Ürün adı ve kategori */}
                  <div className="mb-2">
                    <h2 className="text-lg font-semibold text-white mb-1 truncate">
                      {product.name}
                    </h2>
                    {product.category && (
                      <span className="bg-blue-600 text-blue-100 text-xs px-2 py-1 rounded">
                        {product.category.name}
                      </span>
                    )}
                  </div>

                  {/* Ürün açıklaması */}
                  {product.description && (
                    <div className="mb-3">
                      <p className="text-gray-400 text-sm">
                        {showFullDescription[product.id] 
                          ? product.description 
                          : product.description.length > 100 
                            ? `${product.description.substring(0, 100)}...` 
                            : product.description
                        }
                      </p>
                      {product.description.length > 100 && (
                        <button
                          onClick={() => toggleDescription(product.id)}
                          className="text-green-400 text-xs hover:text-green-300 mt-1 transition-colors"
                        >
                          {showFullDescription[product.id] ? 'Daha az göster' : 'Devamını oku'}
                        </button>
                      )}
                    </div>
                  )}

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
