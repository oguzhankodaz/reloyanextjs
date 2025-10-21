/** @format */
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRadixToast } from "@/components/notifications/ToastProvider";

type Props = {
  companyId: string;
};

export default function CategoryForm({ companyId }: Props) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const toast = useRadixToast();

  const mutation = useMutation({
    mutationFn: async (categoryData: { name: string; companyId: string }) => {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Kategori eklenemedi");
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", companyId] });
      setName("");
      toast({
        title: "Başarılı",
        description: "Kategori başarıyla eklendi.",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message,
        variant: "error",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Eksik bilgi",
        description: "Lütfen kategori adı giriniz.",
        variant: "error",
      });
      return;
    }

    mutation.mutate({
      name: name.trim(),
      companyId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-700">Kategori Ekle</h3>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Kategori adı"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
          required
        />
        <button
          type="submit"
          disabled={mutation.isPending}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {mutation.isPending ? "Ekleniyor..." : "➕ Ekle"}
        </button>
      </div>
    </form>
  );
}
