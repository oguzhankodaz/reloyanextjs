"use client";

import { useState, useEffect, useCallback } from "react";
import { useCompanyOrStaffCompanyId } from "@/hooks/useCompanyOrStaffCompanyId";
import { QrCode, Download } from "lucide-react";
import Image from "next/image";

export function QRGenerator() {
  const companyId = useCompanyOrStaffCompanyId();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const menuUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/menu/${companyId}`;

  const generateQRCode = useCallback(async () => {
    setIsGenerating(true);
    try {
      // QR kod oluşturma API'si
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(menuUrl)}`;
      setQrCodeUrl(qrApiUrl);
    } catch (error) {
      console.error("QR kod oluşturma hatası:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [menuUrl]);

  useEffect(() => {
    if (companyId) {
      generateQRCode();
    }
  }, [companyId, generateQRCode]);

  const downloadQR = () => {
    if (qrCodeUrl) {
      // Direkt PNG olarak indir - yeni sekme açmadan
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `menu-qr-${companyId}.png`;
      link.target = '_blank'; // Yeni sekmede aç
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };



  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <QrCode className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Menü QR Kodu</h3>
          <p className="text-sm text-gray-600">Müşterilerin menünüze erişmesi için QR kod</p>
        </div>
      </div>

      {isGenerating ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">QR kod oluşturuluyor...</span>
        </div>
      ) : qrCodeUrl ? (
        <div className="space-y-6">
          {/* QR Kod Görüntüleme */}
          <div className="text-center">
            <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
              <Image 
                src={qrCodeUrl} 
                alt="Menu QR Code" 
                width={192}
                height={192}
                className="mx-auto"
              />
            </div>
            <p className="text-sm text-gray-600 mt-3">
              QR kodu yazdırın ve müşterilerinizin görebileceği yere asın
            </p>
          </div>


          {/* Aksiyon Butonları */}
          <div className="flex justify-center">
            <button
              onClick={downloadQR}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              PNG İndir
            </button>
          </div>

          {/* Kullanım Talimatları */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Kullanım Talimatları:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• QR kodu yazdırın ve masalara/duvarlara asın</li>
              <li>• Müşteriler QR kodu okutarak menünüze erişebilir</li>
              <li>• QR kod her zaman güncel menünüzü gösterir</li>
              <li>• Müşteriler üye olarak sadakat puanları kazanabilir</li>
              <li>• <strong>Alternatif:</strong> QR koda sağ tıklayıp &quot;Resmi farklı kaydet&quot; ile de indirebilirsiniz</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">QR kod oluşturulamadı</p>
          <button
            onClick={generateQRCode}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      )}
    </div>
  );
}