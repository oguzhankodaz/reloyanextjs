/** @format */
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct } from "@/actions/product";

type Props = {
  companyId: string;
};

export default function ProductForm({ companyId }: Props) {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>(""); 
  const [cashback, setCashback] = useState<string>(""); 

  const mutation = useMutation({
    mutationFn: (newProduct: {
      name: string;
      price: number;
      cashback: number;
      companyId: string;
    }) => createProduct(newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", companyId] });
      setName("");
      setPrice("");
      setCashback("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const priceValue = parseFloat(price);
    const cashbackValue = parseFloat(cashback);

    if (!name || isNaN(priceValue) || priceValue <= 0) {
      alert("Lütfen ürün adı ve fiyat giriniz.");
      return;
    }

    mutation.mutate({
      name,
      price: priceValue,
      cashback: isNaN(cashbackValue) ? 0 : cashbackValue,
      companyId,
    });
  };

  // ✅ Fiyat değiştiğinde %3 hesapla
  const handlePriceChange = (value: string) => {
    setPrice(value);

    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      setCashback((num * 0.03).toFixed(2)); // %3
    } else {
      setCashback("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mb-6">
      <input
        type="text"
        placeholder="Ürün adı"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />
      <input
        type="number"
        placeholder="Fiyat (₺)"
        value={price}
        onChange={(e) => handlePriceChange(e.target.value)}
        className="w-full border rounded px-3 py-2"
      />
      <input
        type="number"
        placeholder="Nakit İade (₺)"
        value={cashback}
        onChange={(e) => setCashback(e.target.value)} // kullanıcı isterse değiştirir
        className="w-full border rounded px-3 py-2"
      />
      <button
        type="submit"
        disabled={mutation.isPending}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {mutation.isPending ? "Ekleniyor..." : "➕ Ürün Ekle"}
      </button>
    </form>
  );
}
