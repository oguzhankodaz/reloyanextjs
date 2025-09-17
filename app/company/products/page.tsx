'use client'
import React from "react";
import ProductManager from "./ProductManager";
import ProductInfoBox from "@/components/company/ProductInfoBox";
import CompanyNavbar from "@/components/company/Navbar/Navbar";

const ProductPage = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
       <CompanyNavbar></CompanyNavbar>
      {/* Ürün Yönetimi */}
      <div className="lg:col-span-2">
        <ProductManager />
      </div>

  <ProductInfoBox></ProductInfoBox>
      
    </div>
  );
};

export default ProductPage;
