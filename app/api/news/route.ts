import { NextRequest, NextResponse } from 'next/server';
import { fetchAllNews, fetchNewsByCategory } from '@/lib/news-fetcher';
import { rewriteHeadlineAndSummary } from '@/lib/ai-rewriter';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    // News holen
    const articles = category
      ? await fetchNewsByCategory(category)
      : await fetchAllNews();

    // Headlines und Summaries sachlich umschreiben
    const rewrittenArticles = await Promise.all(
      articles.map(async (article) => {
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
      })
    );

    return NextResponse.json({ articles: rewrittenArticles });
  } catch (error) {
    console.error('Fehler beim Laden der News:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der News' },
      { status: 500 }
    );
  }
}
