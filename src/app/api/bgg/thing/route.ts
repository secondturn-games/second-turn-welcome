import { NextResponse } from 'next/server';
import { bggClient } from '@/lib/bgg/bgg-client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Game ID is required' },
      { status: 400 }
    );
  }

  try {
    const gameDetails = await bggClient.getGameDetails(id);
    if (!gameDetails) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    return NextResponse.json(gameDetails);
  } catch (error) {
    console.error(`Error fetching details for BGG thing ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch game details from BGG' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
