/** @format */
"use client";

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-800 bg-black text-gray-400 py-4 mt-10">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm">
        © {new Date().getFullYear()} ReloYa. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
