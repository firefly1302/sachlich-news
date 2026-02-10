import Parser from 'rss-parser';
import { NewsArticle, NewsFeed } from './types';
import { NEWS_FEEDS } from './news-sources';
import {
  scrapeWeltwocheHeadlines,
  scrapeNebelspalterHeadlines,
  scrape20MinHeadlines,
  scrapeBlickHeadlines,
  shouldFilterArticle
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

    // Sortiere RSS Items nach Datum (neueste zuerst)
    const sortedItems = (rssFeed.items || []).sort((a, b) => {
      const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return dateB - dateA; // Neueste zuerst
    });

    // Filtere belastende/irrelevante Artikel raus
    const filteredItems = sortedItems.filter(item => {
      const title = item.title || '';
      return !shouldFilterArticle(title);
    });

    const articles: NewsArticle[] = filteredItems.slice(0, 10).map((item, index) => {
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
  console.log(`🚀 Fetching ${NEWS_FEEDS.length} feeds in PARALLEL...`);
  const startTime = Date.now();

  // PARALLEL fetching with Promise.allSettled (ein Fehler stoppt andere nicht)
  const results = await Promise.allSettled(
    NEWS_FEEDS.map(feed => fetchNewsFromFeed(feed))
  );

  // Sammle alle erfolgreichen Ergebnisse
  const allArticles: NewsArticle[] = [];
  let successCount = 0;
  let failureCount = 0;

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      allArticles.push(...result.value);
      successCount++;
    } else {
      failureCount++;
      console.error(`❌ Feed ${NEWS_FEEDS[index].name} failed:`, result.reason?.message || 'Unknown error');
    }
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✅ Parallel fetch completed in ${elapsed}s (${successCount} success, ${failureCount} failed)`);

  // Sortiere nach Datum (neueste zuerst)
  allArticles.sort((a, b) => {
    const dateA = typeof a.publishedAt === 'string' ? new Date(a.publishedAt) : a.publishedAt;
    const dateB = typeof b.publishedAt === 'string' ? new Date(b.publishedAt) : b.publishedAt;
    return dateB.getTime() - dateA.getTime();
  });

  return allArticles;
}

export async function fetchNewsByCategory(category: string): Promise<NewsArticle[]> {
  const categoryFeeds = NEWS_FEEDS.filter(feed => feed.category === category);
  console.log(`🚀 Fetching ${categoryFeeds.length} feeds for category '${category}' in PARALLEL...`);
  const startTime = Date.now();

  // PARALLEL fetching with Promise.allSettled
  const results = await Promise.allSettled(
    categoryFeeds.map(feed => fetchNewsFromFeed(feed))
  );

  // Sammle alle erfolgreichen Ergebnisse
  const allArticles: NewsArticle[] = [];
  let successCount = 0;
  let failureCount = 0;

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      allArticles.push(...result.value);
      successCount++;
    } else {
      failureCount++;
      console.error(`❌ Feed ${categoryFeeds[index].name} failed:`, result.reason?.message || 'Unknown error');
    }
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✅ Parallel fetch completed in ${elapsed}s (${successCount} success, ${failureCount} failed)`);

  allArticles.sort((a, b) => {
    const dateA = typeof a.publishedAt === 'string' ? new Date(a.publishedAt) : a.publishedAt;
    const dateB = typeof b.publishedAt === 'string' ? new Date(b.publishedAt) : b.publishedAt;
    return dateB.getTime() - dateA.getTime();
  });

  return allArticles;
}
