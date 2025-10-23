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
    
    // 1. Önce context'i temizle (API çağrılarını durdur)
    setUser(null);
    queryClient.clear();
    
    // 2. Sonra token'ları sil
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    
    // 3. Kısa bir delay ile redirect (context güncellemesi için)
    setTimeout(() => {
      router.replace("/");
    }, 100);
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="flex items-center gap-2 text-red-500 hover:text-red-500 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-wait"
    >
      {isLoggingOut ? (
        <>
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="hidden sm:inline text-sm font-medium">Çıkış yapılıyor...</span>
        </>
      ) : (
        <>
          <LogOut className="w-6 h-6" />
          <span className="hidden sm:inline text-sm font-medium">Çıkış</span>
        </>
      )}
    </button>
  );
};

export default LogoutButton;
