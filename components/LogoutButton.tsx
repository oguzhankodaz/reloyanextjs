"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

const LogoutButton = () => {
  const router = useRouter();
  const { setUser } = useAuth(); // 👈 context user’ı sıfırlamak için
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    setUser(null); // context temizlendi
    queryClient.clear();
    router.replace("/"); // anasayfaya yönlendir
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-gray-300 hover:text-red-500 transition"
    >
      <LogOut className="w-5 h-5" />
      <span className="hidden sm:inline text-sm font-medium">Çıkış</span>
    </button>
  );
};

export default LogoutButton;
