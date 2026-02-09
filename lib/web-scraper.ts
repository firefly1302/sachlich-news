import axios from 'axios';
import * as cheerio from 'cheerio';
import { NewsArticle, NewsCategory } from './types';

// Filter-Funktion: Entfernt emotional belastende und irrelevante Artikel
export function shouldFilterArticle(title: string): boolean {
  const titleLower = title.toLowerCase();

  // 1. Nutzlose Inhalte (Bildstrecken, Comics, etc.)
  const uselessPatterns = [
    /bilder des tages/i,
    /bildstrecke/i,
    /galerie/i,
    /tägliche comics/i,
    /zeigt aktuelle ereignisse/i,
    /^(wetter|horoskop|comics|quiz)/i,
  ];

  // 2. Emotional belastende Einzelschicksale (KEINE gesellschaftliche Relevanz)
  const disturbingPatterns = [
    // Extreme Gewalt an Kindern
    /kindesmord/i,
    /kindesmissbrauch/i,
    /kind (stirbt|tot|verhungert|verdurstet|erstickt)/i,
    /baby (tot|stirbt|verhungert)/i,

    // Prozesse/Urteile zu Kindern und Gewalt
    /prozess.*(kind|kindes|jungen|mädchen)/i,
    /urteil.*(kind|kindes|jungen|mädchen)/i,
    /misshandlung.*(kind|kindes|jungen|mädchen|sohn|tochter)/i,
    /vernachlässigung.*(kind|kindes|sohn|tochter)/i,

    // Extreme Gewalt allgemein
    /folter/i,
    /brutal|grausam|verstümmelt/i,
    /missbraucht|vergewaltigt|misshandelt/i,

    // Familiendramen / Einzelschicksale
    /prozess (gegen|in).*(eltern|mutter|vater|paar)/i,
    /eltern (verurteilt|angeklagt).*wegen/i,
    /dämon|exorzismus/i,

    // Namen von Privatpersonen in Gewalt-Kontext
    // (Kevin, Nathalie etc. sind Privatpersonen, keine öffentlichen Figuren)
    /(kevin|nathalie|michael|sandra).*(verurteilt|angeklagt|getötet)/i,
  ];

  // 3. Prüfe auf nutzlose Inhalte
  for (const pattern of uselessPatterns) {
    if (pattern.test(titleLower)) {
      console.log(`⚠️ Gefiltert (nutzlos): ${title.substring(0, 60)}...`);
      return true;
    }
  }

  // 4. Prüfe auf belastende Einzelschicksale
  for (const pattern of disturbingPatterns) {
    if (pattern.test(titleLower)) {
      console.log(`⚠️ Gefiltert (belastend): ${title.substring(0, 60)}...`);
      return true;
    }
  }

  // Artikel ist OK
  return false;
}

// 12ft.io Paywall-Umgehung
async function bypassPaywall(url: string): Promise<string> {
  try {
    const bypassUrl = `https://12ft.io/${url}`;
    const response = await axios.get(bypassUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      timeout: 15000,
    });
    return response.data;
  } catch (error) {
    console.error('12ft.io failed, trying direct fetch:', error);
    // Fallback: Direkt versuchen
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      timeout: 15000,
    });
    return response.data;
  }
}

// Weltwoche Artikel scrapen
export async function scrapeWeltwoche(url: string): Promise<string> {
  try {
    const html = await bypassPaywall(url);
    const $ = cheerio.load(html);

    console.log('📄 Scraping Weltwoche:', url);

    // 12ft.io verwendet #readability-page-1 für den Hauptinhalt
    let content = '';

    // Primärer Selektor: 12ft.io Readability Container
    const readabilityContent = $('#readability-page-1').text().trim();
    if (readabilityContent && readabilityContent.length > 200) {
      console.log('✓ Found content via #readability-page-1:', readabilityContent.length, 'chars');
      return readabilityContent;
    }

    // Fallback: Versuche verschiedene Content-Selektoren für direkten Zugriff
    const selectors = [
      '.article-body p',
      '.article-content p',
      'article .text p',
      '.entry-content p',
      'article p',
    ];

    for (const selector of selectors) {
      const elements = $(selector);
      if (elements.length > 3) { // Mind. 3 Paragraphen
        elements.each((_, el) => {
          const text = $(el).text().trim();
          // Filtere Headlines und Metadaten aus
          if (text.length > 50 && !text.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
            content += text + '\n\n';
          }
        });
        if (content.length > 500) {
          console.log('✓ Found content via selector:', selector, '-', content.length, 'chars');
          break;
        }
      }
    }

    if (!content || content.length < 200) {
      console.warn('⚠️ Weltwoche content too short, might be paywall blocked');
      return 'Artikel konnte nicht vollständig geladen werden. Die Quelle ist möglicherweise durch eine Paywall geschützt.';
    }

    return content.trim();
  } catch (error) {
    console.error('❌ Fehler beim Scrapen von Weltwoche:', error);
    return 'Fehler beim Laden des Artikels.';
  }
}

