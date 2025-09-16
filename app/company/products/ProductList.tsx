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
  onDelete?: (id: number) => void; // parent state güncelleme için opsiyonel callback
};

const ProductList: React.FC<Props> = ({ products, onDelete }) => {
  const [search, setSearch] = useState("");

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

      {/* Ürün listesi */}
      {filtered.length === 0 ? (
        <p className="text-gray-500 text-sm text-center">
          {search ? "Sonuç bulunamadı." : "Henüz ürün eklenmedi."}
        </p>
      ) : (
        <ul className="space-y-2">
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
              <button
                onClick={() => handleDelete(product.id)}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Sil
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProductList;
