import axios from 'axios';
import * as cheerio from 'cheerio';
import { NewsArticle } from './types';

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

    // Weltwoche-spezifische Selektoren
    let content = '';

    // Versuche verschiedene Content-Selektoren
    const selectors = [
      'article .article-content',
      '.article-body',
      '.entry-content',
      'article p',
      '.content p',
    ];

    for (const selector of selectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        elements.each((_, el) => {
          const text = $(el).text().trim();
          if (text.length > 30) {
            content += text + '\n\n';
          }
        });
        if (content.length > 100) break;
      }
    }

    return content.trim() || 'Artikel konnte nicht vollständig geladen werden.';
  } catch (error) {
    console.error('Fehler beim Scrapen von Weltwoche:', error);
    return 'Fehler beim Laden des Artikels.';
  }
}

// Nebelspalter Artikel scrapen
export async function scrapeNebelspalter(url: string): Promise<string> {
  try {
    const html = await bypassPaywall(url);
    const $ = cheerio.load(html);

    let content = '';

    // Nebelspalter-spezifische Selektoren
    const selectors = [
      'article .article-text',
      '.post-content',
      '.entry-content',
      'article p',
      '.text-content p',
    ];

    for (const selector of selectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        elements.each((_, el) => {
          const text = $(el).text().trim();
          if (text.length > 30) {
            content += text + '\n\n';
          }
        });
        if (content.length > 100) break;
      }
    }

    return content.trim() || 'Artikel konnte nicht vollständig geladen werden.';
  } catch (error) {
    console.error('Fehler beim Scrapen von Nebelspalter:', error);
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
    // Für Paywall-Seiten: 12ft.io verwenden, sonst direkt
    const useBypass = url.includes('nzz.ch') || url.includes('weltwoche') || url.includes('nebelspalter');
    const html = useBypass ? await bypassPaywall(url) : await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      timeout: 15000,
    }).then(res => res.data);

    const $ = cheerio.load(html);

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
          // Filtere kurze Texte und Metadaten aus
          if (text.length > 50 && !text.includes('©') && !text.includes('Quelle:')) {
            content += text + '\n\n';
          }
        });
        if (content.length > 300) break; // Genug Content gefunden
      }
    }

    return content.trim() || 'Artikel konnte nicht vollständig geladen werden. Möglicherweise blockiert die Website das automatische Laden.';
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

      // Filter: Nur richtige Artikel (mindestens 30 Zeichen Titel)
      if (title.length > 30 && title.length < 200 && href) {
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

    console.log(`Weltwoche: ${articles.length} Artikel gefunden`);
    return articles.slice(0, 10); // Max 10 Artikel
  } catch (error) {
    console.error('Fehler beim Scrapen von Weltwoche Headlines:', error);
    return [];
  }
}

// Nebelspalter Homepage scrapen für Headlines
export async function scrapeNebelspalterHeadlines(): Promise<NewsArticle[]> {
  try {
    // Verwende die Themen-Seite mit Artikelliste
    const response = await axios.get('https://www.nebelspalter.ch/themen/alle-themen', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const articles: NewsArticle[] = [];
    const seenUrls = new Set<string>();

    // Suche alle Links die zu Artikeln führen
    $('a').each((index, el) => {
      const $el = $(el);
      const title = $el.text().trim();
      const href = $el.attr('href') || '';

      // Nebelspalter Artikel haben meist längere Titel
      if (title.length > 30 && title.length < 200 && href.includes('/themen/')) {
        const fullUrl = href.startsWith('http') ? href : `https://www.nebelspalter.ch${href}`;

        if (!seenUrls.has(fullUrl) && !fullUrl.includes('?filter=')) {
          seenUrls.add(fullUrl);
          articles.push({
            id: `nebelspalter-${Date.now()}-${articles.length}`,
            title,
            summary: title,
            category: 'alternativ',
            source: 'Nebelspalter',
            publishedAt: new Date(),
            originalUrl: fullUrl,
          });
        }
      }
    });

    console.log(`Nebelspalter: ${articles.length} Artikel gefunden`);
    return articles.slice(0, 10); // Max 10 Artikel
  } catch (error) {
    console.error('Fehler beim Scrapen von Nebelspalter Headlines:', error);
    return [];
  }
}
