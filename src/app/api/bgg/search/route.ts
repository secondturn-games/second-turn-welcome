import { NextResponse } from 'next/server';
import { boardgameService } from '@/lib/boardgame-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');


  if (!query) {
    return NextResponse.json(
      { error: 'Search query is required' },
      { status: 400 }
    );
  }

  try {
    const results = await boardgameService.search({ query });
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in board game search API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search results' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
