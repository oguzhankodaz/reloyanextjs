/** @format */

"use client";

import { useState, useEffect } from "react";
import { useCompanyAuth } from "@/context/CompanyAuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CompanyProfilePage() {
  const { company } = useCompanyAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Load company data
  useEffect(() => {
    if (!company) {
      router.push("/company/login");
      return;
    }

    // Fetch current company data
    fetch("/api/company/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.company) {
          setFormData({
            name: data.company.name || "",
            email: data.company.email || "",
            address: data.company.address || "",
          });
        }
      })
      .catch((error) => console.error("Failed to load company data:", error));
  }, [company, router]);

  if (!company) {
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // TODO: Company update API endpoint'i eklenecek
      // Şimdilik mock response
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setMessage({
        type: "success",
        text: "Şirket bilgileriniz başarıyla güncellendi!",
      });
    } catch (error) {
      console.error("Update error:", error);
      setMessage({
        type: "error",
        text: "Bir hata oluştu. Lütfen tekrar deneyin.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Button */}
        <Link
          href="/company/dashboard"
          className="inline-flex items-center text-gray-400 hover:text-yellow-400 transition-colors mb-6 group"
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
          Dashboard'a Dön
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Şirket Ayarları</h1>
          <p className="text-gray-400">
            Şirket bilgilerinizi görüntüleyin ve güncelleyin
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Company Info Card */}
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              Şirket Bilgileri
            </h2>

            {/* Message Alert */}
            {message && (
              <div
                className={`mb-4 p-3 rounded-lg border text-sm ${
                  message.type === "success"
                    ? "bg-green-900/20 border-green-600 text-green-300"
                    : "bg-red-900/20 border-red-600 text-red-300"
                }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Company Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Şirket Adı *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Şirket adınız"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  E-posta *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled
                  className="w-full px-4 py-2 bg-gray-900/30 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
                  placeholder="sirket@email.com"
                />
                <p className="mt-1 text-xs text-gray-500">
                  E-posta değiştirmek için destek ile iletişime geçin
                </p>
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Adres
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Şirket adresiniz"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </button>
            </form>
          </div>

          {/* Security & Settings Card */}
          <div className="space-y-6">
            {/* Password Change */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <svg
                  className="w-6 h-6 mr-2 text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Güvenlik
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                Şifrenizi değiştirmek veya güvenlik ayarlarınızı güncellemek
                için
              </p>
              <button
                disabled
                className="w-full bg-gray-700 text-gray-400 cursor-not-allowed font-medium py-2 px-4 rounded-lg"
              >
                Yakında Aktif Olacak
              </button>
            </div>

            {/* Data & Privacy */}
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <svg
                  className="w-6 h-6 mr-2 text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Veri ve Gizlilik
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                KVKK kapsamında şirket verilerinizi yönetin
              </p>
              <div className="space-y-2">
                <Link
                  href="/privacy"
                  className="block w-full text-center bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  KVKK Aydınlatma Metni
                </Link>
                <Link
                  href="/terms"
                  className="block w-full text-center bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Hizmet Koşulları
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="mt-8 bg-yellow-900/20 border border-yellow-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3 text-yellow-300 flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Bilgilendirme
          </h3>
          <p className="text-gray-300 text-sm">
            Şirket hesabınız ile ilgili kritik değişiklikler için lütfen destek
            ekibi ile iletişime geçin. Tüm değişiklikler güvenlik amacıyla
            kayıt altına alınır.
          </p>
        </div>
      </div>
    </div>
  );
}
