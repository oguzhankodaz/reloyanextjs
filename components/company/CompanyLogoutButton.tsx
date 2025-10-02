/** @format */

"use client";

import { LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCompanyAuth } from "@/context/CompanyAuthContext";
import { useStaffAuth } from "@/context/StaffAuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";


const CompanyLogoutButton = () => {
  const router = useRouter();
  const { setCompany } = useCompanyAuth();
  const { setStaff } = useStaffAuth();
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // Hem company hem staff cookie'lerini temizlemeye çalış
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    await fetch("/api/staff/logout", {
      method: "POST",
      credentials: "include",
    });

    // Context sıfırla
    setCompany(null);
    setStaff(null);
    queryClient.clear();
    // Ana sayfaya yönlendir
    router.replace("/");
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="flex items-center gap-2 text-red-300 hover:text-red-500 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-wait"
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

export default CompanyLogoutButton;
