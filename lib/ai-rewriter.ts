import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const REWRITE_PROMPT = `Du bist ein Redakteur für Sachlich.News - eine Nachrichtenseite die sachlich und ohne Dramatik informiert.

Deine Aufgabe:
1. Schreibe die News sachlich um - entferne emotionale Sprache, Drama und Sensationalismus
2. Konzentriere dich auf Fakten: Wer, Was, Wann, Wo, Warum
3. Vermeide dramatische Worte wie "schockierend", "erschütternd", "tragisch", "Horror", etc.
4. Halte den Text informativ aber neutral
5. Kürze unnötige Details, die nur schockieren sollen
6. Schreibe auf Deutsch (Schweizer Hochdeutsch)

Wichtig: Die Leser wollen informiert sein, aber nicht emotional belastet werden.`;

export async function rewriteHeadlineAndSummary(
  title: string,
  summary: string
): Promise<{ title: string; summary: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: REWRITE_PROMPT },
        {
          role: 'user',
          content: `Schreibe diese News sachlich um:\n\nTitel: ${title}\n\nZusammenfassung: ${summary}\n\nGib mir zurück:\nSACHLICHER TITEL: [der neue Titel]\nSACHLICHE ZUSAMMENFASSUNG: [2-3 Sätze]`
        }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const result = response.choices[0]?.message?.content || '';

    // Parse die Antwort
    const titleMatch = result.match(/SACHLICHER TITEL:\s*(.+?)(?:\n|$)/i);
    const summaryMatch = result.match(/SACHLICHE ZUSAMMENFASSUNG:\s*(.+?)(?:\n\n|$)/is);

    return {
      title: titleMatch?.[1]?.trim() || title,
      summary: summaryMatch?.[1]?.trim() || summary,
    };
  } catch (error) {
    console.error('Fehler beim Umschreiben:', error);
    // Fallback: Original zurückgeben
    return { title, summary };
  }
}

export async function rewriteFullArticle(content: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: REWRITE_PROMPT },
        {
          role: 'user',
          content: `Schreibe diesen Artikel komplett sachlich um:\n\n${content}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    return response.choices[0]?.message?.content || content;
  } catch (error) {
    console.error('Fehler beim Umschreiben des Artikels:', error);
    return content;
  }
}
