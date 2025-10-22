/** @format */
"use client";

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { deleteProductAction } from "@/actions/product";
import { Product } from "@/lib/types";
import { useRadixToast } from "@/components/notifications/ToastProvider";

type Props = {
  products: Product[];
  companyId?: string | null;
};

export default function ProductListView({ products, companyId }: Props) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const toast = useRadixToast();

  // Kategorileri yükle
  const { data: categoriesData } = useQuery({
    queryKey: ["categories", companyId],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      return response.json();
    },
    enabled: !!companyId,
  });

  const categories = categoriesData?.categories || [];

  // Silme işlemi
  const deleteMutation = useMutation({
    mutationFn: (productId: number) => deleteProductAction(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", companyId] });
      toast({
        title: "Başarılı",
        description: "Ürün başarıyla silindi.",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Ürün silinirken bir hata oluştu.",
        variant: "error",
      });
    },
  });

  // Filtreleme
  const filtered = products.filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = selectedCategory === null || product.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* Arama kutusu */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Ürün ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Kategori Filtreleri */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Kategori Filtresi</h3>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === null
                ? "bg-green-600 text-white"
                : "bg-gray-600 text-gray-300 hover:bg-gray-500"
            }`}
          >
            Tümü
          </button>
          {categories.map((category: any) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? "bg-green-600 text-white"
                  : "bg-gray-600 text-gray-300 hover:bg-gray-500"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Ürün Listesi */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <p className="text-gray-400 text-lg">
            {search || selectedCategory !== null 
              ? "Arama kriterlerinize uygun ürün bulunamadı." 
              : "Henüz ürün eklenmedi."
            }
          </p>
        </div>
      ) : (
        <div className="max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 min-w-0">
          <div className="grid grid-cols-1 gap-4 w-full">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="bg-gray-700 rounded-xl p-5 border border-gray-600 hover:border-green-500/50 hover:shadow-lg transition-all duration-300 group"
              >
                {/* Ürün Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-lg mb-2 group-hover:text-green-400 transition-colors">
                      {product.name.length > 40 
                        ? `${product.name.substring(0, 40)}...` 
                        : product.name
                      }
                    </h3>
                    {product.category && (
                      <span className="inline-flex items-center bg-blue-600 text-blue-100 text-xs px-3 py-1 rounded-full font-medium">
                        {product.category.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Ürün Açıklaması */}
                {product.description && (
                  <div className="mb-4">
                    <p className="text-gray-300 text-sm line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                )}

                {/* Fiyat Bilgileri - Yan yana kompakt */}
                <div className="flex gap-2 mb-4">
                  <div className="flex-1 bg-gray-600 rounded-lg p-2">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">💵</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-400 text-xs">Fiyat</div>
                        <div className="text-white font-bold text-sm truncate">{product.price} ₺</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 bg-gray-600 rounded-lg p-2">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">🎯</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-400 text-xs">İade</div>
                        <div className="text-green-400 font-bold text-sm truncate">{product.cashback} ₺</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sil Butonu */}
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      const confirmed = confirm(
                        "Bu ürünü silmek istediğinize emin misiniz?"
                      );
                      if (!confirmed) return;
                      deleteMutation.mutate(product.id);
                    }}
                    disabled={deleteMutation.isPending}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>
                      {deleteMutation.isPending ? "Siliniyor..." : "Sil"}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
