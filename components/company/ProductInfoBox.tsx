// components/company/ProductInfoBox.tsx
import React from "react";

const ProductInfoBox = () => {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-bold mb-3">ℹ️ Puan Sistemi Nasıl Çalışır?</h2>

      <p className="mb-3">
        ReloYa’da iki farklı puan mantığı vardır. Böylece müşteri avantajlı
        hissederken işletme de kârını korur.
      </p>

      <div className="space-y-3 text-sm">
        <div>
          <span className="font-semibold">1. Satış Puanı (Kazandırılan Puan):</span>
          <p>
            Müşteri alışveriş yaptığında ürünün <strong>kârı üzerinden</strong>{" "}
            puan kazanır.  
            Örneğin: maliyeti <strong>70₺</strong>, satış fiyatı{" "}
            <strong>100₺</strong> olan ürün için kâr 30₺’dir. Eğer kârın %10’u
            puan verilirse müşteri <strong>30 puan</strong> kazanır.
          </p>
        </div>

        <div>
          <span className="font-semibold">2. Satın Alma Puanı (Ürün İçin Gerekli Puan):</span>
          <p>
            Müşteri yalnızca puanla alışveriş yapmak isterse, ürün fiyatından
            daha yüksek puan gerekir.  
            Örneğin: <strong>100₺</strong> ürün için <strong>1500 puan</strong>{" "}
            belirlenebilir. Bu sayede müşteri ödüllendirilir ama işletme zarar
            etmez.
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm italic text-gray-600">
        🔑 Özet: Satış puanı kâra göre verilir, satın alma puanı ise fiyatın
        üzerinde olacak şekilde belirlenir.
      </p>
    </div>
  );
};

export default ProductInfoBox;
