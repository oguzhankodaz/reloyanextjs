/** @format */

"use client";

import { LEGAL_CONFIG } from "@/legal/config";
import Link from "next/link";
import SmartBackButton from "@/components/SmartBackButton";
import { Mail, MessageCircle } from "lucide-react";

export default function ContactPage() {
  const { company } = LEGAL_CONFIG;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Smart Back Button */}
        <SmartBackButton fallbackUrl="/" label="Geri Dön" />

        <h1 className="text-4xl font-bold mb-2">Destek ve Yardım</h1>
        <p className="text-gray-400 mb-8">
          Size yardımcı olmak için buradayız
        </p>

        {/* Destek Merkezi */}
        <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 backdrop-blur-sm border border-cyan-500/50 rounded-lg p-8 mb-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-cyan-500/20 rounded-full">
              <MessageCircle className="w-10 h-10 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold mb-3 text-white">
            Destek Merkezi
          </h2>
          <p className="text-gray-300 mb-4 max-w-2xl mx-auto">
            Herhangi bir sorunuz veya destek talebiniz için bize e-posta gönderin.
            Ekibimiz en kısa sürede size geri dönüş yapacaktır.
          </p>
          <a
            href={`mailto:${company.supportEmail}`}
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            <Mail className="w-5 h-5" />
            {company.supportEmail}
          </a>
          <p className="text-gray-400 text-sm mt-4">
            Yanıt süresi: En geç 24 saat içinde
          </p>
        </div>

        {/* SSS ve Yardım Bölümü */}
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6 text-cyan-400">
            Sık Sorulan Sorular
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-white mb-2">
                Nasıl puan kazanabilirim?
              </h3>
              <p className="text-gray-300 text-sm">
                İş ortağı işletmelerden yaptığınız her satın alım sonrasında
                QR kodunuzu okutarak puan kazanabilirsiniz. Puanlar otomatik
                olarak hesabınıza tanımlanır.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">
                Hesabımı nasıl silebilirim?
              </h3>
              <p className="text-gray-300 text-sm">
                Hesap ayarlarınıza giderek{" "}
                <Link
                  href="/account/privacy"
                  className="text-cyan-400 underline hover:text-cyan-300"
                >
                  Gizlilik ve Veri Talepleri
                </Link>{" "}
                bölümünden hesabınızı kalıcı olarak silebilirsiniz.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">
                Puanlarımın geçerlilik süresi var mı?
              </h3>
              <p className="text-gray-300 text-sm">
                Puan geçerlilik süreleri iş ortağı işletmeler tarafından
                belirlenir. Puanlarınızın son kullanma tarihini hesabınızdan
                görebilirsiniz.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">
                Kişisel verilerim nasıl korunuyor?
              </h3>
              <p className="text-gray-300 text-sm">
                KVKK (Kişisel Verilerin Korunması Kanunu) kapsamında tüm
                verileriniz güvenli şekilde saklanmaktadır. Detaylı bilgi için{" "}
                <Link
                  href="/privacy"
                  className="text-cyan-400 underline hover:text-cyan-300"
                >
                  KVKK Aydınlatma Metni
                </Link>
                &apos;ni inceleyebilirsiniz.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">
                İşletme olarak nasıl iş ortağı olabilirim?
              </h3>
              <p className="text-gray-300 text-sm">
                İş ortaklığı başvuruları için{" "}
                <a
                  href={`mailto:${company.email}?subject=İş Ortaklığı Başvurusu`}
                  className="text-cyan-400 underline hover:text-cyan-300"
                >
                  {company.email}
                </a>{" "}
                adresinden bizimle iletişime geçebilirsiniz.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center text-gray-500 text-sm pt-8 border-t border-gray-700 mt-8">
          <p className="mb-2">Diğer Sayfalar</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/privacy" className="text-cyan-400 hover:underline">
              KVKK Aydınlatma Metni
            </Link>
            <Link href="/terms" className="text-cyan-400 hover:underline">
              Hizmet Koşulları
            </Link>
            <Link href="/cookies" className="text-cyan-400 hover:underline">
              Çerez Politikası
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

