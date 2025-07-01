'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isActive = (path: string) => pathname === path;

  return (
    <header className="border-b bg-red-500 text-white p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <img src="/images/second_turn.png" alt="Second Turn Logo" className="h-12 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/" className={cn(buttonVariants({ variant: 'ghost' }), 'text-sm font-medium transition-colors hover:text-primary', isActive('/') ? 'text-foreground' : 'text-muted-foreground')}>Home</Link>
            <Link href="/listings" className={cn(buttonVariants({ variant: 'ghost' }), 'text-sm font-medium transition-colors hover:text-primary', isActive('/listings') ? 'text-foreground' : 'text-muted-foreground')}>Browse Listings</Link>
            <Link href="/listings/new" className={cn(buttonVariants({ variant: 'ghost' }), 'text-sm font-medium transition-colors hover:text-primary', isActive('/listings/new') ? 'text-foreground' : 'text-muted-foreground')}>Sell a Game</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {status === 'loading' && (
            <div className="h-8 w-24 animate-pulse rounded-md bg-muted/80" />
          )}
          {status === 'unauthenticated' && (
            <div className="flex items-center gap-2">
              <Link href="/login" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>Sign In</Link>
              <Link href="/register" className={cn(buttonVariants({ size: 'sm' }))}>Sign Up</Link>
            </div>
          )}
          {status === 'authenticated' && session.user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image ?? ''} alt={session.user.name ?? ''} />
                    <AvatarFallback>{session.user.name?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session.user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/listings/my-listings">My Listings</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
