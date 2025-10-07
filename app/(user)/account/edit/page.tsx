/** @format */

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isValidPhone } from "@/lib/helpers";

export default function EditProfilePage() {
  const { user, setUser } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Load user data
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Fetch current user data
    fetch("/api/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setFormData({
            name: data.user.name || "",
            surname: data.user.surname || "",
            email: data.user.email || "",
            phone: data.user.phone || "",
          });
        }
      })
      .catch((error) => console.error("Failed to load user data:", error));
  }, [user, router]);

  if (!user) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Client-side validation
    if (formData.phone && !isValidPhone(formData.phone)) {
      setMessage({
        type: "error",
        text: "Geçersiz telefon numarası formatı. Örnek: +90 5XX XXX XX XX",
      });
      setLoading(false);
      return;
    }

    try {
      // Email değişikliğine izin verilmiyor, sadece ad/soyad ve telefon
      const response = await fetch("/api/dsar/rectify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          surname: formData.surname,
          phone: formData.phone,
          requestType: "direct",
        }),
      });

      const data = await response.json();

      if (response.status === 429) {
        setMessage({
          type: "error",
          text: `Çok fazla istek. Lütfen daha sonra tekrar deneyin.`,
        });
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Güncelleme başarısız");
      }

      // Direct update
      setMessage({
        type: "success",
        text: "Bilgileriniz başarıyla güncellendi!",
      });

      // Update auth context
      setUser({
        ...user,
        name: formData.name,
        surname: formData.surname,
        phone: formData.phone,
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
    <div className="max-w-2xl mx-auto">
      {/* Back Button */}
      <Link
        href="/account/privacy"
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
        Geri Dön
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bilgilerimi Düzenle</h1>
        <p className="text-gray-400">
          Kişisel bilgilerinizi güncelleyin
        </p>
      </div>

      {/* Message Alert */}
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
      <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Ad *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              minLength={2}
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Adınız"
            />
          </div>

          {/* Surname */}
          <div>
            <label
              htmlFor="surname"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Soyad *
            </label>
            <input
              type="text"
              id="surname"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              required
              minLength={2}
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Soyadınız"
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
              placeholder="ornek@email.com"
            />
            <p className="mt-1 text-xs text-gray-500">
              E-posta değiştirmek için destek ile iletişime geçin
            </p>
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Telefon (Opsiyonel)
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="+90 5XX XXX XX XX"
            />
            <p className="mt-1 text-xs text-gray-500">
              Türk telefon numarası formatında girin. Örnek: +90 555 123 45 67
            </p>
          </div>

          {/* Info */}
          <div className="bg-cyan-900/20 border border-cyan-800 rounded-lg p-4">
            <p className="text-sm text-cyan-300">
              <strong>Bilgilendirme:</strong> Ad, soyad ve telefon değişiklikleri
              anında uygulanır. E-posta gibi kritik bilgiler için destek ekibi ile iletişime geçin.
            </p>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
            </button>
          </div>
        </form>
      </div>

      {/* Audit Notice */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          Tüm veri değişiklikleri güvenlik amacıyla kayıt altına alınır.
        </p>
      </div>
    </div>
  );
}

