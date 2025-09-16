"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedCompany = localStorage.getItem("company");

    if (storedUser) {
      router.replace("/dashboard"); // müşteri dashboard
    } else if (storedCompany) {
      router.replace("/company/dashboard"); // şirket dashboard
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white px-6">
      {/* Slogan */}
      <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-4 tracking-tight">
        ReloYa
      </h1>
      <p className="text-lg sm:text-xl text-gray-300 text-center max-w-2xl mb-10">
        Her yerde, her zaman yanınızda. <br />
        Harcamalarınız boşa gitmesin, kazanca dönüşsün. 🎉
      </p>

      {/* Seçenekler */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* Müşteri */}
        <div className="bg-white text-black rounded-2xl shadow-lg p-6 flex flex-col items-center">
          <h2 className="text-xl font-bold mb-2">Normal insan</h2>
          <p className="text-gray-600 text-center mb-4">
            Puan toplayın, avantajlı harcayın.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/login")}
              className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Giriş Yap
            </button>
            <button
              onClick={() => router.push("/register")}
              className="px-5 py-2 border border-black text-black rounded-lg hover:bg-gray-100"
            >
              Kayıt Ol
            </button>
          </div>
        </div>

        {/* Şirket */}
        <div className="bg-white text-black rounded-2xl shadow-lg p-6 flex flex-col items-center">
          <h2 className="text-xl font-bold mb-2">Şirket</h2>
          <p className="text-gray-600 text-center mb-4">
            Müşterilerinize sadakat kazandırın.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/company/login")}
              className="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Giriş Yap
            </button>
            <button
              onClick={() => router.push("/company/register")}
              className="px-5 py-2 border border-black text-black rounded-lg hover:bg-gray-100"
            >
              Kayıt Ol
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
