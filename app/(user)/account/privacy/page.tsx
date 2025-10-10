/** @format */

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Consent = {
  id: string;
  consentType: string;
  granted: boolean;
  grantedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

const consentTypeLabels: Record<string, string> = {
  terms: "Hizmet Koşulları",
  privacy: "Gizlilik Politikası",
  marketing: "Pazarlama İletişimi",
  analytics: "Analitik ve İstatistik",
  profiling: "Profilleme",
};

export default function PrivacyPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [consentsLoading, setConsentsLoading] = useState(true);
  const [consents, setConsents] = useState<Consent[]>([]);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Load consents
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const loadConsents = async () => {
      try {
        const response = await fetch("/api/consent", {
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          setConsents(data.consents || []);
        }
      } catch (error) {
        console.error("Load consents error:", error);
      } finally {
        setConsentsLoading(false);
      }
    };

    loadConsents();
  }, [user, router]);

  // Redirect if not logged in
  if (!user) {
    return null;
  }

  // Export data handler
  const handleExportData = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/dsar/export", {
        credentials: "include",
      });

      if (response.status === 429) {
        const data = await response.json();
        setMessage({
          type: "error",
          text: `Çok fazla istek. ${data.retryAfter} saniye sonra tekrar deneyin.`,
        });
        return;
      }

      if (!response.ok) {
        throw new Error("Veri dışa aktarma başarısız");
      }

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reloya-verilerim-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage({
        type: "success",
        text: "Verileriniz başarıyla indirildi!",
      });
    } catch (error) {
      console.error("Export error:", error);
      setMessage({
        type: "error",
        text: "Bir hata oluştu. Lütfen tekrar deneyin.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete account handler
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Hesabınızı silmek istediğinizden emin misiniz?\n\n" +
        "Bu işlem geri alınamaz ve tüm verileriniz silinecektir.\n" +
        "Yasal saklama yükümlülüğü olan satın alma kayıtları anonimleştirilmiş olarak saklanacaktır.\n\n" +
        "Devam etmek istiyor musunuz?"
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/dsar/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          reason: "Kullanıcı hesap silme talebi",
        }),
      });

      const data = await response.json();

      if (response.status === 429) {
        setMessage({
          type: "error",
          text: `Çok fazla istek. ${data.retryAfter} saniye sonra tekrar deneyin.`,
        });
        return;
      }

      if (response.status === 409) {
        setMessage({
          type: "error",
          text: "Zaten bekleyen bir silme talebiniz var.",
        });
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Silme talebi oluşturulamadı");
      }

      setMessage({
        type: "success",
        text: `Silme talebiniz alındı. Talep ID: ${data.requestId.substring(
          0,
          8
        )}... İşlem 30 gün içinde tamamlanacaktır.`,
      });
    } catch (error) {
      console.error("Delete error:", error);
      setMessage({
        type: "error",
        text: "Bir hata oluştu. Lütfen tekrar deneyin.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Rectify data handler
  const handleRectifyData = () => {
    router.push("/account/edit");
  };

  // Toggle consent
  const handleToggleConsent = async (consentType: string, currentlyGranted: boolean) => {
    // Zorunlu onaylar geri çekilemez
    if (["terms", "privacy"].includes(consentType) && currentlyGranted) {
      setMessage({
        type: "error",
        text: "Zorunlu onaylar geri çekilemez.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/consent", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          consentType,
          granted: !currentlyGranted,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "İşlem başarısız");
      }

      setMessage({
        type: "success",
        text: data.message,
      });

      // Reload consents
      const reloadResponse = await fetch("/api/consent", {
        credentials: "include",
      });
      
      if (reloadResponse.ok) {
        const reloadData = await reloadResponse.json();
        setConsents(reloadData.consents || []);
      }
    } catch (error) {
      console.error("Toggle consent error:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Bir hata oluştu",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        href="/dashboard"
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
        Dashboard’a Dön
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gizlilik ve Veri Yönetimi</h1>
        <p className="text-gray-400">
          KVKK haklarınızı kullanın ve verilerinizi yönetin
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

      {/* DSAR Actions Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Rectify Data Card */}
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <div className="flex items-start mb-4">
            <div className="w-12 h-12 bg-blue-900/40 rounded-lg flex items-center justify-center mr-4">
              <svg
                className="w-6 h-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Bilgilerimi Düzelt</h2>
              <p className="text-gray-400 text-sm mb-4">
                Yanlış veya eksik kayıtlı kişisel bilgilerinizi düzeltin. Ad,
                soyad, e-posta ve telefon bilgilerinizi güncelleyebilirsiniz.
              </p>
              <button
                onClick={handleRectifyData}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Bilgilerimi Düzenle
              </button>
            </div>
          </div>
        </div>

        {/* Delete Account Card */}
        <div className="bg-gray-800/40 backdrop-blur-sm border border-red-900/50 rounded-lg p-6">
          <div className="flex items-start mb-4">
            <div className="w-12 h-12 bg-red-900/40 rounded-lg flex items-center justify-center mr-4">
              <svg
                className="w-6 h-6 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2 text-red-300">
                Hesabımı Sil
              </h2>
              <p className="text-gray-400 text-sm mb-4">
                Hesabınızı ve kişisel verilerinizi kalıcı olarak silme talebi
                oluşturun. Bu işlem geri alınamaz. Talepler 30 gün içinde
                değerlendirilir.
              </p>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded transition-colors"
              >
                {loading ? "İşleniyor..." : "Silme Talebi Oluştur"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Consent Management Section */}
      <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-lg p-6 mb-8">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-purple-900/40 rounded-lg flex items-center justify-center mr-3">
            <svg
              className="w-5 h-5 text-purple-400"
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
          </div>
          <h2 className="text-xl font-semibold">Rıza Yönetimi</h2>
        </div>
        
        <p className="text-gray-400 text-sm mb-4">
          Verilerinizin işlenmesine ilişkin rızalarınızı görüntüleyin ve yönetin.
        </p>

        {consentsLoading ? (
          <div className="text-center py-4 text-gray-400">Yükleniyor...</div>
        ) : consents.length === 0 ? (
          <div className="text-center py-4 text-gray-400">
            Henüz rıza kaydı bulunmuyor.
          </div>
        ) : (
          <div className="space-y-3">
            {consents.map((consent) => (
              <div
                key={consent.id}
                className="flex items-center justify-between p-4 bg-gray-900/40 rounded-lg border border-gray-700"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-white">
                    {consentTypeLabels[consent.consentType] || consent.consentType}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {consent.granted
                      ? `Onaylandı: ${new Date(consent.grantedAt!).toLocaleDateString("tr-TR")}`
                      : consent.revokedAt
                      ? `Geri çekildi: ${new Date(consent.revokedAt).toLocaleDateString("tr-TR")}`
                      : "Onay verilmedi"}
                  </p>
                  {["terms", "privacy"].includes(consent.consentType) && (
                    <span className="inline-block mt-1 text-xs bg-red-900/30 text-red-300 px-2 py-0.5 rounded">
                      Zorunlu
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleToggleConsent(consent.consentType, consent.granted)}
                  disabled={loading || (["terms", "privacy"].includes(consent.consentType) && consent.granted)}
                  className={`px-4 py-2 rounded transition-colors text-sm font-medium ${
                    consent.granted
                      ? "bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {consent.granted ? "Geri Çek" : "Onayla"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Information Panel */}
      <div className="bg-cyan-900/20 border border-cyan-800 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-3 text-cyan-300">
          KVKK Haklarınız
        </h3>
        <p className="text-gray-300 text-sm mb-3">
          6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aşağıdaki
          haklara sahipsiniz:
        </p>
        <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
          <li>İşlenmişse buna ilişkin bilgi talep etme</li>
          <li>
            İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme
          </li>
          <li>Eksik veya yanlış işlenmiş verilerin düzeltilmesini isteme</li>
          <li>
            Belirli koşullarda verilerin silinmesini/yok edilmesini isteme
          </li>
          <li>
            İşlenen verilerin analizi sonucu aleyhe bir sonuca itiraz etme
          </li>
        </ul>
        <div className="mt-4 pt-4 border-t border-cyan-800">
          <p className="text-sm text-gray-400">
            Detaylı bilgi için{" "}
            <Link href="/privacy" className="text-cyan-400 hover:underline">
              KVKK Aydınlatma Metni
            </Link>
            ’ni inceleyebilirsiniz.
          </p>
        </div>
      </div>

      {/* Legal Links */}
      <div className="text-center space-x-4 text-sm text-gray-500">
        <Link href="/privacy" className="hover:text-cyan-400">
          KVKK Aydınlatma Metni
        </Link>
        <span>•</span>
        <Link href="/terms" className="hover:text-cyan-400">
          Hizmet Koşulları
        </Link>
        <span>•</span>
        <Link href="/cookies" className="hover:text-cyan-400">
          Çerez Politikası
        </Link>
      </div>

      {/* Subtle Export Data Link */}
      <div className="mt-8 pt-6 border-t border-gray-800/50">
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-2">
            KVKK Madde 11 uyarınca verilerinizi talep edebilirsiniz
          </p>
          <button
            onClick={handleExportData}
            disabled={loading}
            className="text-xs text-gray-500 hover:text-gray-400 underline decoration-dotted underline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "İndiriliyor..." : "Verilerimi JSON olarak indir"}
          </button>
        </div>
      </div>
    </div>
  );
}
