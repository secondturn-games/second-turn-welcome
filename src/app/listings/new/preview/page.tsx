'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    const savedData = sessionStorage.getItem('listingPreviewData');
    if (savedData) {
      setListingData(JSON.parse(savedData));
    } else {
      // If no data, redirect to the start of the form
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
      // Always create the listing first with isFeatured set to false.
      // The Stripe webhook will update it upon successful payment.
      const initialPayload = {
        ...listingData.payload,
        isFeatured: false,
      };

      const createResponse = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(initialPayload),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.error || 'Failed to create listing');
      }

      const { listing } = await createResponse.json();

      // If the user does not want to feature the listing, we are done.
      if (!isFeatured) {
        sessionStorage.removeItem('listingPreviewData');
        toast({ title: 'Success!', description: 'Your listing has been created.' });
        router.push(`/listings/${listing.id}`); // Redirect to the new listing page
        return;
      }

      // If the user wants to feature it, proceed to Stripe checkout.
      const stripeResponse = await fetch('/api/stripe/checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id }),
      });

      if (!stripeResponse.ok) {
        const errorData = await stripeResponse.json();
        // The listing exists, but payment session failed. Redirect to the non-featured listing.
        toast({ variant: 'destructive', title: 'Payment Error', description: `Your listing was created, but we couldn't start the payment process. ${errorData.error}` });
        router.push(`/listings/${listing.id}`);
        return;
      }

      const { url } = await stripeResponse.json();
      sessionStorage.removeItem('listingPreviewData');
      window.location.href = url; // Redirect to Stripe

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
            <div className="items-center flex space-x-2 my-4 p-4 border rounded-lg bg-muted/40">
              <Checkbox
                id="featured"
                checked={isFeatured}
                onCheckedChange={(checked) => setIsFeatured(checked as boolean)}
                disabled={isSubmitting}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="featured" className="text-base font-medium">
                  Feature your listing for $5.00
                </Label>
                <p className="text-sm text-muted-foreground">
                  Your listing will be highlighted and appear at the top of search results.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleEdit} disabled={isSubmitting}>Edit Listing</Button>
              <Button type="button" onClick={handleConfirmPost} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isFeatured ? 'Proceed to Payment' : 'Confirm & Post Listing'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
