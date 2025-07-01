import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
// Define the GameCondition type to match our Prisma schema
type GameCondition = 'MINT' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
import { formatPrice } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  const listing = await prisma.listing.findFirst({
    where: { id: id, status: 'ACTIVE' },
    include: {
      game: true,
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          createdAt: true,
        },
      },
    },
  });

  if (!listing) {
    notFound();
  }

  const isOwner = session?.user?.email === listing.user.email;
  const conditionLabels: Record<GameCondition, string> = {
    MINT: 'Mint',
    LIKE_NEW: 'Like New',
    GOOD: 'Good',
    FAIR: 'Fair',
    POOR: 'Poor',
  } as const;
  
  // Ensure the condition is a valid GameCondition
  const getConditionLabel = (condition: string): string => {
    return conditionLabels[condition as GameCondition] || condition;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Game Images */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-lg overflow-hidden shadow">
              {listing.game.image ? (
                <Image
                  src={listing.game.image}
                  alt={listing.game.title}
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover"
                  priority
                />
              ) : (
                <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>
            
            {/* Game Description */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-bold mb-4">About This Game</h2>
              <div className="prose max-w-none">
                {listing.game.description ? (
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: listing.game.description.replace(/<\/p><p>/g, '</p>\n<p>') 
                    }} 
                  />
                ) : (
                  <p>No description available</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Listing Details */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h1 className="text-2xl font-bold mb-2">{listing.game.title}</h1>
              {listing.game.yearPublished && (
                <p className="text-gray-600 mb-4">({listing.game.yearPublished})</p>
              )}
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Condition</h3>
                  <p>{getConditionLabel(listing.condition)}</p>
                </div>

                {listing.description && (
                  <div>
                    <h3 className="text-lg font-semibold">Seller's Notes</h3>
                    <p className="whitespace-pre-line">{listing.description}</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold">
                      {listing.isFree ? 'Free' : formatPrice(listing.price || 0)}
                    </span>
                    {!listing.isFree && <span className="text-gray-500">+ shipping</span>}
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <Button className="w-full" size="lg">
                      {listing.isFree ? 'Request This Game' : 'Buy Now'}
                    </Button>
                    <Button variant="outline" className="w-full">
                      Message Seller
                    </Button>
                    {isOwner && (
                      <Button variant="outline" className="w-full">
                        Edit Listing
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Information */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Seller Information</h2>
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  {listing.user.image ? (
                    <Image
                      src={listing.user.image}
                      alt={listing.user.name || 'Seller'}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <span className="text-gray-500 text-xl">
                      {listing.user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{listing.user.name || 'Anonymous'}</h3>
                  <p className="text-sm text-gray-500">
                    Member since{' '}
                    {new Date(listing.user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Shipping</h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Option:</span>{' '}
                  {listing.shippingOption === 'LOCAL_PICKUP' ? 'Local Pickup' : 'National Shipping'}
                </p>
                {listing.location && (
                  <p>
                    <span className="font-medium">Location:</span> {listing.location}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Game Details */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Game Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold">Players</h3>
              <p>
                {listing.game.minPlayers}
                {listing.game.maxPlayers !== listing.game.minPlayers
                  ? `-${listing.game.maxPlayers}`
                  : ''}{' '}
                players
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Play Time</h3>
              <p>
                {listing.game.minPlayTime}
                {listing.game.maxPlayTime !== listing.game.minPlayTime
                  ? `-${listing.game.maxPlayTime} minutes`
                  : ' minutes'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Age</h3>
              <p>{listing.game.minAge}+ years</p>
            </div>
            {listing.game.primaryDesigner && (
              <div>
                <h3 className="font-semibold">Designer</h3>
                <p>{listing.game.primaryDesigner}</p>
              </div>
            )}
            {listing.game.primaryPublisher && (
              <div>
                <h3 className="font-semibold">Publisher</h3>
                <p>{listing.game.primaryPublisher}</p>
              </div>
            )}
            {listing.game.averageRating && (
              <div>
                <h3 className="font-semibold">BGG Rating</h3>
                <p>
                  {listing.game.averageRating.toFixed(1)}/10
                  {listing.game.usersRated && (
                    <span className="text-sm text-gray-500 ml-1">
                      ({listing.game.usersRated.toLocaleString()} ratings)
                    </span>
                  )}
                </p>
              </div>
            )}
            {listing.game.bggRank && (
              <div>
                <h3 className="font-semibold">BGG Rank</h3>
                <p>#{listing.game.bggRank}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
