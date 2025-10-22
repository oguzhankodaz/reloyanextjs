"use client";

import { ProductList } from "@/app/company/products/ProductList";
import { CartItem } from "@/types/cart";
import { Product } from "@/types/product";

type Props = {
  products: Product[];
  onAdd: (item: CartItem) => void;
};

export function ProductSelector({ products, onAdd }: Props) {
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg w-full">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="mr-2">🔍</span>
          Ürün Ara & Sepete Ekle
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          Ürünleri arayın ve sepete ekleyin
        </p>
      </div>
      <div className="p-4">
        <ProductList products={products} onAdd={onAdd} simplified={true} />
      </div>
    </div>
  );
}
