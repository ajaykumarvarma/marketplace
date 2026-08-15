import { useState } from "react";
import Link from "next/link";
import { Mail, MessageSquare, ArrowRight, Send, CheckCircle, Shield, Clock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SEO } from "@/components/SEO";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.success) {
        setTicketId(result.ticketId || "");
        setSubmitted(true);
      }
    } catch {
      // Handle error silently
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Contact Support — TradeVault" description="Get help with your orders, account, or selling on TradeVault. Our support team responds within 24 hours." />
      <div className="container py-8 md:py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">Contact Support</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">Need help with an order, account, or listing? Our team is here to assist you within 24 hours.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center space-y-4">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                    <CheckCircle className="h-8 w-8 text-success" />
                  </div>
                  <h2 className="font-display text-xl font-semibold text-foreground">Ticket Submitted</h2>
                  <p className="text-muted-foreground">Your support ticket has been received. We will respond within 24 hours.</p>
                  {ticketId && (
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Ticket ID</p>
                      <p className="font-mono text-sm text-primary">{ticketId}</p>
                    </div>
                  )}
                  <Button onClick={() => setSubmitted(false)} variant="outline" className="border-border hover:bg-muted">
                    Submit Another Ticket
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" placeholder="John Doe" className="bg-muted border-border" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" placeholder="john@example.com" className="bg-muted border-border" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" name="subject" placeholder="Order #TV-12345 issue" className="bg-muted border-border" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" name="message" placeholder="Describe your issue in detail..." className="bg-muted border-border min-h-[150px]" required />
                  </div>
                  <Button type="submit" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
                    <Send className="h-4 w-4" />
                    {loading ? "Submitting..." : "Submit Ticket"}
                  </Button>
                </form>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h3 className="font-display font-semibold text-foreground">Quick Links</h3>
                <div className="space-y-3">
                  <Link href="/help" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Help Center
                    <ArrowRight className="h-3 w-3 ml-auto" />
                  </Link>
                  <Link href="/dispute" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground">
                    <Shield className="h-4 w-4 text-primary" />
                    Dispute Resolution
                    <ArrowRight className="h-3 w-3 ml-auto" />
                  </Link>
                  <Link href="/security" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground">
                    <Shield className="h-4 w-4 text-primary" />
                    Security Center
                    <ArrowRight className="h-3 w-3 ml-auto" />
                  </Link>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h3 className="font-display font-semibold text-foreground">Contact Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="h-4 w-4 text-primary" />
                    support@tradevault.io
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    Response time: ~24 hours
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Globe className="h-4 w-4 text-primary" />
                    Global support, English
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}