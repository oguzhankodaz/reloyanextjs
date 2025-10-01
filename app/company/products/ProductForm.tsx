/** @format */
"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct } from "@/actions/product";
import { useRadixToast } from "@/components/notifications/ToastProvider";

type Props = {
  companyId: string;
};

export default function ProductForm({ companyId }: Props) {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [cashback, setCashback] = useState<string>("");
  const [cashbackPercentage, setCashbackPercentage] = useState<number>(3); // Varsayılan %3
  const toast = useRadixToast();

  // Şirketin cashback oranını yükle
  useEffect(() => {
    fetch("/api/company/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setCashbackPercentage(data.settings.cashbackPercentage);
        }
      })
      .catch(() => {
        // Hata durumunda varsayılan %3 kullan
      });
  }, []);

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
      toast({
        title: "Eksik bilgi",
        description: "Lütfen ürün adı ve fiyat giriniz.",
        variant: "error",
      });
      return;
    }

    mutation.mutate({
      name,
      price: priceValue,
      cashback: isNaN(cashbackValue) ? 0 : cashbackValue,
      companyId,
    });
  };

  // ✅ Fiyat değiştiğinde şirket oranına göre hesapla
  const handlePriceChange = (value: string) => {
    setPrice(value);

    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      const calculatedCashback = (num * cashbackPercentage) / 100;
      setCashback(calculatedCashback.toFixed(2));
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
      <div>
        <input
          type="number"
          placeholder="Nakit İade (₺)"
          value={cashback}
          onChange={(e) => setCashback(e.target.value)} // kullanıcı isterse değiştirir
          className="w-full border rounded px-3 py-2"
        />
        <p className="text-xs text-gray-500 mt-1">
          Otomatik hesaplanan oran:{" "}
          <span className="font-semibold text-green-600">%{cashbackPercentage}</span>
          {" "}(İsterseniz manuel değiştirebilirsiniz)
        </p>
      </div>
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
