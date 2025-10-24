"use client";

import { useState, useEffect, useCallback } from "react";
import { useCompanyOrStaffCompanyId } from "@/hooks/useCompanyOrStaffCompanyId";
import { QrCode, Download, ExternalLink } from "lucide-react";
import QRCode from "react-qr-code";
import Link from "next/link";

export function QRGenerator() {
  const companyId = useCompanyOrStaffCompanyId();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSize, setSelectedSize] = useState<number>(5); // cm cinsinden

  const menuUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/menu/${companyId}`;

  const generateQRCode = useCallback(async () => {
    setIsGenerating(true);
    try {
      // QR kod oluşturma - react-qr-code kütüphanesi ile
      // API çağrısı yapmaya gerek yok, component otomatik oluşturur
      setQrCodeUrl(menuUrl);
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

  const downloadQR = (sizeCm: number) => {
    if (qrCodeUrl) {
      // QR kod SVG'sini PNG olarak indir - daha spesifik selector
      const qrContainer = document.querySelector('[data-testid="qr-code"]') || 
                         document.querySelector('.inline-block svg') ||
                         document.querySelector('svg');
      
      if (qrContainer) {
        const svg = qrContainer.tagName === 'SVG' ? qrContainer : qrContainer.querySelector('svg');
        
        if (svg) {
          // SVG'yi canvas'a çevir - transparan canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          // SVG'yi data URL'ye çevir - transparan arka plan
          const svgData = new XMLSerializer().serializeToString(svg);
          
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const svgUrl = URL.createObjectURL(svgBlob);
          
          img.onload = () => {
            // CM'yi pixel'e çevir (96 DPI varsayımı)
            const pixelsPerCm = 96 / 2.54; // 1 cm = 37.8 pixel (96 DPI)
            const sizeInPixels = Math.round(sizeCm * pixelsPerCm);
            
            canvas.width = sizeInPixels;
            canvas.height = sizeInPixels;
            
            // Canvas'ı temizle - transparan yap
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              // QR kod'u çiz - boyutu ayarla
              ctx.drawImage(img, 0, 0, sizeInPixels, sizeInPixels);
            }
            
            // PNG olarak indir - transparan arka plan
            const link = document.createElement('a');
            link.download = `menu-qr-${companyId}-${sizeCm}cm.png`;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(svgUrl);
          };
          
          img.src = svgUrl;
        } else {
          console.error('SVG bulunamadı');
        }
      } else {
        console.error('QR container bulunamadı');
      }
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
            <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-xl shadow-sm" data-testid="qr-code">
              <QRCode 
                value={qrCodeUrl} 
                size={192}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-3">
              QR kodu yazdırın ve müşterilerinizin görebileceği yere asın
            </p>
          </div>


          {/* Boyut Seçenekleri */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 text-center">QR Kod Boyutu Seçin</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[3, 5, 8, 10, 15, 20].map((size) => (
                <button
                  key={size}
                  onClick={() => downloadQR(size)}
                  className={`flex flex-col items-center gap-1 px-4 py-3 rounded-lg border-2 transition-all ${
                    selectedSize === size
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50 text-gray-900'
                  }`}
                >
                  <div className="text-lg font-bold">{size} cm</div>
                  <div className={`text-xs ${
                    selectedSize === size ? 'text-purple-600' : 'text-gray-600'
                  }`}>
                    {size < 5 ? 'Küçük' : size < 10 ? 'Orta' : 'Büyük'}
                  </div>
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600 text-center">
              Hangi boyutu seçerseniz o boyutta QR kod indirilir
            </p>
          </div>

          {/* Menüyü Gör Linki */}
          <div className="flex justify-center">
            <Link
              href={`/menu/${companyId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Menüyü Gör
            </Link>
          </div>

          {/* Kullanım Talimatları */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Kullanım Talimatları:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• QR kodu yazdırın ve masalara/duvarlara asın</li>
              <li>• Müşteriler QR kodu okutarak menünüze erişebilir</li>
              <li>• QR kod her zaman güncel menünüzü gösterir</li>
              <li>• Müşteriler üye olarak sadakat puanları kazanabilir</li>
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