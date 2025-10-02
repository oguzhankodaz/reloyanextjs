/** @format */

import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Home, Settings } from "lucide-react";
import CompanyLogoutButton from "../CompanyLogoutButton";
import Image from "next/image";
import { useStaffAuth } from "@/context/StaffAuthContext";
// useCompanyAuth kaldırıldı (kullanılmıyor)

const CompanyNavbar = () => {
  const pathname = usePathname();
  const { staff } = useStaffAuth();
  // company kaldırıldı (kullanılmıyor)
  const [forceStaffOnQR, setForceStaffOnQR] = useState(false);

  // On qr-result, detect staff session via API to avoid context race
  useEffect(() => {
    let cancelled = false;
    if (pathname.startsWith("/qr-result")) {
      fetch("/api/staff/me", { credentials: "include" })
        .then((r) => r.json())
        .then((d) => {
          if (!cancelled) setForceStaffOnQR(Boolean(d?.staff));
        })
        .catch(() => {
          if (!cancelled) setForceStaffOnQR(false);
        });
    } else {
      setForceStaffOnQR(false);
    }
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const navItems = [
    { href: "/company/dashboard", label: "Ana Sayfa", icon: Home },
  ];

  // Sadece personel paneli ve personel login sayfalarında minimal navbar göster
  const isStaffMinimal =
    pathname === "/company/staff/dashboard" ||
    pathname === "/company/staff/login" ||
    ((staff || forceStaffOnQR) && pathname.startsWith("/qr-result"));

  if (isStaffMinimal) {
    return (
      <nav className="border-b border-gray-800 bg-black/40 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between py-4">
          <div className="flex items-center">
            <Image
              src="/logo_xl_white1.webp"
              alt="Reloya Logo"
              width={120}
              height={30}
              className="h-8 w-auto"
              priority
            />
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/company/staff/dashboard"
              className={`flex items-center gap-2 hover:text-yellow-400 transition ${
                pathname === "/company/staff/dashboard"
                  ? "text-yellow-400 font-semibold"
                  : "text-gray-300"
              }`}
            >
              <Home className="w-6 h-6" />
              <span className="hidden sm:inline text-sm">Ana Sayfa</span>
            </Link>
            <CompanyLogoutButton />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b border-gray-800 bg-black/40 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between py-4">
        {/* Logo */}
        <div className="flex items-center">
          <Image
            src="/logo_xl_white1.webp"
            alt="Reloya Logo"
            width={120}
            height={30}
            className="h-8 w-auto"
            priority
          />
        </div>

        {/* Menü */}
        <div className="flex items-center gap-6">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 hover:text-yellow-400 transition ${
                pathname === href
                  ? "text-yellow-400 font-semibold"
                  : "text-gray-300"
              }`}
            >
              <Icon className="w-6 h-6" />
              {/* Mobilde gizle, sadece büyük ekranda göster */}
              <span className="hidden sm:inline text-sm">{label}</span>
            </Link>
          ))}

          {/* Ayarlar Butonu */}
          <Link
            href="/company/profile"
            className={`flex items-center gap-2 hover:text-yellow-400 transition ${
              pathname === "/company/profile"
                ? "text-yellow-400 font-semibold"
                : "text-gray-300"
            }`}
            title="Şirket Ayarları"
          >
            <Settings className="w-6 h-6" />
            <span className="hidden sm:inline text-sm">Ayarlar</span>
          </Link>

          <CompanyLogoutButton />
        </div>
      </div>
    </nav>
  );
};

export default CompanyNavbar;
