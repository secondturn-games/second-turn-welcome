'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface ListingData {
  payload: any;
  display: any;
  rehydration: any;
}

export default function PreviewListingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [listingData, setListingData] = useState<ListingData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedData = sessionStorage.getItem('listingPreviewData');
    if (savedData) {
      setListingData(JSON.parse(savedData));
    } else {
      router.replace('/listings/new');
    }
  }, [router]);

  const handleEdit = () => {
    router.push('/listings/new');
  };

  const handleConfirmPost = async () => {
    if (!listingData) return;

    setIsSubmitting(true);

    try {
      const payload = {
        ...listingData.payload,
        isFeatured: false, // Featuring is temporarily disabled
      };

      const createResponse = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || 'Failed to create listing');
      }

      const { listing } = await createResponse.json();

      sessionStorage.removeItem('listingPreviewData');
      toast({ title: 'Success!', description: 'Your listing has been created.' });
      router.push(`/listings/${listing.id}`);

    } catch (error: any) {
      console.error('Submission error:', error);
      toast({ variant: 'destructive', title: 'An Error Occurred', description: error.message });
      setIsSubmitting(false);
    }
  };

  if (!listingData) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const { display } = listingData;
  const displayImage = display.versionImage || display.gameImage;
  const displayTitle = display.versionName ? `${display.gameTitle} (${display.versionName})` : display.gameTitle;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Preview Your Listing</CardTitle>
            <CardDescription>This is how your listing will appear to others. Review carefully before posting.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <h2 className="text-2xl font-bold">{displayTitle}</h2>
            {displayImage && (
              <div className="w-1/2 mx-auto">
                <img src={displayImage} alt={`Cover for ${displayTitle}`} className="rounded-lg w-full" />
              </div>
            )}
            <div className="space-y-4">
              <p><strong>Condition:</strong> {display.condition}</p>
              <p><strong>Price:</strong> {display.price > 0 ? `$${display.price.toFixed(2)}` : 'Free'}</p>
              <p><strong>Shipping:</strong> {display.shipping === 'LOCAL_PICKUP' ? `Local Pickup Only (${display.location})` : 'National Shipping Available'}</p>
              {display.comments && <p><strong>Comments:</strong> {display.comments}</p>}
              {display.expansions.length > 0 && (
                <div>
                  <strong>Included Expansions:</strong>
                  <ul className="list-disc list-inside">
                    {display.expansions.map((exp: any) => <li key={exp.title}>{exp.title} ({exp.year})</li>)}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Feature listing option is temporarily disabled. */}

            <div className="flex justify-between items-center pt-4 border-t">
              <button type="button" className={buttonVariants({ variant: "outline" })} onClick={handleEdit} disabled={isSubmitting}>Edit Listing</button>
              <Button type="button" onClick={handleConfirmPost} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm & Post Listing
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
