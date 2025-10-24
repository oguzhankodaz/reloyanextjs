export function CompanyMenuSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Skeleton */}
      <div className="text-center mb-8">
        <div className="h-10 bg-gray-200 rounded-lg w-64 mx-auto mb-4 animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded-lg w-96 mx-auto mb-4 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded-lg w-32 mx-auto animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Categories Sidebar Skeleton */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <div className="h-6 bg-gray-200 rounded-lg w-24 mb-4 animate-pulse"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-200 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded-lg mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-3/4 mb-4 animate-pulse"></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-8 bg-gray-200 rounded-lg w-20 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-10 bg-gray-200 rounded-lg w-10 animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded-lg w-12 animate-pulse"></div>
                    <div className="h-10 bg-gray-200 rounded-lg w-10 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Sidebar Skeleton */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="h-6 bg-gray-200 rounded-lg w-16 mb-4 animate-pulse"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded-lg w-24 mb-2 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded-lg w-16 animate-pulse"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded-lg w-12 animate-pulse"></div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 mt-4">
                <div className="h-4 bg-gray-200 rounded-lg w-full mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-3/4 animate-pulse"></div>
              </div>
              <div className="h-12 bg-gray-200 rounded-lg w-full mt-4 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
