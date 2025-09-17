'use client'
import BackButton from '@/components/company/BackButton'
import CompanyNavbar from '@/components/company/Navbar/Navbar'
import { BarChart, PieChart, Activity } from 'lucide-react'
import React from 'react'

const ReportsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <CompanyNavbar />
      <div className="p-6">
        <BackButton />

        <h1 className="text-2xl font-bold mb-6 mt-4">📊 Raporlar</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kart: Toplam Müşteri */}
          <div className="bg-gray-800 rounded-xl p-6 shadow flex flex-col items-center">
            <Activity className="w-10 h-10 text-yellow-400 mb-3" />
            <h2 className="text-lg font-semibold">Toplam Müşteri</h2>
            <p className="text-3xl font-bold mt-2">1,245</p>
            <p className="text-sm text-gray-400 mt-1">Bu ay +124 yeni müşteri</p>
          </div>

          {/* Kart: Toplam Puan */}
          <div className="bg-gray-800 rounded-xl p-6 shadow flex flex-col items-center">
            <BarChart className="w-10 h-10 text-green-400 mb-3" />
            <h2 className="text-lg font-semibold">Dağıtılan Puan</h2>
            <p className="text-3xl font-bold mt-2">56,780</p>
            <p className="text-sm text-gray-400 mt-1">Geçen aya göre %12 artış</p>
          </div>

          {/* Kart: En Aktif İşletme */}
          <div className="bg-gray-800 rounded-xl p-6 shadow flex flex-col items-center">
            <PieChart className="w-10 h-10 text-blue-400 mb-3" />
            <h2 className="text-lg font-semibold">En Aktif İşletme</h2>
            <p className="text-xl font-bold mt-2">☕ Kahve Dükkanı</p>
            <p className="text-sm text-gray-400 mt-1">15,200 puan dağıttı</p>
          </div>
        </div>

        {/* Tablo: Müşterilere Göre Puanlar */}
        <div className="bg-gray-800 rounded-xl p-6 shadow mt-8">
          <h2 className="text-xl font-semibold mb-4">👥 Müşteri Puanları</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-700 text-gray-200">
                  <th className="px-4 py-2 text-left">Ad Soyad</th>
                  <th className="px-4 py-2 text-center">Toplam Puan</th>
                  <th className="px-4 py-2 text-center">Son İşlem</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-700">
                  <td className="px-4 py-2">Oğuzhan Kodaz</td>
                  <td className="px-4 py-2 text-center text-green-400">2,450</td>
                  <td className="px-4 py-2 text-center">Latte Kahve (+50)</td>
                </tr>
                <tr className="hover:bg-gray-700">
                  <td className="px-4 py-2">Emma Levine</td>
                  <td className="px-4 py-2 text-center text-green-400">1,920</td>
                  <td className="px-4 py-2 text-center">Market Alışverişi (+200)</td>
                </tr>
                <tr className="hover:bg-gray-700">
                  <td className="px-4 py-2">Blair Lopez</td>
                  <td className="px-4 py-2 text-center text-green-400">1,500</td>
                  <td className="px-4 py-2 text-center">Kitap Alımı (+120)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Grafik Placeholder */}
        <div className="bg-gray-800 rounded-xl p-6 shadow mt-8">
          <h2 className="text-xl font-semibold mb-4">📈 Aylık Puan Dağılımı</h2>
          <div className="h-48 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-600 rounded">
            [Buraya grafik gelecek]
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsPage
