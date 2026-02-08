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
    const response = await axios.get('https://weltwoche.ch/ausgabe/aktuelle-ausgabe/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const articles: NewsArticle[] = [];

    // Erweiterte Selektoren für Weltwoche
    $('article, .teaser, .post-item, h2 a, h3 a').slice(0, 15).each((index, el) => {
      const $el = $(el);
      let title = '';
      let link = '';
      let summary = '';

      if ($el.is('a')) {
        // Link-Element
        title = $el.text().trim();
        link = $el.attr('href') || '';
      } else {
        // Article/Teaser-Element
        title = $el.find('h2, h3, .title, .headline').first().text().trim();
        link = $el.find('a').first().attr('href') || '';
        summary = $el.find('.excerpt, .summary, .teaser-text, p').first().text().trim();
      }

      if (title && link && title.length > 10) {
        const fullUrl = link.startsWith('http') ? link : `https://weltwoche.ch${link}`;

        // Verhindere Duplikate
        if (!articles.some(a => a.originalUrl === fullUrl)) {
          articles.push({
            id: `weltwoche-${Date.now()}-${index}`,
            title,
            summary: summary || title,
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
    const response = await axios.get('https://www.nebelspalter.ch/themen/politik', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const articles: NewsArticle[] = [];

    // Erweiterte Selektoren für Nebelspalter
    $('a[href*="/themen/"], h2 a, h3 a, .article-link').slice(0, 15).each((index, el) => {
      const $el = $(el);
      const title = $el.text().trim() || $el.find('h2, h3').text().trim();
      const link = $el.attr('href') || $el.find('a').first().attr('href') || '';

      if (title && link && title.length > 10 && link.includes('/themen/')) {
        const fullUrl = link.startsWith('http') ? link : `https://www.nebelspalter.ch${link}`;

        // Verhindere Duplikate
        if (!articles.some(a => a.originalUrl === fullUrl)) {
          articles.push({
            id: `nebelspalter-${Date.now()}-${index}`,
            title,
            summary: title, // Kein Summary verfügbar
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
