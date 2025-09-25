/** @format */

import type { Metadata } from "next";
import CompanyDashboardPage from "./CompanyDashboardPage"; // client component

export const metadata: Metadata = {
  title: "Şirket Dashboard | ReloYa",
  description:
    "Şirketinizin müşteri puanlarını, satışlarını ve raporlarını görüntüleyin.",
  keywords: [
    "müşteri sadakat programı",
    "puan sistemi",
    "reloya",
    "şirket dashboard",
  ],
  openGraph: {
    title: "Şirket Dashboard | ReloYa",
    description:
      "Şirketinizin müşteri puanlarını, satışlarını ve raporlarını görüntüleyin.",
    url: "https://reloya.com/company/dashboard",
    siteName: "ReloYa",
    images: [
      {
        url: "https://reloya.com/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
};

export default function DashboardPage() {
  return <CompanyDashboardPage />;
}
