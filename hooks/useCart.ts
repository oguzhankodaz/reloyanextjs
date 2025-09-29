// hooks/useCart.ts
"use client";

import { CartItem } from "@/types/cart";
import { Product } from "@/types/product";
import { useState } from "react";

export function useCart(products: Product[]) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: number) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const calculateTotals = () => {
    const totalPrice = cartItems.reduce(
      (sum, item) =>
        sum +
        (products.find((p) => p.id === item.id)?.price || 0) * item.quantity,
      0
    );
    const totalCashback = cartItems.reduce(
      (sum, item) =>
        sum +
        (products.find((p) => p.id === item.id)?.cashback || 0) * item.quantity,
      0
    );
    return { totalPrice, totalCashback };
  };

  return { cartItems, addToCart, removeFromCart, calculateTotals, setCartItems };
}
