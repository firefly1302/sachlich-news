import { Redis } from '@upstash/redis';
import { NewsArticle } from './types';

// Lazy Redis client initialization - only create when env vars are available
let redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (redis) return redis;

  // Check if Redis env vars are available (only on Vercel runtime, not during build)
  if (process.env.REDIS_URL) {
    redis = Redis.fromEnv(); // Automatically reads REDIS_URL
    return redis;
  } else if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    return redis;
  }

  // No Redis available (e.g., during build or local dev without .env)
  console.warn('⚠️ Redis not configured - caching disabled');
  return null;
}

// Feed caching (15 Min TTL)
export async function getCachedFeed(category?: string): Promise<NewsArticle[] | null> {
  const client = getRedis();
  if (!client) return null; // Caching disabled

  try {
    const key = `feed:${category || 'all'}`;
    const cached = await client.get<NewsArticle[]>(key);
    return cached;
  } catch (error) {
    console.error('❌ Error getting cached feed:', error);
    return null;
  }
}

export async function setCachedFeed(articles: NewsArticle[], category?: string): Promise<void> {
  const client = getRedis();
  if (!client) return; // Caching disabled

  try {
    const key = `feed:${category || 'all'}`;
    await client.set(key, articles, { ex: 900 }); // 15 Min TTL
    console.log(`✅ Cached feed: ${key} (${articles.length} articles, 15 min TTL)`);
  } catch (error) {
    console.error('❌ Error setting cached feed:', error);
  }
}

// Article metadata caching (permanent)
export async function getCachedArticle(id: string): Promise<{
  meta: NewsArticle | null;
  content: string | null;
}> {
  const client = getRedis();
  if (!client) return { meta: null, content: null }; // Caching disabled

  try {
    const meta = await client.get<NewsArticle>(`article:${id}:meta`);
    const content = await client.get<string>(`article:${id}:content`);
    return { meta, content };
  } catch (error) {
    console.error('❌ Error getting cached article:', error);
    return { meta: null, content: null };
  }
}

export async function setCachedArticle(article: NewsArticle, content?: string): Promise<void> {
  const client = getRedis();
  if (!client) return; // Caching disabled

  try {
    await client.set(`article:${article.id}:meta`, article);
    if (content) {
      await client.set(`article:${article.id}:content`, content);
      console.log(`✅ Cached article: ${article.id} (with content)`);
    } else {
      console.log(`✅ Cached article metadata: ${article.id}`);
    }
  } catch (error) {
    console.error('❌ Error setting cached article:', error);
  }
}

// Headline caching (permanent)
export async function getCachedHeadline(originalTitle: string): Promise<{
  title: string;
  summary: string;
} | null> {
  const client = getRedis();
  if (!client) return null; // Caching disabled

  try {
    const hash = createHash(originalTitle);
    const cached = await client.get<{ title: string; summary: string }>(`headline:${hash}`);
    return cached;
  } catch (error) {
    console.error('❌ Error getting cached headline:', error);
    return null;
  }
}

export async function setCachedHeadline(
  originalTitle: string,
  rewritten: { title: string; summary: string }
): Promise<void> {
  const client = getRedis();
  if (!client) return; // Caching disabled

  try {
    const hash = createHash(originalTitle);
    await client.set(`headline:${hash}`, rewritten);
    console.log(`✅ Cached headline: ${hash.substring(0, 8)}...`);
  } catch (error) {
    console.error('❌ Error setting cached headline:', error);
  }
}

// Helper: Generate article ID from URL
export function generateArticleId(originalUrl: string): string {
  const hash = createHash(originalUrl).substring(0, 8);
  const timestamp = Date.now().toString(36);
  return `${hash}-${timestamp}`;
}

// Simple hash function for generating consistent cache keys
function createHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

// Helper: Ensure publishedAt is a string
export function ensureDateString(date: Date | string): string {
  return typeof date === 'string' ? date : date.toISOString();
}
