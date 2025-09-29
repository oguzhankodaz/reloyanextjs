/** @format */

import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";
import { CompanyAuthProvider } from "@/context/CompanyAuthContext";
import { StaffAuthProvider } from "@/context/StaffAuthContext"; // ✅ staff context eklendi
import Footer from "@/components/Footer";
import ReactQueryProvider from "./ReactQueryProvider";
import { RadixToastProvider } from "@/components/notifications/ToastProvider";

export const metadata: Metadata = {
  title: "Reloya",
  description: "Müşteri sadakat uygulaması",
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
          <CompanyAuthProvider>
            <StaffAuthProvider>
              <ReactQueryProvider>
                <RadixToastProvider>{children}</RadixToastProvider>
              </ReactQueryProvider>
            </StaffAuthProvider>
          </CompanyAuthProvider>
        </AuthProvider>
        <Footer />
      </body>
    </html>
  );
}
