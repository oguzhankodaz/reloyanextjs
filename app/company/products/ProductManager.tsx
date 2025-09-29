/** @format */
"use client";

import { useQuery } from "@tanstack/react-query";
import { getProductsByCompanyAction } from "@/actions/product";
import ProductForm from "./ProductForm";
import ProductSkeleton from "./ProductSkeleton";
import { useCompanyAuth } from "@/context/CompanyAuthContext";
import { ProductList } from "./ProductList";
import { Product } from "@/lib/types";



const ProductManager = () => {
  const { company } = useCompanyAuth();

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

  // createMutation kaldırıldı (kullanılmıyor)

  return (
    <div className="bg-white text-black rounded-xl p-6 shadow">
      <h2 className="text-lg font-bold mb-4">Ürünler</h2>

      {/* ✅ Form */}
      {company?.companyId && <ProductForm companyId={company.companyId} />}

      {isLoading ? (
        <ProductSkeleton />
      ) : (
        <ProductList
          products={products || []}
          companyId={company?.companyId || null} // ✅ invalidate için gerekli
        />
      )}
    </div>
  );
};

export default ProductManager;
