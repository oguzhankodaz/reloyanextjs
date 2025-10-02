/** @format */

import { usePathname } from "next/navigation";
import React from "react";
import Link from "next/link";
import { Home, Star, Settings } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import Image from "next/image";

const UserNavbar = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Ana Sayfa", icon: Home },
    { href: "/points", label: "Para Puanlarım", icon: Star },
  ];

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
               <Icon className="w-6 h-6" />
               {/* Mobilde gizle, sadece büyük ekranda göster */}
               <span className="hidden sm:inline text-sm">{label}</span>
            </Link>
          ))}

          {/* Ayarlar Butonu */}
          <Link
            href="/account/privacy"
            className={`flex items-center gap-2 hover:text-yellow-400 transition ${
              pathname.startsWith("/account")
                ? "text-yellow-400 font-semibold"
                : "text-gray-300"
            }`}
            title="Ayarlar ve Gizlilik"
          >
             <Settings className="w-6 h-6" />
             <span className="hidden sm:inline text-sm">Ayarlar</span>
          </Link>

          <LogoutButton />
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;
