/** @format */

import { LEGAL_CONFIG } from "@/legal/config";

export default function TermsContent() {
  const { company } = LEGAL_CONFIG;

  return (
    <div className="space-y-6 text-sm">
      {/* Giriş */}
      <section>
        <p className="text-gray-700 leading-relaxed">
          İşbu Hizmet Koşulları, <strong>{company.name}</strong> (&quot;
          <strong>ReloYa</strong>&quot;, &quot;<strong>Şirket</strong>&quot;) tarafından işletilen müşteri sadakat
          platformunun kullanımına ilişkin hükümleri düzenlemektedir.
        </p>
      </section>

      {/* 1. Hizmet Kapsamı */}
      <section>
        <h3 className="text-lg font-semibold mb-3 text-gray-900">
          1. Hizmet Kapsamı
        </h3>
        <p className="text-gray-700 mb-2">
          ReloYa, kullanıcıların iş ortağı işletmelerden yaptıkları satın
          alımlar sonucunda puan kazanmalarını sağlar.
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-3">
          <li>Kullanıcı hesabı oluşturma</li>
          <li>QR kod ile kimlik doğrulama</li>
          <li>Puan kazanma ve kullanma</li>
          <li>Satın alma geçmişi takibi</li>
        </ul>
      </section>

      {/* 2. Kullanıcı Yükümlülükleri */}
      <section>
        <h3 className="text-lg font-semibold mb-3 text-gray-900">
          2. Kullanıcı Yükümlülükleri
        </h3>
        <div className="space-y-2 text-gray-700">
          <p>
            <strong>2.1.</strong> Kayıt sırasında doğru bilgi sağlamalısınız.
          </p>
          <p>
            <strong>2.2.</strong> Hesap güvenliğinden siz sorumlusunuz.
          </p>
          <p>
            <strong>2.3.</strong> 18 yaşından küçükler platformu kullanamaz.
          </p>
        </div>
      </section>

      {/* 3. Puan Sistemi */}
      <section>
        <h3 className="text-lg font-semibold mb-3 text-gray-900">
          3. Puan Sistemi
        </h3>
        <div className="space-y-2 text-gray-700">
          <p>
            <strong>3.1.</strong> Puanlar, geçerli satın alımlar karşılığında kazanılır.
          </p>
          <p>
            <strong>3.2.</strong> Puanlar işletme bazında saklanır.
          </p>
          <p>
            <strong>3.3.</strong> Puanlar nakde çevrilemez, devredilemez.
          </p>
        </div>
      </section>

      {/* 4. Yasaklı Davranışlar */}
      <section>
        <h3 className="text-lg font-semibold mb-3 text-gray-900">
          4. Yasaklı Davranışlar
        </h3>
        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-3">
          <li>Sahte bilgi sağlamak</li>
          <li>Sistemi manipüle etmeye çalışmak</li>
          <li>Başkasının hesabını izinsiz kullanmak</li>
          <li>Otomatik araçlar (bot) kullanmak</li>
        </ul>
      </section>

      {/* 5. Sorumluluk */}
      <section>
        <h3 className="text-lg font-semibold mb-3 text-gray-900">
          5. Sorumluluk Sınırlaması
        </h3>
        <p className="text-gray-700">
          Platform &quot;olduğu gibi&quot; sunulmaktadır. İş ortağı işletmelerin sunduğu
          ürün/hizmetlerin kalitesinden sorumlu değiliz.
        </p>
      </section>

      {/* 6. Uyuşmazlık */}
      <section className="bg-amber-50 p-4 rounded-lg border border-amber-200">
        <h3 className="text-sm font-semibold mb-2 text-amber-900">
          Uygulanacak Hukuk
        </h3>
        <p className="text-xs text-amber-800">
          İşbu sözleşme Türkiye Cumhuriyeti kanunlarına tabidir.
          İstanbul Anadolu Mahkemeleri yetkilidir.
        </p>
      </section>
    </div>
  );
}







