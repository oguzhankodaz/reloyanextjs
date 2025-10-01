/** @format */
"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-800 bg-black text-gray-400 py-6 mt-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* Legal Links */}
        <div className="flex flex-wrap justify-center gap-6 mb-4 text-sm">
          <Link
            href="/privacy"
            className="hover:text-cyan-400 transition-colors"
          >
            KVKK Aydınlatma Metni
          </Link>
          <Link
            href="/terms"
            className="hover:text-cyan-400 transition-colors"
          >
            Hizmet Koşulları
          </Link>
          <Link
            href="/cookies"
            className="hover:text-cyan-400 transition-colors"
          >
            Çerez Politikası
          </Link>
          <Link
            href="/account/privacy"
            className="hover:text-cyan-400 transition-colors"
          >
            Veri Taleplerim
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-center text-sm">
          © {new Date().getFullYear()} ReloYa. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
