/** @format */
"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createProduct } from "@/actions/product";
import { useRadixToast } from "@/components/notifications/ToastProvider";

type Props = {
  companyId: string;
};

interface Category {
  id: number;
  name: string;
}

export default function ProductForm({ companyId }: Props) {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [price, setPrice] = useState<string>("");
  const [cashback, setCashback] = useState<string>("");
  const [cashbackPercentage, setCashbackPercentage] = useState<number | null>(null); // Başlangıçta null
  const [loadingPercentage, setLoadingPercentage] = useState(true);
  const toast = useRadixToast();

  const MAX_DESCRIPTION_LENGTH = 500; // Maksimum karakter sınırı
  const MAX_NAME_LENGTH = 40; // Ürün adı maksimum karakter sınırı

  // Kategorileri yükle
  const { data: categoriesData } = useQuery({
    queryKey: ["categories", companyId],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      return response.json();
    },
  });

  const categories: Category[] = categoriesData?.categories || [];

  // Şirketin cashback oranını yükle
  useEffect(() => {
    setLoadingPercentage(true);
    fetch("/api/company/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setCashbackPercentage(data.settings.cashbackPercentage);
        } else {
          setCashbackPercentage(3); // Fallback
        }
      })
      .catch(() => {
        setCashbackPercentage(3); // Hata durumunda varsayılan %3
      })
      .finally(() => {
        setLoadingPercentage(false);
      });
  }, []);

  const mutation = useMutation({
    mutationFn: (newProduct: {
      name: string;
      description?: string;
      categoryId?: number | null;
      price: number;
      cashback: number;
      companyId: string;
    }) => createProduct(newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", companyId] });
      setName("");
      setDescription("");
      setCategoryId(null);
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
      description: description.trim() || undefined,
      categoryId: categoryId || undefined,
      price: priceValue,
      cashback: isNaN(cashbackValue) ? 0 : cashbackValue,
      companyId,
    });
  };

  // ✅ Fiyat değiştiğinde şirket oranına göre hesapla
  const handlePriceChange = (value: string) => {
    setPrice(value);

    const num = parseFloat(value);
    if (!isNaN(num) && num > 0 && cashbackPercentage !== null) {
      const calculatedCashback = (num * cashbackPercentage) / 100;
      setCashback(calculatedCashback.toFixed(2));
    } else {
      setCashback("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mb-6">
      <div>
        <input
          type="text"
          placeholder="Ürün adı *"
          value={name}
          onChange={(e) => {
            if (e.target.value.length <= MAX_NAME_LENGTH) {
              setName(e.target.value);
            }
          }}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          maxLength={MAX_NAME_LENGTH}
          required
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Kısa ve açıklayıcı ürün adı girin</span>
          <span className={`${name.length > MAX_NAME_LENGTH * 0.8 ? 'text-orange-500' : ''} ${name.length === MAX_NAME_LENGTH ? 'text-red-500' : ''}`}>
            {name.length}/{MAX_NAME_LENGTH}
          </span>
        </div>
      </div>
      
      <div>
        <textarea
          placeholder="Ürün açıklaması (opsiyonel)"
          value={description}
          onChange={(e) => {
            if (e.target.value.length <= MAX_DESCRIPTION_LENGTH) {
              setDescription(e.target.value);
            }
          }}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 h-20 resize-none text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          rows={3}
          maxLength={MAX_DESCRIPTION_LENGTH}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Ürün içeriği, malzemeler, özellikler hakkında bilgi</span>
          <span className={`${description.length > MAX_DESCRIPTION_LENGTH * 0.8 ? 'text-orange-500' : ''} ${description.length === MAX_DESCRIPTION_LENGTH ? 'text-red-500' : ''}`}>
            {description.length}/{MAX_DESCRIPTION_LENGTH}
          </span>
        </div>
      </div>

      <div>
        <select
          value={categoryId || ""}
          onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value) : null)}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Kategori seçin (opsiyonel)</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <input
          type="number"
          placeholder="Fiyat (₺) *"
          value={price}
          onChange={(e) => handlePriceChange(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          step="0.01"
          min="0"
          required
        />
      </div>
      
      <div>
        <input
          type="number"
          placeholder="Nakit İade (₺)"
          value={cashback}
          onChange={(e) => setCashback(e.target.value)} // kullanıcı isterse değiştirir
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          step="0.01"
          min="0"
        />
        <p className="text-xs text-gray-400 mt-1">
          {loadingPercentage ? (
            <span className="text-gray-400">Oran yükleniyor...</span>
          ) : (
            <>
              Otomatik hesaplanan oran:{" "}
              <span className="font-semibold text-green-400">%{cashbackPercentage}</span>
              {" "}(İsterseniz manuel değiştirebilirsiniz)
            </>
          )}
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
