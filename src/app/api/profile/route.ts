import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { ListingStatus } from '@prisma/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        listings: {
          include: {
            game: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

const updateListingStatusSchema = z.object({
  listingId: z.string(),
  status: z.nativeEnum(ListingStatus),
});

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const userId = session.user.id;

    const body: unknown = await request.json();
    const validation = updateListingStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request data', details: validation.error.format() }, { status: 400 });
    }

    const { listingId, status } = validation.data;

    const listingToUpdate = await prisma.listing.findFirst({
      where: {
        id: listingId,
        userId: userId,
       },
    });

    if (!listingToUpdate) {
      return NextResponse.json({ error: 'Listing not found or you are not authorized to update it' }, { status: 404 });
    }

    const updatedListing = await prisma.listing.update({
      where: {
        id: listingId,
      },
      data: {
        status: status,
      },
    });

    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error('Error updating listing status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
