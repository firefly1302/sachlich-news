export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Image skeleton */}
            <div className="w-full h-48 bg-gray-200 animate-pulse"></div>

            <div className="p-6">
              {/* Category and time */}
              <div className="flex justify-between items-start mb-3">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Title */}
              <div className="space-y-2 mb-3">
                <div className="h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-5 w-5/6 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Summary */}
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse"></div>
              </div>

              {/* Source and link */}
              <div className="flex justify-between items-center">
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <p className="text-gray-600">Lade sachliche Nachrichten...</p>
      </div>
    </div>
  );
}
