"use client";
import React, { useEffect, useState } from "react";
import {
  createProductAction,
  getProductsByCompanyAction,
} from "@/actions/product";
import ProductForm from "./ProductForm";
import ProductList from "./ProductList";
import ProductSkeleton from "./ProductSkeleton";
import { useCompanyAuth } from "@/context/CompanyAuthContext"; // ✅ context

type Product = {
  id: number;
  name: string;
  price: number;
  pointsToBuy: number;
  pointsOnSell: number;
};

const ProductManager = () => {
  const { company } = useCompanyAuth(); // ✅ artık company buradan geliyor
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!company?.companyId) {
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      const res = await getProductsByCompanyAction(company.companyId);
      if (res.success) setProducts(res.products);
      setLoading(false);
    })();
  }, [company]);

  const refreshProducts = async () => {
    if (!company?.companyId) return;
    setLoading(true);
    const updated = await getProductsByCompanyAction(company.companyId);
    if (updated.success) setProducts(updated.products);
    setLoading(false);
  };

  return (
    <div className="bg-white text-black rounded-xl p-6 shadow">
      <h2 className="text-lg font-bold mb-4">Ürünler</h2>

      {/* ✅ Formu sadece company varsa gösterelim */}
      {company?.companyId && (
        <ProductForm
          companyId={company.companyId}
          onSuccess={refreshProducts}
          createProductAction={createProductAction}
        />
      )}

      {loading ? (
        <ProductSkeleton />
      ) : (
        <ProductList
          products={products}
          onDelete={(id) =>
            setProducts(products.filter((p) => p.id !== id))
          }
        />
      )}
    </div>
  );
};

export default ProductManager;
