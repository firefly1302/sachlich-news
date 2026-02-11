import NewsCard from '../components/NewsCard';
import { Metadata } from 'next';
import { NewsArticle } from '@/lib/types';
import { getCachedFeed, setCachedFeed, generateArticleId, ensureDateString, setCachedArticle } from '@/lib/cache';
import { fetchNewsByCategory } from '@/lib/news-fetcher';
import { rewriteHeadlineAndSummary } from '@/lib/ai-rewriter';
import { shouldFilterArticle } from '@/lib/web-scraper';
import { getCachedHeadline, setCachedHeadline } from '@/lib/cache';

export const metadata: Metadata = {
  title: 'Schweiz News | Sachlich.News',
  description: 'Nachrichten aus der Schweiz - sachlich aufbereitet ohne Drama und Sensationalismus.',
};

// ISR disabled - only manual refresh via button
export const revalidate = false;

export default async function SchweizPage() {
  // Server-side data fetching with caching
  let articles = await getCachedFeed('schweiz');

  if (!articles) {
    // Cache miss - fetch fresh
    console.log('🇨🇭 Schweiz: Cache miss - fetching fresh data');
    const rawArticles = await fetchNewsByCategory('schweiz');

    // Filter BEFORE AI (cost optimization)
    const filtered = rawArticles.filter(a => !shouldFilterArticle(a.title));

    // Generate IDs and AI-rewrite with headline caching
    articles = await Promise.all(
      filtered.map(async (article) => {
        const id = generateArticleId(article.originalUrl);

        // Check headline cache
        const cachedHeadline = await getCachedHeadline(article.title);
        let finalArticle: NewsArticle;

        if (cachedHeadline) {
          finalArticle = {
            ...article,
            id,
            title: cachedHeadline.title,
            summary: cachedHeadline.summary,
            publishedAt: ensureDateString(article.publishedAt),
          };
        } else {
          // Not cached - rewrite and cache
          const rewritten = await rewriteHeadlineAndSummary(
            article.title,
            article.summary
          );

          await setCachedHeadline(article.title, rewritten);

          finalArticle = {
            ...article,
            id,
            title: rewritten.title,
            summary: rewritten.summary,
            publishedAt: ensureDateString(article.publishedAt),
          };
        }

        // Cache article metadata so detail page can find it
        await setCachedArticle(finalArticle);

        return finalArticle;
      })
    );

    // Filter AFTER AI (double check)
    articles = articles.filter(a => !shouldFilterArticle(a.title));

    // Cache for 15 min
    await setCachedFeed(articles, 'schweiz');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Schweiz</h2>
        <p className="text-gray-600 mt-2">Nachrichten aus der Schweiz - {articles.length} Artikel</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
      {articles.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Noch keine Nachrichten verfügbar.
        </div>
      )}
    </div>
  );
}
