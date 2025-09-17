/** @format */

"use client";
import React from "react";
import ProductManager from "./ProductManager";
import ProductInfoBox from "@/components/company/ProductInfoBox";
import CompanyNavbar from "@/components/company/Navbar/Navbar";
import BackButton from "@/components/company/BackButton";

const ProductPage = () => {
  return (
    <div className="pt-2">
  
      <CompanyNavbar></CompanyNavbar>
      <BackButton />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5">
        {/* Ürün Yönetimi */}
        <div className="lg:col-span-2">
          <ProductManager />
        </div>

        <ProductInfoBox></ProductInfoBox>
      </div>
    </div>
  );
};

export default ProductPage;
