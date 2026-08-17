import { Code, Key, Webhook, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { SEO } from "@/components/SEO";

export default function DeveloperPortal() {
  return (
    <>
      <SEO title="Developer Portal — TradeVault API" />
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <Code className="h-12 w-12 text-primary mx-auto mb-4" />
            <h1 className="font-display text-3xl font-bold mb-2">Developer Portal</h1>
            <p className="text-muted-foreground">Build on top of TradeVault with our REST API and webhooks.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/developer/api-keys" className="border border-border rounded-lg bg-card p-6 hover:border-primary/30 transition-colors">
              <Key className="h-8 w-8 text-primary mb-3" />
              <h2 className="font-display text-lg font-semibold mb-1">API Keys</h2>
              <p className="text-sm text-muted-foreground mb-3">Generate and manage API keys for authentication.</p>
              <span className="text-sm text-primary flex items-center gap-1">Manage Keys <ArrowRight className="h-4 w-4" /></span>
            </Link>

            <Link href="/developer/webhooks" className="border border-border rounded-lg bg-card p-6 hover:border-primary/30 transition-colors">
              <Webhook className="h-8 w-8 text-accent mb-3" />
              <h2 className="font-display text-lg font-semibold mb-1">Webhooks</h2>
              <p className="text-sm text-muted-foreground mb-3">Subscribe to real-time platform events.</p>
              <span className="text-sm text-primary flex items-center gap-1">Manage Webhooks <ArrowRight className="h-4 w-4" /></span>
            </Link>

            <div className="border border-border rounded-lg bg-card p-6 md:col-span-2">
              <BookOpen className="h-8 w-8 text-muted-foreground mb-3" />
              <h2 className="font-display text-lg font-semibold mb-2">API Reference</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-success/10 text-success">GET</span>
                  <div>
                    <code className="font-mono text-xs">/api/v1/products</code>
                    <p className="text-muted-foreground text-xs mt-0.5">List all products with pagination and filters.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-success/10 text-success">GET</span>
                  <div>
                    <code className="font-mono text-xs">/api/v1/products/:id</code>
                    <p className="text-muted-foreground text-xs mt-0.5">Get detailed product information.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-primary/10 text-primary">POST</span>
                  <div>
                    <code className="font-mono text-xs">/api/v1/orders</code>
                    <p className="text-muted-foreground text-xs mt-0.5">Create a new order (requires authentication).</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-warning/10 text-warning">GET</span>
                  <div>
                    <code className="font-mono text-xs">/api/v1/orders/:id</code>
                    <p className="text-muted-foreground text-xs mt-0.5">Get order status and details.</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">Rate limit: 100 requests per minute per API key.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}