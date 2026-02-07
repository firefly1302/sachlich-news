import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold">Sachlich.News</h1>
          </Link>
          <p className="text-blue-100 text-sm max-w-md">
            Nachrichten ohne Drama. Nur Fakten.
          </p>
        </div>
      </div>
    </header>
  );
}
