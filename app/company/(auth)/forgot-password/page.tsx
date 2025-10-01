/** @format */
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";

export default function CompanyForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "company" }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: data.message,
        });
        setEmail("");
      } else {
        setMessage({
          type: "error",
          text: data.message || "Bir hata oluştu",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Bir hata oluştu. Lütfen tekrar deneyin.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black px-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <Link
          href="/company/login"
          className="inline-flex items-center text-gray-400 hover:text-yellow-400 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Giriş sayfasına dön
        </Link>

        {/* Card */}
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-600/20 rounded-full mb-4">
              <Mail className="w-8 h-8 text-yellow-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Şifremi Unuttum
            </h1>
            <p className="text-gray-400 text-sm">
              Şirket email adresinize şifre sıfırlama bağlantısı göndereceğiz
            </p>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                message.type === "success"
                  ? "bg-green-900/20 border-green-600 text-green-300"
                  : "bg-red-900/20 border-red-600 text-red-300"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Şirket E-posta Adresiniz
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="sirket@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold py-3 px-6 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Sıfırlama Bağlantısı Gönder
                </>
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 text-center text-sm text-gray-400">
            <p>
              Bağlantı 1 saat geçerli olacaktır. Email gelmezse spam
              klasörünüzü kontrol edin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

