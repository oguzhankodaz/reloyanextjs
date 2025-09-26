/** @format */
"use client";

export default function ReportsSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Başlık skeleton */}
      <div className="h-8 w-48 bg-gray-700 animate-pulse rounded" />

      {/* Summary cards skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-800 rounded-xl p-6 shadow flex flex-col items-center animate-pulse"
          >
            <div className="w-10 h-10 bg-gray-700 rounded-full mb-3" />
            <div className="h-4 w-24 bg-gray-700 rounded mb-2" />
            <div className="h-6 w-16 bg-gray-600 rounded" />
          </div>
        ))}
      </div>

      {/* Tablo skeleton */}
      <div className="bg-gray-800 rounded-xl p-6 shadow">
        <div className="h-6 w-40 bg-gray-700 rounded mb-4 animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-6 bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>

      {/* Chart skeleton */}
      <div className="bg-gray-800 rounded-xl p-6 shadow">
        <div className="h-6 w-32 bg-gray-700 rounded mb-4 animate-pulse" />
        <div className="h-48 bg-gray-700 rounded animate-pulse" />
      </div>
    </div>
  );
}
