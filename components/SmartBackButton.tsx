/** @format */

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface SmartBackButtonProps {
  fallbackUrl?: string;
  label?: string;
}

/**
 * Akıllı geri butonu - Kullanıcı tipine göre doğru dashboard'a yönlendirir
 * User → /dashboard
 * Company → /company/dashboard
 * Giriş yapmamış → / (ana sayfa veya fallback)
 */
export default function SmartBackButton({
  fallbackUrl = "/",
  label = "Geri Dön",
}: SmartBackButtonProps) {
  const [backUrl, setBackUrl] = useState(fallbackUrl);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check user type from cookies/API
    const checkUserType = async () => {
      try {
        // Try user endpoint
        const userRes = await fetch("/api/me", { credentials: "include" });
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData?.user) {
            setBackUrl("/dashboard");
            setLoading(false);
            return;
          }
        }

        // Try company endpoint
        const companyRes = await fetch("/api/company/me", {
          credentials: "include",
        });
        if (companyRes.ok) {
          const companyData = await companyRes.json();
          if (companyData?.company) {
            setBackUrl("/company/dashboard");
            setLoading(false);
            return;
          }
        }

        // No user logged in - use fallback
        setBackUrl(fallbackUrl);
        setLoading(false);
      } catch (error) {
        console.error("SmartBackButton error:", error);
        setBackUrl(fallbackUrl);
        setLoading(false);
      }
    };

    checkUserType();
  }, [fallbackUrl]);

  if (loading) {
    // Show button but don't make it clickable while loading
    return (
      <div className="inline-flex items-center text-gray-500 mb-6">
        <svg
          className="w-5 h-5 mr-2 animate-pulse"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        <span className="text-sm">{label}</span>
      </div>
    );
  }

  return (
    <Link
      href={backUrl}
      className="inline-flex items-center text-gray-400 hover:text-cyan-400 transition-colors mb-6 group"
    >
      <svg
        className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      {label}
    </Link>
  );
}





