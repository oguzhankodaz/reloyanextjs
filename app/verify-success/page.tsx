/** @format */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function VerifySuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-2xl font-bold mb-3">Doğrulama Başarılı</h1>
        <p className="mb-4">Hesabınız başarıyla doğrulandı.</p>
        <p className="mb-6">3 saniye içinde ana sayfaya yönlendirileceksiniz.</p>
        <Link href="/" className="text-blue-600 underline">
          Hemen ana sayfaya git
        </Link>
      </div>
    </div>
  );
}
