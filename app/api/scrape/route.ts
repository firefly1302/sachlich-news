import { NextRequest, NextResponse } from 'next/server';
import { scrapeArticle } from '@/lib/web-scraper';
import { rewriteFullArticle } from '@/lib/ai-rewriter';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'Keine URL angegeben' }, { status: 400 });
    }

    // Artikel scrapen
    const scrapedContent = await scrapeArticle(url);

    // Sachlich umschreiben
    const rewrittenContent = await rewriteFullArticle(scrapedContent);

    return NextResponse.json({ content: rewrittenContent });
  } catch (error) {
    console.error('Fehler beim Scrapen:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden des Artikels' },
      { status: 500 }
    );
  }
}
