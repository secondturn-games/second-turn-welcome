import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { utapi } from '../uploadthing/core';
import { GameCondition, ShippingOption, Prisma } from '@prisma/client';

// Define the schema for the request body
const listingCreateSchema = z.object({
  description: z.string().optional(),
  price: z.number().min(0),
  isFree: z.boolean(),
  condition: z.nativeEnum(GameCondition),
  shippingOption: z.nativeEnum(ShippingOption),
  location: z.string().optional(),
  gameId: z.string(),
  bggVersionId: z.string().optional(),
  expansionIds: z.array(z.string()).optional(),
  images: z.array(z.object({
    key: z.string(),
    name: z.string(),
    size: z.number(),
    url: z.string().url(),
  })).optional(),
  isFeatured: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be signed in to create a listing' },
        { status: 401 }
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    const validation = listingCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { description, price, isFree, condition, shippingOption, location, gameId, bggVersionId, expansionIds, images, isFeatured } = validation.data;

    // Check if the game exists
    const game = await prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      // Clean up any uploaded files if game not found
      if (images && images.length > 0) {
        await utapi.deleteFiles(images.map((img: { key: string }) => img.key));
      }

      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Get the current user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      // Clean up any uploaded files if user not found
      if (images && images.length > 0) {
        await utapi.deleteFiles(images.map((img: { key: string }) => img.key));
      }

      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create the listing data object with the correct type
    const data: Prisma.ListingUncheckedCreateInput = {
      description,
      price: isFree ? 0 : price,
      isFree,
      condition,
      shippingOption,
      location,
      userId: user.id,
      gameId: gameId,
      images: images?.map((img) => img.url) || [],
      isFeatured: isFeatured || false,
      expansionIds: expansionIds || [],
    };

    // Conditionally add optional fields
    if (bggVersionId) {
      data.bggVersionId = bggVersionId;
    }

    const listing = await prisma.listing.create({
      data,
      include: {
        game: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error) {
    console.error('Error creating listing:', error);
    
    // Clean up any uploaded files if there was an error
    try {
      const body = await request.json();
      if (body.images?.length > 0) {
        const s3DeletePromises = (body.images || []).map((img: { key: string }) => utapi.deleteFiles(img.key));
      }
    } catch (cleanupError) {
      console.error('Error cleaning up uploaded files:', cleanupError);
    }
    
    return NextResponse.json(
      { error: 'An error occurred while creating the listing' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