// Nebelspalter Artikel scrapen
export async function scrapeNebelspalter(url: string): Promise<string> {
  try {
    const html = await bypassPaywall(url);
    const $ = cheerio.load(html);

    console.log('📄 Scraping Nebelspalter:', url);

    // 12ft.io verwendet #readability-page-1 für den Hauptinhalt
    const readabilityContent = $('#readability-page-1').text().trim();
    if (readabilityContent && readabilityContent.length > 200) {
      console.log('✓ Found content via #readability-page-1:', readabilityContent.length, 'chars');
      return readabilityContent;
    }

    // Fallback: Nebelspalter-spezifische Selektoren
    let content = '';
    const selectors = [
      '.post-content p',
      '.article-text p',
      '.entry-content p',
      'article p',
      '.text-content p',
    ];

    for (const selector of selectors) {
      const elements = $(selector);
      if (elements.length > 3) {
        elements.each((_, el) => {
          const text = $(el).text().trim();
          if (text.length > 50 && !text.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
            content += text + '\n\n';
          }
        });
        if (content.length > 500) {
          console.log('✓ Found content via selector:', selector, '-', content.length, 'chars');
          break;
        }
      }
    }

    if (!content || content.length < 200) {
      console.warn('⚠️ Nebelspalter content too short');
      return 'Artikel konnte nicht vollständig geladen werden. Die Quelle ist möglicherweise durch eine Paywall geschützt.';
    }

    return content.trim();
  } catch (error) {
    console.error('❌ Fehler beim Scrapen von Nebelspalter:', error);
    return 'Fehler beim Laden des Artikels.';
  }
}

// Generischer Scraper für beliebige URLs
export async function scrapeArticle(url: string): Promise<string> {
  if (url.includes('weltwoche')) {
    return scrapeWeltwoche(url);
  } else if (url.includes('nebelspalter')) {
    return scrapeNebelspalter(url);
  }

  // Generischer Scraper für alle anderen Schweizer News-Seiten
  try {
    console.log('📄 Scraping article:', url);

    // Für Paywall-Seiten: 12ft.io verwenden, sonst direkt
    const useBypass = url.includes('nzz.ch') || url.includes('weltwoche') || url.includes('nebelspalter');
    const html = useBypass ? await bypassPaywall(url) : await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      timeout: 15000,
    }).then(res => res.data);

    const $ = cheerio.load(html);

    // Priorisiere #readability-page-1 für 12ft.io
    if (useBypass) {
      const readabilityContent = $('#readability-page-1').text().trim();
      if (readabilityContent && readabilityContent.length > 200) {
        console.log('✓ Found content via #readability-page-1:', readabilityContent.length, 'chars');
        return readabilityContent;
      }
    }

    let content = '';

    // Erweiterte Selektoren für verschiedene Schweizer News-Seiten
    const selectors = [
      // SRF
      'article .article-content p',
      '.article__lead',
      '.article__text p',
      // Blick
      '.article__body p',
      '.article-text p',
      '.post-content p',
      // NZZ
      '.article__body p',
      '.articlebody p',
      // Infosperber
      '.entry-content p',
      '.article-text p',
      // Zeitpunkt
      '.field--name-body p',
      '.article-body p',
      // Schweizer Monat
      '.entry-content p',
      '.post-content p',
      // Generisch
      'article p',
      '.content p',
      'main p',
    ];

    for (const selector of selectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        elements.each((_, el) => {
          const text = $(el).text().trim();
          // Filtere kurze Texte, Metadaten und Datum aus
          if (text.length > 50 && !text.includes('©') && !text.includes('Quelle:') && !text.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
            content += text + '\n\n';
          }
        });
        if (content.length > 500) {
          console.log('✓ Found content via selector:', selector, '-', content.length, 'chars');
          break;
        }
      }
    }

    if (!content || content.length < 200) {
      console.warn('⚠️ Content too short or not found');
      return 'Dieser Artikel konnte nicht vollständig geladen werden. Die Quelle ist möglicherweise durch eine Paywall geschützt oder verwendet eine nicht unterstützte Struktur.';
    }

    return content.trim();
  } catch (error) {
    console.error('Fehler beim Scrapen:', error);
    return 'Fehler beim Laden des Artikels. Die Quelle ist möglicherweise nicht verfügbar.';
  }
}

