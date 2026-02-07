'use client';

import { NewsArticle } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import Link from 'next/link';

interface NewsCardProps {
  article: NewsArticle;
}

export default function NewsCard({ article }: NewsCardProps) {
  const timeAgo = formatDistanceToNow(new Date(article.publishedAt), {
    addSuffix: true,
    locale: de,
  });

  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
          {article.category}
        </span>
        <span className="text-xs text-gray-500">{timeAgo}</span>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-3 leading-tight">
        {article.title}
      </h2>

      <p className="text-gray-700 mb-4 line-clamp-3">{article.summary}</p>

      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">{article.source}</span>
        <a
          href={article.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Quelle lesen →
        </a>
      </div>
    </article>
  );
}
