"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      // ✅ kullanıcı varsa dashboard’a yönlendir
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {/* kullanıcı varsa zaten yönlenecek, yoksa form görünecek */}
     Home Page
    </div>
  );
}
