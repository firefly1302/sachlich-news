import Parser from 'rss-parser';
import { NewsArticle, NewsFeed } from './types';
import { NEWS_FEEDS } from './news-sources';

const parser = new Parser();

export async function fetchNewsFromFeed(feed: NewsFeed): Promise<NewsArticle[]> {
  try {
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
