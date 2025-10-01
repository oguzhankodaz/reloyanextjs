"use client";

import { LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const LogoutButton = () => {
  const router = useRouter();
  const { setUser } = useAuth(); // 👈 context user'ı sıfırlamak için
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    setUser(null); // context temizlendi
    queryClient.clear();
    router.replace("/"); // anasayfaya yönlendir
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="flex items-center gap-2 text-gray-300 hover:text-red-500 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-wait"
    >
      {isLoggingOut ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="hidden sm:inline text-sm font-medium">Çıkış yapılıyor...</span>
        </>
      ) : (
        <>
          <LogOut className="w-5 h-5" />
          <span className="hidden sm:inline text-sm font-medium">Çıkış</span>
        </>
      )}
    </button>
  );
};

export default LogoutButton;
