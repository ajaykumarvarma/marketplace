import Link from "next/link";
import { Shield, Github, Twitter, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-md">
                <Shield className="h-[18px] w-[18px] text-white" />
              </div>
              <span className="font-display text-lg font-semibold tracking-tight text-foreground">
                TradeVault
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              The secure marketplace for digital goods. Escrow-protected transactions, fraud detection, and instant delivery.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm text-foreground mb-4">Buyers</h4>
            <ul>
              <li className="mb-2.5"><Link href="/marketplace" className="text-sm text-muted-foreground hover:text-primary transition-colors">Browse Marketplace</Link></li>
              <li className="mb-2.5"><Link href="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">How It Works</Link></li>
              <li className="mb-2.5"><Link href="/security" className="text-sm text-muted-foreground hover:text-primary transition-colors">Buyer Protection</Link></li>
              <li><Link href="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm text-foreground mb-4">Sellers</h4>
            <ul>
              <li className="mb-2.5"><Link href="/sell" className="text-sm text-muted-foreground hover:text-primary transition-colors">Start Selling</Link></li>
              <li className="mb-2.5"><Link href="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">Fees & Payouts</Link></li>
              <li className="mb-2.5"><Link href="/seller/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">Seller Tools</Link></li>
              <li><Link href="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">API Documentation</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm text-foreground mb-4">Company</h4>
            <ul>
              <li className="mb-2.5"><Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li className="mb-2.5"><Link href="/security" className="text-sm text-muted-foreground hover:text-primary transition-colors">Security</Link></li>
              <li><Link href="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 TradeVault. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="text-xs text-muted-foreground hover:text-primary transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}