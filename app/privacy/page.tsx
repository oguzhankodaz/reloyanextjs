/** @format */

"use client";

import { LEGAL_CONFIG } from "@/legal/config";
import Link from "next/link";
import SmartBackButton from "@/components/SmartBackButton";

export default function PrivacyPage() {
  const { company, dpo, data, crossBorder, kvkk } = LEGAL_CONFIG;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Smart Back Button */}
        <SmartBackButton fallbackUrl="/" label="Geri Dön" />

        <h1 className="text-4xl font-bold mb-2">Kişisel Verilerin Korunması</h1>
        <p className="text-gray-400 mb-8">KVKK Aydınlatma Metni</p>

        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-lg p-8 space-y-8">
          {/* 1. Veri Sorumlusu */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              1. Veri Sorumlusu
            </h2>
            <p className="text-gray-300 leading-relaxed">
              6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca,
              kişisel verileriniz; veri sorumlusu olarak{" "}
              <strong>{company.name}</strong> (&quot;
              <strong>{company.shortName}</strong>&quot;) tarafından aşağıda
              açıklanan kapsamda işlenebilecektir.
            </p>
            <div className="mt-4 p-4 bg-gray-900/50 rounded border border-gray-600">
              <p className="text-sm text-gray-300">
                <strong>Adres:</strong> {company.address}
                <br />
                <strong>E-posta:</strong>{" "}
                <a
                  href={`mailto:${dpo.email}`}
                  className="text-cyan-400 hover:underline"
                >
                  {dpo.email}
                </a>
                <br />
                <strong>Telefon:</strong> {dpo.phone}
              </p>
            </div>
          </section>

          {/* 2. İşlenen Kişisel Veriler */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              2. İşlenen Kişisel Verileriniz
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Platformumuz üzerinden aşağıdaki kişisel verileriniz
              işlenmektedir:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>
                <strong>Kimlik Bilgileri:</strong> Ad, soyad, e-posta adresi,
                telefon numarası
              </li>
              <li>
                <strong>İşlem Güvenliği Bilgileri:</strong> IP adresi, çerez
                kayıtları, oturum bilgileri
              </li>
              <li>
                <strong>Müşteri İşlem Bilgileri:</strong> Satın alma kayıtları,
                sadakat puanları, ürün tercihleri
              </li>
              <li>
                <strong>Pazarlama Bilgileri:</strong> Kampanya tercihleri,
                rıza kayıtları (opsiyonel)
              </li>
            </ul>
          </section>

          {/* 3. İşleme Amaçları */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              3. Kişisel Verilerin İşlenme Amaçları
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              {kvkk.purposes.map((purpose, idx) => (
                <li key={idx}>{purpose}</li>
              ))}
            </ul>
          </section>

          {/* 4. Hukuki Sebepler */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              4. İşlemenin Hukuki Sebepleri
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Kişisel verileriniz, KVKK&apos;nın 5. ve 6. maddelerinde belirtilen
              aşağıdaki hukuki sebeplere dayanılarak işlenmektedir:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              {kvkk.legalBases.map((basis, idx) => (
                <li key={idx}>{basis}</li>
              ))}
            </ul>
          </section>

          {/* 5. Veri Paylaşımı */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              5. Kişisel Verilerin Aktarılması
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Kişisel verileriniz, yukarıda belirtilen amaçlarla ve KVKK&apos;nın 8.
              ve 9. maddelerinde belirtilen şartlara uygun olarak aşağıdaki
              alıcı gruplarıyla paylaşılabilir:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>
                İş ortağı şirketler (sadakat programı katılımcısı işletmeler)
              </li>
              <li>
                Hizmet sağlayıcılar (bulut altyapı, e-posta hizmetleri, ödeme
                altyapısı)
              </li>
              <li>Yasal yükümlülükler gereği kamu kurum ve kuruluşları</li>
              <li>Denetim ve hukuki danışmanlık firmaları</li>
            </ul>
          </section>

          {/* 6. Yurt Dışı Aktarım */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              6. Kişisel Verilerin Yurt Dışına Aktarılması
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Platform altyapısının sağlanması amacıyla kişisel verileriniz
              aşağıdaki ülkelere aktarılmaktadır. Bu aktarımlar KVKK&apos;nın 9.
              maddesi uyarınca uygun güvencelerle yapılmaktadır:
            </p>
            <div className="space-y-3">
              {crossBorder.transfers.map((transfer, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gray-900/50 rounded border border-gray-600"
                >
                  <p className="text-sm text-gray-300">
                    <strong className="text-cyan-400">Ülke:</strong>{" "}
                    {transfer.country}
                    <br />
                    <strong className="text-cyan-400">Hizmet Sağlayıcı:</strong>{" "}
                    {transfer.provider}
                    <br />
                    <strong className="text-cyan-400">Hukuki Dayanak:</strong>{" "}
                    {transfer.legalBasis}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 7. Saklama Süreleri */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              7. Kişisel Verilerin Saklanma Süreleri
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Kişisel verileriniz, işlenme amaçlarının gerektirdiği süre ve
              yasal saklama yükümlülükleri doğrultusunda aşağıdaki sürelerle
              saklanmaktadır:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>
                <strong>Kullanıcı hesap bilgileri:</strong>{" "}
                {data.retentionPeriods.userAccount} yıl
              </li>
              <li>
                <strong>Satın alma kayıtları:</strong>{" "}
                {data.retentionPeriods.purchases} yıl (Vergi Usul Kanunu)
              </li>
              <li>
                <strong>Rıza kayıtları:</strong>{" "}
                {data.retentionPeriods.consents} yıl
              </li>
              <li>
                <strong>Denetim kayıtları:</strong>{" "}
                {data.retentionPeriods.auditLogs} yıl
              </li>
            </ul>
          </section>

          {/* 8. İlgili Kişi Hakları */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              8. KVKK Kapsamındaki Haklarınız
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              KVKK&apos;nın 11. maddesi uyarınca, veri sorumlusu olan şirketimize
              başvurarak aşağıdaki haklarınızı kullanabilirsiniz:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              {kvkk.rights.map((right, idx) => (
                <li key={idx}>{right}</li>
              ))}
            </ul>
          </section>

          {/* 9. Başvuru Yöntemi */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              9. Haklarınızı Nasıl Kullanabilirsiniz?
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              KVKK&apos;dan doğan haklarınızı kullanmak için aşağıdaki kanallardan
              talepte bulunabilirsiniz:
            </p>
            <div className="p-4 bg-cyan-900/20 border border-cyan-600 rounded">
              <p className="text-gray-300">
                <strong className="text-cyan-400">
                  Platform üzerinden:
                </strong>{" "}
                <Link
                  href="/account/privacy"
                  className="underline hover:text-cyan-300"
                >
                  Hesabım → Gizlilik ve Veri Talepleri
                </Link>
                <br />
                <strong className="text-cyan-400">E-posta:</strong>{" "}
                <a
                  href={`mailto:${dpo.email}`}
                  className="underline hover:text-cyan-300"
                >
                  {dpo.email}
                </a>
                <br />
                <strong className="text-cyan-400">Posta:</strong>{" "}
                {company.address}
              </p>
            </div>
            <p className="text-gray-400 text-sm mt-4">
              Başvurularınız en geç <strong>{data.dsarSla} gün</strong> içinde
              yanıtlanacaktır. Başvurunuzun niteliğine göre kimlik doğrulama
              talep edilebilir.
            </p>
          </section>

          {/* 10. İletişim */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              10. İletişim
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Kişisel verilerinizin korunması hakkında sorularınız için
              bizimle iletişime geçebilirsiniz:
            </p>
            <div className="mt-4 p-4 bg-gray-900/50 rounded border border-gray-600">
              <p className="text-sm text-gray-300">
                <strong>KVKK Sorumlusu:</strong> {dpo.name}
                <br />
                <strong>E-posta:</strong>{" "}
                <a
                  href={`mailto:${dpo.email}`}
                  className="text-cyan-400 hover:underline"
                >
                  {dpo.email}
                </a>
                <br />
                <strong>Destek:</strong>{" "}
                <a
                  href={`mailto:${company.supportEmail}`}
                  className="text-cyan-400 hover:underline"
                >
                  {company.supportEmail}
                </a>
                <br />
                <strong>Telefon:</strong> {dpo.phone}
              </p>
            </div>
          </section>

          {/* Son güncelleme */}
          <div className="text-center text-gray-500 text-sm pt-6 border-t border-gray-700">
            <p>Son güncelleme: 1 Ekim 2025</p>
            <p className="mt-2">
              <Link href="/terms" className="text-cyan-400 hover:underline">
                Hizmet Koşulları
              </Link>
              {" • "}
              <Link href="/cookies" className="text-cyan-400 hover:underline">
                Çerez Politikası
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

