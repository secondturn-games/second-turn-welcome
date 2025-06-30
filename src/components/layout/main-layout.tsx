'use client';

import dynamic from 'next/dynamic';

// Dynamically import components to avoid SSR issues
const Header = dynamic(() => import('./header').then(mod => mod.Header), { ssr: false });
const Footer = dynamic(() => import('./footer').then(mod => mod.Footer), { ssr: true });

// Import Toast components separately to avoid destructuring issues
const ToastProvider = dynamic(
  () => import('../ui/toaster').then(mod => mod.ToastProvider),
  { ssr: false, loading: () => null }
);

const ToastViewport = dynamic(
  () => import('../ui/toaster').then(mod => mod.ToastViewport),
  { ssr: false, loading: () => null }
);

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <ToastProvider>
        <Header />
        <main className="flex-1 flex justify-center">
          <div className="container max-w-7xl py-6">
            {children}
          </div>
        </main>
        <Footer />
        <ToastViewport />
      </ToastProvider>
    </div>
  );
}
