'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  const handleRefresh = () => {
    router.refresh();
    window.location.reload();
  };

  return (
    <header className="bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold">Sachlich.News</h1>
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-400 rounded-lg font-medium transition-colors flex items-center gap-2"
              title="News aktualisieren"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
              <span className="hidden sm:inline">Aktualisieren</span>
            </button>
            <p className="text-blue-100 text-sm max-w-md hidden md:block">
              Nachrichten ohne Drama. Nur Fakten.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
