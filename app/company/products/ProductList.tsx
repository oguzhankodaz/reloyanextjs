/** @format */
"use client";

import React, { useState } from "react";
import { deleteProductAction } from "@/actions/product";

type Product = {
  id: number;
  name: string;
  price: number;
  pointsToBuy: number;
  pointsOnSell: number;
};

type Props = {
  products: Product[];
  mode?: "manage" | "select"; // 👈 yeni parametre
  onDelete?: (id: number) => void;
  onSelectChange?: (selected: { id: number; quantity: number }[]) => void;
};

const ProductList: React.FC<Props> = ({
  products,
  mode = "manage",
  onDelete,
  onSelectChange,
}) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<{ id: number; quantity: number }[]>(
    []
  );

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    const res = await deleteProductAction(id);
    if (res.success) {
      if (onDelete) onDelete(id); // Parent state’den de çıkar
    } else {
      alert(res.message);
    }
  };

  const toggleSelect = (id: number, checked: boolean) => {
    let updated = [...selected];

    if (checked) {
      if (!updated.find((i) => i.id === id)) {
        updated.push({ id, quantity: 1 });
      }
    } else {
      updated = updated.filter((i) => i.id !== id);
    }

    setSelected(updated);
    onSelectChange?.(updated);
  };

  const updateQuantity = (id: number, quantity: number) => {
    const updated = [...selected]; // ✅ const
    const index = updated.findIndex((i) => i.id === id);

    if (index !== -1) {
      updated[index].quantity = quantity;
    } else {
      updated.push({ id, quantity });
    }

    setSelected(updated);
    onSelectChange?.(updated);
  };

  return (
    <div>
      {/* Search bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Ürün ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-black focus:outline-none"
        />
      </div>
      <hr className="border-t border-gray-300 mb-4" />

      {/* Ürün listesi */}
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

              {/* Mode = manage → silme */}
              {mode === "manage" && (
                <button
                  onClick={() => handleDelete(product.id)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
                >
                  Sil
                </button>
              )}

              {/* Mode = select → checkbox + quantity */}
              {mode === "select" && (
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    min={1}
                    defaultValue={1}
                    onChange={(e) =>
                      updateQuantity(product.id, parseInt(e.target.value))
                    }
                    className="w-20 h-12 text-lg border rounded px-3 text-center"
                  />
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        toggleSelect(product.id, e.target.checked)
                      }
                      className="w-6 h-6 accent-green-600"
                    />
                    <span className="text-sm text-gray-700">Seç</span>
                  </label>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProductList;
