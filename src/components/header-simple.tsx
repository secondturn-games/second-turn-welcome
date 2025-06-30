import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={cn("bg-background border-b w-full py-4", className)}>
      <div className="container mx-auto px-4">
        <h1 className="text-xl font-bold">BoardGameSwap</h1>
      </div>
    </header>
  );
}
