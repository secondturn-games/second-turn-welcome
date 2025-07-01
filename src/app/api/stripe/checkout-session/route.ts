import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { listingId } = await req.json();

    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Featured Listing Fee',
              description: 'Make your listing stand out for a small fee.',
            },
            unit_amount: 500, // $5.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/listings/${listingId}?featured=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/listings/${listingId}?featured=false`,
      metadata: {
        listingId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });

  } catch (error: any) {
    console.error('Stripe session creation error:', error);
    return NextResponse.json({ error: 'Failed to create Stripe session' }, { status: 500 });
  }
}
