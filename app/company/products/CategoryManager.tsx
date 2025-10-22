/** @format */
"use client";

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useRadixToast } from "@/components/notifications/ToastProvider";
import { useCompanyAuth } from "@/context/CompanyAuthContext";

interface Category {
  id: number;
  name: string;
}

export default function CategoryManager() {
  const { company } = useCompanyAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const toast = useRadixToast();

  // Kategorileri yükle
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ["categories", company?.companyId],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      return response.json();
    },
    enabled: !!company?.companyId,
  });

  const categories: Category[] = categoriesData?.categories || [];

  // Kategori ekleme
  const createMutation = useMutation({
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
      queryClient.invalidateQueries({ queryKey: ["categories", company?.companyId] });
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

  // Kategori silme
  const deleteMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Kategori silinemedi");
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", company?.companyId] });
      queryClient.invalidateQueries({ queryKey: ["products", company?.companyId] });
      toast({
        title: "Başarılı",
        description: "Kategori ve bağlı ürünler silindi.",
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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Eksik bilgi",
        description: "Lütfen kategori adı giriniz.",
        variant: "error",
      });
      return;
    }

    if (!company?.companyId) {
      toast({
        title: "Hata",
        description: "Şirket bilgisi bulunamadı.",
        variant: "error",
      });
      return;
    }

    const toTitleCaseTr = (value: string) =>
      value
        .trim()
        .split(/\s+/)
        .map((w) =>
          w.length === 0
            ? w
            : w.charAt(0).toLocaleUpperCase("tr-TR") + w.slice(1).toLocaleLowerCase("tr-TR")
        )
        .join(" ");

    createMutation.mutate({
      name: toTitleCaseTr(name),
      companyId: company.companyId,
    });
  };

  const handleDelete = (categoryId: number, categoryName: string) => {
    if (window.confirm(`"${categoryName}" kategorisini ve bu kategorideki tüm ürünleri silmek istediğinizden emin misiniz?`)) {
      deleteMutation.mutate(categoryId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Kategori Ekleme Formu */}
      <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
        <h3 className="text-lg font-semibold text-white mb-4">Kategori Ekle</h3>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Kategori adı"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 w-full sm:w-auto"
          >
            {createMutation.isPending ? "Ekleniyor..." : "➕ Ekle"}
          </button>
        </form>
      </div>

      {/* Kategori Listesi */}
      <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
        <h3 className="text-lg font-semibold text-white mb-4">Kategoriler</h3>
        
        {isLoading ? (
          <div className="text-center py-4">
            <div className="text-gray-400">Kategoriler yükleniyor...</div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">📂</div>
            <p className="text-gray-400 text-sm">Henüz kategori eklenmedi.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between bg-gray-600 rounded-lg p-3 border border-gray-500 min-h-[60px]"
              >
                <span className="text-white font-medium flex-1 min-w-0 pr-2 line-clamp-2">
                  {category.name}
                </span>
                <button
                  onClick={() => handleDelete(category.id, category.name)}
                  disabled={deleteMutation.isPending}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50 flex-shrink-0"
                >
                  {deleteMutation.isPending ? "Siliniyor..." : "🗑️ Sil"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
