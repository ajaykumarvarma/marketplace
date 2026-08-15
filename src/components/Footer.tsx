import Link from "next/link";
import { Shield, Github, Twitter, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 border border-primary/20">
                <Shield className="h-[18px] w-[18px] text-primary" />
              </div>
              <span className="font-display text-lg font-semibold tracking-tight text-foreground">
                Trade<span className="text-primary">Vault</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              The secure marketplace for digital goods. Escrow-protected transactions, fraud detection, and instant delivery.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm text-foreground mb-4">Buyers</h4>
            <ul>
              <li className="mb-2.5"><Link href="/marketplace" className="text-sm text-muted-foreground hover:text-foreground">Browse Marketplace</Link></li>
              <li className="mb-2.5"><Link href="/help" className="text-sm text-muted-foreground hover:text-foreground">How It Works</Link></li>
              <li className="mb-2.5"><Link href="/security" className="text-sm text-muted-foreground hover:text-foreground">Buyer Protection</Link></li>
              <li><Link href="/help" className="text-sm text-muted-foreground hover:text-foreground">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm text-foreground mb-4">Sellers</h4>
            <ul>
              <li className="mb-2.5"><Link href="/sell" className="text-sm text-muted-foreground hover:text-foreground">Start Selling</Link></li>
              <li className="mb-2.5"><Link href="/help" className="text-sm text-muted-foreground hover:text-foreground">Fees & Payouts</Link></li>
              <li className="mb-2.5"><Link href="/seller/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Seller Tools</Link></li>
              <li><Link href="/help" className="text-sm text-muted-foreground hover:text-foreground">API Documentation</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-sm text-foreground mb-4">Company</h4>
            <ul>
              <li className="mb-2.5"><Link href="/" className="text-sm text-muted-foreground hover:text-foreground">About Us</Link></li>
              <li className="mb-2.5"><Link href="/security" className="text-sm text-muted-foreground hover:text-foreground">Security</Link></li>
              <li><Link href="/help" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 TradeVault. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground">Terms of Service</Link>
            <Link href="/cookies" className="text-xs text-muted-foreground hover:text-foreground">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}