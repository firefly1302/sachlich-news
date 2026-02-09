import { NextRequest, NextResponse } from 'next/server';
import { fetchAllNews, fetchNewsByCategory } from '@/lib/news-fetcher';
import { rewriteHeadlineAndSummary } from '@/lib/ai-rewriter';
import { shouldFilterArticle } from '@/lib/web-scraper';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    console.log(`\n🔵 Fetching news for category: ${category || 'all'}`);

    // News holen
    const articles = category
      ? await fetchNewsByCategory(category)
      : await fetchAllNews();

    console.log(`📰 Fetched ${articles.length} articles`);

    // Headlines und Summaries sachlich umschreiben
    console.log('🤖 Starting AI rewriting for all articles...');
    const rewrittenArticles = await Promise.all(
      articles.map(async (article, index) => {
        try {
          console.log(`[${index + 1}/${articles.length}] Rewriting: ${article.title.substring(0, 50)}...`);

          const rewritten = await rewriteHeadlineAndSummary(
            article.title,
            article.summary
          );

          return {
            ...article,
            title: rewritten.title,
            summary: rewritten.summary,
            publishedAt: article.publishedAt.toISOString(), // JSON-serializable
          };
        } catch (articleError) {
          console.error(`❌ Failed to rewrite article ${index + 1}:`, articleError);
          // Return original if rewriting fails
          return {
            ...article,
            publishedAt: article.publishedAt.toISOString(),
          };
        }
      })
    );

    // WICHTIG: Filter NACH dem AI-Rewriting anwenden!
    // Die AI kann belastende Keywords wieder einführen
    const filteredArticles = rewrittenArticles.filter(article => {
      const shouldFilter = shouldFilterArticle(article.title);
      if (shouldFilter) {
        console.log(`⚠️ Gefiltert (nach AI): ${article.title.substring(0, 60)}...`);
      }
      return !shouldFilter;
    });

    console.log(`✅ ${filteredArticles.length}/${rewrittenArticles.length} Artikel nach Filter\n`);
    return NextResponse.json({ articles: filteredArticles });
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
