/** @format */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProductsByCompanyAction } from "@/actions/product";
import ProductForm from "./ProductForm";
import ProductSkeleton from "./ProductSkeleton";
import { useCompanyAuth } from "@/context/CompanyAuthContext";
import ProductListView from "./ProductListView";
import CategoryManager from "./CategoryManager";
import { Product } from "@/lib/types";



const ProductManager = () => {
  const { company } = useCompanyAuth();
  const [activeTab, setActiveTab] = useState<"products" | "categories">("products");
  const [productSubTab, setProductSubTab] = useState<"add" | "list">("add");

  // ✅ Ürünleri cache'le
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["products", company?.companyId],
    queryFn: async () => {
      if (!company?.companyId) return [];
      const res = await getProductsByCompanyAction(company.companyId);
      return res.success ? res.products : [];
    },
    enabled: !!company?.companyId, // company yoksa çalışmaz
    staleTime: 1000 * 60 * 5, // 5 dk cache
  });

  return (
    <div className="bg-gray-800 text-white rounded-xl p-6 shadow">
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-700 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab("products")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === "products"
              ? "bg-green-600 text-white shadow-sm"
              : "text-gray-300 hover:text-white hover:bg-gray-600"
          }`}
        >
          🛍️ Ürün İşlemleri
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === "categories"
              ? "bg-green-600 text-white shadow-sm"
              : "text-gray-300 hover:text-white hover:bg-gray-600"
          }`}
        >
          📂 Kategori İşlemleri
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "products" ? (
        <div>
          <h2 className="text-lg font-bold mb-4">Ürün İşlemleri</h2>

          {/* Ürün Alt Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => setProductSubTab("add")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                productSubTab === "add"
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-gray-300 hover:text-white hover:bg-gray-600"
              }`}
            >
              ➕ Ürün Ekle
            </button>
            <button
              onClick={() => setProductSubTab("list")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                productSubTab === "list"
                  ? "bg-green-600 text-white shadow-sm"
                  : "text-gray-300 hover:text-white hover:bg-gray-600"
              }`}
            >
              📋 Ürün Listesi
            </button>
          </div>

          {/* Ürün Alt Tab Content */}
          {productSubTab === "add" ? (
            <div>
              {company?.companyId && <ProductForm companyId={company.companyId} />}
            </div>
          ) : (
            <div>
              {isLoading ? (
                <ProductSkeleton />
              ) : (
                <ProductListView
                  products={products || []}
                  companyId={company?.companyId || null}
                />
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-bold mb-4">Kategori Yönetimi</h2>
          {company?.companyId && <CategoryManager />}
        </div>
      )}
    </div>
  );
};

export default ProductManager;
