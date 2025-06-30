import { NextResponse } from 'next/server';
import { bggClient } from '@/lib/bgg/bgg-client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: 'Search query is required' },
      { status: 400 }
    );
  }

  try {
    const results = await bggClient.searchGames(query);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error searching BGG:', error);
    return NextResponse.json(
      { error: 'Failed to search BGG' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
