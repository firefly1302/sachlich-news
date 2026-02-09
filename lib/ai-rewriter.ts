import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const REWRITE_PROMPT = `Du bist ein Redakteur für Sachlich.News - eine Nachrichtenseite die sachlich und ohne Dramatik informiert.

WICHTIGE REGEL: Die Leser wollen informiert sein über RELEVANTE News, aber NICHT emotional belastet werden durch dramatische Sprache.

Deine Aufgabe:
1. Entferne NUR die DRAMATIK, nicht die INFORMATION:
   - ❌ Entferne: "schockierend", "erschütternd", "tragisch", "Horror", "Drama", emotionale Übertreibungen
   - ✅ Behalte: Namen von öffentlichen Personen (Sportler, Politiker), konkrete Fakten, wichtige Details
   - ❌ Entferne: Sensible medizinische Details (Hormone, Geschlechtsorgane, grafische Verletzungsbeschreibungen)
   - ✅ Behalte: Allgemeine medizinische Fakten (Beinbruch, Operation, Behandlung)

2. Namen und Personen:
   - ✅ Behalte Namen bei: Sportler, Politiker, Prominente, öffentliche Personen
   - ❌ Entferne Namen bei: Opfern von Gewalt, Unfällen, medizinischen Fällen (außer bei Sportverletzungen)

3. Halte die Headline INFORMATIV und ERKENNBAR:
   - User müssen erkennen können, worum es geht
   - Vermeide zu abstrakte Formulierungen wie "Person erlebt Vorfall"
   - Nenne konkrete Fakten: Wer, Was, Wo

4. Schreibe auf Deutsch (Schweizer Hochdeutsch)

BEISPIELE:

Sport (Namen behalten):
❌ Original: "Vonns Sturz schockt Ski-Welt – nun sprechen ihr Team und ihr Papa"
✅ Sachlich: "Lindsey Vonn stürzt bei Olympia-Abfahrt in Cortina und erleidet Beinbruch"

Medizinische Details (zu sensibel):
❌ Original: "Imane Khelif bestätigt Hormonbehandlung zur Senkung des Testosteronspiegels vor Olympiade"
✅ Sachlich: "Boxerin äussert sich zu medizinischer Vorbereitung für Olympiade"

Gewalt (Namen und Details entfernen):
❌ Original: "Grausamer Mord an Familie Müller - Polizei findet drei Leichen mit Stichwunden"
✅ Sachlich: "Polizeieinsatz in Zürich nach Vorfall mit drei Todesopfern"

Politik (Drama entfernen, Inhalt behalten):
❌ Original: "Politiker platzt im Interview der Kragen - heftige Beleidigungen gegen Journalisten"
✅ Sachlich: "Bundesrat äussert sich kritisch zu Medienberichterstattung"`;

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

    // Prüfe ob Content zu kurz oder eine Fehlermeldung ist
    if (!content || content.length < 100) {
      console.warn('⚠️ Content too short, skipping rewrite');
      return 'Dieser Artikel konnte leider nicht geladen werden. Die Quelle ist möglicherweise durch eine Paywall geschützt oder vorübergehend nicht verfügbar.';
    }

    // Prüfe ob Content bereits eine Fehlermeldung ist
    if (content.includes('Fehler beim Laden') || content.includes('konnte nicht vollständig geladen werden')) {
      console.warn('⚠️ Content is error message, not rewriting');
      return content;
    }

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
    return 'Dieser Artikel konnte leider nicht umgeschrieben werden. Bitte versuchen Sie es später erneut.';
  }
}
