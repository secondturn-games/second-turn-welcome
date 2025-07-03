'use client';

import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10">
      <Container>
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              Coming Soon
            </h1>
            <p className="text-xl text-muted-foreground">
              This section is currently under development
            </p>
          </div>
          
          <div className="bg-card p-8 rounded-xl shadow-sm border">
            <h2 className="text-2xl font-semibold mb-4">What's Coming</h2>
            <ul className="text-left space-y-2 text-muted-foreground">
              <li>• Browse and search board game listings</li>
              <li>• Create your gaming profile</li>
              <li>• List games for sale or trade</li>
              <li>• Connect with other players</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg">
                Back to Home
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              Notify Me When Ready
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}