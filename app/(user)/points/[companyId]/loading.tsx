/** @format */
"use client";

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-700 rounded ${className}`} />
);

export default function LoadingCompanyProducts() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white px-4 py-6">
      <div className="max-w-3xl mx-auto mb-6">
        <div className="flex items-center text-gray-400">
          <Skeleton className="w-5 h-5 mr-2" />
          <Skeleton className="w-16 h-4" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto mb-6">
        <Skeleton className="w-48 h-8 mb-2" />
        <Skeleton className="w-72 h-4" />
      </div>

      <div className="max-w-3xl mx-auto grid gap-5 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg"
          >
            <Skeleton className="w-32 h-6 mb-4" />
            <div className="space-y-2">
              <Skeleton className="w-24 h-4" />
              <Skeleton className="w-28 h-4" />
              <Skeleton className="w-20 h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
