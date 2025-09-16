/** @format */

import { usePathname } from "next/navigation";
import React from "react";
import Link from "next/link";
import { Home, Star } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

const UserNavbar = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Ana Sayfa", icon: Home },
    { href: "/points", label: "Puanlarım", icon: Star },
  ];

  return (
    <nav className="border-b border-gray-800 bg-black/40 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between py-4">
        {/* Logo */}
        <h1 className="text-xl font-bold">
          <Link href="/dashboard">Reloya</Link>
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

          <LogoutButton />
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;
