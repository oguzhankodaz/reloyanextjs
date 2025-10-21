/** @format */
"use client";

import { useAuth } from "@/context/AuthContext";
import { 
  Banknote, 
  Building2, 
  Gift, 
  Loader2, 
  Star,
  TrendingUp,
  Wallet,
  ArrowRight,
  Crown,
  Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserCashbackAction } from "@/actions/points";

type UserCashback = {
  companyId: string;
  companyName: string;
  totalCashback: number;
};

const CashbackPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [navigating, setNavigating] = useState<string | null>(null);

  // ✅ React Query ile cashback verilerini çekiyoruz
  const {
    data: cashback,
    isLoading,
    isError,
  } = useQuery<UserCashback[]>({
    queryKey: ["user-cashback", user?.userId],
    queryFn: async () => {
      if (!user?.userId) return [];
      // backend action: user'a göre şirket bazlı toplam cashback
      const res = await getUserCashbackAction(user.userId);
      return res.success ? res.cashback : [];
    },
    enabled: !!user?.userId,
    staleTime: 1000 * 60 * 5,
  });

  const handleNavigate = (companyId: string) => {
    setNavigating(companyId);
    router.push(`/points/${companyId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-2xl">
              <Loader2 className="w-8 h-8 text-black animate-spin" />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="w-3 h-3 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2 bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
            Para Puanlarınız Yükleniyor
          </h3>
          <p className="text-gray-300 text-sm">
            Şirket verileriniz hazırlanıyor...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center shadow-2xl">
            <span className="text-white text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2 bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
            Bir Hata Oluştu
          </h3>
          <p className="text-gray-300 text-sm">
            Para puanlarınız yüklenirken bir sorun yaşandı
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Modern Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
              <Wallet className="w-4 h-4 text-black" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
              Para Puanlarım
            </h1>
          </div>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            Şirketlerden kazandığınız para puanlarınızı görüntüleyin ve ürünlerini keşfedin
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-12">
        {!cashback || cashback.length === 0 ? (
          <div className="text-center py-16">
            <div className="relative mx-auto w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full opacity-20"></div>
              <div className="relative w-full h-full bg-gradient-to-r from-gray-700 to-gray-800 rounded-full flex items-center justify-center">
                <Banknote className="w-10 h-10 text-gray-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Henüz Para Puanınız Yok
            </h3>
            <p className="text-gray-400 text-lg max-w-md mx-auto mb-6">
              İşletmelerden alışveriş yaparak para puanı kazanmaya başlayın
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <TrendingUp className="w-4 h-4" />
              <span>Alışveriş yaptığınızda otomatik olarak para puanı kazanırsınız</span>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Company Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cashback
                .sort((a, b) => b.totalCashback - a.totalCashback)
                .map((c, index) => (
                  <div
                    key={c.companyId}
                    className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                      index === 0 
                        ? 'bg-gradient-to-br from-yellow-500/20 via-yellow-400/10 to-yellow-500/20 border-2 border-yellow-400/50' 
                        : 'bg-gradient-to-br from-gray-800/50 to-black/50 border border-gray-700/50'
                    } backdrop-blur-sm`}
                  >
                    {/* Ranking Badge */}
                    <div className="absolute top-4 right-4">
                      {index === 0 && (
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                          <Crown className="w-4 h-4 text-black" />
                        </div>
                      )}
                      {index > 0 && (
                        <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-sm">{index + 1}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <div className="text-center">
                        {/* Company Icon */}
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg ${
                          index === 0 
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' 
                            : 'bg-gradient-to-r from-gray-600 to-gray-700'
                        }`}>
                          <Building2 className={`w-8 h-8 ${index === 0 ? 'text-black' : 'text-white'}`} />
                        </div>

                        {/* Company Name */}
                        <h3 className="text-lg font-bold text-white mb-3 line-clamp-2">
                          {c.companyName}
                        </h3>
                        
                        {/* Cashback Amount */}
                        <div className={`text-3xl font-bold mb-4 ${
                          index === 0 
                            ? 'text-yellow-400' 
                            : 'text-white'
                        }`}>
                          {c.totalCashback.toFixed(2)} ₺
                        </div>
                        
                        {/* Action Button */}
                        <button
                          onClick={() => handleNavigate(c.companyId)}
                          disabled={navigating === c.companyId}
                          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                            index === 0 
                              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black shadow-lg hover:shadow-yellow-500/25' 
                              : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg hover:shadow-gray-500/25'
                          }`}
                        >
                          {navigating === c.companyId ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>Yükleniyor...</span>
                            </>
                          ) : (
                            <>
                              <Gift className="w-5 h-5" />
                              <span>Ürünleri Gör</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-r from-white/5 to-white/10 rounded-full blur-xl"></div>
                    <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-r from-white/5 to-white/10 rounded-full blur-lg"></div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashbackPage;
