import type { Metadata } from "next";
import UserDashboard from "./UserDashboard"; // client component

export const metadata: Metadata = {
  title: "Kullanıcı Dashboard | ReloYa",
  description: "Puanlarınızı, işlemlerinizi ve kampanyalarınızı görüntüleyin.",
  keywords: ["müşteri paneli", "sadakat programı", "reloya", "kullanıcı dashboard"],
  openGraph: {
    title: "Kullanıcı Dashboard | ReloYa",
    description: "Puanlarınızı, işlemlerinizi ve kampanyalarınızı görüntüleyin.",
    url: "https://reloya.com/dashboard",
    siteName: "ReloYa",
    images: [
      {
        url: "https://reloya.com/og-image-user.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
};

export default function Page() {
  return <UserDashboard />;
}
