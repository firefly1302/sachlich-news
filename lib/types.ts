export type NewsCategory = 'people' | 'zuerich' | 'schweiz' | 'international';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: NewsCategory;
  source: string;
  publishedAt: Date;
  originalUrl: string;
  imageUrl?: string;
  fullContent?: string;
  rewrittenContent?: string;
}

export interface NewsFeed {
  url: string;
  category: NewsCategory;
  name: string;
}
