import React from "react";
import ProductManager from "./ProductManager";
import ProductInfoBox from "@/components/company/ProductInfoBox";

const ProductPage = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Ürün Yönetimi */}
      <div className="lg:col-span-2">
        <ProductManager />
      </div>

  <ProductInfoBox></ProductInfoBox>
      
    </div>
  );
};

export default ProductPage;
