/** @format */

"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCompanyAuth } from "@/context/CompanyAuthContext";
import { useStaffAuth } from "@/context/StaffAuthContext";
import { useQueryClient } from "@tanstack/react-query";


const CompanyLogoutButton = () => {
  const router = useRouter();
  const { setCompany } = useCompanyAuth();
  const { setStaff } = useStaffAuth();
  const queryClient = useQueryClient();
  const handleLogout = async () => {
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
      className="flex items-center gap-2 text-gray-300 hover:text-red-500 transition"
    >
      <LogOut className="w-5 h-5" />
      <span className="hidden sm:inline text-sm font-medium">Çıkış</span>
    </button>
  );
};

export default CompanyLogoutButton;
