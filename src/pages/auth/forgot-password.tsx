import { useState } from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEO } from "@/components/SEO";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <>
      <SEO title="Reset Password — TradeVault" description="Reset your TradeVault account password." />
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted border border-border mx-auto mb-3">
              <Shield className="h-6 w-6 text-muted-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">Reset password</h1>
            <p className="text-sm text-muted-foreground">Enter your email and we'll send you a reset link</p>
          </div>

          {sent ? (
            <div className="bg-muted border border-border rounded-lg p-6 text-center mb-4">
              <CheckCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium text-foreground mb-2">Check your email</h3>
              <p className="text-sm text-muted-foreground mb-4">If an account exists for {email}, you'll receive a password reset link shortly.</p>
              <Button variant="outline" className="border-border" onClick={() => setSent(false)}>
                Send again
              </Button>
            </div>
          ) : (
            <form className="mb-4" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
              <div className="mb-4">
                <Label htmlFor="email" className="mb-2 block">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-muted border-border"
                />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                <Mail className="h-4 w-4" />
                Send Reset Link
              </Button>
            </form>
          )}

          <Link href="/auth/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </>
  );
}