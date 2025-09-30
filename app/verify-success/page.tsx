/** @format */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerifySuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Doğrulama Başarılı</h1>
        <p style={{ marginBottom: 16 }}>Hesabınız başarıyla doğrulandı.</p>
        <p style={{ marginBottom: 24 }}>3 saniye içinde ana sayfaya yönlendirileceksiniz.</p>
        <a href="/" style={{ color: "#2563EB", textDecoration: "underline" }}>
          Hemen ana sayfaya git
        </a>
      </div>
    </div>
  );
}
