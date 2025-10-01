/** @format */

import { LEGAL_CONFIG } from "@/legal/config";

export default function KvkkContent() {
  const { company, dpo, data, kvkk } = LEGAL_CONFIG;

  return (
    <div className="space-y-6 text-sm">
      {/* 1. Veri Sorumlusu */}
      <section>
        <h3 className="text-lg font-semibold mb-3 text-gray-900">
          1. Veri Sorumlusu
        </h3>
        <p className="text-gray-700 leading-relaxed mb-3">
          6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca,
          kişisel verileriniz; veri sorumlusu olarak{" "}
          <strong>{company.name}</strong> (&quot;
          <strong>{company.shortName}</strong>&quot;) tarafından aşağıda
          açıklanan kapsamda işlenebilecektir.
        </p>
        <div className="p-3 bg-gray-100 rounded border border-gray-300">
          <p className="text-xs text-gray-700">
            <strong>Adres:</strong> {company.address}
            <br />
            <strong>E-posta:</strong> {dpo.email}
            <br />
            <strong>Telefon:</strong> {dpo.phone}
          </p>
        </div>
      </section>

      {/* 2. İşlenen Kişisel Veriler */}
      <section>
        <h3 className="text-lg font-semibold mb-3 text-gray-900">
          2. İşlenen Kişisel Verileriniz
        </h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-3">
          <li>
            <strong>Kimlik Bilgileri:</strong> Ad, soyad, e-posta adresi
          </li>
          <li>
            <strong>İşlem Güvenliği:</strong> IP adresi, çerez kayıtları
          </li>
          <li>
            <strong>Müşteri İşlem:</strong> Satın alma kayıtları, sadakat puanları
          </li>
        </ul>
      </section>

      {/* 3. İşleme Amaçları */}
      <section>
        <h3 className="text-lg font-semibold mb-3 text-gray-900">
          3. İşlenme Amaçları
        </h3>
        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-3">
          {kvkk.purposes.slice(0, 5).map((purpose, idx) => (
            <li key={idx}>{purpose}</li>
          ))}
        </ul>
      </section>

      {/* 4. Haklarınız */}
      <section>
        <h3 className="text-lg font-semibold mb-3 text-gray-900">
          4. KVKK Haklarınız
        </h3>
        <p className="text-gray-700 mb-2">
          KVKK&apos;nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-3 text-xs">
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
          <li>İşlenme amacını öğrenme</li>
          <li>Eksik/yanlış verilerin düzeltilmesini isteme</li>
          <li>Verilerin silinmesini isteme</li>
        </ul>
      </section>

      {/* 5. Saklama */}
      <section>
        <h3 className="text-lg font-semibold mb-3 text-gray-900">
          5. Saklama Süreleri
        </h3>
        <p className="text-gray-700">
          Verileriniz, yasal yükümlülükler ve işlenme amaçları doğrultusunda{" "}
          <strong>{data.retentionPeriods.userAccount} yıl</strong> süreyle saklanır.
        </p>
      </section>

      {/* İletişim */}
      <section className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
        <h3 className="text-sm font-semibold mb-2 text-cyan-900">
          Haklarınızı Kullanmak İçin
        </h3>
        <p className="text-xs text-cyan-800">
          <strong>E-posta:</strong> {dpo.email}
          <br />
          <strong>Yanıt Süresi:</strong> En geç {data.dsarSla} gün
        </p>
      </section>
    </div>
  );
}


