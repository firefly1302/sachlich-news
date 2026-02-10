import NewsCard from '../components/NewsCard';
import { NewsArticle } from '@/lib/types';
import { getCachedFeed, setCachedFeed, generateArticleId, ensureDateString } from '@/lib/cache';
import { fetchNewsByCategory } from '@/lib/news-fetcher';
import { rewriteHeadlineAndSummary } from '@/lib/ai-rewriter';
import { shouldFilterArticle } from '@/lib/web-scraper';
import { getCachedHeadline, setCachedHeadline } from '@/lib/cache';

// ISR: Revalidate every 15 min
export const revalidate = 900;

export default async function PeoplePage() {
  // Server-side data fetching with caching
  let articles = await getCachedFeed('people');

  if (!articles) {
    // Cache miss - fetch fresh
    console.log('👥 People: Cache miss - fetching fresh data');
    const rawArticles = await fetchNewsByCategory('people');

    // Filter BEFORE AI (cost optimization)
    const filtered = rawArticles.filter(a => !shouldFilterArticle(a.title));

    // Generate IDs and AI-rewrite with headline caching
    articles = await Promise.all(
      filtered.map(async (article) => {
        const id = generateArticleId(article.originalUrl);

        // Check headline cache
        const cachedHeadline = await getCachedHeadline(article.title);
        if (cachedHeadline) {
          return {
            ...article,
            id,
            title: cachedHeadline.title,
            summary: cachedHeadline.summary,
            publishedAt: ensureDateString(article.publishedAt),
          };
        }

        // Not cached - rewrite and cache
        const rewritten = await rewriteHeadlineAndSummary(
          article.title,
          article.summary
        );

        await setCachedHeadline(article.title, rewritten);

        return {
          ...article,
          id,
          title: rewritten.title,
          summary: rewritten.summary,
          publishedAt: ensureDateString(article.publishedAt),
        };
      })
    );

    // Filter AFTER AI (double check)
    articles = articles.filter(a => !shouldFilterArticle(a.title));

    // Cache for 15 min
    await setCachedFeed(articles, 'people');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">People</h2>
        <p className="text-gray-600 mt-2">Prominente und Unterhaltung - {articles.length} Artikel</p>
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
