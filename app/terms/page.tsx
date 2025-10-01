/** @format */

import { LEGAL_CONFIG } from "@/legal/config";
import Link from "next/link";

export const metadata = {
  title: "Hizmet Koşulları | ReloYa",
  description: "ReloYa platformu kullanım koşulları ve sözleşmesi",
};

export default function TermsPage() {
  const { company } = LEGAL_CONFIG;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-400 hover:text-cyan-400 transition-colors mb-6 group"
        >
          <svg
            className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Ana Sayfaya Dön
        </Link>

        <h1 className="text-4xl font-bold mb-2">Hizmet Koşulları</h1>
        <p className="text-gray-400 mb-8">
          ReloYa Müşteri Sadakat Platformu Kullanım Sözleşmesi
        </p>

        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-lg p-8 space-y-8">
          {/* Giriş */}
          <section>
            <p className="text-gray-300 leading-relaxed">
              İşbu Hizmet Koşulları, <strong>{company.name}</strong> (&quot;
              <strong>ReloYa</strong>&quot;, &quot;<strong>Şirket</strong>&quot;, &quot;
              <strong>Biz</strong>&quot;) tarafından işletilen müşteri sadakat
              platformunun kullanımına ilişkin hüküm ve koşulları
              düzenlemektedir. Platformu kullanarak bu koşulları kabul etmiş
              sayılırsınız.
            </p>
          </section>

          {/* 1. Tanımlar */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              1. Tanımlar
            </h2>
            <ul className="space-y-2 text-gray-300">
              <li>
                <strong>Platform:</strong> ReloYa web ve mobil uygulamaları ile
                tüm ilgili hizmetler
              </li>
              <li>
                <strong>Kullanıcı:</strong> Platformu kullanan tüzel veya
                gerçek kişiler
              </li>
              <li>
                <strong>İş Ortağı:</strong> Platform üzerinden sadakat programı
                sunan işletmeler
              </li>
              <li>
                <strong>Puan/Cashback:</strong> Satın alımlar karşılığında
                kazanılan sadakat puanları
              </li>
            </ul>
          </section>

          {/* 2. Hizmetin Kapsamı */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              2. Hizmetin Kapsamı ve Tanımı
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              ReloYa, kullanıcıların iş ortağı işletmelerden yaptıkları satın
              alımlar sonucunda puan kazanmalarını ve bu puanları kullanmalarını
              sağlayan bir sadakat platformudur. Platform aşağıdaki temel
              özellikleri sunar:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Kullanıcı hesabı oluşturma ve yönetimi</li>
              <li>QR kod ile hızlı kimlik doğrulama</li>
              <li>İş ortağı işletmelerden puan kazanma</li>
              <li>Kazanılan puanları kullanma ve takip etme</li>
              <li>Satın alma geçmişi görüntüleme</li>
              <li>Kampanya ve fırsatlardan haberdar olma</li>
            </ul>
          </section>

          {/* 3. Kullanıcı Kayıt ve Hesap */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              3. Kullanıcı Kaydı ve Hesap Güvenliği
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong>3.1.</strong> Platform kullanımı için kayıt olmanız
                gerekmektedir. Kayıt sırasında doğru, eksiksiz ve güncel bilgi
                sağlamakla yükümlüsünüz.
              </p>
              <p>
                <strong>3.2.</strong> Hesabınız ve şifreniz kişiseldir. Hesap
                güvenliğinden siz sorumlusunuz. Herhangi bir yetkisiz kullanım
                durumunda derhal bizi bilgilendirmelisiniz.
              </p>
              <p>
                <strong>3.3.</strong> 18 yaşından küçük kişiler platformu
                kullanamaz. Kayıt olarak 18 yaşını doldurduğunuzu beyan etmiş
                olursunuz.
              </p>
              <p>
                <strong>3.4.</strong> Bir kişi yalnızca bir hesap
                oluşturabilir. Çoklu hesap tespiti durumunda hesaplarınız
                askıya alınabilir.
              </p>
            </div>
          </section>

          {/* 4. Puan Sistemi */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              4. Puan Kazanma ve Kullanma
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong>4.1.</strong> Puanlar, iş ortağı işletmelerden yapılan
                geçerli satın alımlar karşılığında kazanılır. Her iş ortağının
                kendi puan oranları ve kuralları vardır.
              </p>
              <p>
                <strong>4.2.</strong> Kazanılan puanlar, işletme bazında
                saklanır ve yalnızca ilgili işletmede kullanılabilir.
              </p>
              <p>
                <strong>4.3.</strong> Puanların geçerlilik süresi, iş ortağı
                işletme tarafından belirlenir. Süre dolmuş puanlar otomatik
                olarak silinir.
              </p>
              <p>
                <strong>4.4.</strong> İade edilen satın alımlardan kazanılan
                puanlar hesabınızdan düşülecektir.
              </p>
              <p>
                <strong>4.5.</strong> Puanlar nakde çevrilemez, devredilemez ve
                satılamaz.
              </p>
            </div>
          </section>

          {/* 5. Yasaklı Kullanım */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              5. Yasaklı Davranışlar
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Platformu kullanırken aşağıdaki faaliyetlerde bulunamazsınız:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Sahte veya yanıltıcı bilgi sağlamak</li>
              <li>
                Sistemi manipüle etmeye çalışmak veya haksız puan kazanmak
              </li>
              <li>Başkasının hesabını izinsiz kullanmak</li>
              <li>Platform altyapısına zarar verecek faaliyetlerde bulunmak</li>
              <li>Otomatik araçlar (bot, script) kullanmak</li>
              <li>Platformun ticari olmayan kullanımını engellemek</li>
              <li>Telif haklarını veya fikri mülkiyet haklarını ihlal etmek</li>
            </ul>
          </section>

          {/* 6. Ücretlendirme */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              6. Ücretlendirme ve Ödemeler
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong>6.1.</strong> Kullanıcılar için platform kullanımı
                şu anda ücretsizdir. Gelecekte ücretli özellikler sunulması
                durumunda önceden bilgilendirileceksiniz.
              </p>
              <p>
                <strong>6.2.</strong> İş ortağı işletmeler, platform kullanımı
                için ayrı bir sözleşme ile ücret öderler.
              </p>
            </div>
          </section>

          {/* 7. Sorumluluk Sınırlaması */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              7. Sorumluluk Sınırlamaları
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong>7.1.</strong> Platform &quot;olduğu gibi&quot; sunulmaktadır.
                Hizmetin kesintisiz veya hatasız olacağını garanti etmiyoruz.
              </p>
              <p>
                <strong>7.2.</strong> İş ortağı işletmelerin sunduğu ürün ve
                hizmetlerin kalitesinden sorumlu değiliz. Bu konudaki
                sorumluluk doğrudan işletmeye aittir.
              </p>
              <p>
                <strong>7.3.</strong> Teknik arızalar, bakım çalışmaları veya
                güncelllemeler nedeniyle hizmetin geçici olarak
                durdurulabileceğini kabul edersiniz.
              </p>
              <p>
                <strong>7.4.</strong> Platform kullanımından kaynaklanan dolaylı
                zararlardan (kayıp kar, veri kaybı vb.) sorumlu değiliz.
              </p>
            </div>
          </section>

          {/* 8. Fikri Mülkiyet */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              8. Fikri Mülkiyet Hakları
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Platform üzerindeki tüm içerik, tasarım, logo, yazılım, kod ve
              diğer materyaller ReloYa&apos;nın veya lisans verenlerin mülkiyetindedir
              ve telif hakkı yasalarıyla korunmaktadır. İzinsiz kullanım, kopyalama
              veya dağıtım yasaktır.
            </p>
          </section>

          {/* 9. Hesap Askıya Alma ve Fesih */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              9. Hesap Askıya Alma ve Sonlandırma
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong>9.1.</strong> Bu koşulları ihlal etmeniz durumunda
                hesabınızı askıya alabilir veya sonlandırabiliriz.
              </p>
              <p>
                <strong>9.2.</strong> Hesabınızı dilediğiniz zaman{" "}
                <Link
                  href="/account/privacy"
                  className="text-cyan-400 underline hover:text-cyan-300"
                >
                  hesap ayarlarından
                </Link>{" "}
                kapatabilirsiniz. Hesap kapatma sonrası puanlarınız kaybolacaktır.
              </p>
              <p>
                <strong>9.3.</strong> 24 ay boyunca kullanılmayan hesaplar
                otomatik olarak pasif hale getirilebilir.
              </p>
            </div>
          </section>

          {/* 10. Değişiklikler */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              10. Koşullarda Değişiklik
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Bu koşulları zaman zaman güncelleyebiliriz. Önemli değişiklikler
              durumunda e-posta veya platform bildirimi ile sizi
              bilgilendireceğiz. Değişikliklerden sonra platformu kullanmaya
              devam etmeniz, yeni koşulları kabul ettiğiniz anlamına gelir.
            </p>
          </section>

          {/* 11. Uyuşmazlık Çözümü */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              11. Uygulanacak Hukuk ve Uyuşmazlık Çözümü
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong>11.1.</strong> İşbu sözleşme Türkiye Cumhuriyeti
                kanunlarına tabidir.
              </p>
              <p>
                <strong>11.2.</strong> İşbu sözleşmeden doğan uyuşmazlıklarda
                İstanbul Anadolu Mahkemeleri ve İcra Daireleri yetkilidir.
              </p>
              <p>
                <strong>11.3.</strong> Tüketici işlemlerinde, tüketicinin
                yerleşim yerindeki Tüketici Hakem Heyetleri ve Tüketici
                Mahkemeleri de yetkilidir.
              </p>
            </div>
          </section>

          {/* 12. İletişim */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400">
              12. İletişim
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Hizmet koşulları hakkında sorularınız için:
            </p>
            <div className="p-4 bg-gray-900/50 rounded border border-gray-600">
              <p className="text-sm text-gray-300">
                <strong>{company.name}</strong>
                <br />
                <strong>Adres:</strong> {company.address}
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

