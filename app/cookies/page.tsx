/** @format */

"use client";

import { LEGAL_CONFIG } from "@/legal/config";
import Link from "next/link";
import SmartBackButton from "@/components/SmartBackButton";

export default function CookiesPage() {
  const { company, cookies } = LEGAL_CONFIG;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Smart Back Button */}
        <SmartBackButton fallbackUrl="/" label="Geri Dön" />

        <h1 className="text-4xl font-bold mb-2">Çerez Politikası</h1>
        <p className="text-gray-400 mb-8">
          ReloYa platformunda çerez kullanımı hakkında bilgilendirme
        </p>

        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-lg p-8 space-y-8">
          {/* Giriş */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              Çerez Nedir?
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Çerezler (cookies), web sitelerinin tarayıcınız aracılığıyla
              cihazınızda sakladığı küçük metin dosyalarıdır. Bu dosyalar,
              platformun düzgün çalışmasını sağlamak, kullanıcı deneyimini
              geliştirmek ve platformumuzun nasıl kullanıldığını anlamak için
              kullanılır.
            </p>
          </section>

          {/* Çerez Kullanımının Amacı */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              Çerezleri Neden Kullanıyoruz?
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              ReloYa olarak çerezleri aşağıdaki amaçlarla kullanıyoruz:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Platformun temel işlevlerini sağlamak (oturum yönetimi)</li>
              <li>Güvenliği artırmak ve yetkisiz erişimi önlemek</li>
              <li>Kullanıcı tercihlerinizi hatırlamak</li>
              <li>Platform performansını analiz etmek</li>
              <li>Kullanıcı deneyimini kişiselleştirmek</li>
            </ul>
          </section>

          {/* Zorunlu Çerezler */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              1. Zorunlu Çerezler
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Bu çerezler platformun çalışması için gereklidir ve devre dışı
              bırakılamaz. Genellikle oturum açma, güvenlik ve temel işlevler
              için kullanılır.
            </p>
            <div className="space-y-3">
              {cookies.categories.necessary.cookies.map((cookie, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gray-900/50 rounded border border-gray-600"
                >
                  <p className="text-gray-300">
                    <strong className="text-cyan-400">Çerez Adı:</strong>{" "}
                    <code className="bg-gray-800 px-2 py-1 rounded text-sm">
                      {cookie.name}
                    </code>
                    <br />
                    <strong className="text-cyan-400">Amaç:</strong>{" "}
                    {cookie.purpose}
                    <br />
                    <strong className="text-cyan-400">Süre:</strong>{" "}
                    {cookie.duration}
                    <br />
                    <strong className="text-cyan-400">Tür:</strong>{" "}
                    {cookie.type}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-gray-400 text-sm mt-4">
              <strong>Not:</strong> Bu çerezler HttpOnly ve Secure olarak
              işaretlenmiştir, yani JavaScript ile erişilemez ve sadece HTTPS
              üzerinden iletilir.
            </p>
          </section>

          {/* İşlevsel Çerezler */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              2. İşlevsel Çerezler
            </h2>
            <p className="text-gray-300 leading-relaxed">
              İşlevsel çerezler, tercihlerinizi hatırlamamıza ve platformu
              kişiselleştirmemize yardımcı olur (örn. dil tercihi, tema
              ayarları). Şu anda ReloYa’da aktif işlevsel çerez kullanılmamaktadır.
              Gelecekte eklenirse, bu sayfa güncellenecektir.
            </p>
          </section>

          {/* Analitik Çerezler */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              3. Analitik Çerezler
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Analitik çerezler, platformun nasıl kullanıldığını anlamamıza
              yardımcı olur (örn. hangi sayfalar ziyaret ediliyor, ne kadar
              süre kalınıyor). Bu veriler topluca kullanılır ve bireysel
              kullanıcıları tanımlamaz.
            </p>
            <p className="text-gray-400 text-sm mt-3">
              <strong>Mevcut durum:</strong> Şu anda üçüncü taraf analitik
              araçlar (Google Analytics vb.) kullanılmamaktadır. Gelecekte
              kullanılırsa, açık rızanız alınacaktır.
            </p>
          </section>

          {/* Reklam Çerezleri */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              4. Reklam ve Pazarlama Çerezleri
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Bu çerezler, size daha alakalı reklamlar göstermek için
              kullanılır. ReloYa şu anda reklam çerezi kullanmamaktadır.
            </p>
          </section>

          {/* Üçüncü Taraf Çerezleri */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              Üçüncü Taraf Hizmet Sağlayıcılar
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Platform altyapısı için aşağıdaki üçüncü taraf hizmet
              sağlayıcılar kullanılmaktadır. Bu sağlayıcılar kendi çerez
              politikalarına sahiptir:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>
                <strong>Vercel:</strong> Hosting ve CDN hizmetleri (ABD)
              </li>
              <li>
                <strong>Neon:</strong> Veritabanı altyapısı (ABD)
              </li>
              <li>
                <strong>SendGrid:</strong> E-posta gönderim servisi (ABD)
              </li>
            </ul>
            <p className="text-gray-400 text-sm mt-4">
              Bu sağlayıcıların veri işleme politikaları hakkında detaylı bilgi
              için{" "}
              <Link
                href="/privacy"
                className="text-cyan-400 underline hover:text-cyan-300"
              >
                KVKK Aydınlatma Metni
              </Link>
              ’ni inceleyebilirsiniz.
            </p>
          </section>

          {/* Çerez Ayarları */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              Çerez Tercihlerinizi Nasıl Yönetirsiniz?
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong>Tarayıcı Ayarları:</strong> Çoğu tarayıcı, çerezleri
                kabul etme/reddetme veya mevcut çerezleri silme seçeneği sunar.
                Ancak çerezleri devre dışı bırakmanız, platformun bazı
                özelliklerinin düzgün çalışmamasına neden olabilir.
              </p>
              <div className="p-4 bg-cyan-900/20 border border-cyan-600 rounded">
                <p className="font-semibold mb-2">
                  Popüler tarayıcılarda çerez ayarları:
                </p>
                <ul className="text-sm space-y-1">
                  <li>
                    <strong>Chrome:</strong> Ayarlar → Gizlilik ve güvenlik →
                    Çerezler ve diğer site verileri
                  </li>
                  <li>
                    <strong>Firefox:</strong> Ayarlar → Gizlilik ve Güvenlik →
                    Çerezler ve Site Verileri
                  </li>
                  <li>
                    <strong>Safari:</strong> Tercihler → Gizlilik → Çerezleri
                    Yönet
                  </li>
                  <li>
                    <strong>Edge:</strong> Ayarlar → Gizlilik, arama ve
                    hizmetler → Çerezler
                  </li>
                </ul>
              </div>
              <p>
                <strong>Platform Üzerinden:</strong> Gelecekte eklenecek çerez
                tercih merkezi ile analitik ve pazarlama çerezlerini
                yönetebileceksiniz.
              </p>
            </div>
          </section>

          {/* Çerez Saklama Süreleri */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              Çerez Saklama Süreleri
            </h2>
            <div className="space-y-3 text-gray-300">
              <p>
                <strong>Oturum Çerezleri:</strong> Tarayıcınızı kapattığınızda
                otomatik olarak silinir.
              </p>
              <p>
                <strong>Kalıcı Çerezler:</strong> Belirlenen süre boyunca
                (genellikle 7-30 gün) cihazınızda kalır. ReloYa’da oturum
                çerezleri maksimum 7 gün saklanır.
              </p>
            </div>
          </section>

          {/* Değişiklikler */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              Çerez Politikasında Değişiklikler
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Bu çerez politikasını zaman zaman güncelleyebiliriz. Önemli
              değişiklikler olması durumunda sizi bilgilendireceğiz. Bu
              sayfayı düzenli olarak kontrol etmenizi öneririz.
            </p>
          </section>

          {/* İletişim */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              İletişim
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Çerez kullanımı hakkında sorularınız için:
            </p>
            <div className="p-4 bg-gray-900/50 rounded border border-gray-600">
              <p className="text-sm text-gray-300">
                <strong>{company.name}</strong>
                <br />
                <strong>E-posta:</strong>{" "}
                <a
                  href={`mailto:${company.email}`}
                  className="text-cyan-400 hover:underline"
                >
                  {company.email}
                </a>
                <br />
                <strong>Telefon:</strong> {company.phone}
              </p>
            </div>
          </section>

          {/* Son güncelleme */}
          <div className="text-center text-gray-500 text-sm pt-6 border-t border-gray-700">
            <p>Son güncelleme: 1 Ekim 2025</p>
            <p className="mt-2">
              <Link href="/privacy" className="text-cyan-400 hover:underline">
                KVKK Aydınlatma Metni
              </Link>
              {" • "}
              <Link href="/terms" className="text-cyan-400 hover:underline">
                Hizmet Koşulları
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

