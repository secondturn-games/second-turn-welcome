'use client';

import * as React from 'react';
import { useState, useCallback } from 'react';
import { Search, Loader2, X, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface GameSearchResult {
  id: string;
  name: string;
  yearPublished: number | null;
  type: 'base game' | 'expansion';
  bggRank: number | null;
  averageRating: number | null;
}

interface SelectedGameDisplay {
  title: string;
  yearPublished: number | null;
}

interface GameSearchProps {
  className?: string;
  onSelectGame: (game: GameSearchResult | null) => void;
  initialSelection?: SelectedGameDisplay | null;
}

export function GameSearch({
  className,
  onSelectGame,
  initialSelection = null,
}: GameSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GameSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [selectedGame, setSelectedGame] = useState<SelectedGameDisplay | null>(
    initialSelection
  );

  const handleSearch = useCallback(async () => {
    if (query.trim().length === 0) {
      setResults([]);
      setSearchPerformed(false);
      return;
    }
    setIsLoading(true);
    setSearchPerformed(true);
    try {
      const response = await fetch(`/api/search-games?q=${query}`);
      const data = response.ok ? await response.json() : [];
      setResults(data);
    } catch (error) {
      console.error('Failed to fetch search results:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleSelectGame = (game: GameSearchResult) => {
    setSelectedGame({ title: game.name, yearPublished: game.yearPublished });
    onSelectGame(game);
    setQuery('');
    setResults([]);
    setSearchPerformed(false);
  };

  const handleClearSelection = () => {
    setSelectedGame(null);
    onSelectGame(null);
    setQuery('');
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-600';
    if (rating >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (selectedGame) {
    return (
      <div className={cn('p-4 border rounded-lg bg-muted/20', className)}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{selectedGame.title}</h3>
            {selectedGame.yearPublished && (
              <p className="text-sm text-muted-foreground">{selectedGame.yearPublished}</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={handleClearSelection} className="-mr-2 -mt-2 h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or BGG ID..."
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
        </div>
        <Button onClick={handleSearch} disabled={isLoading || !query.trim()}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span className="ml-2 hidden sm:inline">Search</span>
        </Button>
      </div>

      {isLoading && (
        <div className="p-4 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>
      )}

      {!isLoading && searchPerformed && results.length === 0 && (
        <div className="p-4 text-center text-muted-foreground bg-muted/30 rounded-lg mt-2">No games found.</div>
      )}

      {results.length > 0 && !isLoading && (
        <div className="space-y-2 mt-2 border-t pt-2">
          <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2">
            {results.map((game) => (
              <button
                key={game.id}
                type="button"
                className="w-full text-left p-3 bg-card border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors"
                onClick={() => handleSelectGame(game)}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-foreground">{game.name}</h4>
                      <Badge variant={game.type === 'base game' ? 'default' : 'secondary'}>
                        {game.type === 'base game' ? 'Base' : 'Expansion'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {game.yearPublished && <span>{game.yearPublished} &middot; </span>}
                      <span>BGG ID: {game.id}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end text-sm">
                      {game.bggRank && (
                        <div className="font-semibold">Rank: <span className="text-primary">{new Intl.NumberFormat().format(game.bggRank)}</span></div>
                      )}
                      {game.averageRating && (
                        <div className={cn('font-semibold', getRatingColor(game.averageRating))}>{game.averageRating.toFixed(1)}/10</div>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
