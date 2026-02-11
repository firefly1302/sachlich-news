import NewsCard from './components/NewsCard';
import { NewsArticle } from '@/lib/types';
import { getCachedFeed, setCachedFeed, generateArticleId, ensureDateString, setCachedArticle } from '@/lib/cache';
import { fetchAllNews } from '@/lib/news-fetcher';
import { rewriteHeadlineAndSummary } from '@/lib/ai-rewriter';
import { shouldFilterArticle } from '@/lib/web-scraper';
import { getCachedHeadline, setCachedHeadline } from '@/lib/cache';

// ISR disabled - only manual refresh via button
export const revalidate = false;

// Smart Mix: Durchmische Kategorien für bessere Vielfalt auf Homepage
function smartMixCategories(articles: NewsArticle[]): NewsArticle[] {
  // Gruppiere nach Kategorie
  const byCategory: Record<string, NewsArticle[]> = {};

  articles.forEach(article => {
    if (!byCategory[article.category]) {
      byCategory[article.category] = [];
    }
    byCategory[article.category].push(article);
  });

  // Sortiere jede Kategorie nach Datum (neueste zuerst)
  Object.keys(byCategory).forEach(category => {
    byCategory[category].sort((a, b) => {
      const dateA = typeof a.publishedAt === 'string' ? new Date(a.publishedAt) : a.publishedAt;
      const dateB = typeof b.publishedAt === 'string' ? new Date(b.publishedAt) : b.publishedAt;
      return dateB.getTime() - dateA.getTime();
    });
  });

  // Round-Robin: Nimm abwechselnd aus jeder Kategorie
  const mixed: NewsArticle[] = [];
  const categories = Object.keys(byCategory);
  let maxLength = Math.max(...categories.map(cat => byCategory[cat].length));

  for (let i = 0; i < maxLength; i++) {
    for (const category of categories) {
      if (byCategory[category][i]) {
        mixed.push(byCategory[category][i]);
      }
    }
  }

  console.log(`🎨 Smart Mix: ${articles.length} Artikel aus ${categories.length} Kategorien durchmischt`);
  return mixed;
}

export default async function HomePage() {
  // Server-side data fetching with caching
  let articles = await getCachedFeed();

  if (!articles) {
    // Cache miss - fetch fresh
    console.log('🏠 Homepage: Cache miss - fetching fresh data');
    const rawArticles = await fetchAllNews();

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

        // IMPORTANT: Cache article metadata so detail page can find it
        await setCachedArticle(finalArticle);

        return finalArticle;
      })
    );

    // Filter AFTER AI (double check)
    articles = articles.filter(a => !shouldFilterArticle(a.title));

    // Cache for 15 min (BEFORE mixing - cache stores chronological)
    await setCachedFeed(articles);
  }

  // SMART MIX: Always apply to ensure good category distribution
  // (Works for both fresh and cached articles)
  articles = smartMixCategories(articles);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Alle Nachrichten</h2>
        <p className="text-gray-600 mt-2">
          Sachlich informiert ohne Drama - {articles.length} Artikel
        </p>
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
