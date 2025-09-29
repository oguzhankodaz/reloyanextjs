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
    <div className="bg-white text-black p-3 sm:p-4 rounded-lg shadow-md w-full max-w-3xl mx-auto">
      <ProductList products={products} onAdd={onAdd} />
    </div>
  );
}
