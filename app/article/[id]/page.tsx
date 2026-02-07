'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';

export default function ArticlePage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [rewrittenContent, setRewrittenContent] = useState('');

  const title = searchParams.get('title') || '';
  const summary = searchParams.get('summary') || '';
  const source = searchParams.get('source') || '';
  const category = searchParams.get('category') || '';
  const publishedAt = searchParams.get('publishedAt') || '';
  const originalUrl = searchParams.get('originalUrl') || '';
  const imageUrl = searchParams.get('imageUrl') || '';

  useEffect(() => {
    async function rewriteContent() {
      if (!summary) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/rewrite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: summary }),
        });

        if (response.ok) {
          const data = await response.json();
          setRewrittenContent(data.content);
        } else {
          setRewrittenContent(summary);
        }
      } catch (error) {
        console.error('Fehler beim Umschreiben:', error);
        setRewrittenContent(summary);
      } finally {
        setLoading(false);
      }
    }

    rewriteContent();
  }, [summary]);

  const timeAgo = publishedAt
    ? formatDistanceToNow(new Date(publishedAt), {
        addSuffix: true,
        locale: de,
      })
    : '';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        ← Zurück zur Übersicht
      </Link>

      <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {imageUrl && (
          <div className="relative w-full h-96 bg-gray-100">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="p-8">
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
              {category}
            </span>
            <span>{source}</span>
            {timeAgo && <span>{timeAgo}</span>}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {title}
          </h1>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">
                Artikel wird sachlich aufbereitet...
              </span>
            </div>
          ) : (
            <div className="prose prose-lg max-w-none">
              <div className="text-gray-800 leading-relaxed whitespace-pre-line">
                {rewrittenContent || summary}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              Dieser Artikel wurde von Sachlich.News automatisch sachlich
              aufbereitet.
            </p>
            {originalUrl && (
              <a
                href={originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Original-Quelle bei {source} ansehen →
              </a>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
