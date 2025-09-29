"use client";

import { formatCurrency } from "@/lib/helpers";
import { CartItem } from "@/types/cart";
import { Product } from "@/types/product";

type Props = {
  cartItems: CartItem[];
  products: Product[];
  onRemove: (id: number) => void;
  onSave: () => void;
  saving: boolean;
};

export function Cart({ cartItems, products, onRemove, onSave, saving }: Props) {
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

  return (
    <div className="bg-gray-800 text-gray-100 p-4 rounded-lg shadow-md w-full max-w-3xl mx-auto">
      <h3 className="font-semibold mb-4 text-lg">🛍 Sepetiniz</h3>

      {cartItems.length === 0 ? (
        <p className="text-gray-400 text-sm">Henüz ürün eklemediniz.</p>
      ) : (
        <>
          <div className="space-y-2">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center bg-gray-700 rounded-md px-3 py-2"
              >
                <span className="text-sm sm:text-base">
                  {item.name} × {item.quantity}
                </span>
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-red-400 hover:text-red-500 text-xs sm:text-sm"
                >
                  ❌ Sil
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-600 mt-4 pt-3 text-sm sm:text-base">
            <p className="flex justify-between">
              <span>💵 Toplam:</span>
              <span className="font-semibold">{formatCurrency(totalPrice)}</span>
            </p>
            <p className="flex justify-between">
              <span>🎯 Kazanılacak:</span>
              <span className="font-semibold text-green-400">
                {formatCurrency(totalCashback)}
              </span>
            </p>
          </div>

          <button
            onClick={onSave}
            disabled={saving}
            className="w-full mt-5 bg-green-600 text-white py-2 sm:py-3 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Kaydet ✅"}
          </button>
        </>
      )}
    </div>
  );
}
