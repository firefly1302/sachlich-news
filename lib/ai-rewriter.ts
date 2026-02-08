import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const REWRITE_PROMPT = `Du bist ein Redakteur für Sachlich.News - eine Nachrichtenseite die sachlich und ohne Dramatik informiert.

WICHTIGE REGEL: Die Leser wollen informiert sein, aber NICHT emotional belastet werden durch sensationelle oder kontroverse Details.

Deine Aufgabe:
1. Schreibe die News EXTREM sachlich um - entferne:
   - Emotionale Sprache, Drama und Sensationalismus
   - Dramatische Worte wie "schockierend", "erschütternd", "tragisch", "Horror"
   - Sensible medizinische/persönliche Details (Hormone, Geschlecht, Krankheiten, etc.)
   - Kontroverse Aussagen oder Zitate die polarisieren
   - Unnötige Details die nur schockieren oder provozieren sollen

2. Fokussiere auf das WESENTLICHE:
   - Wer macht was?
   - Was ist die relevante Information für die Allgemeinheit?
   - Halte den Titel so allgemein wie möglich, aber trotzdem informativ

3. Bei sensiblen Themen (Gewalt, Medizin, Politik, Personen):
   - Reduziere auf absolutes Minimum
   - Keine Details zu Personen, Verletzungen, medizinischen Eingriffen
   - Fokus auf das übergeordnete Ereignis, nicht auf Details

4. Schreibe auf Deutsch (Schweizer Hochdeutsch)

BEISPIELE:
❌ "Imane Khelif bestätigt Hormonbehandlung zur Senkung des Testosteronspiegels vor Olympiade"
✅ "Boxerin kommentiert medizinische Vorbereitung für Olympiade"

❌ "Grausamer Mord an Familie in Zürich - Polizei findet drei Leichen"
✅ "Polizeieinsatz in Zürich nach Vorfall mit Todesfolge"

❌ "Politiker platzt im Interview der Kragen - heftige Beleidigungen"
✅ "Interview mit Politiker führt zu kontroversen Äusserungen"`;

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
      temperature: 0.3,
      max_tokens: 400,
    });

    const result = response.choices[0]?.message?.content || '';

    console.log('=== AI Rewriting Debug ===');
    console.log('Original Title:', title);
    console.log('AI Response:', result);

    // Erweiterte Regex-Patterns für flexibleres Parsing
    const titleMatch = result.match(/(?:SACHLICHER TITEL|Sachlicher Titel|Titel):\s*(.+?)(?:\n|$)/i);
    const summaryMatch = result.match(/(?:SACHLICHE ZUSAMMENFASSUNG|Sachliche Zusammenfassung|Zusammenfassung):\s*(.+?)(?:\n\n|$)/is);

    const rewrittenTitle = titleMatch?.[1]?.trim();
    const rewrittenSummary = summaryMatch?.[1]?.trim();

    // Wenn Parsing fehlschlägt, versuche gesamten Text zu verwenden
    if (!rewrittenTitle || !rewrittenSummary) {
      console.warn('⚠️ AI Response Format konnte nicht geparst werden. Verwende Fallback.');
      const lines = result.split('\n').filter(l => l.trim());

      return {
        title: rewrittenTitle || lines[0] || title,
        summary: rewrittenSummary || lines.slice(1).join(' ') || summary,
      };
    }

    console.log('✓ Rewritten Title:', rewrittenTitle);
    console.log('========================\n');

    return {
      title: rewrittenTitle,
      summary: rewrittenSummary,
    };
  } catch (error) {
    console.error('❌ FEHLER beim Umschreiben:', error);
    if (error instanceof Error) {
      console.error('Error Details:', error.message);
    }
    // Fallback: Original zurückgeben
    return { title, summary };
  }
}

export async function rewriteFullArticle(content: string): Promise<string> {
  try {
    console.log('=== Full Article Rewriting ===');
    console.log('Content Length:', content.length);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: REWRITE_PROMPT },
        {
          role: 'user',
          content: `Schreibe diesen Artikel komplett sachlich um. Behalte alle wichtigen Informationen bei, aber entferne dramatische Sprache:\n\n${content}`
        }
      ],
      temperature: 0.3,
      max_tokens: 2500,
    });

    const rewritten = response.choices[0]?.message?.content || content;
    console.log('✓ Article rewritten, new length:', rewritten.length);
    console.log('==============================\n');

    return rewritten;
  } catch (error) {
    console.error('❌ FEHLER beim Umschreiben des Artikels:', error);
    if (error instanceof Error) {
      console.error('Error Details:', error.message);
    }
    return content;
  }
}
