"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("company");
    localStorage.removeItem("user");
    router.replace("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-gray-300 hover:text-red-500 transition"
    >
      <LogOut className="w-5 h-5" />
      {/* Sadece büyük ekranda yazı göster */}
      <span className="hidden sm:inline text-sm font-medium">Çıkış</span>
    </button>
  );
};

export default LogoutButton;
