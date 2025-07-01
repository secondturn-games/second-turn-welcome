import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

// This is the data structure the frontend component expects.
export interface GameSearchResult {
  id: string;
  name: string;
  yearPublished?: number;
  bggRank?: number;
  averageRating?: number;
  type: 'base game' | 'expansion';
}

class BoardgameService {
  private static instance: BoardgameService;
  private games: GameSearchResult[] = [];
  private ready: Promise<void>;
  private gamesLogged = false;

  private constructor() {
    this.ready = this.loadAndProcessData();
    // This is the crucial fix: By attaching a catch handler to the promise, we prevent
    // an unhandled promise rejection from crashing the entire server if the CSV
    // file fails to load on startup. The error will instead be thrown and caught
    // properly in the API route when a search is attempted.
    this.ready.catch(err => {
      console.error('[BoardgameService] Initialization failed. The service will be unavailable until the app is restarted and the issue is fixed.', err.message);
    });
  }

  public static getInstance(): BoardgameService {
    if (!BoardgameService.instance) {
      BoardgameService.instance = new BoardgameService();
    }
    return BoardgameService.instance;
  }

  private loadAndProcessData(): Promise<void> {
    return new Promise((resolve, reject) => {
      const csvFilePath = path.join(process.cwd(), 'src', 'boardgames_ranks.csv');
      const fileStream = fs.createReadStream(csvFilePath, 'utf8');
      const processedGames: GameSearchResult[] = [];

      // --- Robust Stream Error Handling ---
      // This is crucial to prevent server crashes from file system errors.
      fileStream.on('error', (err) => {
        console.error('[BoardgameService] Critical error reading file stream:', err);
        reject(err);
      });

      Papa.parse(fileStream, {
        header: true,
        transformHeader: header => header.trim(),
        dynamicTyping: false, // Turn off unreliable dynamic typing; we will parse manually.
        skipEmptyLines: true,
        step: (result) => {
          const rawGame: any = result.data;

          // --- Definitive Data Validation ---
          // A TypeError during search was caused by rows with an ID but no name.
          // We must ensure both 'id' and a non-empty 'name' exist.
          if (!rawGame.id || !rawGame.name || typeof rawGame.name !== 'string' || rawGame.name.trim() === '') {
            return; // Skip invalid row
          }

          // Extract and use only the specified columns.
          const id = rawGame.id;
          const name = rawGame.name;
          // --- Type-Safe Manual Parsing ---
          const yearPublishedNum = parseInt(rawGame.yearpublished, 10);
          const rankNum = parseInt(rawGame.rank, 10);
          const bayesAverageNum = parseFloat(rawGame.bayesaverage);

          const type: 'base game' | 'expansion' = rawGame.is_expansion === '1' ? 'expansion' : 'base game';

          const gameData: GameSearchResult = {
            id: id.toString(),
            name: name,
            yearPublished: isNaN(yearPublishedNum) ? undefined : yearPublishedNum,
            bggRank: isNaN(rankNum) || rankNum <= 0 ? undefined : rankNum,
            averageRating: isNaN(bayesAverageNum) ? undefined : bayesAverageNum,
            type: type,
          };

          processedGames.push(gameData);
        },
        complete: () => {
          this.games = processedGames;
          console.log(`[BoardgameService] Streamed and processed ${this.games.length} valid games from CSV.`);
          resolve();
        },
        error: (error: any) => {
          console.error('[BoardgameService] Error parsing CSV data:', error);
          fileStream.destroy(); // Ensure stream is closed on parsing error
          reject(error);
        },
      });
    });
  }

  public async search(options: { query: string }): Promise<GameSearchResult[]> {
    await this.ready; // Ensure data is loaded and processed before searching

    const { query } = options;
    const lowercasedQuery = query.toLowerCase();
    const isNumericQuery = /^\d+$/.test(query);

    // The data is already in the correct format, so we just need to filter by name or ID.
    return this.games.filter(game => {
      try {
        if (isNumericQuery) {
          return game.id === query;
        }

        // Defensive check to prevent TypeError on game.name
        if (typeof game.name !== 'string') {
          console.warn('[BoardgameService] Search skipped an item with a non-string name:', game);
          return false;
        }
        return game.name.toLowerCase().includes(lowercasedQuery);
      } catch (error) {
        console.error('[BoardgameService] CRITICAL: Error during search filter. Skipping problematic item. Item:', game, 'Error:', error);
        return false; // Exclude problematic item from results
      }
    });
  }
}

export const boardgameService = BoardgameService.getInstance();
