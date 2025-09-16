"use client";

import { useEffect, useState } from "react";
import { QrCode } from "lucide-react";
import QRCode from "react-qr-code";

const UserQrButton = () => {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUserId(parsed.id);
    }
  }, []);

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
          <div className="relative bg-gradient-to-br from-white to-gray-100 rounded-2xl p-6 w-[90%] max-w-sm text-center shadow-2xl border border-gray-200">
            {/* Dekoratif gradient top border */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-t-2xl"></div>

            <h2 className="text-xl font-extrabold mb-5 text-gray-900">
              🎟️ Benim QR Kodum
            </h2>

            {userId ? (
              <div className="bg-white rounded-xl p-4 shadow-inner inline-block">
                <QRCode value={userId} size={180} />
              </div>
            ) : (
              <p className="text-gray-500">Kullanıcı bulunamadı</p>
            )}

            <p className="text-sm text-gray-700 mt-4">
              Bu kodu işletmeye göster,{" "}
              <span className="font-semibold text-yellow-600">
                puanlarını hemen kazan!
              </span>
            </p>

            <button
              onClick={() => setOpen(false)}
              className="mt-6 px-5 py-2 bg-gradient-to-r from-black to-gray-800 text-white rounded-lg shadow hover:from-gray-900 hover:to-black transition"
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
