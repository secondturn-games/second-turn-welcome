import { Prisma } from '@prisma/client';

type User = Prisma.UserGetPayload<{
  include: {
    listings: {
      include: {
        game: true;
      };
    };
  };
}>;

type Listing = Prisma.ListingGetPayload<{
  include: {
    game: true;
  };
}>;

type Game = Prisma.GameGetPayload<{}>;

export type ProfileUser = User & {
  listings: (Listing & {
    game: Game;
  })[];
};

export type ProfilePageProps = {
  user: ProfileUser | null;
};
