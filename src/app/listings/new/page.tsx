'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { GameSearch, type GameSearchResult } from '@/components/listings/game-search';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

// Types
interface GameFromCSV {
  BGGId: string;
  Name: string;
  YearPublished: string;
}

interface BggGameDetails {
  id: string;
  title: string;
  yearPublished: number;
  description: string;
  image?: string;
}

interface BggGameVersion {
  id: string;
  name: string;
  year: string;
  publisher: string;
  thumbnail?: string;
  image?: string;
}

type Condition = 'MINT' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
type ShippingOption = 'LOCAL_PICKUP' | 'NATIONAL_SHIPPING';

const conditionMap: { [key: string]: Condition } = {
  'new': 'MINT',
  'like-new': 'LIKE_NEW',
  'very-good': 'GOOD',
  'good': 'FAIR',
  'acceptable': 'POOR',
};

export default function NewListingPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Component State
  const [selectedGame, setSelectedGame] = useState<GameFromCSV | null>(null);
  const [gameDetails, setGameDetails] = useState<BggGameDetails | null>(null);
  const [gameVersions, setGameVersions] = useState<BggGameVersion[] | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expansions, setExpansions] = useState<BggGameDetails[]>([]);
  const [selectedExpansions, setSelectedExpansions] = useState<string[]>([]);
  const [isLoadingExpansions, setIsLoadingExpansions] = useState(false);

  // Form State
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('');
  const [shipping, setShipping] = useState<ShippingOption>('NATIONAL_SHIPPING');
  const [location, setLocation] = useState('');
  const [comments, setComments] = useState('');
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  useEffect(() => {
    const savedData = sessionStorage.getItem('listingPreviewData');
    if (savedData) {
      const data = JSON.parse(savedData);
      const rehydration = data.rehydration;

      setSelectedGame(rehydration.selectedGame);
      setGameDetails(rehydration.gameDetails);
      setGameVersions(rehydration.gameVersions);
      setExpansions(rehydration.expansions);
      setPrice(rehydration.price);
      setCondition(rehydration.condition);
      setShipping(rehydration.shipping);
      setLocation(rehydration.location);
      setComments(rehydration.comments);
      setSelectedVersionId(rehydration.selectedVersionId);
      setSelectedExpansions(rehydration.selectedExpansions);
    } else {
      if (!selectedGame) {
        setGameDetails(null);
        setGameVersions(null);
        return;
      }

      const fetchGameDetails = async () => {
        setIsLoadingDetails(true);
        try {
          const response = await fetch(`/api/bgg/game/${selectedGame.BGGId}?versions=true`);
          if (!response.ok) throw new Error('Failed to fetch details');
          const data = await response.json();
          setGameDetails(data.game);
          setGameVersions(data.versions);
        } catch (error) {
          console.error('Error fetching game details:', error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch game details.' });
          setSelectedGame(null);
        } finally {
          setIsLoadingDetails(false);
        }
      };

      fetchGameDetails();
    }
  }, [selectedGame, toast]);

    const handleGameSelection = (game: GameSearchResult | null) => {
    if (game) {
      setSelectedGame({
        BGGId: game.id,
        Name: game.name,
        YearPublished: game.yearPublished?.toString() ?? '',
      });
    } else {
      setSelectedGame(null);
    }
  };

  const handleGoBack = () => {
    setSelectedGame(null);
    setGameDetails(null);
    setGameVersions(null);
    setSelectedVersionId(null);
    setExpansions([]);
    setSelectedExpansions([]);
  };

  const handleFetchExpansions = async () => {
    if (!gameDetails) return;
    setIsLoadingExpansions(true);
    try {
      const response = await fetch(`/api/bgg/game/${gameDetails.id}/expansions`);
      if (!response.ok) throw new Error('Failed to fetch expansions');
      const data = await response.json();
      setExpansions(data.expansions || []);
    } catch (error) {
      console.error('Error fetching expansions:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch expansions.' });
    } finally {
      setIsLoadingExpansions(false);
    }
  };

  const handlePreview = (e: FormEvent) => {
    e.preventDefault();
    if (!gameDetails) return;

    const selectedVersion = gameVersions?.find(v => v.id === selectedVersionId);
    const selectedExpansionDetails = expansions.filter(exp => selectedExpansions.includes(exp.id));

    const listingData = {
      payload: {
        description: comments,
        price: parseFloat(price) || 0,
        isFree: parseFloat(price) === 0,
        condition: conditionMap[condition],
        shippingOption: shipping,
        location,
        gameId: gameDetails.id,
        bggVersionId: selectedVersionId,
        expansionIds: selectedExpansions,
      },
      display: {
        gameTitle: gameDetails.title,
        gameYear: gameDetails.yearPublished,
        gameImage: gameDetails.image,
        versionName: selectedVersion?.name,
        versionYear: selectedVersion?.year,
        versionImage: selectedVersion?.image,
        expansions: selectedExpansionDetails.map(e => ({ title: e.title, year: e.yearPublished })),
        price: parseFloat(price) || 0,
        condition,
        shipping,
        location,
        comments,
      },
      rehydration: {
        selectedGame,
        gameDetails,
        gameVersions,
        expansions,
        price,
        condition,
        shipping,
        location,
        comments,
        selectedVersionId,
        selectedExpansions,
      }
    };

    sessionStorage.setItem('listingPreviewData', JSON.stringify(listingData));
    router.push('/listings/new/preview');
  };

  if (!selectedGame) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Add a New Listing</CardTitle>
              <CardDescription>Search for the board game you want to list for sale.</CardDescription>
            </CardHeader>
            <CardContent>
              <GameSearch onSelectGame={handleGameSelection} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoadingDetails) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <div className="flex flex-col items-center gap-4 p-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Fetching details for {selectedGame.Name}...</p>
        </div>
      </div>
    );
  }

  if (gameDetails) {
    const selectedVersion = gameVersions?.find(v => v.id === selectedVersionId);
    const displayImage = selectedVersion?.image || gameDetails.image;
    const displayYear = selectedVersion?.year || gameDetails.yearPublished;
    const displayTitle = gameDetails.title;

    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handlePreview}>
            <Card>
              <CardHeader>
                <CardTitle>Create Listing for: {displayTitle}</CardTitle>
                <CardDescription>Published: {displayYear} | BGG ID: {gameDetails.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {displayImage && (
                  <div className="w-1/3 mx-auto">
                    <img src={displayImage} alt={`Cover for ${displayTitle}`} className="rounded-lg w-full" />
                  </div>
                )}

                {gameVersions && gameVersions.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="version">Game Version/Edition</Label>
                    <Select name="version" onValueChange={setSelectedVersionId}>
                      <SelectTrigger id="version"><SelectValue placeholder="Select a version (optional)" /></SelectTrigger>
                      <SelectContent>
                        {gameVersions.map((version) => (
                          <SelectItem key={version.id} value={version.id}>
                            {version.name} ({version.year}) - {version.publisher}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {gameVersions && gameVersions.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="version">Game Version/Edition</Label>
                    <Select name="version" onValueChange={setSelectedVersionId}>
                      <SelectTrigger id="version"><SelectValue placeholder="Select a version (optional)" /></SelectTrigger>
                      <SelectContent>
                        {gameVersions.map((version) => (
                          <SelectItem key={version.id} value={version.id}>
                            {version.name} ({version.year}) - {version.publisher}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-4">
                  <Button type="button" variant="outline" onClick={handleFetchExpansions} disabled={isLoadingExpansions}>
                    {isLoadingExpansions ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Add Expansions
                  </Button>
                  {expansions.length > 0 && (
                    <div className="space-y-2 p-4 border rounded-md">
                      <h4 className="font-medium">Available Expansions</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {expansions.map(exp => (
                          <div key={exp.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`exp-${exp.id}`}
                              onCheckedChange={(checked: boolean | 'indeterminate') => {
                                setSelectedExpansions(prev => 
                                  checked ? [...prev, exp.id] : prev.filter(id => id !== exp.id)
                                );
                              }}
                            />
                            <label htmlFor={`exp-${exp.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                              {exp.title} ({exp.yearPublished})
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition</Label>
                    <Select name="condition" onValueChange={setCondition} required>
                      <SelectTrigger id="condition"><SelectValue placeholder="Select condition" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New (Sealed)</SelectItem>
                        <SelectItem value="like-new">Like New</SelectItem>
                        <SelectItem value="very-good">Very Good</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="acceptable">Acceptable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g., 25.00 or 0 for free" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Shipping</Label>
                  <Select name="shipping" onValueChange={(v) => setShipping(v as ShippingOption)} defaultValue={shipping}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NATIONAL_SHIPPING">National Shipping Available</SelectItem>
                      <SelectItem value="LOCAL_PICKUP">Local Pickup Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {shipping === 'LOCAL_PICKUP' && (
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., San Francisco, CA" required={shipping === 'LOCAL_PICKUP'} />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="comments">Comments (Optional)</Label>
                  <Textarea id="comments" value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Any notes about the condition, edition, or included components?" />
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <Button type="button" variant="outline" onClick={handleGoBack} disabled={isSubmitting}>Back to Search</Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Preview Listing
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>Could not load details for {selectedGame?.Name}. Please try again.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleGoBack} className="w-full">Back to Search</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


