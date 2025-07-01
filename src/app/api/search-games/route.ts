import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import Papa from 'papaparse';

// Define the structure of a game from the CSV
interface GameFromCSV {
  id: string;
  name: string;
  yearpublished: string;
  rank: string;
  average: string;
  is_expansion: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), 'src', 'boardgames_ranks.csv');

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    const parseResult = Papa.parse<GameFromCSV>(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: header => header.trim().toLowerCase(),
    });

    if (parseResult.errors.length > 0) {
      console.error('CSV parsing errors:', parseResult.errors);
    }

    const allGames = parseResult.data.filter(game => game.id && game.name);

    const queryLower = query.toLowerCase();

    const filteredResults = allGames.filter(game => 
      (game.name.toLowerCase().includes(queryLower)) ||
      (game.id.toString() === query)
    );

    const processedResults = filteredResults.map(game => ({
      id: game.id,
      name: game.name,
      yearPublished: parseInt(game.yearpublished, 10) || null,
      bggRank: parseInt(game.rank, 10) || 0,
      averageRating: parseFloat(game.average) || 0,
      type: game.is_expansion === '1' ? 'expansion' : 'base game',
    }));

    processedResults.sort((a, b) => {
      const rankA = a.bggRank;
      const rankB = b.bggRank;

      if (rankA > 0 && rankB <= 0) return -1;
      if (rankB > 0 && rankA <= 0) return 1;

      if (rankA > 0 && rankB > 0) {
        return rankA - rankB;
      }

      return b.averageRating - a.averageRating;
    });

    const limitedResults = processedResults.slice(0, 50);

    return NextResponse.json(limitedResults);
  } catch (error) {
    console.error('Error reading or parsing CSV file:', error);
    return NextResponse.json({ error: 'Failed to search for games' }, { status: 500 });
  }
}
