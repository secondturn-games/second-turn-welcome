'use client';

import * as React from 'react';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Container } from "@/components/container";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Mail, Clock, GamepadIcon } from "lucide-react";

export function ComingSoon() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically integrate with your email service
    // For now, we'll just show a success message
    setIsSubmitted(true);
    setEmail('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 to-secondary/10">
      {/* Header */}
      <header className="p-6">
        <Container>
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <GamepadIcon className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-primary">Board Game Hub</span>
            </div>
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex justify-center"
              >
                <div className="relative">
                  <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
                    <Clock className="w-16 h-16 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full animate-pulse" />
                </div>
              </motion.div>

              {/* Heading */}
              <div className="space-y-4">
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-5xl md:text-7xl font-bold tracking-tight"
                >
                  <span className="text-foreground">Something</span>
                  <span className="block text-primary mt-2">Epic is Coming</span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
                >
                  We're building the ultimate platform for board game enthusiasts. 
                  Buy, sell, trade, and discover your next favorite game in our upcoming marketplace.
                </motion.p>
              </div>

              {/* Email Signup */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="max-w-md mx-auto"
              >
                {!isSubmitted ? (
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 h-12 text-base"
                          required
                        />
                      </div>
                      <Button type="submit" size="lg" className="h-12 px-8 text-base">
                        Notify Me
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Be the first to know when we launch. No spam, unsubscribe anytime.
                    </p>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 border border-green-200 rounded-lg p-6"
                  >
                    <div className="flex items-center justify-center space-x-2 text-green-700">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="font-medium">Thanks! We'll notify you when we launch.</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Features Preview */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
              >
                {[
                  {
                    title: "Buy & Sell",
                    description: "Find rare and popular board games from fellow enthusiasts",
                    icon: "🎲"
                  },
                  {
                    title: "Trade Games",
                    description: "Exchange games you don't play for ones you'll love",
                    icon: "🔄"
                  },
                  {
                    title: "Community",
                    description: "Connect with board game lovers in your area",
                    icon: "👥"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
                    className="bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-border/50"
                  >
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </Container>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <Container>
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Board Game Hub. Something awesome is on the way.</p>
          </div>
        </Container>
      </footer>
    </div>
  );
}