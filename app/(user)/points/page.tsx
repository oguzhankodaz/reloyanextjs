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
      <div className="min-h-screen flex items-center justify-center text-gray-300">
        ⏳ Para puanlar yükleniyor...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        ❌ Para puanlar yüklenirken hata oluştu
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white px-4 py-6">
      {/* Sayfa Başlığı */}
      <div className="max-w-xl mx-auto text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-green-400 flex items-center justify-center gap-2">
          <Banknote className="w-7 h-7" />
          Kazandığınız Para Puanlar
        </h1>
        <p className="text-gray-400 text-sm md:text-base mt-2">
          Aşağıda işletmelere göre kazandığınız para puanları görebilir ve
          ürünleri görüntüleyebilirsiniz.
        </p>
      </div>

      {/* Kartlar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
        {!cashback || cashback.length === 0 ? (
          <p className="text-center text-gray-400 col-span-full">
            Henüz hiç para puanınız yok 🙁
          </p>
        ) : (
          cashback.map((c) => (
            <div
              key={c.companyId}
              className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg hover:shadow-green-400/10 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">
                    {c.companyName}
                  </h2>
                </div>
                <p className="text-green-400 text-2xl font-bold mb-1">
                  {c.totalCashback.toFixed(2)} ₺
                </p>
                <p className="text-gray-400 text-sm">
                  Bu işletmeden kazandığınız toplam para puan
                </p>
              </div>

              <button
                onClick={() => handleNavigate(c.companyId)}
                disabled={navigating === c.companyId}
                className="mt-4 inline-flex items-center gap-2 justify-center bg-green-400 text-black font-medium px-4 py-2 rounded-lg hover:bg-green-300 active:scale-95 transition-all text-sm disabled:opacity-70 disabled:cursor-wait"
              >
                {navigating === c.companyId ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4" />
                    Ürünleri Görüntüle
                  </>
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CashbackPage;
