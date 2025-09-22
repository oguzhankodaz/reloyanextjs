"use client";

import { getUserPointsAction } from "@/actions/points";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Award, Building2 } from "lucide-react";

type UserPoint = {
  id: number;
  totalPoints: number;
  company: {
    id: string;
    name: string;
  };
};

const PointsPage = () => {
  const { user } = useAuth();
  const [points, setPoints] = useState<UserPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.userId) return;

    getUserPointsAction(user.userId).then((res) => {
      if (res.success) setPoints(res.points);
      setLoading(false);
    });
  }, [user?.userId]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-300">
        ⏳ Puanlar yükleniyor...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white p-4 flex flex-col items-center">
      {/* Başlık */}
      <h1 className="text-2xl font-extrabold mb-2 text-yellow-400 flex items-center gap-2">
        <Award className="w-6 h-6 text-yellow-400" />
        Kazandığınız Puanlar
      </h1>
      <p className="text-gray-400 text-sm mb-6 text-center">
        İşletmelerden topladığınız puanlar burada listeleniyor
      </p>

      {points.length === 0 ? (
        <p className="text-gray-400 mt-10">Henüz hiç puanınız yok 🙁</p>
      ) : (
        <div className="w-full max-w-md space-y-4">
          {points.map((p) => (
            <div
              key={p.id}
              className="bg-gray-800 p-4 rounded-xl shadow-md hover:scale-[1.02] transition-transform"
            >
              {/* İşletme İsmi */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-semibold">{p.company.name}</h2>
                </div>
              </div>

              {/* Puan Göstergesi */}
              <p className="text-green-400 text-2xl font-bold">
                {p.totalPoints.toLocaleString()} Puan
              </p>

        
           
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PointsPage;
