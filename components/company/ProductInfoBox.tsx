// components/company/ProductInfoBox.tsx
import React from "react";

const ProductInfoBox = () => {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-bold mb-3">ℹ️ Nakit İade Sistemi Nasıl Çalışır?</h2>

      <p className="mb-3">
        ReloYa’da müşteriler alışveriş yaptıkça <strong>nakit iade (para puan)</strong> kazanır. 
        Bu sistem hem müşteriyi ödüllendirir hem de işletmenin kontrolünü korumasını sağlar.
      </p>

      <div className="space-y-3 text-sm">
        <div>
          <span className="font-semibold">1. Varsayılan İade Oranı (%3):</span>
          <p>
            Her ürün için varsayılan olarak <strong>fiyatın %3’ü</strong> kadar nakit iade kazanılır.  
            Örneğin: <strong>100₺</strong>’lik bir ürün alan müşteri <strong>3₺</strong> iade kazanır.
          </p>
        </div>

        <div>
          <span className="font-semibold">2. Esnek İade Oranı (Manuel Belirleme):</span>
          <p>
            İşletme isterse bu oranı <strong>ürüne özel</strong> ya da 
            <strong>toplam harcama</strong> üzerinden farklı bir yüzdelik ile ayarlayabilir.  
            Örneğin: <strong>100₺</strong> ürün için %5 seçilirse müşteri <strong>5₺</strong> iade kazanır.
          </p>
        </div>

        <div>
          <span className="font-semibold">3. Bakiye Kullanımı:</span>
          <p>
            Müşteri kazandığı bakiyeyi sonraki alışverişlerinde 
            <strong>doğrudan ödeme indirimi</strong> olarak kullanabilir.  
            Kullanılan tutar anında müşterinin toplam bakiyesinden düşülür.
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm italic text-gray-600">
        🔑 Özet: Varsayılan iade oranı %3’tür, fakat işletme istediği zaman bu oranı 
        manuel değiştirebilir. Böylece müşteri avantajlı olurken işletme esnekliğini korur.
      </p>
    </div>
  );
};

export default ProductInfoBox;
