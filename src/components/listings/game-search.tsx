'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Loader2, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Represents a board game with its complete information
 * @interface Game
 * @property {string} id - Unique identifier for the game
 * @property {string} title - The title of the game
 * @property {number | null} [yearPublished] - The year the game was published (optional)
 * @property {number | null} [minPlayers] - Minimum number of players (optional)
 * @property {number | null} [maxPlayers] - Maximum number of players (optional)
 * @property {number | null} [playingTime] - Average playing time in minutes (optional)
 * @property {number | null} [minPlayTime] - Minimum play time in minutes (optional)
 * @property {number | null} [maxPlayTime] - Maximum play time in minutes (optional)
 * @property {number | null} [minAge] - Minimum recommended player age (optional)
 * @property {string | null} [description] - Game description (optional)
 * @property {string | null} [thumbnail] - URL of the game's thumbnail image (optional)
 * @property {string | null} [image] - URL of the game's main image (optional)
 * @property {number | null} [averageRating] - Average user rating (0-10) (optional)
 * @property {number | null} [usersRated] - Number of users who rated the game (optional)
 * @property {number | null} [bggRank] - BoardGameGeek ranking (optional)
 * @property {string | null} [primaryPublisher] - Primary publisher of the game (optional)
 * @property {string | null} [primaryDesigner] - Primary designer of the game (optional)
 * @property {string[]} [categories] - Game categories (optional)
 * @property {string[]} [mechanics] - Game mechanics (optional)
 * @property {string[]} [families] - Game families (optional)
 * @property {string[]} [expansions] - Game expansions (optional)
 * @property {string[]} [designers] - Game designers (optional)
 * @property {string[]} [artists] - Game artists (optional)
 * @property {string[]} [publishers] - Game publishers (optional)
 * @property {Date} [createdAt] - When the game was added to our database (optional)
 * @property {Date} [updatedAt] - When the game was last updated (optional)
 */
interface Game {
  id: string;
  title: string;
  yearPublished?: number | null;
  minPlayers?: number | null;
  maxPlayers?: number | null;
  playingTime?: number | null;
  minPlayTime?: number | null;
  maxPlayTime?: number | null;
  minAge?: number | null;
  description?: string | null;
  thumbnail?: string | null;
  image?: string | null;
  averageRating?: number | null;
  usersRated?: number | null;
  bggRank?: number | null;
  primaryPublisher?: string | null;
  primaryDesigner?: string | null;
  categories?: string[];
  mechanics?: string[];
  families?: string[];
  expansions?: string[];
  designers?: string[];
  artists?: string[];
  publishers?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
import { cn } from '@/lib/utils';

/**
 * Represents a name object from the BoardGameGeek API
 * @interface BGGName
 * @property {string} type - The type of name (e.g., 'primary', 'alternate')
 * @property {string} value - The actual name value
 * @property {any} [key: string] - Additional properties that might be present
 */
interface BGGName {
  type: string;
  value: string;
  [key: string]: any;
}

/**
 * Represents a search result from the BoardGameGeek API
 * @interface BGGSearchResult
 * @property {string} id - The BGG game ID
 * @property {BGGName[] | string} name - The game name(s), can be an array of name objects or a string
 * @property {{ value: string } | number} [yearpublished] - The year the game was published
 * @property {string} type - The type of item (e.g., 'boardgame', 'expansion')
 */
interface BGGSearchResult {
  id: string;
  name: BGGName[] | string;
  yearpublished?: { value: string } | number;
  type: string;
}

/**
 * Represents a formatted game search result for display
 * @interface GameSearchResult
 * @property {string} id - The game ID
 * @property {string} name - The display name of the game
 * @property {number} [yearPublished] - The year the game was published (optional)
 * @property {string} type - The type of game (e.g., 'boardgame')
 */
interface GameSearchResult {
  id: string;
  name: string;
  yearPublished?: number;
  type: string;
}

/**
 * Props for the GameSearch component
 * @interface GameSearchProps
 * @property {(game: Game) => void} onSelectGame - Callback when a game is selected
 * @property {string} [className] - Additional CSS class names (optional)
 */
interface GameSearchProps {
  onSelectGame: (game: Game) => void;
  className?: string;
}

/**
 * GameSearch Component
 * 
 * A search component that allows users to search for board games using the BoardGameGeek API.
 * Displays search results and allows selection of a game to populate a form.
 * 
 * @component
 * @param {GameSearchProps} props - The component props
 * @returns {JSX.Element} The rendered game search interface
 * 
 * @example
 * ```tsx
 * const handleGameSelect = (game) => {
 *   console.log('Selected game:', game);
 * };
 * 
 * <GameSearch 
 *   onSelectGame={handleGameSelect}
 *   className="my-4"
 * />
 * ```
 */
export function GameSearch({ onSelectGame, className }: GameSearchProps) {
  /** @type {ReturnType<typeof useRouter>} */
  const router = useRouter();
  
  /** @type {URLSearchParams} Search parameters from the URL */
  const searchParams = useSearchParams();
  
  /** @type {[string, React.Dispatch<React.SetStateAction<string>>]} Search query state */
  const [query, setQuery] = React.useState('');
  
  /** @type {[GameSearchResult[], React.Dispatch<React.SetStateAction<GameSearchResult[]>>]} Search results state */
  const [results, setResults] = React.useState<GameSearchResult[]>([]);
  
  /** @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]} Loading state */
  const [isLoading, setIsLoading] = React.useState(false);
  
  /** @type {[Game | null, React.Dispatch<React.SetStateAction<Game | null>>]} Selected game state */
  const [selectedGame, setSelectedGame] = React.useState<Game | null>(null);
  
  /** @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]} Whether a search has been performed */
  const [searchPerformed, setSearchPerformed] = React.useState(false);

  /**
   * Performs a search for board games based on the current query
   * @async
   * @function handleSearch
   * @returns {Promise<void>}
   */
  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      setSearchPerformed(false);
      return;
    }

