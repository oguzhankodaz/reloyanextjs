/** @format */
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProductAction } from "@/actions/product";
import { Product } from "@/lib/types"; // ✅ Artık Product tipini buradan alıyoruz
import { useRadixToast } from "@/components/notifications/ToastProvider";

// ✅ Props tanımı buraya
type Props = {
  products: Product[];
  companyId?: string | null;
  onAdd?: (item: { id: number; name: string; quantity: number }) => void;
  simplified?: boolean; // QR-result için sadeleştirilmiş görünüm
};

export const ProductList: React.FC<Props> = ({ products, onAdd, companyId, simplified = false }) => {
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: number]: boolean }>({});
  const queryClient = useQueryClient();
  const toast = useRadixToast();

  // ✅ Silme işlemi
  const deleteMutation = useMutation({
    mutationFn: (productId: number) => deleteProductAction(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", companyId] });
    },
  });

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase())) ||
    (p.category && p.category.name.toLowerCase().includes(search.toLowerCase()))
  );

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

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <p className="text-gray-400 text-lg">
            {search ? "Arama kriterlerinize uygun ürün bulunamadı." : "Henüz ürün eklenmedi."}
          </p>
        </div>
      ) : (
        <div className="max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 min-w-0">
          {/* Desktop: Grid Layout, Mobile: Stack Layout */}
          <div className="grid grid-cols-1 gap-4 w-full">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="bg-gray-700 rounded-xl p-5 border border-gray-600 hover:border-green-500/50 hover:shadow-lg transition-all duration-300 group"
              >
                {/* Ürün Bilgileri */}
                {simplified ? (
                  // QR-result için sadeleştirilmiş görünüm
                  <div className="mb-4">
                    <h3 className="font-bold text-white text-lg mb-3 group-hover:text-green-400 transition-colors">
                      {product.name.length > 40 
                        ? `${product.name.substring(0, 40)}...` 
                        : product.name
                      }
                    </h3>
                    
                    {/* Fiyat ve İade - Yan yana */}
                    <div className="flex items-center justify-between bg-gray-600 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">💵</span>
                        <div>
                          <div className="text-gray-400 text-xs">Fiyat</div>
                          <div className="text-white font-bold text-lg">{product.price} ₺</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">🎯</span>
                        <div className="text-right">
                          <div className="text-gray-400 text-xs">İade</div>
                          <div className="text-green-400 font-bold text-lg">{product.cashback} ₺</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Company/products için tam detaylı görünüm
                  <>
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
                        <p className="text-gray-300 text-sm">
                          {expandedDescriptions[product.id] 
                            ? product.description 
                            : product.description.length > 100 
                              ? `${product.description.substring(0, 100)}...` 
                              : product.description
                          }
                        </p>
                        {product.description.length > 100 && (
                          <button
                            onClick={() => setExpandedDescriptions(prev => ({
                              ...prev,
                              [product.id]: !prev[product.id]
                            }))}
                            className="text-green-400 text-xs mt-1 hover:text-green-300 transition-colors"
                          >
                            {expandedDescriptions[product.id] ? "Daha az göster" : "Devamını oku"}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Fiyat Bilgileri */}
                    <div className="bg-gray-600 rounded-lg p-3 mb-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">💵</span>
                          <div className="flex-1">
                            <div className="text-gray-400 text-xs">Fiyat</div>
                            <div className="text-white font-bold text-lg break-all">{product.price} ₺</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">🎯</span>
                          <div className="flex-1">
                            <div className="text-gray-400 text-xs">İade</div>
                            <div className="text-green-400 font-bold text-lg break-all">{product.cashback} ₺</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  {/* Eğer onAdd varsa → sepete ekle modu */}
                  {onAdd && (
                    <>
                      <div className="flex items-center bg-gray-600 rounded-lg flex-1">
                        <button
                          onClick={() => {
                            const current = quantities[product.id] || 1;
                            if (current > 1) {
                              setQuantities({
                                ...quantities,
                                [product.id]: current - 1,
                              });
                            }
                          }}
                          className="p-2 text-gray-300 hover:text-white transition-colors disabled:opacity-50"
                          disabled={(quantities[product.id] || 1) <= 1}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={quantities[product.id] || 1}
                          onChange={(e) =>
                            setQuantities({
                              ...quantities,
                              [product.id]: Math.max(1, parseInt(e.target.value, 10) || 1),
                            })
                          }
                          className="w-16 h-10 bg-transparent text-center text-white border-0 focus:ring-0"
                        />
                        <button
                          onClick={() => {
                            const current = quantities[product.id] || 1;
                            setQuantities({
                              ...quantities,
                              [product.id]: current + 1,
                            });
                          }}
                          className="p-2 text-gray-300 hover:text-white transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          const quantity = quantities[product.id] || 1;
                          onAdd?.({
                            id: product.id,
                            name: product.name,
                            quantity: quantity,
                          });
                          toast({
                            title: "Ürün eklendi",
                            description: `${product.name} (${quantity} adet) sepete eklendi`,
                            variant: "success",
                          });
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 flex-1 sm:flex-none"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Ekle</span>
                      </button>
                    </>
                  )}

                  {/* Yönetici modu → silme */}
                  {!onAdd && (
                    <button
                      onClick={() => {
                        const confirmed = confirm(
                          "Bu ürünü silmek istediğinize emin misiniz?"
                        );
                        if (!confirmed) return;
                        deleteMutation.mutate(product.id);
                      }}
                      disabled={deleteMutation.isPending}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 w-full"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>
                        {deleteMutation.isPending ? "Siliniyor..." : "Sil"}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
