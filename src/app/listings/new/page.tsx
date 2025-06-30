'use client';

import { useState } from 'react';
import { GameSearch } from '@/components/listings/game-search';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Define the Game type based on the Prisma schema
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
}

export default function NewListingPage() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectGame = (game: Game) => {
    setSelectedGame(game);
  };

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          gameId: selectedGame?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create listing');
      }

      const result = await response.json();
      // Redirect to the new listing page after successful creation
      // router.push(`/listings/${result.id}`);
      console.log('Listing created:', result);
    } catch (error) {
      console.error('Error creating listing:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (selectedGame) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Create Listing for {selectedGame.title}</CardTitle>
              <CardDescription>
                Please fill in the details for your listing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Game selected: {selectedGame.title}</p>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedGame(null)}
                  className="w-full"
                >
                  Back to Search
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create a New Listing</CardTitle>
            <CardDescription>
              List a board game for sale, trade, or giveaway
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Search for a Game</h3>
              <GameSearch onSelectGame={handleSelectGame} />
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Can't find your game?{' '}
                  <Button variant="link" className="p-0 h-auto">
                    Add it manually
                  </Button>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
