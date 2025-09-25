/** @format */

import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css"; 
import { CompanyAuthProvider } from "@/context/CompanyAuthContext";
import Footer from "@/components/Footer";
import ReactQueryProvider from "./ReactQueryProvider";

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
          <CompanyAuthProvider>
            <ReactQueryProvider>
              {children}
            </ReactQueryProvider>
          </CompanyAuthProvider>
        </AuthProvider>
        <Footer />
      </body>
    </html>
  );
}
