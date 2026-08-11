import { Shield, Lock, Eye, Server, Fingerprint, Bell, Clock, Globe } from "lucide-react";
import { SEO } from "@/components/SEO";

const features = [
  {
    icon: Lock,
    title: "256-bit SSL Encryption",
    description: "All data in transit is encrypted with industry-standard TLS 1.3. Your payment details never touch our servers unencrypted.",
  },
  {
    icon: Eye,
    title: "Escrow Protection",
    description: "Every transaction is held in escrow until delivery is confirmed. Sellers only get paid when buyers are satisfied.",
  },
  {
    icon: Fingerprint,
    title: "Multi-Factor Authentication",
    description: "Secure your account with TOTP-based 2FA. We support Google Authenticator, Authy, and hardware security keys.",
  },
  {
    icon: Server,
    title: "Cold Storage Funds",
    description: "Platform reserves and crypto holdings are stored in offline multi-signature wallets with geographic distribution.",
  },
  {
    icon: Bell,
    title: "Real-Time Fraud Alerts",
    description: "Our AI monitors every transaction for velocity anomalies, chargeback risk, and identity spoofing in real time.",
  },
  {
    icon: Clock,
    title: "24/7 Monitoring",
    description: "Security operations center staffed around the clock. Automated incident response with sub-60-second escalation.",
  },
  {
    icon: Globe,
    title: "GDPR & CCPA Compliant",
    description: "Your data is yours. Full export, deletion, and portability rights. We never sell your information to third parties.",
  },
  {
    icon: Shield,
    title: "Bug Bounty Program",
    description: "We partner with ethical hackers through HackerOne. Report vulnerabilities and get rewarded for keeping us secure.",
  },
];

export default function SecurityPage() {
  return (
    <>
      <SEO title="Security — TradeVault" description="Learn how TradeVault protects your transactions, data, and digital goods with industry-leading security." />
      <div className="container py-16 md:py-24 space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground">Security at TradeVault</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Trust is our only product. Every line of code, every process, and every policy is designed to keep your funds and data safe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="bg-card border border-border rounded-lg p-6 space-y-3 hover:border-primary/20 transition-colors">
              <feature.icon className="h-6 w-6 text-primary" />
              <h3 className="font-display font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-lg p-8 text-center space-y-4">
          <h2 className="font-display text-2xl font-bold text-foreground">Need to report a security issue?</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            We take security reports seriously. Contact our security team directly at security@tradevault.io or through our HackerOne program.
          </p>
          <p className="font-mono text-sm text-primary">security@tradevault.io</p>
        </div>
      </div>
    </>
  );
}