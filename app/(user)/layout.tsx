/** @format */

"use client";

import UserNavbar from "@/components/user/Navbar";

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <UserNavbar></UserNavbar> {/* İçerik */}
      <main className="max-w-7xl mx-auto px-6 py-6">{children}</main>
      {/* Floating QR Kod Butonu */}
    </div>
  );
}
