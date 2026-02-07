import { NextRequest, NextResponse } from 'next/server';
import { rewriteFullArticle } from '@/lib/ai-rewriter';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Kein Content angegeben' },
        { status: 400 }
      );
    }

    const rewrittenContent = await rewriteFullArticle(content);

    return NextResponse.json({ content: rewrittenContent });
  } catch (error) {
    console.error('Fehler beim Umschreiben:', error);
    return NextResponse.json(
      { error: 'Fehler beim Umschreiben' },
      { status: 500 }
    );
  }
}
