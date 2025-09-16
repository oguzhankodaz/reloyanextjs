import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
