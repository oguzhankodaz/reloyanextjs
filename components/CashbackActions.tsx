"use client";

import { formatCurrency } from "@/lib/helpers";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

type Props = {
  totalSpendInput: string;
  setTotalSpendInput: (v: string) => void;
  percentageInput: string;
  cashbackPreview: number;
  handleGiveCashbackBySpend: () => void;
  useCashbackInput: string;
  setUseCashbackInput: (v: string) => void;
  handleUseCashback: () => void;
  totalCashback: number;
  saving: boolean;
};

export function CashbackActions({
  totalSpendInput,
  setTotalSpendInput,
  percentageInput,
  cashbackPreview,
  handleGiveCashbackBySpend,
  useCashbackInput,
  setUseCashbackInput,
  handleUseCashback,
  totalCashback,
  saving,
}: Props) {
  return (
    <div className="bg-gray-900 rounded-lg shadow-md p-6 w-full max-w-3xl space-y-6">
      <h2 className="text-lg font-semibold text-gray-100">
        💳 Müşteri Para Puan İşlemleri
      </h2>

      {/* Toplam harcama ile iade */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-2">
          Toplam Harcama ile Nakit İade Ver
        </h3>
        <input
          type="number"
          value={totalSpendInput}
          onChange={(e) => setTotalSpendInput(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 mb-3 text-gray-100"
          placeholder="Toplam harcama (₺)"
        />

        <div className="mb-4 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3">
          <p className="text-sm text-gray-400">
            <span className="text-gray-300 font-medium">Nakit İade Oranı:</span>{" "}
            <span className="font-bold text-yellow-400 text-lg">%{percentageInput}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Bu oran şirket yöneticisi tarafından belirlenir
          </p>
        </div>

        <p className="text-gray-300 mb-3">
          🎯 Verilecek Nakit İade:{" "}
          <span className="font-bold text-green-400">
            {formatCurrency(cashbackPreview)}
          </span>
        </p>

        <ConfirmDialog
          title="Nakit iade onayı"
          description={`${formatCurrency(
            cashbackPreview
          )} iade verilecektir. Onaylıyor musunuz?`}
          onConfirm={handleGiveCashbackBySpend}
          trigger={
            <button
              disabled={saving || cashbackPreview <= 0}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "İşlem yapılıyor..." : "İade Ver"}
            </button>
          }
        />
      </div>

      {/* Manuel bakiye kullan */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-2">
          🎯 Manuel Para Puan Kullan
        </h3>
        <input
          type="number"
          min={1}
          max={totalCashback}
          value={useCashbackInput}
          onChange={(e) => setUseCashbackInput(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 mb-3 text-gray-100"
          placeholder="Kullanılacak tutar (₺)"
        />

        <ConfirmDialog
          title="Bakiye kullanım onayı"
          description={`${formatCurrency(
            parseFloat(useCashbackInput) || 0
          )} bakiye kullanılacaktır. Onaylıyor musunuz?`}
          onConfirm={handleUseCashback}
          trigger={
            <button
              disabled={saving || parseFloat(useCashbackInput) <= 0}
              className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? "İşlem yapılıyor..." : "Bakiyeyi Kullan"}
            </button>
          }
        />
      </div>
    </div>
  );
}
