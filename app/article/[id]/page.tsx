import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { NewsArticle } from '@/lib/types';
import { getCachedArticle, setCachedArticle } from '@/lib/cache';
import { scrapeArticle } from '@/lib/web-scraper';
import { rewriteFullArticle } from '@/lib/ai-rewriter';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id } = await params;
  const query = await searchParams;

  // Try to get article from cache or query params
  let { meta: article } = await getCachedArticle(id);

  if (!article && query.title) {
    article = {
      id,
      title: query.title,
      summary: query.summary || '',
      source: query.source || '',
      category: query.category as any,
      publishedAt: query.publishedAt || new Date().toISOString(),
      originalUrl: query.originalUrl || '',
      imageUrl: query.imageUrl || undefined,
    };
  }

  if (!article) {
    return {
      title: 'Artikel nicht gefunden | Sachlich.News',
      description: 'Der gesuchte Artikel konnte nicht gefunden werden.',
    };
  }

  return {
    title: `${article.title} | Sachlich.News`,
    description: article.summary || 'Sachlich aufbereiteter Nachrichtenartikel ohne Drama und Sensationalismus.',
    openGraph: {
      title: article.title,
      description: article.summary,
      type: 'article',
      publishedTime: typeof article.publishedAt === 'string'
        ? article.publishedAt
        : article.publishedAt.toISOString(),
      authors: [article.source],
      images: article.imageUrl ? [article.imageUrl] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.summary,
      images: article.imageUrl ? [article.imageUrl] : [],
    },
  };
}

export default async function ArticlePage({ params, searchParams }: Props) {
  const { id } = await params;
  const query = await searchParams;

  // Try cache first
  let { meta: article, content: rewrittenContent } = await getCachedArticle(id);

  // Backwards compatibility: Support old query param URLs (for 30 days)
  if (!article && query.title) {
    console.log('📌 Backwards compat: Using query params for article data');
    article = {
      id,
      title: query.title,
      summary: query.summary || '',
      source: query.source || '',
      category: query.category as any,
      publishedAt: query.publishedAt || new Date().toISOString(),
      originalUrl: query.originalUrl || '',
      imageUrl: query.imageUrl || undefined,
    };

    // Cache for future (metadata only, content will be cached when scraped)
    await setCachedArticle(article);
  }

  // If no article data, show error
  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          ← Zurück zur Übersicht
        </Link>
        <div className="text-center py-12 text-red-600">
          Artikel nicht gefunden.
        </div>
      </div>
    );
  }

  // If no content cached, scrape + rewrite
  if (!rewrittenContent && article.originalUrl) {
    try {
      console.log(`📄 Scraping article: ${article.originalUrl}`);
      const scrapedContent = await scrapeArticle(article.originalUrl);

      if (scrapedContent && scrapedContent.length > 200) {
        console.log(`🤖 Rewriting full article (${scrapedContent.length} chars)...`);
        rewrittenContent = await rewriteFullArticle(scrapedContent);

        // Cache permanently
        await setCachedArticle(article, rewrittenContent);
      } else {
        // Not enough content - use summary
        rewrittenContent = article.summary;
      }
    } catch (error) {
      console.error('❌ Error scraping article:', error);
      rewrittenContent = article.summary;
    }
  }

  // Fallback to summary if no content
  if (!rewrittenContent) {
    rewrittenContent = article.summary;
  }

  const timeAgo = article.publishedAt
    ? formatDistanceToNow(new Date(article.publishedAt), {
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
        {article.imageUrl && (
          <div className="relative w-full h-96 bg-gray-100">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="p-8">
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
              {article.category}
            </span>
            <span>{article.source}</span>
            {timeAgo && <span>{timeAgo}</span>}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {article.title}
          </h1>

          <div className="prose prose-lg max-w-none">
            <div className="text-gray-800 leading-relaxed whitespace-pre-line">
              {rewrittenContent}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              Dieser Artikel wurde von Sachlich.News automatisch sachlich
              aufbereitet.
            </p>
            {article.originalUrl && (
              <a
                href={article.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Original-Quelle bei {article.source} ansehen →
              </a>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
