import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import dynamic from 'next/dynamic';
import './globals.css';
import './direct.css'; // Direct CSS styling as fallback

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'BoardGameSwap - Trade Your Board Games',
  description: 'A peer-to-peer marketplace for board game enthusiasts to buy, sell, and trade board games.',
  keywords: ['board games', 'trading', 'marketplace', 'board game exchange', 'sell board games'],
  authors: [{ name: 'BoardGameSwap Team' }],
  creator: 'BoardGameSwap',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

// Create a client component that wraps the app with ThemeProvider
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth-provider';

// Create a client component that wraps the app with ThemeProvider
function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}

// Import MainLayout with SSR
const MainLayout = dynamic(
  () => import('@/components/layout/main-layout').then(mod => mod.MainLayout),
  { ssr: true }
);

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  primary: '#294D58',
                  secondary: '#DBE5B9',
                  background: '#FDFAF3',
                  accent: '#FF8157',
                }
              }
            }
          }
        ` }}></script>
      </head>
      <body className={`${inter.variable} font-sans min-h-screen bg-background`}>
        <ThemeProviderWrapper>
          <AuthProvider>
            <MainLayout>{children}</MainLayout>
          </AuthProvider>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
