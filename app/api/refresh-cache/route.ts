import { NextResponse } from 'next/server';
import { getRedis } from '@/lib/cache';

export async function POST() {
  try {
    const redis = getRedis();

    if (!redis) {
      return NextResponse.json(
        { error: 'Redis not configured' },
        { status: 500 }
      );
    }

    // Bekannte Feed-Cache Keys gezielt löschen (statt KEYS-Befehl)
    const feedKeys = [
      'feed:all',
      'feed:zuerich',
      'feed:schweiz',
      'feed:international',
      'feed:people',
      'feed:alternativ',
    ];

    const deleted = await redis.del(...feedKeys);
    console.log(`🗑️ Cache geleert: ${deleted} Feed-Caches gelöscht`);

    return NextResponse.json({
      success: true,
      message: `${deleted} Feed-Caches gelöscht`,
      cleared: feedKeys,
    });
  } catch (error) {
    console.error('❌ Fehler beim Cache leeren:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
