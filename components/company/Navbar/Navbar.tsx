/** @format */

import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Users, BarChart2, Home, UserCog } from "lucide-react";
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
    { href: "/company/products", label: "Ürün İşlemleri", icon: Package },
    { href: "/company/customers", label: "Müşteriler", icon: Users },
    { href: "/company/reports", label: "Raporlar", icon: BarChart2 },
    // 👇 Yeni ekledik
    { href: "/company/staff", label: "Personel İşlemleri", icon: UserCog },
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
              src="/logo_xs_white.webp"
              alt="Reloya Logo XS"
              width={100}
              height={32}
              className="h-8 w-auto block sm:hidden"
              priority
            />
            <Image
              src="/logo_xl_white.webp"
              alt="Reloya Logo XL"
              width={160}
              height={40}
              className="h-10 w-auto hidden sm:block"
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
              <Home className="w-5 h-5" />
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
          {/* Küçük ekran için logo */}
          <Image
            src="/logo_xs_white.webp"
            alt="Reloya Logo XS"
            width={100}
            height={32}
            className="h-8 w-auto block sm:hidden"
            priority
          />

          {/* Büyük ekran için logo */}
          <Image
            src="/logo_xl_white.webp"
            alt="Reloya Logo XL"
            width={160}
            height={40}
            className="h-10 w-auto hidden sm:block"
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
              <Icon className="w-5 h-5" />
              {/* Mobilde gizle, sadece büyük ekranda göster */}
              <span className="hidden sm:inline text-sm">{label}</span>
            </Link>
          ))}

          <CompanyLogoutButton />
        </div>
      </div>
    </nav>
  );
};

export default CompanyNavbar;
