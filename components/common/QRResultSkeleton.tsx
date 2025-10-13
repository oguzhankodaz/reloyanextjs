/** @format */
"use client";

import CompanyNavbar from "@/components/company/Navbar/Navbar";

export default function QRResultSkeleton() {
  return (
    <div className="bg-gray-950 min-h-screen">
      <CompanyNavbar />
      <div className="flex flex-col items-center justify-start p-4 space-y-6">
        {/* User Info Card Skeleton */}
        <div className="w-full max-w-md bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700 animate-pulse">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
          <div className="h-8 bg-gray-700 rounded w-full mt-4"></div>
        </div>

        {/* Cashback Actions Skeleton */}
        <div className="w-full max-w-md bg-gray-800 rounded-xl p-6 space-y-4 animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-700 rounded w-1/3"></div>
          </div>
        </div>

        {/* Product Selector Skeleton */}
        <div className="w-full max-w-md bg-gray-800 rounded-xl p-6 animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-24 bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-700 rounded"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center text-yellow-400 flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-semibold">
            Kullanıcı bilgileri yükleniyor...
          </span>
        </div>
      </div>
    </div>
  );
}

