import { NextRequest, NextResponse } from 'next/server';
import { scrapeArticle } from '@/lib/web-scraper';
import { rewriteFullArticle } from '@/lib/ai-rewriter';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'Keine URL angegeben' }, { status: 400 });
    }

    console.log(`\n📄 Scraping article from: ${url}`);

    // Artikel scrapen
    const scrapedContent = await scrapeArticle(url);
    console.log(`✓ Scraped ${scrapedContent.length} characters`);

    if (scrapedContent.length < 100) {
      console.warn('⚠️ Scraped content is very short, might be incomplete');
    }

    // Sachlich umschreiben
    console.log('🤖 Rewriting article content...');
    const rewrittenContent = await rewriteFullArticle(scrapedContent);
    console.log(`✅ Article rewritten, final length: ${rewrittenContent.length} characters\n`);

    return NextResponse.json({ content: rewrittenContent });
  } catch (error) {
    console.error('❌ FEHLER beim Scrapen:', error);
    if (error instanceof Error) {
      console.error('Error Details:', error.message);
      console.error('Error Stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Fehler beim Laden des Artikels' },
      { status: 500 }
    );
  }
}
