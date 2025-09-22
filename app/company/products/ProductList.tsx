/** @format */
"use client";

import { deleteProductAction } from "@/actions/product";
import React, { useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  pointsToBuy: number;
  pointsOnSell: number;
};

type Props = {
  products: Product[];
  onAdd?: (item: { id: number; name: string; quantity: number }) => void;
  onDelete?: (id: number) => void;
};

export const ProductList: React.FC<Props> = ({ products, onAdd, onDelete }) => {
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Search bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Ürün ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

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
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-gray-600">
                  {product.price} ₺ • Alım: {product.pointsToBuy} puan • Satış:{" "}
                  {product.pointsOnSell} puan
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

              {/* Eğer onDelete varsa → yönetici modu */}
              {onDelete && (
                <button
                  onClick={async () => {
                    const confirmed = confirm(
                      "Bu ürünü silmek istediğinize emin misiniz?"
                    );
                    if (!confirmed) return;

                    try {
                      const res = await deleteProductAction(product.id);
                      if (res.success) {
                        onDelete?.(product.id); // parent state’i de güncelle
                      } else {
                        alert(res.message || "Ürün silinemedi.");
                      }
                    } catch (err) {
                      console.error(err);
                      alert("Sunucu hatası!");
                    }
                  }}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  ❌ Sil
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
