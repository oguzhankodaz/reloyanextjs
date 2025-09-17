/** @format */
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const BackButton = () => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/company/dashboard")}
      className="flex items-center gap-2 text-gray-300 hover:text-yellow-400 transition pt-4"
    >
      <ArrowLeft className="w-5 h-5" />
      <span className="text-sm font-medium">Geri</span>
    </button>
  );
};

export default BackButton;
