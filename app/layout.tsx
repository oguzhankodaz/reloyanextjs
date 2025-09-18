/** @format */

import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CompanyAuthProvider } from "@/context/CompanyAuthContext";

export const metadata: Metadata = {
  title: "ReloYa",
  description: "Müşteri Sadakat Programı",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white font-sans">
        <AuthProvider>
          <CompanyAuthProvider>{children}</CompanyAuthProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
