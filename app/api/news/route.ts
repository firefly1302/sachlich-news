import { NextRequest, NextResponse } from 'next/server';
import { fetchAllNews, fetchNewsByCategory } from '@/lib/news-fetcher';
import { rewriteHeadlineAndSummary } from '@/lib/ai-rewriter';
import { shouldFilterArticle } from '@/lib/web-scraper';
import { getCachedFeed, setCachedFeed, getCachedHeadline, setCachedHeadline, generateArticleId, ensureDateString } from '@/lib/cache';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    console.log(`\n🔵 Fetching news for category: ${category || 'all'}`);

    // 1. Check Cache (15 Min TTL)
    const cached = await getCachedFeed(category || undefined);
    if (cached) {
      console.log(`✅ Cache HIT - returning ${cached.length} cached articles\n`);
      return NextResponse.json({ articles: cached });
    }

    // 2. Cache Miss - Fetch fresh
    console.log('⚠️ Cache MISS - fetching fresh data');
    const rawArticles = category
      ? await fetchNewsByCategory(category)
      : await fetchAllNews();

    console.log(`📰 Fetched ${rawArticles.length} raw articles`);

    // 3. WICHTIG: Filter VORHER (spart Geld! - keine AI Calls für gefilterte Artikel)
    const filteredBeforeAI = rawArticles.filter(article => {
      const shouldFilter = shouldFilterArticle(article.title);
      if (shouldFilter) {
        console.log(`⚠️ Gefiltert (vor AI): ${article.title.substring(0, 60)}...`);
      }
      return !shouldFilter;
    });

    console.log(`📊 ${filteredBeforeAI.length}/${rawArticles.length} articles after pre-filter`);

    // 4. AI-Rewriting mit Headline-Cache
    console.log('🤖 Starting AI rewriting with headline caching...');
    const rewrittenArticles = await Promise.all(
      filteredBeforeAI.map(async (article, index) => {
        try {
          // Generate stable ID based on original URL
          const id = generateArticleId(article.originalUrl);

          // Check headline cache
          const cachedHeadline = await getCachedHeadline(article.title);
          if (cachedHeadline) {
            console.log(`[${index + 1}/${filteredBeforeAI.length}] Cache hit: ${article.title.substring(0, 40)}...`);
            return {
              ...article,
              id,
              title: cachedHeadline.title,
              summary: cachedHeadline.summary,
              publishedAt: ensureDateString(article.publishedAt),
            };
          }

          // Not cached - rewrite and cache
          console.log(`[${index + 1}/${filteredBeforeAI.length}] Rewriting: ${article.title.substring(0, 40)}...`);
          const rewritten = await rewriteHeadlineAndSummary(
            article.title,
            article.summary
          );

          // Cache headline permanently
          await setCachedHeadline(article.title, rewritten);

          return {
            ...article,
            id,
            title: rewritten.title,
            summary: rewritten.summary,
            publishedAt: ensureDateString(article.publishedAt),
          };
        } catch (articleError) {
          console.error(`❌ Failed to rewrite article ${index + 1}:`, articleError);
          // Return original if rewriting fails
          return {
            ...article,
            id: generateArticleId(article.originalUrl),
            publishedAt: ensureDateString(article.publishedAt),
          };
        }
      })
    );

    // 5. Filter NACHHER (falls AI Keywords hinzufügt - double check)
    const finalFiltered = rewrittenArticles.filter(article => {
      const shouldFilter = shouldFilterArticle(article.title);
      if (shouldFilter) {
        console.log(`⚠️ Gefiltert (nach AI): ${article.title.substring(0, 60)}...`);
      }
      return !shouldFilter;
    });

    console.log(`✅ ${finalFiltered.length}/${rewrittenArticles.length} articles after post-filter`);

    // 6. Cache full feed (15 Min)
    await setCachedFeed(finalFiltered, category || undefined);

    console.log(`🎯 Returning ${finalFiltered.length} articles\n`);
    return NextResponse.json({ articles: finalFiltered });
  } catch (error) {
    console.error('❌ CRITICAL ERROR beim Laden der News:', error);
    if (error instanceof Error) {
      console.error('Error Stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Fehler beim Laden der News' },
      { status: 500 }
    );
  }
}
