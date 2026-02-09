import Parser from 'rss-parser';
import { NewsArticle, NewsFeed } from './types';
import { NEWS_FEEDS } from './news-sources';
import {
  scrapeWeltwocheHeadlines,
  scrapeNebelspalterHeadlines,
  scrape20MinHeadlines,
  scrapeBlickHeadlines
} from './web-scraper';

const parser = new Parser();

export async function fetchNewsFromFeed(feed: NewsFeed): Promise<NewsArticle[]> {
  try {
    // Web-Scraping für Blick, Weltwoche, Nebelspalter und 20min
    if (feed.url.startsWith('SCRAPE:')) {
      const source = feed.url.replace('SCRAPE:', '');

      if (source === 'weltwoche') {
        return await scrapeWeltwocheHeadlines();
      } else if (source === 'nebelspalter') {
        return await scrapeNebelspalterHeadlines();
      } else if (source.startsWith('20min-')) {
        const category = source.replace('20min-', '');
        return await scrape20MinHeadlines(category, feed.category as any);
      } else if (source.startsWith('blick-')) {
        const category = source.replace('blick-', '');
        return await scrapeBlickHeadlines(category, feed.category as any);
      }

      return [];
    }

    // Normales RSS-Fetching
    const rssFeed = await parser.parseURL(feed.url);

    const articles: NewsArticle[] = (rssFeed.items || []).slice(0, 10).map((item, index) => {
      const id = `${feed.category}-${Date.now()}-${index}`;

      return {
        id,
        title: item.title || 'Kein Titel',
        summary: item.contentSnippet || item.description || '',
        category: feed.category,
        source: feed.name,
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        originalUrl: item.link || '',
        imageUrl: item.enclosure?.url || undefined,
      };
    });

    return articles;
  } catch (error) {
    console.error(`Fehler beim Laden von ${feed.name}:`, error);
    return [];
  }
}

export async function fetchAllNews(): Promise<NewsArticle[]> {
  const allArticles: NewsArticle[] = [];

  for (const feed of NEWS_FEEDS) {
    const articles = await fetchNewsFromFeed(feed);
    allArticles.push(...articles);
  }

  // Sortiere nach Datum (neueste zuerst)
  allArticles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  return allArticles;
}

export async function fetchNewsByCategory(category: string): Promise<NewsArticle[]> {
  const categoryFeeds = NEWS_FEEDS.filter(feed => feed.category === category);
  const allArticles: NewsArticle[] = [];

  for (const feed of categoryFeeds) {
    const articles = await fetchNewsFromFeed(feed);
    allArticles.push(...articles);
  }

  allArticles.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  return allArticles;
}
