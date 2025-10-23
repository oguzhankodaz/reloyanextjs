/** @format */

import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Home, Settings, Loader2 } from "lucide-react";
import CompanyLogoutButton from "../CompanyLogoutButton";
import Image from "next/image";
import { useStaffAuth } from "@/context/StaffAuthContext";
// useCompanyAuth kaldırıldı (kullanılmıyor)

const CompanyNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { staff } = useStaffAuth();
  // company kaldırıldı (kullanılmıyor)
  const [forceStaffOnQR, setForceStaffOnQR] = useState(false);
  const [navigating, setNavigating] = useState<string | null>(null);

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

  const handleNavigate = (href: string) => {
    setNavigating(href);
    router.push(href);
  };

  // Navigation tamamlandığında loading state'i temizle
  useEffect(() => {
    if (navigating && pathname === navigating) {
      setNavigating(null);
    }
  }, [pathname, navigating]);

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
            <button
              onClick={() => handleNavigate("/company/staff/dashboard")}
              disabled={navigating === "/company/staff/dashboard"}
              className={`flex items-center gap-2 hover:text-yellow-400 transition disabled:opacity-50 disabled:cursor-wait ${
                pathname === "/company/staff/dashboard"
                  ? "text-yellow-400 font-semibold"
                  : "text-gray-300"
              }`}
            >
              {navigating === "/company/staff/dashboard" ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Home className="w-6 h-6" />
              )}
              <span className="hidden sm:inline text-sm">Ana Sayfa</span>
            </button>
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
            <button
              key={href}
              onClick={() => handleNavigate(href)}
              disabled={navigating === href}
              className={`flex items-center gap-2 hover:text-yellow-400 transition disabled:opacity-50 disabled:cursor-wait ${
                pathname === href
                  ? "text-yellow-400 font-semibold"
                  : "text-gray-300"
              }`}
            >
              {navigating === href ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Icon className="w-6 h-6" />
              )}
              {/* Mobilde gizle, sadece büyük ekranda göster */}
              <span className="hidden sm:inline text-sm">{label}</span>
            </button>
          ))}

          {/* Ayarlar Butonu */}
          <button
            onClick={() => handleNavigate("/company/profile")}
            disabled={navigating === "/company/profile"}
            className={`flex items-center gap-2 hover:text-yellow-400 transition disabled:opacity-50 disabled:cursor-wait ${
              pathname === "/company/profile"
                ? "text-yellow-400 font-semibold"
                : "text-gray-300"
            }`}
            title="Şirket Ayarları"
          >
            {navigating === "/company/profile" ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Settings className="w-6 h-6" />
            )}
            <span className="hidden sm:inline text-sm">Ayarlar</span>
          </button>

          <CompanyLogoutButton />
        </div>
      </div>
    </nav>
  );
};

export default CompanyNavbar;
