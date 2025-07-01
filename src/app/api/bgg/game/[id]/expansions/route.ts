import { NextRequest, NextResponse } from 'next/server';
import { bggClient } from '@/lib/bgg/bgg-client';

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  if (!id) {
    return NextResponse.json(
      { error: 'Game ID is required' },
      { status: 400 }
    );
  }

  try {
    const expansions = await bggClient.getExpansionsForGame(id);
    return NextResponse.json({ expansions });
  } catch (error) {
    console.error(`Error fetching expansions for game ID ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch expansions' },
      { status: 500 }
    );
  }
}
