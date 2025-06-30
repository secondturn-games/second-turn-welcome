import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={cn("border-t bg-background py-6", className)}>
      <div className="container mx-auto px-4">
        <p className="text-center text-sm text-muted-foreground">
          © {currentYear} BoardGameSwap. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
