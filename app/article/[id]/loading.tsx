import Link from 'next/link';

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        ← Zurück zur Übersicht
      </Link>

      <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Image skeleton */}
        <div className="w-full h-96 bg-gray-200 animate-pulse"></div>

        <div className="p-8">
          {/* Category and source */}
          <div className="flex items-center gap-4 mb-4">
            <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Title */}
          <div className="mb-6 space-y-3">
            <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-5/6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-4/6 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Loading message */}
          <div className="flex items-center justify-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">
              Vollständiger Artikel wird geladen und sachlich aufbereitet...
            </span>
          </div>

          {/* Content skeleton */}
          <div className="space-y-4 mt-8">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Footer skeleton */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="h-3 w-96 bg-gray-200 rounded animate-pulse mb-3"></div>
            <div className="h-3 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </article>
    </div>
  );
}
