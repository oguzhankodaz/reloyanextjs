"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { QrCode } from "lucide-react";
import { useRouter } from "next/navigation";

const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((m) => m.Scanner),
  { ssr: false }
);

export default function QRReaderModal() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      {/* Açma butonu */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-yellow-400 text-black rounded-full p-5 shadow-lg hover:bg-yellow-300 transition"
      >
        <QrCode className="w-7 h-7" />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 w-[360px] text-center relative">
            <h2 className="text-lg font-bold mb-3">📷 QR Kod Oku</h2>

            <Scanner
              components={{}}
              onScan={(data) => {
                if (data && data[0]?.rawValue) {
                  const userId = data[0].rawValue;
                  setOpen(false);
                  // ✅ QR okunduğunda yönlendirme
                  router.push(`/qr-result?userId=${encodeURIComponent(userId)}`);
                }
              }}
              onError={(err) => console.error("QR hata:", err)}
            />

            {/* Alt kısımda kırmızı kapatma butonu */}
            <button
              onClick={() => setOpen(false)}
              className="mt-4 w-full bg-red-600 text-white font-semibold py-2 rounded-lg hover:bg-red-700 transition"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </>
  );
}
