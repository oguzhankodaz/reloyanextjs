/** @format */

import { usePathname } from "next/navigation";
import React from "react";
import Link from "next/link";
import { Package, Users, BarChart2, Home } from "lucide-react";
import CompanyLogoutButton from "../CompanyLogoutButton";

const CompanyNavbar = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/company/dashboard", label: "Ana Sayfa", icon: Home },
    { href: "/company/products", label: "Ürün İşlemleri", icon: Package },
    { href: "/company/customers", label: "Müşteriler", icon: Users },
    { href: "/company/reports", label: "Raporlar", icon: BarChart2 },
  ];

  return (
    <nav className="border-b border-gray-800 bg-black/40 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between py-4">
        {/* Logo */}
        <h1 className="text-xl font-bold">
          <Link href="/company/dashboard">ReloYa Business</Link>
        </h1>

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
