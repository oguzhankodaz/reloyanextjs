"use client";
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct } from "@/actions/product"; // ✅ helper fonksiyon

type Props = {
  companyId: string | null;

};

const ProductForm: React.FC<Props> = ({ companyId }) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const mutation = useMutation({
    mutationFn: (newProduct: {
      name: string;
      price: number;
      pointsToBuy?: number;
      pointsOnSell?: number;
      companyId: string;
    }) => createProduct(newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", companyId] });
      setLoading(false);
    },
    onError: () => {
      setLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!companyId) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const pointsToBuy = parseInt(formData.get("pointsToBuy") as string) || 0;
    const pointsOnSell = parseInt(formData.get("pointsOnSell") as string) || 0;

    setLoading(true);
    mutation.mutate({ name, price, pointsToBuy, pointsOnSell, companyId });
    e.currentTarget.reset();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mb-6">
      <input
        type="text"
        name="name"
        placeholder="Ürün adı"
        className="w-full px-3 py-2 border rounded"
        required
      />
      <input
        type="number"
        name="price"
        placeholder="Fiyat"
        className="w-full px-3 py-2 border rounded"
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          type="number"
          name="pointsToBuy"
          placeholder="Satın alma puanı"
          className="w-full px-3 py-2 border rounded"
        />
        <input
          type="number"
          name="pointsOnSell"
          placeholder="Satış puanı"
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
      >
        {loading ? "Ekleniyor..." : "+ Ürün Ekle"}
      </button>
    </form>
  );
};

export default ProductForm;
