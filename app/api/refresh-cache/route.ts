import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Redis client mit lazy init
function getRedis(): Redis | null {
  if (!process.env.REDIS_URL && !process.env.UPSTASH_REDIS_REST_URL) {
    return null;
  }

  if (process.env.REDIS_URL) {
    return Redis.fromEnv();
  } else if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  return null;
}

export async function POST() {
  try {
    const redis = getRedis();

    if (!redis) {
      return NextResponse.json(
        { error: 'Redis not configured' },
        { status: 500 }
      );
    }

    // Lösche alle Feed-Caches (feed:all, feed:zuerich, etc.)
    const keys = await redis.keys('feed:*');

    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`🗑️ Cache geleert: ${keys.length} Feed-Caches gelöscht`);
    }

    return NextResponse.json({
      success: true,
      message: `${keys.length} Feed-Caches gelöscht`,
      cleared: keys,
    });
  } catch (error) {
    console.error('❌ Fehler beim Cache leeren:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
