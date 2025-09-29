/** @format */
"use client";

import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "@/lib/helpers";
import CompanyNavbar from "@/components/company/Navbar/Navbar";
import QRReaderModal from "@/components/company/QrReader";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useRadixToast } from "@/components/notifications/ToastProvider";

type ActivityView =
  | {
      kind: "purchase";
      id: number;
      at: string;
      userName: string;
      totalPrice: number;
      cashbackEarned: number;
    }
  | {
      kind: "usage";
      id: number;
      at: string;
      userName: string;
      amount: number;
      price: number | null;
    };

export default function StaffDashboardPage() {
  const [message, setMessage] = useState<string>("");
  const [header, setHeader] = useState<{
    staffName: string;
    companyName: string;
  } | null>(null);
  const [activitiesByDate, setActivitiesByDate] = useState<
    Record<string, ActivityView[]>
  >({});
  const [loading, setLoading] = useState<boolean>(true);
  const toast = useRadixToast();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/staff/activity", {
          credentials: "include",
        });
        const data = await res.json();
        if (data?.staff && data?.company) {
          setHeader({
            staffName: data.staff.name,
            companyName: data.company.name,
          });
        }
        setActivitiesByDate(data?.activitiesByDate ?? {});
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const dateKeys = useMemo(
    () => Object.keys(activitiesByDate).sort((a, b) => (a < b ? 1 : -1)),
    [activitiesByDate]
  );

  const handleRevert = async (kind: "purchase" | "usage", id: number) => {
    const res = await fetch("/api/staff/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ kind, id }),
    });
    const data = await res.json();

    if (data.success) {
      toast({
        title: "İşlem geri alındı",
        description: data.message,
        variant: "success",
      });
    } else {
      toast({
        title: "Hata",
        description: data.message,
        variant: "error",
      });
    }

    // Listeleri tazele
    const ref = await fetch("/api/staff/activity", { credentials: "include" });
    const next = await ref.json();
    setActivitiesByDate(next?.activitiesByDate ?? {});
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8">
      <CompanyNavbar></CompanyNavbar>
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {header ? (
              <>
                Hoş geldiniz, {header.staffName} · {header.companyName}
              </>
            ) : (
              <>Personel Paneli</>
            )}
          </h1>
        </div>

        {/* Günlük işlemler */}
        <div className="bg-gray-900 rounded-xl p-4 max-h-[70vh] overflow-auto">
          <h2 className="font-semibold mb-3">Bugünkü İşlemler</h2>
          {loading ? (
            <p>Yükleniyor...</p>
          ) : dateKeys.length === 0 ? (
            <p className="text-gray-400 text-sm">Kayıt bulunamadı.</p>
          ) : (
            <div className="space-y-4">
              {dateKeys.map((day) => (
                <div key={day} className="border border-gray-800 rounded-lg">
                  <div className="px-3 py-2 bg-gray-800 text-sm font-semibold">
                    {day}
                  </div>
                  <ul className="divide-y divide-gray-800">
                    {activitiesByDate[day].map((act) => (
                      <li
                        key={`${act.kind}-${act.id}`}
                        className="p-3 flex items-center justify-between text-sm"
                      >
                        <div className="space-y-0.5">
                          {act.kind === "purchase" ? (
                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                              <span className="text-green-400">Satış</span>
                              <span className="text-gray-200">
                                · {act.userName || act.id}
                              </span>
                              <span className="text-gray-400">
                                · {formatCurrency(act.totalPrice)} · İade:{" "}
                                {formatCurrency(act.cashbackEarned)}
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                              <span className="text-red-400">
                                Puan Kullanımı
                              </span>
                              <span className="text-gray-200">
                                · {act.userName || act.id}
                              </span>
                              <span className="text-gray-400">
                                · Puan: {formatCurrency(act.amount)}{" "}
                                {act.price
                                  ? `· Fiyat: ${formatCurrency(act.price)}`
                                  : ""}
                              </span>
                            </div>
                          )}
                        </div>
                        <ConfirmDialog
                          title="İşlemi geri al?"
                          description="Bu işlemi geri almak istediğinize emin misiniz?"
                          onConfirm={() => handleRevert(act.kind, act.id)}
                          trigger={
                            <button className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded shrink-0">
                              Geri Al
                            </button>
                          }
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {message && (
          <div className="bg-white text-black rounded p-3">{message}</div>
        )}
      </div>
      <QRReaderModal></QRReaderModal>
    </div>
  );
}
