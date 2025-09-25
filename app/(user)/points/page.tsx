/** @format */
"use client";

import { getUserPointsAction } from "@/actions/points";
import { useAuth } from "@/context/AuthContext";
import { Award, Building2, Gift } from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

type UserPoint = {
  id: number;
  totalPoints: number;
  company: {
    id: string;
    name: string;
  };
};

const PointsPage = () => {
  const { user } = useAuth();

  // ✅ React Query ile puanları çekiyoruz
  const {
    data: points,
    isLoading,
    isError,
  } = useQuery<UserPoint[]>({
    queryKey: ["user-points", user?.userId],
    queryFn: async () => {
      if (!user?.userId) return [];
      const res = await getUserPointsAction(user.userId);
      return res.success ? res.points : [];
    },
    enabled: !!user?.userId,
    staleTime: 1000 * 60 * 5, // 5 dk cache
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-300">
        ⏳ Puanlar yükleniyor...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        ❌ Puanlar yüklenirken hata oluştu
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white px-4 py-6">
      {/* Sayfa Başlığı */}
      <div className="max-w-xl mx-auto text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-yellow-400 flex items-center justify-center gap-2">
          <Award className="w-7 h-7" />
          Kazandığınız Puanlar
        </h1>
        <p className="text-gray-400 text-sm md:text-base mt-2">
          Aşağıda işletmelere göre kazandığınız puanları görebilir ve ürünleri
          görüntüleyebilirsiniz.
        </p>
      </div>

      {/* Kartlar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
        {!points || points.length === 0 ? (
          <p className="text-center text-gray-400 col-span-full">
            Henüz hiç puanınız yok 🙁
          </p>
        ) : (
          points.map((p) => (
            <div
              key={p.id}
              className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg hover:shadow-yellow-400/10 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">
                    {p.company.name}
                  </h2>
                </div>
                <p className="text-green-400 text-2xl font-bold mb-1">
                  {p.totalPoints.toLocaleString()} Puan
                </p>
                <p className="text-gray-400 text-sm">
                  Bu işletmedeki toplam puanınız
                </p>
              </div>

              <Link
                href={`/points/${p.company.id}`}
                className="mt-4 inline-flex items-center gap-2 justify-center bg-yellow-400 text-black font-medium px-4 py-2 rounded-lg hover:bg-yellow-300 transition text-sm"
              >
                <Gift className="w-4 h-4" />
                Ürünleri Görüntüle
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PointsPage;
