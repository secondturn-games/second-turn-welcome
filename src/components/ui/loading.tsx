import { Loader2 } from 'lucide-react';

interface LoadingProps {
  className?: string;
  text?: string;
}

/**
 * A loading spinner component with optional text
 * @param {string} className - Additional CSS classes
 * @param {string} text - Optional text to display below the spinner
 */
export function Loading({ className = '', text }: LoadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

/**
 * A full-page loading spinner
 */
export function PageLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loading text="Loading..." className="h-12 w-12" />
    </div>
  );
}
