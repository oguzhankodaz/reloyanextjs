"use client";

import { useState } from "react";
import { QrCode } from "lucide-react";
import QRCode from "react-qr-code";
import { useAuth } from "@/context/AuthContext"; // ✅ context eklendi
import { calculateUserBadge, getQRTheme } from "@/lib/badge";
import { getUserDashboard } from "@/actions/userDashboard";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/helpers";

const UserQrButton = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth(); // ✅ user context'ten alınır

  // Kullanıcı verilerini çek (rozet hesaplamak için)
  const { data: dashboardData } = useQuery({
    queryKey: ["user-dashboard", user?.userId],
    queryFn: async () => {
      if (!user?.userId) return null;
      return await getUserDashboard(user.userId);
    },
    enabled: !!user?.userId && open, // Sadece modal açıkken çek
    staleTime: 1000 * 60 * 5,
  });

  // Rozet hesaplama (totalEarnings üzerinden)
  const userBadge = dashboardData ? calculateUserBadge(dashboardData.totalEarnings) : null;
  const qrTheme = userBadge ? getQRTheme(userBadge.currentBadge) : null;

  return (
    <>
      {/* Sağ altta sabit buton */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-full p-5 shadow-lg hover:scale-110 hover:shadow-2xl transition-all"
      >
        <QrCode className="w-7 h-7" />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className={`relative bg-gradient-to-br ${qrTheme?.background || "from-white to-gray-100"} rounded-2xl p-6 w-[90%] max-w-sm text-center shadow-2xl border ${qrTheme?.border || "border-gray-200"}`}>
            {/* Rozet temalı üst border */}
            <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${qrTheme?.accent || "from-yellow-400 to-orange-500"} rounded-t-2xl`}></div>

            {/* Rozet Bilgisi */}
            {userBadge && (
              <div className={`bg-gradient-to-r ${qrTheme?.accent} rounded-lg p-3 mb-4 text-white`}>
                <div className="text-2xl mb-1">{userBadge.currentBadge.icon}</div>
                <h3 className="text-sm font-bold">{userBadge.currentBadge.name} Üye</h3>
                <p className="text-xs opacity-90">
                  {formatCurrency(dashboardData?.totalEarnings || 0)} toplam kazanç
                </p>
              </div>
            )}

            <h2 className={`text-xl font-extrabold mb-5 ${qrTheme?.text || "text-gray-900"}`}>
              🎟️ Benim QR Kodum
            </h2>

            {user?.userId ? (
              <div className="bg-white rounded-xl p-4 shadow-inner inline-block">
                {/* ✅ user.id değerini QR koda bastık */}
                <QRCode value={user.userId} size={180} />
              </div>
            ) : (
              <p className="text-gray-500">Kullanıcı bulunamadı</p>
            )}

            <p className={`text-sm mt-4 ${qrTheme?.text || "text-gray-700"}`}>
              Bu kodu işletmeye göster,{" "}
              <span className="font-semibold">
                puanlarını hemen kazan!
              </span>
            </p>

            {/* Rozet temalı buton */}
            <button
              onClick={() => setOpen(false)}
              className={`mt-6 px-5 py-2 bg-gradient-to-r ${qrTheme?.accent || "from-black to-gray-800"} text-white rounded-lg shadow hover:opacity-90 transition`}
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default UserQrButton;
