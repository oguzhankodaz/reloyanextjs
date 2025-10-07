/** @format */
"use client";

import { useAuth } from "@/context/AuthContext";
import { Banknote, Building2, Gift, Loader2 } from "lucide-react";
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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center shadow-sm">
            <Loader2 className="w-6 h-6 text-green-400 animate-spin" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            Para puanlar yükleniyor
          </h3>
          <p className="text-gray-400">
            Lütfen bekleyin...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-900/30 rounded-full flex items-center justify-center">
            <span className="text-red-400 text-xl">⚠️</span>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            Bir hata oluştu
          </h3>
          <p className="text-gray-400">
            Para puanlar yüklenirken bir sorun yaşandı
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Minimal Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-green-400" />
            <h1 className="text-xl font-semibold text-white">
              Para Puanlarım
            </h1>
          </div>
        </div>
      </div>

      {/* Compact Cards Container with Scroll */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        {!cashback || cashback.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-800 rounded-full flex items-center justify-center">
              <Banknote className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-base font-medium text-white mb-1">
              Henüz para puanınız yok
            </h3>
            <p className="text-sm text-gray-400">
              İşletmelerden alışveriş yaparak para puanı kazanmaya başlayın
            </p>
          </div>
        ) : (
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pr-2">
              {cashback
                .sort((a, b) => b.totalCashback - a.totalCashback)
                .map((c, index) => (
                  <div
                    key={c.companyId}
                    className={`group relative bg-gray-800 rounded-lg border transition-all duration-200 hover:border-gray-600 ${
                      index === 0 
                        ? 'border-yellow-500/50' 
                        : 'border-gray-700'
                    }`}
                  >
                    <div className="p-4 relative">
                      {/* Badge for #1 - Top right corner */}
                      {index === 0 && (
                        <div className="absolute top-2 right-2">
                          <div className="bg-yellow-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                            👑
                          </div>
                        </div>
                      )}
                      
                      {/* Vertical Layout */}
                      <div className="text-center">
                        {/* Company Name */}
                        <h3 className="text-base font-semibold text-white mb-2">
                          {c.companyName}
                        </h3>
                        
                        {/* Total Points */}
                        <div className={`text-2xl font-bold mb-3 ${
                          index === 0 
                            ? 'text-yellow-400' 
                            : 'text-green-400'
                        }`}>
                          {c.totalCashback.toFixed(2)} ₺
                        </div>
                        
                        {/* Action Button - Icon Only */}
                        <button
                          onClick={() => handleNavigate(c.companyId)}
                          disabled={navigating === c.companyId}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                            index === 0 
                              ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          {navigating === c.companyId ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Gift className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
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
