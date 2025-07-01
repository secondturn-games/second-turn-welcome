import { NextRequest, NextResponse } from 'next/server';
import { bggClient } from '@/lib/bgg/bgg-client';
import { parseStringPromise } from 'xml2js';

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
      const response = await fetch(`https://boardgamegeek.com/xmlapi2/thing?id=${id}&versions=1`);
      const xml = await response.text();
      const parsed = await parseStringPromise(xml);
      const item = parsed.items?.item?.[0];
      if (item && item.versions?.[0]?.item) {
        versions = item.versions[0].item.map((v: any) => ({
          id: v.$.id,
          name: v.name?.[0]?.$?.value || 'N/A',
          year: v.yearpublished?.[0]?.$?.value || 'N/A',
          publisher: v.link?.find((l: any) => l.$.type === 'boardgamepublisher')?.$.value || '',
          thumbnail: v.thumbnail?.[0] || '',
          image: v.image?.[0] || '',
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
