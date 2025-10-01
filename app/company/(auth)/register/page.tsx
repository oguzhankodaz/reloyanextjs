/** @format */

"use client";

import { registerCompanyAction } from "@/actions/auth";
import { useActionState } from "react";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import LegalModal from "@/components/legal/LegalModal";
import KvkkContent from "@/components/legal/KvkkContent";
import TermsContent from "@/components/legal/TermsContent";

export default function CompanyRegisterPage() {
  const [state, formAction] = useActionState(registerCompanyAction, {
    success: false,
    message: "",
    company: null,
  });

  const [isPending, startTransition] = useTransition();
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [showKvkkModal, setShowKvkkModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const router = useRouter();

  // ✅ Başarılı kayıt sonrası login sayfasına yönlendirme
  useEffect(() => {
    if (state.success) {
      const timeout = setTimeout(() => {
        router.push("/company/login");
      }, 1500); // 1.5 saniye bekleyip yönlendir
      return () => clearTimeout(timeout);
    }
  }, [state.success, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 relative">
        {/* Geri Butonu */}
        <button
          onClick={() => router.push("/")}
          className="absolute top-4 left-4 text-gray-600 hover:text-black flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Geri</span>
        </button>
        {/* Logo / Başlık */}
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6 tracking-wide">
          ReloYa Business
        </h1>
        <p className="text-center text-gray-500 mb-8">
          İşletme Paneli • Kayıt Ol
        </p>

        {/* Form */}
        <form
          className="space-y-5"
          action={(formData) =>
            startTransition(() => {
              formAction(formData);
            })
          }
        >
          <div>
            <input
              type="text"
              name="name"
              placeholder="Şirket Adı"
              required
              minLength={2}
              pattern="[A-Za-zÇĞİÖŞÜçğıöşü0-9&()\/.,'\- ]{2,}"
              title="Geçerli bir şirket adı girin."
              className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none placeholder-gray-400"
            />
          </div>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Şirket E-posta"
              required
              inputMode="email"
              autoComplete="email"
              className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none placeholder-gray-400"
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="Şifre"
              required
              minLength={8}
              pattern="(?=.*[A-Za-z])(?=.*[0-9]).{8,}"
              title="En az 8 karakter, en az bir harf ve bir rakam içermeli."
              className="text-black w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:outline-none placeholder-gray-400"
            />
          </div>

          {/* KVKK Onay Checkbox */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="kvkk-consent"
              checked={kvkkAccepted}
              onChange={(e) => setKvkkAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 text-black border-gray-300 rounded focus:ring-2 focus:ring-black cursor-pointer"
            />
            <label htmlFor="kvkk-consent" className="text-xs text-gray-700 leading-relaxed cursor-pointer">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowKvkkModal(true);
                }}
                className="text-black font-semibold hover:underline"
              >
                KVKK Aydınlatma Metni
              </button>
              &apos;ni okudum, anladım. Şirket verilerinin işlenmesine ve{" "}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowTermsModal(true);
                }}
                className="text-black font-semibold hover:underline"
              >
                Hizmet Koşulları
              </button>
              &apos;nı kabul ediyorum.
            </label>
          </div>

          <button
            type="submit"
            disabled={isPending || !kvkkAccepted}
            className="w-full bg-black text-white font-semibold py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "⏳ Kayıt olunuyor..." : "Kayıt Ol"}
          </button>
          
          {!kvkkAccepted && (
            <p className="text-xs text-center text-gray-500">
              Kayıt olmak için KVKK metnini kabul etmelisiniz
            </p>
          )}
        </form>

        {/* Hata veya başarı mesajı */}
        {state.message && (
          <p
            className={`mt-6 text-center font-medium ${
              state.success ? "text-green-600" : "text-red-600"
            }`}
          >
            {state.message}
          </p>
        )}

        {/* Ekstra link */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Zaten hesabınız var mı?{" "}
          <a
            href="/company/login"
            className="text-black font-semibold hover:underline"
          >
            Giriş Yap
          </a>
        </div>
      </div>

      {/* KVKK Modal */}
      <LegalModal
        isOpen={showKvkkModal}
        onClose={() => setShowKvkkModal(false)}
        title="KVKK Aydınlatma Metni"
      >
        <KvkkContent />
      </LegalModal>

      {/* Terms Modal */}
      <LegalModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="Hizmet Koşulları"
      >
        <TermsContent />
      </LegalModal>
    </div>
  );
}
