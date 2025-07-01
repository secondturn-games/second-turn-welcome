import Link from "next/link";
import { Container } from "./container";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={cn("border-t bg-background/50 py-8", className)}>
      <Container>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Second Turn</h3>
            <p className="text-sm text-muted-foreground">
              The best place to buy, sell, and trade board games with fellow enthusiasts.
            </p>
          </div>
          
          <div>
            <h4 className="mb-4 text-sm font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { href: "/about", label: "About Us" },
                { href: "/listings", label: "Browse Listings" },
                { href: "/faq", label: "FAQ" },
                { href: "/contact", label: "Contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 text-sm font-semibold">Legal</h4>
            <ul className="space-y-2">
              {[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
                { href: "/shipping", label: "Shipping Policy" },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Second Turn. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
