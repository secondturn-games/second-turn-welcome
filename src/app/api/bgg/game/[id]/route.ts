import { NextRequest, NextResponse } from 'next/server';
import { bggClient } from '@/lib/bgg/bgg-client';


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const fetchVersions = searchParams.get('versions') === 'true';

  if (!id) {
    return NextResponse.json(
      { error: 'Game ID is required' },
      { status: 400 }
    );
  }

  try {
    const game = await bggClient.getGameDetails(id);
    
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    let versions = null;
    if (fetchVersions) {
      const rawVersions = await bggClient.getGameVersions(id);
      if (rawVersions) {
        versions = rawVersions.map((v) => ({
          id: v.id,
          name: v.name?.value || 'N/A',
          year: v.yearpublished?.value || 'N/A',
          publisher:
            v.links?.find((l) => l.type === 'boardgamepublisher')?.value || '',
          thumbnail: v.thumbnail || '',
          image: v.image || '',
        }));
      }
    }

    return NextResponse.json({ game, versions });
  } catch (error) {
    console.error(`Error fetching game details for ID ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch game details' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
