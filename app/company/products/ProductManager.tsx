"use client";
import React, { useEffect, useState } from "react";
import {
  createProductAction,
  getProductsByCompanyAction,
} from "@/actions/product";
import ProductForm from "./ProductForm";
import ProductList from "./ProductList";
import ProductSkeleton from "./ProductSkeleton"; // ✅ ekledik

type Product = {
  id: number;
  name: string;
  price: number;
  pointsToBuy: number;
  pointsOnSell: number;
};

const ProductManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedCompany = localStorage.getItem("company");
    if (storedCompany) {
      const parsed = JSON.parse(storedCompany);
      setCompanyId(parsed.id);

      (async () => {
        setLoading(true);
        const res = await getProductsByCompanyAction(parsed.id);
        if (res.success) setProducts(res.products);
        setLoading(false);
      })();
    } else {
      setLoading(false);
    }
  }, []);

  const refreshProducts = async () => {
    if (!companyId) return;
    setLoading(true);
    const updated = await getProductsByCompanyAction(companyId);
    if (updated.success) setProducts(updated.products);
    setLoading(false);
  };

  return (
    <div className="bg-white text-black rounded-xl p-6 shadow">
      <h2 className="text-lg font-bold mb-4">Ürünler</h2>

      <ProductForm
        companyId={companyId}
        onSuccess={refreshProducts}
        createProductAction={createProductAction}
      />

      {/* ✅ Skeleton yerine ProductList */}
      {loading ? (
        <ProductSkeleton />
      ) : (
        <ProductList
          products={products}
          onDelete={(id) => setProducts(products.filter((p) => p.id !== id))}
        />
      )}
    </div>
  );
};

export default ProductManager;