    setIsLoading(true);
    console.log('Searching for games with query:', query);
    try {
      const response = await fetch(`/api/bgg/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to search games:', response.status, errorText);
        throw new Error(`Failed to search games: ${response.status}`);
      }
      const data = await response.json();
      console.log('Search results:', JSON.stringify(data, null, 2));
      
      // Process the results to extract the correct name and year
      const results = (Array.isArray(data.results) ? data.results : []).map((result: BGGSearchResult) => {
        const name = getPrimaryName(result.name);
        const yearPublished = getYearPublished(result.yearpublished);
        
        return {
          id: String(result.id || ''),
          name,
          yearPublished,
          type: result.type || 'boardgame'
        };
      });
      
      setResults(results);
      setSearchPerformed(true);
    } catch (error) {
      console.error('Error searching games:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Extracts the primary name from a BGG name array or returns a default value
   * @param {BGGName[] | string | undefined} name - The name data from BGG API
   * @returns {string} The primary name or 'Unknown Game' if not available
   */
  const getPrimaryName = (name: BGGName[] | string | undefined): string => {
    if (!name) return 'Unknown Game';
    if (typeof name === 'string') return name;
    
    // Find the primary name (type === 'primary') or fall back to the first name
    const primaryName = Array.isArray(name) 
      ? name.find(n => n.type === 'primary') || name[0]
      : null;
      
    return primaryName?.value || 'Unknown Game';
  };

  /**
   * Extracts the year published from BGG response data
   * @param {{ value: string } | number | undefined} yearData - The year data from BGG API
   * @returns {number | undefined} The year as a number, or undefined if not available
   */
  const getYearPublished = (yearData: { value: string } | number | undefined): number | undefined => {
    if (!yearData) return undefined;
    if (typeof yearData === 'number') return yearData;
    if (typeof yearData === 'object' && 'value' in yearData) {
      const year = parseInt(yearData.value, 10);
      return isNaN(year) ? undefined : year;
    }
    return undefined;
  };

  /**
   * Handles keydown events on the search input
   * @param {React.KeyboardEvent<HTMLInputElement>} e - The keyboard event
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  /**
   * Extracts a value from BGG API response fields, handling different response formats
   * @param {any} field - The field to extract a value from
   * @returns {any} The extracted value or null if not found
   */
  const extractValue = (field: any): any => {
    if (field === undefined || field === null) return null;
    if (typeof field === 'string' || typeof field === 'number' || typeof field === 'boolean') return field;
    if (Array.isArray(field)) return field.map(extractValue);
    if (field.value !== undefined) return field.value;
    return null;
  };

  /**
   * Extracts a display name from BGG name field, which can be in various formats
   * @param {any} nameField - The name field from BGG API
   * @returns {string} The display name or 'Unknown Game' if not available
   */
  const extractName = (nameField: any): string => {
    if (!nameField) return 'Unknown Game';
    if (typeof nameField === 'string') return nameField;
    if (Array.isArray(nameField)) {
      const primaryName = nameField.find((n: any) => n.type === 'primary');
      if (primaryName) return primaryName.value;
      return nameField[0]?.value || 'Unknown Game';
    }
    if (nameField.value) return nameField.value;
    return 'Unknown Game';
  };

  /**
   * Handles selection of a game from search results
   * Fetches detailed game information and calls the onSelectGame callback
   * @async
   * @param {GameSearchResult} game - The selected game from search results
   * @returns {Promise<void>}
   */
  const handleSelectGame = async (game: GameSearchResult) => {
    try {
      console.log('Fetching game details for ID:', game.id);
      const response = await fetch(`/api/bgg/game/${game.id}`);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch game details:', response.status, errorText);
        throw new Error(`Failed to fetch game details: ${response.status}`);
      }
      const data = await response.json();
      console.log('Game details response:', JSON.stringify(data, null, 2));
      
      if (!data.game) {
        console.error('No game data in response:', data);
        throw new Error('No game data in response');
      }
      
      const gameDetails = data.game;
      console.log('Game details:', JSON.stringify(gameDetails, null, 2));
      
      // Extract and format game details
      const extractLinks = (type: string): string[] => {
        if (!gameDetails.links) return [];
        const filtered = Array.isArray(gameDetails.links) 
          ? gameDetails.links.filter((link: any) => link.type === type)
          : [];
        return filtered.map((link: any) => extractValue(link.value) || '').filter(Boolean);
      };
      
      // Format the game data for our application
      const formattedGame: Game = {
        id: extractValue(gameDetails.id) || '',
        title: extractName(gameDetails.name),
        yearPublished: extractValue(gameDetails.yearpublished) ? parseInt(extractValue(gameDetails.yearpublished)) : null,
        minPlayers: extractValue(gameDetails.minplayers) ? parseInt(extractValue(gameDetails.minplayers)) : null,
        maxPlayers: extractValue(gameDetails.maxplayers) ? parseInt(extractValue(gameDetails.maxplayers)) : null,
        playingTime: extractValue(gameDetails.playingtime) ? parseInt(extractValue(gameDetails.playingtime)) : null,
        minPlayTime: extractValue(gameDetails.minplaytime) ? parseInt(extractValue(gameDetails.minplaytime)) : null,
        maxPlayTime: extractValue(gameDetails.maxplaytime) ? parseInt(extractValue(gameDetails.maxplaytime)) : null,
        minAge: extractValue(gameDetails.minage) ? parseInt(extractValue(gameDetails.minage)) : null,
        description: extractValue(gameDetails.description) || '',
        thumbnail: extractValue(gameDetails.thumbnail) || '',
        image: extractValue(gameDetails.image) || '',
        averageRating: extractValue(gameDetails.statistics?.ratings?.average?.value) || 0,
        usersRated: extractValue(gameDetails.statistics?.ratings?.usersrated?.value) || 0,
        bggRank: extractValue(gameDetails.statistics?.ratings?.ranks?.rank?.[0]?.value) || null,
        primaryPublisher: extractValue(gameDetails.links?.find((l: any) => l.type === 'boardgamepublisher')?.value) || null,
        primaryDesigner: extractValue(gameDetails.links?.find((l: any) => l.type === 'boardgamedesigner')?.value) || null,
        categories: extractLinks('boardgamecategory'),
        mechanics: extractLinks('boardgamemechanic'),
        families: extractLinks('boardgamefamily'),
        expansions: extractLinks('boardgameexpansion'),
        designers: extractLinks('boardgamedesigner'),
        artists: extractLinks('boardgameartist'),
        publishers: extractLinks('boardgamepublisher'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      console.log('Formatted game:', formattedGame);
      setSelectedGame(formattedGame);
      onSelectGame(formattedGame);
    } catch (error) {
      console.error('Error fetching game details:', error);
      // You might want to show an error message to the user here
    }
  };

  /**
   * Clears the currently selected game and resets the search query
   */
  const handleClearSelection = () => {
    setSelectedGame(null);
    setQuery('');
  };

  if (selectedGame) {
    return (
      <div className={cn('p-4 border rounded-lg bg-muted/20', className)}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{selectedGame.title}</h3>
            {selectedGame.yearPublished && (
              <p className="text-sm text-muted-foreground">
                {selectedGame.yearPublished}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearSelection}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for a board game..."
              className="pl-10 pr-4 py-2 w-full bg-card text-foreground border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-colors"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
            />
          </div>
          
          <Button
            type="button"
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            className="shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="sr-only">Search</span>
          </Button>
        </div>

        {/* Search Results */}
        <div className="space-y-2">
          {searchPerformed && !isLoading && results.length === 0 && (
            <div className="p-4 text-center text-muted-foreground bg-muted/30 rounded-lg">
              No games found. Try a different search term.
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Search Results</h3>
              <div className="space-y-2">
                {results.map((game) => (
                  <button
                    key={game.id}
                    type="button"
                    className="w-full text-left p-4 bg-card border border-gray-200 hover:border-primary/50 hover:bg-primary/5 rounded-lg transition-colors duration-200"
                    onClick={() => handleSelectGame(game)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{game.name}</h4>
                        {game.yearPublished && (
                          <p className="text-sm text-muted-foreground">
                            Published: {game.yearPublished}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground mt-0.5" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
