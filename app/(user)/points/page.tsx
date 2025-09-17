"use client";

import { getUserPointsAction } from "@/actions/points";
import { useEffect, useState } from "react";

type UserPoint = {
  id: number;
  totalPoints: number;
  company: {
    id: string;
    name: string;
  };
};

const PointsPage = () => {
  const [points, setPoints] = useState<UserPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userRaw = localStorage.getItem("user");
    if (!userRaw) return;

    const user = JSON.parse(userRaw);
    const userId = user.id;

    getUserPointsAction(userId).then((res) => {
      if (res.success) setPoints(res.points);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="p-6 text-gray-300">⏳ Yükleniyor...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-extrabold mb-6 text-yellow-400">
        🎉 Kazandığınız Puanlar
      </h1>

      {points.length === 0 ? (
        <p className="text-gray-400">Henüz hiç puanınız yok.</p>
      ) : (
        <div className="w-full max-w-md space-y-4">
          {points.map((p) => (
            <div
              key={p.id}
              className="bg-gray-800 p-4 rounded-xl shadow hover:scale-105 transition"
            >
              <h2 className="text-lg font-semibold">{p.company.name}</h2>
              <p className="text-green-400 text-xl font-bold">
                {p.totalPoints} Puan
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PointsPage;
