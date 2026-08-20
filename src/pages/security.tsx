import { Shield, Lock, Eye, Server, Fingerprint, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";

export default function SecurityPage() {
  return (
    <>
      <SEO title="Security — TradeVault" description="TradeVault's enterprise-grade security infrastructure, fraud detection, and buyer protection systems." />
      <div className="container py-12 md:py-20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border text-muted-foreground text-sm mb-4">
            <Shield className="h-4 w-4" />
            SOC 2 Type II Compliant
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">Security Infrastructure</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Multi-layered security architecture protecting every transaction with real-time fraud detection, escrow protection, and encrypted data handling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Lock, title: "256-bit TLS Encryption", desc: "All data in transit encrypted with AES-256-GCM. Certificates pinned and rotated automatically." },
            { icon: Eye, title: "Real-Time Fraud Detection", desc: "Velocity checks, device fingerprinting, IP reputation scoring, and behavioral analysis on every order." },
            { icon: Server, title: "Escrow Protection", desc: "Funds held in secure escrow until delivery is confirmed by the buyer. Chargeback-resistant architecture." },
            { icon: Fingerprint, title: "Device Fingerprinting", desc: "Canvas + WebGL + browser characteristic hashing to detect suspicious devices and prevent account takeover." },
            { icon: AlertTriangle, title: "Automated Risk Scoring", desc: "Every order scored 0-100 in real-time. High-risk transactions auto-flagged for manual review." },
            { icon: Clock, title: "Rate Limiting", desc: "Intelligent per-IP and per-user rate limits prevent brute force, scraping, and inventory hoarding." },
          ].map((f) => (
            <div key={f.title} className="bg-card border border-border rounded-lg p-6">
              <f.icon className="h-8 w-8 text-muted-foreground mb-3" />
              <h3 className="font-display font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-lg p-8 mb-16">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6">Live Protection Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Fraud Events Blocked", value: "12,847", change: "+3.2%" },
              { label: "Escrow Volume Protected", value: "$2.4M", change: "+18%" },
              { label: "Avg. Response Time", value: "42ms", change: "-12%" },
              { label: "Uptime", value: "99.97%", change: "Stable" },
            ].map((m) => (
              <div key={m.label}>
                <p className="text-2xl font-mono font-bold text-foreground mb-1">{m.value}</p>
                <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                <Badge variant="outline" className="text-xs border-border text-muted-foreground">{m.change}</Badge>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">Security Certifications</h2>
          <div className="flex flex-wrap gap-3">
            {["SOC 2 Type II", "PCI DSS Level 1", "GDPR Compliant", "ISO 27001", "CCPA Ready"].map((cert) => (
              <div key={cert} className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg border border-border">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}