import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Error message: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { listingId, userId } = session.metadata!;

    try {
      await prisma.listing.updateMany({
        where: {
          id: listingId,
          userId: userId, // Ensure the user owns the listing
        },
        data: {
          isFeatured: true,
        },
      });
      console.log(`✅ Listing ${listingId} successfully marked as featured.`);
    } catch (error) {
      console.error(`🔥 Failed to update listing ${listingId}:`, error);
      // Even if the DB update fails, we should return a 200 to Stripe to prevent retries
    }
  }

  return NextResponse.json({ received: true });
}
