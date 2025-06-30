'use client';

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { Container } from "@/components/container";
import dynamic from 'next/dynamic';

// Dynamically import GameSearch with SSR disabled
const GameSearch = dynamic(
  () => import('@/components/listings/game-search').then(mod => mod.GameSearch),
  { ssr: false }
);

export default function Home() {
  const [selectedGame, setSelectedGame] = useState(null);

  const handleGameSelect = (game: any) => {
    setSelectedGame(game);
    // You can add additional logic here when a game is selected
    console.log('Selected game:', game);
  };
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/10 py-20 md:py-28">
        <Container className="relative z-10">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div className="space-y-6 text-center md:text-left">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Discover & Trade
                <span className="block text-primary mt-2">Board Games</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto md:mx-0">
                Connect with board game enthusiasts, buy, sell, and trade your favorite games. 
                Find your next adventure today!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/listings" className={cn(buttonVariants({ size: 'lg' }), 'text-base')}>Browse Listings</Link>
                <Link href="/listings/new" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'text-base')}>Sell a Game</Link>
              </div>
            </div>
            <div className="relative h-64 md:h-96">
              <div className="absolute inset-0 bg-primary/10 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-[url('/board-game-bg.jpg')] bg-cover bg-center opacity-20" />
              </div>
              <div className="absolute -right-4 -bottom-4 w-64 h-64 bg-accent/20 rounded-2xl -z-10" />
            </div>
          </div>
        </Container>
      </section>

      {/* Search Section */}
      <section className="py-16 bg-background">
        <Container>
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">Find Your Next Game</h2>
              <p className="text-muted-foreground">
                Search from thousands of board games in our marketplace
              </p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-sm border">
              <GameSearch onSelectGame={handleGameSelect} />
            </div>
          </div>
        </Container>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-secondary/5">
        <Container>
          <h2 className="text-3xl font-bold text-center mb-12">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Strategy', count: '245' },
              { name: 'Family', count: '189' },
              { name: 'Party', count: '167' },
              { name: 'Cooperative', count: '132' },
            ].map((category) => (
              <div 
                key={category.name}
                className="bg-card p-6 rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
              >
                <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                <p className="text-sm text-muted-foreground">{category.count} games</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to start trading?</h2>
            <p className="text-primary-foreground/90 mb-8">
              Join our community of board game enthusiasts and start trading today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }), 'text-base')}>Sign Up Free</Link>
              <Link href="/listings" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'text-base bg-transparent hover:bg-white/10')}>Browse Games</Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
