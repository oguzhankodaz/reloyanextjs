/** @format */

"use client";

import CompanyNavbar from "@/components/company/Navbar/Navbar";
import QRReader from "@/components/company/QrReader";
import { QrCode, Package, Users, BarChart2 } from "lucide-react";
import { useRouter } from "next/navigation";

const CompanyDashboard = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white flex flex-col">
      <CompanyNavbar></CompanyNavbar>
      {/* Main Content */}
      <main className="flex-1 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
        {/* Ürünler */}
        <div
          onClick={() => router.push("/company/products")}
          className="cursor-pointer bg-white text-black rounded-xl p-6 w-full max-w-xs flex flex-col items-center shadow hover:scale-105 transition"
        >
          <Package className="w-8 h-8 mb-3" />
          <span className="font-medium text-sm">Ürün İşlemleri</span>
        </div>

        {/* Müşteriler */}
        <div
          onClick={() => router.push("/company/customers")}
          className="cursor-pointer bg-white text-black rounded-xl p-6 w-full max-w-xs flex flex-col items-center shadow hover:scale-105 transition"
        >
          <Users className="w-8 h-8 mb-3" />
          <span className="font-medium text-sm">Müşterilerim</span>
        </div>

        {/* Raporlar */}
        <div
          onClick={() => router.push("/company/reports")}
          className="cursor-pointer bg-white text-black rounded-xl p-6 w-full max-w-xs flex flex-col items-center shadow hover:scale-105 transition"
        >
          <BarChart2 className="w-8 h-8 mb-3" />
          <span className="font-medium text-sm">Raporlar</span>
        </div>
      </main>

      {/* QR Okutma - Floating Button */}
        <QRReader />
     
    </div>
  );
};

export default CompanyDashboard;
