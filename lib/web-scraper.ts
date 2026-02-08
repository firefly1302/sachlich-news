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

  // Generischer Fallback
  try {
    const html = await bypassPaywall(url);
    const $ = cheerio.load(html);

    let content = '';
    $('article p, .article-content p, .entry-content p').each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 30) {
        content += text + '\n\n';
      }
    });

    return content.trim() || 'Artikel konnte nicht vollständig geladen werden.';
  } catch (error) {
    console.error('Fehler beim Scrapen:', error);
    return 'Fehler beim Laden des Artikels.';
  }
}

// Weltwoche Homepage scrapen für Headlines
export async function scrapeWeltwocheHeadlines(): Promise<NewsArticle[]> {
  try {
    const response = await axios.get('https://weltwoche.ch/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const articles: NewsArticle[] = [];

    // Suche nach Artikel-Links und Titeln
    $('article, .article-item, .post').slice(0, 10).each((index, el) => {
      const $el = $(el);
      const title = $el.find('h2, h3, .title, .article-title').first().text().trim();
      const link = $el.find('a').first().attr('href');
      const summary = $el.find('.excerpt, .summary, p').first().text().trim();

      if (title && link) {
        const fullUrl = link.startsWith('http') ? link : `https://weltwoche.ch${link}`;
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
    });

    return articles;
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
      },
      timeout: 15000,
    });

    const $ = cheerio.load(response.data);
    const articles: NewsArticle[] = [];

    // Suche nach Artikel-Links
    $('article, .article, .post-item').slice(0, 10).each((index, el) => {
      const $el = $(el);
      const title = $el.find('h2, h3, .title').first().text().trim();
      const link = $el.find('a').first().attr('href');
      const summary = $el.find('.excerpt, .teaser, p').first().text().trim();

      if (title && link) {
        const fullUrl = link.startsWith('http') ? link : `https://www.nebelspalter.ch${link}`;
        articles.push({
          id: `nebelspalter-${Date.now()}-${index}`,
          title,
          summary: summary || title,
          category: 'alternativ',
          source: 'Nebelspalter',
          publishedAt: new Date(),
          originalUrl: fullUrl,
        });
      }
    });

    return articles;
  } catch (error) {
    console.error('Fehler beim Scrapen von Nebelspalter Headlines:', error);
    return [];
  }
}
