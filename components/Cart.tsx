"use client";

import { formatCurrency } from "@/lib/helpers";
import { CartItem } from "@/types/cart";
import { Product } from "@/types/product";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

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
    <div className="bg-gray-800 rounded-xl shadow-lg w-full">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <span className="mr-2">🛍️</span>
          Sepetiniz
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          {cartItems.length} ürün sepetinizde
        </p>
      </div>

      <div className="p-4">
        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-2">🛒</div>
            <p className="text-gray-400 text-sm">Henüz ürün eklemediniz.</p>
            <p className="text-gray-500 text-xs mt-1">Ürünleri arayıp sepete ekleyebilirsiniz.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Sepet ürünleri */}
            <div className="space-y-3 max-h-[40vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-700 rounded-lg p-3 border border-gray-600 hover:border-red-500/50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate">{item.name}</h4>
                      <p className="text-gray-400 text-sm">
                        Adet: <span className="font-medium">{item.quantity}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors flex items-center gap-1"
                      title="Ürünü sepetten çıkar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="hidden sm:inline text-sm">Sil</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Özet bilgiler */}
            <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">💵 Toplam Tutar:</span>
                  <span className="font-semibold text-white text-lg">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">🎯 Kazanılacak İade:</span>
                  <span className="font-semibold text-green-400 text-lg">{formatCurrency(totalCashback)}</span>
                </div>
              </div>
            </div>

            {/* Kaydet butonu - Onay dialogu ile */}
            <ConfirmDialog
              trigger={
                <button
                  disabled={saving}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Satın Alma İşlemini Tamamla
                    </>
                  )}
                </button>
              }
              title="Satın Alma Onayı"
              description={`${cartItems.length} ürün için toplam ${formatCurrency(totalPrice)} tutarında satın alma işlemini tamamlamak istediğinizden emin misiniz?`}
              onConfirm={onSave}
            />
          </div>
        )}
      </div>
    </div>
  );
}
