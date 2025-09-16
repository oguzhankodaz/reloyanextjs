import UserQrButton from "@/components/user/UserQRCode";
import React from "react";

const DashboardPage = () => {
  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Müşteri Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Buradan puanlarınızı, harcamalarınızı ve avantajlarınızı takip edebilirsiniz.
      </p>

      {/* Sağ altta QR kod gösteren buton */}
      <UserQrButton />
    </div>
  );
};

export default DashboardPage;
