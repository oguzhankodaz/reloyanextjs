/** @format */

"use client";

import { useState, useEffect } from "react";
import { useCompanyAuth } from "@/context/CompanyAuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRadixToast } from "@/components/notifications/ToastProvider";
import PlanPurchase from "@/components/company/PlanPurchase";

export default function CompanyProfilePage() {
  const { company } = useCompanyAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Cashback ayarları
  const toast = useRadixToast();
  const [cashbackPercentage, setCashbackPercentage] = useState<string>("3");
  const [savingCashback, setSavingCashback] = useState(false);

  const [openPlanModal, setOpenPlanModal] = useState(false);
  const [subscription, setSubscription] = useState<{
    planType: string;
    expiresAt: string;
    status: string;
    amount: number;
    createdAt: string;
    orderId: string;
  } | null>(null);

  const [trialInfo, setTrialInfo] = useState<{
    isActive: boolean;
    daysLeft: number;
    startDate: string;
    endDate: string;
    hasExpired: boolean;
  } | null>(null);

  // Ödeme sonucu bildirimleri
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');

    if (paymentStatus === 'success') {
      toast({
        title: "Ödeme Başarılı! 🎉",
        description: `Aboneliğiniz aktif edildi.`,
        variant: "success",
      });
      // URL'den parametreleri temizle
      window.history.replaceState({}, '', '/company/profile');
    } else if (paymentStatus === 'failed') {
      const reason = urlParams.get('reason') || 'Bilinmeyen hata';
      toast({
        title: "Ödeme Başarısız",
        description: `Ödeme işlemi tamamlanamadı: ${reason}`,
        variant: "error",
      });
      window.history.replaceState({}, '', '/company/profile');
    } else if (paymentStatus === 'error') {
      toast({
        title: "Hata Oluştu",
        description: "Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "error",
      });
      window.history.replaceState({}, '', '/company/profile');
    }
  }, [toast]);

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
          });
        }
      })
      .catch((error) => console.error("Failed to load company data:", error));

    // Fetch cashback settings
    fetch("/api/company/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setCashbackPercentage(data.settings.cashbackPercentage.toString());
        }
      })
      .catch((error) => console.error("Failed to load settings:", error));

    // Abonelik bilgisini getir
    if (company) {
      fetch(`/api/company/subscription?companyId=${company.companyId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            if (data.subscription) {
              setSubscription(data.subscription);
            }
            
            // Deneme süresi bilgilerini set et
            if (data.trial) {
              setTrialInfo(data.trial);
            }
          }
        })
        .catch((error) => console.error("Failed to load subscription:", error));
    }
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
      const response = await fetch("/api/company/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({
          type: "success",
          text: "Şirket bilgileriniz başarıyla güncellendi!",
        });
        window.location.reload();
      } else {
        setMessage({
          type: "error",
          text: data.error || "Bir hata oluştu. Lütfen tekrar deneyin.",
        });
      }
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

  const handleSaveCashback = async () => {
    const percentage = parseFloat(cashbackPercentage);

    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      toast({
        title: "Hata",
        description: "Geçerli bir yüzde değeri girin (0-100 arası)",
        variant: "error",
      });
      return;
    }

    setSavingCashback(true);
    try {
      const res = await fetch("/api/company/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cashbackPercentage: percentage }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: "Başarılı",
          description: "Nakit iade oranı güncellendi ✅",
          variant: "success",
        });
      } else {
        toast({
          title: "Hata",
          description: data.message || "Ayarlar güncellenemedi",
          variant: "error",
        });
      }
    } catch {
      toast({
        title: "Hata",
        description: "Bir hata oluştu",
        variant: "error",
      });
    } finally {
      setSavingCashback(false);
    }
  };

  return (
    <div className="min-h-screen text-white">
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
          Dashboard’a Dön
        </Link>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Şirket Ayarları</h1>
              <p className="text-gray-400 text-sm sm:text-base">Şirket bilgilerinizi görüntüleyin ve güncelleyin</p>
            </div>

          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Company Info Card */}
          <div className="lg:col-span-2 bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center mb-4">Şirket Bilgileri</h2>

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
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
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
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
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
                <p className="mt-1 text-xs text-gray-500">{`E-posta değiştirmek için destek ile iletişime geçin`}</p>
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

          {/* Premium Status Card */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm border border-gray-700 rounded-xl p-6 h-full">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">👑</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Abonelik Bilgileri</h3>
                <p className="text-gray-400 text-sm">Premium durumu ve deneme süresi</p>
              </div>

              {/* Premium Status Content */}
              <div className="space-y-4">
                {/* Premium Subscription Status */}
                {subscription && (() => {
                  const now = new Date();
                  const expiresAt = new Date(subscription.expiresAt);
                  const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  const isActive = subscription.status === 'completed' && daysLeft > 0;
                  
                  return (
                    <div className={`rounded-lg p-4 border ${
                      isActive 
                        ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30'
                        : 'bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'}`}></div>
                          <span className={`font-semibold text-sm ${isActive ? 'text-yellow-300' : 'text-red-300'}`}>
                            {isActive ? 'Premium Aktif' : 'Premium Süresi Doldu'}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                        }`}>
                          {isActive ? 'Aktif' : 'Süresi Doldu'}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Plan:</span>
                          <span className={`font-medium ${isActive ? 'text-yellow-200' : 'text-red-200'}`}>
                            {subscription.planType === 'monthly' ? 'Aylık' : 
                             subscription.planType === '6months' ? '6 Aylık' : 'Yıllık'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Bitiş:</span>
                          <span className={`font-medium ${isActive ? 'text-yellow-200' : 'text-red-200'}`}>
                            {expiresAt.toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Kalan:</span>
                          <span className={`font-bold ${isActive ? 'text-yellow-300' : 'text-red-300'}`}>
                            {daysLeft > 0 ? `${daysLeft} gün` : 'Süresi doldu'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Trial Status */}
                {trialInfo && !subscription && (
                  <div className={`rounded-lg p-4 border ${
                    trialInfo.hasExpired 
                      ? 'bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30'
                      : 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${trialInfo.hasExpired ? 'bg-red-400' : 'bg-blue-400 animate-pulse'}`}></div>
                        <span className={`font-semibold text-sm ${trialInfo.hasExpired ? 'text-red-300' : 'text-blue-300'}`}>
                          {trialInfo.hasExpired ? 'Deneme Süresi Doldu' : 'Deneme Sürümü'}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        trialInfo.hasExpired ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {trialInfo.daysLeft} gün
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Başlangıç:</span>
                        <span className={`font-medium ${trialInfo.hasExpired ? 'text-red-200' : 'text-blue-200'}`}>
                          {new Date(trialInfo.startDate).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Bitiş:</span>
                        <span className={`font-medium ${trialInfo.hasExpired ? 'text-red-200' : 'text-blue-200'}`}>
                          {new Date(trialInfo.endDate).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Premium Action Button */}
                <div className="pt-4 border-t border-gray-700">
                  <button
                    onClick={() => setOpenPlanModal(true)}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-black font-bold py-3 px-4 rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all transform hover:scale-105 text-sm"
                  >
                    {subscription || trialInfo ? 'Aboneliği Yönet' : 'Premium\'a Geç'}
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center mt-2">
                    {subscription || trialInfo ? 'Aboneliğinizi uzatın veya değiştirin' : '7 günlük deneme sürenizi başlatın'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Cashback Settings Card */}
          <div className="lg:col-span-2 bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center">Nakit İade Oranı</h2>
            <p className="text-gray-400 text-sm mb-4">Müşterilere verilecek varsayılan nakit iade yüzdesini belirleyin</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">Yüzde (%)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={cashbackPercentage}
                    onChange={(e) => setCashbackPercentage(e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Örn: 3"
                  />
                  <span className="text-xl font-bold text-yellow-400">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Örnek: %{cashbackPercentage || "0"} ile 100₺ harcamada {(
                    (parseFloat(cashbackPercentage || "0") * 100) /
                    100
                  ).toFixed(2)}₺ iade
                </p>
              </div>
              <button
                onClick={handleSaveCashback}
                disabled={savingCashback}
                className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {savingCashback ? "Kaydediliyor..." : "Oranı Kaydet"}
              </button>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="mt-6 sm:mt-8 bg-yellow-900/20 border border-yellow-800 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 text-yellow-300 flex items-center">Bilgilendirme</h3>
          <p className="text-gray-300 text-sm">
            Şirket hesabınız ile ilgili kritik değişiklikler için lütfen destek ekibi ile iletişime geçin. Tüm değişiklikler güvenlik amacıyla kayıt altına alınır.
          </p>
        </div>
      </div>

      {openPlanModal && (
        <PlanPurchase
          onClose={() => setOpenPlanModal(false)}
        />
      )}
    </div>
  );
}