// Weltwoche Homepage scrapen für Headlines
export async function scrapeWeltwocheHeadlines(): Promise<NewsArticle[]> {
  try {
    const response = await axios.get('https://weltwoche.ch/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const articles: NewsArticle[] = [];
    const seenUrls = new Set<string>();

    // Weltwoche verwendet /daily/ Links für aktuelle Artikel
    $('a[href*="/daily/"]').each((index, el) => {
      const $el = $(el);
      const title = $el.text().trim();
      const href = $el.attr('href') || '';

      // Filter: Nur relevante, nicht-belastende Artikel
      if (title.length > 30 && title.length < 200 && href && !shouldFilterArticle(title)) {
        const fullUrl = href.startsWith('http') ? href : `https://weltwoche.ch${href}`;

        if (!seenUrls.has(fullUrl)) {
          seenUrls.add(fullUrl);
          articles.push({
            id: `weltwoche-${Date.now()}-${articles.length}`,
            title,
            summary: title,
            category: 'alternativ',
            source: 'Weltwoche',
            publishedAt: new Date(),
            originalUrl: fullUrl,
          });
        }
      }
    });

    // Weltwoche hat keine IDs, aber Homepage ist bereits sortiert
    // Behalte die Reihenfolge bei (neueste zuerst auf Homepage)
    console.log(`Weltwoche: ${articles.length} Artikel gefunden`);
    return articles.slice(0, 10); // Max 10 Artikel (bereits sortiert)
  } catch (error) {
    console.error('Fehler beim Scrapen von Weltwoche Headlines:', error);
    return [];
  }
}

// Nebelspalter Homepage scrapen für Headlines
export async function scrapeNebelspalterHeadlines(): Promise<NewsArticle[]> {
  try {
    const response = await axios.get('https://www.nebelspalter.ch/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const articles: NewsArticle[] = [];
    const seenUrls = new Set<string>();

    // Nebelspalter Artikel-URLs haben das Pattern /themen/YYYY/MM/...
    $('a').each((index, el) => {
      const $el = $(el);
      const href = $el.attr('href') || '';

      // Prüfe auf Artikel-URL Pattern (Jahr/Monat)
      if (href.match(/\/themen\/\d{4}\/\d{2}\//)) {
        const title = $el.text().trim();

        // Fallback: Wenn kein Text, suche im Eltern-Element
        const finalTitle = title.length > 20 ? title : $el.closest('article, div').find('h1, h2, h3, h4').first().text().trim();

        // Filter: Nur relevante, nicht-belastende Artikel
        if (finalTitle && finalTitle.length > 20 && finalTitle.length < 200 && !shouldFilterArticle(finalTitle)) {
          const fullUrl = href.startsWith('http') ? href : `https://www.nebelspalter.ch${href}`;

          if (!seenUrls.has(fullUrl)) {
            seenUrls.add(fullUrl);
            articles.push({
              id: `nebelspalter-${Date.now()}-${articles.length}`,
              title: finalTitle,
              summary: finalTitle,
              category: 'alternativ',
              source: 'Nebelspalter',
              publishedAt: new Date(),
              originalUrl: fullUrl,
            });
          }
        }
      }
    });

    // Nebelspalter hat Datum im URL-Pattern /themen/YYYY/MM/DD/
    // Sortiere nach URL (neuere Daten zuerst)
    articles.sort((a, b) => {
      const dateA = a.originalUrl.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
      const dateB = b.originalUrl.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
      if (dateA && dateB) {
        const timestampA = new Date(`${dateA[1]}-${dateA[2]}-${dateA[3]}`).getTime();
        const timestampB = new Date(`${dateB[1]}-${dateB[2]}-${dateB[3]}`).getTime();
        return timestampB - timestampA; // Neueste zuerst
      }
      return 0;
    });

    console.log(`Nebelspalter: ${articles.length} Artikel gefunden, sortiert nach Datum`);
    return articles.slice(0, 10); // Max 10 neueste Artikel
  } catch (error) {
    console.error('Fehler beim Scrapen von Nebelspalter Headlines:', error);
    return [];
  }
}

// Blick Homepage scrapen für Headlines (da RSS blockiert ist)
export async function scrapeBlickHeadlines(section: string, category: NewsCategory): Promise<NewsArticle[]> {
  try {
    // Blick Kategorien-URLs
    const urls: Record<string, string> = {
      'zuerich': 'https://www.blick.ch/schweiz/zuerich/',
      'schweiz': 'https://www.blick.ch/schweiz/',
      'politik': 'https://www.blick.ch/politik/',
      'wirtschaft': 'https://www.blick.ch/wirtschaft/',
      'ausland': 'https://www.blick.ch/ausland/',
      'people': 'https://www.blick.ch/people-tv/',
      'life': 'https://www.blick.ch/life/',
      'sport': 'https://www.blick.ch/sport/',
    };

    const url = urls[section] || 'https://www.blick.ch/';

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const articles: NewsArticle[] = [];
    const seenUrls = new Set<string>();

    // Blick verwendet article-Links
    $('a[href*="/story/"], a[href*="blick.ch"]').each((index, el) => {
      const $el = $(el);
      const href = $el.attr('href') || '';

      // Finde Titel
      let title = $el.text().trim();
      if (!title || title.length < 20) {
        title = $el.find('h1, h2, h3, h4').first().text().trim();
      }
      if (!title || title.length < 20) {
        title = $el.closest('article, div').find('h1, h2, h3, h4').first().text().trim();
      }

      // Filter: Nur richtige Artikel
      if (title && title.length > 20 && title.length < 200 && href) {
        const fullUrl = href.startsWith('http') ? href : `https://www.blick.ch${href}`;

        if (!seenUrls.has(fullUrl) && (fullUrl.includes('blick.ch') && !fullUrl.includes('/rss.xml'))) {
          seenUrls.add(fullUrl);
          articles.push({
            id: `blick-${Date.now()}-${articles.length}`,
            title,
            summary: title,
            category: category,
            source: 'Blick',
            publishedAt: new Date(),
            originalUrl: fullUrl,
          });
        }
      }
    });

    console.log(`Blick (${section}): ${articles.length} Artikel gefunden`);
    return articles.slice(0, 10); // Max 10 Artikel
  } catch (error) {
    console.error(`Fehler beim Scrapen von Blick (${section}):`, error);
    return [];
  }
}

// 20 Minuten Homepage scrapen für Headlines
export async function scrape20MinHeadlines(section: string, category: NewsCategory): Promise<NewsArticle[]> {
  try {
    // 20min Kategorien-URLs
    const urls: Record<string, string> = {
      'zuerich': 'https://www.20min.ch/de/zuerich',
      'schweiz': 'https://www.20min.ch/de/schweiz',
      'ausland': 'https://www.20min.ch/de/ausland',
      'people': 'https://www.20min.ch/de/people',
    };

    const url = urls[section] || 'https://www.20min.ch/de';

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const articles: NewsArticle[] = [];
    const seenUrls = new Set<string>();

    // 20min verwendet verschiedene Link-Strukturen
    // Hauptartikel: /story/...
    $('a[href*="/story/"]').each((index, el) => {
      const $el = $(el);
      const href = $el.attr('href') || '';

      // Finde Titel - entweder im Link-Text oder in Heading-Tags
      let title = $el.text().trim();
      if (!title || title.length < 20) {
        title = $el.find('h1, h2, h3, h4').first().text().trim();
      }
      if (!title || title.length < 20) {
        title = $el.closest('article, div').find('h1, h2, h3, h4').first().text().trim();
      }

      // Filter: Nur relevante, nicht-belastende Artikel
      if (title && title.length > 30 && title.length < 200 && href && !shouldFilterArticle(title)) {
        const fullUrl = href.startsWith('http') ? href : `https://www.20min.ch${href}`;

        if (!seenUrls.has(fullUrl) && fullUrl.includes('/story/')) {
          seenUrls.add(fullUrl);
          articles.push({
            id: `20min-${Date.now()}-${articles.length}`,
            title,
            summary: title,
            category: category,
            source: '20 Minuten',
            publishedAt: new Date(),
            originalUrl: fullUrl,
          });
        }
      }
    });

    // Sortiere nach Story-ID (höhere ID = neuer)
    articles.sort((a, b) => {
      const idA = parseInt(a.originalUrl.match(/-(\d+)$/)?.[1] || '0');
      const idB = parseInt(b.originalUrl.match(/-(\d+)$/)?.[1] || '0');
      return idB - idA; // Neueste zuerst
    });

    console.log(`20 Minuten (${section}): ${articles.length} Artikel gefunden, sortiert nach Story-ID`);
    return articles.slice(0, 10); // Max 10 neueste Artikel
  } catch (error) {
    console.error(`Fehler beim Scrapen von 20min (${section}):`, error);
    return [];
  }
}
