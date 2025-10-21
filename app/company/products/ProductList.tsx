/** @format */
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProductAction } from "@/actions/product";
import { Product } from "@/lib/types"; // ✅ Artık Product tipini buradan alıyoruz

// ✅ Props tanımı buraya
type Props = {
  products: Product[];
  companyId?: string | null;
  onAdd?: (item: { id: number; name: string; quantity: number }) => void;
};

export const ProductList: React.FC<Props> = ({ products, onAdd, companyId }) => {
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const queryClient = useQueryClient();

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
    <div>
      {/* Arama kutusu */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Ürün ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <hr className="border-gray-300 my-4" />
      {filtered.length === 0 ? (
        <p className="text-gray-500 text-sm text-center">
          {search ? "Sonuç bulunamadı." : "Henüz ürün eklenmedi."}
        </p>
      ) : (
        <ul className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {filtered.map((product) => (
            <li
              key={product.id}
              className="flex justify-between items-center border p-3 rounded"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{product.name}</p>
                  {product.category && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {product.category.name}
                    </span>
                  )}
                </div>
                {product.description && (
                  <p className="text-xs text-gray-500 mb-1">{product.description}</p>
                )}
                <p className="text-sm text-gray-600">
                  {product.price} ₺ • Nakit iade: {product.cashback} ₺
                </p>
              </div>

              {/* Eğer onAdd varsa → sepete ekle modu */}
              {onAdd && (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min={1}
                    value={quantities[product.id] || 1}
                    onChange={(e) =>
                      setQuantities({
                        ...quantities,
                        [product.id]: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-20 h-10 border rounded px-3 text-center"
                  />
                  <button
                    onClick={() =>
                      onAdd?.({
                        id: product.id,
                        name: product.name,
                        quantity: quantities[product.id] || 1,
                      })
                    }
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    ➕ Ekle
                  </button>
                </div>
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
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteMutation.isPending ? "Siliniyor..." : "Sil"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProductList;
