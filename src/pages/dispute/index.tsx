import { useState } from "react";
import Link from "next/link";
import { Shield, MessageSquare, Upload, ArrowLeft, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SEO } from "@/components/SEO";

export default function DisputePage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <SEO title="File a Dispute — TradeVault" description="Open a dispute for an order on TradeVault. Our team will review within 24 hours." />
      <div className="container py-8 md:py-12 max-w-2xl mx-auto space-y-8">
        <Link href="/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
            <Shield className="h-3.5 w-3.5" />
            Escrow Protected
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">File a Dispute</h1>
          <p className="text-muted-foreground">Our team will review your case within 24 hours. Funds remain in escrow during investigation.</p>
        </div>

        {submitted ? (
          <div className="bg-success/10 border border-success/20 rounded-lg p-8 text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-success mx-auto" />
            <h2 className="font-display text-xl font-semibold text-foreground">Dispute Filed</h2>
            <p className="text-muted-foreground">Case ID: <span className="font-mono text-foreground">DSP-9201</span></p>
            <p className="text-sm text-muted-foreground">You'll receive updates via email. Most disputes are resolved within 48 hours.</p>
            <Link href="/orders">
              <Button variant="outline" className="border-border hover:bg-muted mt-2">
                View My Orders
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order">Order ID</Label>
                <Input id="order" placeholder="ORD-XXXX" className="bg-muted border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <select id="reason" className="w-full px-3 py-2 rounded-md bg-muted border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                  <option>Item not delivered</option>
                  <option>Item not as described</option>
                  <option>Seller unresponsive</option>
                  <option>Account issue</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Details</Label>
              <Textarea
                id="details"
                placeholder="Describe what happened in detail..."
                rows={5}
                className="bg-muted border-border"
              />
            </div>

            <div className="space-y-2">
              <Label>Evidence (optional)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-2 hover:border-primary/30 transition-colors cursor-pointer">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">Drag and drop screenshots or click to upload</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
              </div>
            </div>

            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Fraud Warning</p>
                <p>False disputes may result in account suspension. All submissions are reviewed by our AI and human moderators.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="border-border hover:bg-muted" onClick={() => window.history.back()}>
                Cancel
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2" onClick={() => setSubmitted(true)}>
                <MessageSquare className="h-4 w-4" />
                Submit Dispute
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Clock, label: "Response Time", value: "< 24 hours" },
            { icon: Shield, label: "Funds Protected", value: "Escrow held" },
            { icon: MessageSquare, label: "Resolution", value: "48 hours avg" },
          ].map((stat) => (
            <div key={stat.label} className="bg-muted border border-border rounded-lg p-4 text-center space-y-1">
              <stat.icon className="h-5 w-5 text-primary mx-auto" />
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="font-medium text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}