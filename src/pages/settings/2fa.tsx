import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Shield, Copy, Check, Smartphone, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import QRCode from "react-qr-code";

export default function TwoFactorAuthPage() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  const [step, setStep] = useState<"overview" | "setup" | "verify" | "disable">("overview");
  const [secret, setSecret] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) router.push("/auth/login");
  }, [user, router]);

  const generateSecret = async () => {
    try {
      const res = await fetch("/api/2fa/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSecret(data.secret);
      setQrUrl(data.otpauth_url);
      setStep("setup");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate secret");
    }
  };

  const verifyCode = async (token: string, secretToVerify: string) => {
    const res = await fetch("/api/2fa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: secretToVerify, code: token }),
    });
    const data = await res.json();
    return data.valid === true;
  };

  const verifyAndEnable = async () => {
    setError("");
    const valid = await verifyCode(code, secret);
    if (!valid) {
      setError("Invalid code. Please try again.");
      return;
    }
    setLoading(true);
    await supabase.auth.updateUser({
      data: { two_factor_secret: secret, two_factor_enabled: true },
    });
    await supabase
      .from("profiles")
      .update({ two_factor_enabled: true, two_factor_secret: secret })
      .eq("id", user!.id);
    await refreshProfile();
    setLoading(false);
    setStep("overview");
  };

  const disable2FA = async () => {
    setError("");
    const valid = await verifyCode(code, profile?.two_factor_secret || "");
    if (!valid) {
      setError("Invalid code. Cannot disable 2FA.");
      return;
    }
    setLoading(true);
    await supabase.auth.updateUser({
      data: { two_factor_secret: null, two_factor_enabled: false },
    });
    await supabase
      .from("profiles")
      .update({ two_factor_enabled: false, two_factor_secret: null })
      .eq("id", user!.id);
    await refreshProfile();
    setLoading(false);
    setStep("overview");
    setCode("");
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return null;

  return (
    <>
      <SEO title="Two-Factor Authentication — TradeVault" description="Secure your TradeVault account with 2FA." />
      <div className="container py-12 max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Two-Factor Authentication</h1>
            <p className="text-foreground/70">Add an extra layer of security to your account</p>
          </div>
        </div>

        {step === "overview" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                {profile?.two_factor_enabled ? "2FA is Enabled" : "Protect Your Account"}
              </CardTitle>
              <CardDescription>
                {profile?.two_factor_enabled
                  ? "Your account is protected with TOTP-based two-factor authentication."
                  : "Enable 2FA to require a verification code from your authenticator app when signing in."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profile?.two_factor_enabled ? (
                <div className="space-y-4">
                  <Badge className="bg-success/10 text-success border-success/20">Active</Badge>
                  <Button variant="destructive" onClick={() => setStep("disable")}>Disable 2FA</Button>
                </div>
              ) : (
                <Button onClick={generateSecret}>Enable 2FA</Button>
              )}
            </CardContent>
          </Card>
        )}

        {step === "setup" && (
          <Card>
            <CardHeader>
              <CardTitle>Scan QR Code</CardTitle>
              <CardDescription>
                Scan this code with Google Authenticator, Authy, or any TOTP app.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white p-4 rounded-lg inline-block">
                <QRCode value={qrUrl} size={200} />
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono text-foreground break-all">
                  {secret}
                </code>
                <Button variant="outline" size="icon" onClick={copySecret}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("overview")}>Cancel</Button>
                <Button onClick={() => { setCode(""); setStep("verify"); }}>Next</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "verify" && (
          <Card>
            <CardHeader>
              <CardTitle>Verify Code</CardTitle>
              <CardDescription>Enter the 6-digit code from your authenticator app.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="font-mono text-center text-lg tracking-widest"
              />
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("setup")}>Back</Button>
                <Button onClick={verifyAndEnable} disabled={loading || code.length !== 6}>
                  {loading ? "Verifying..." : "Enable 2FA"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "disable" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Disable 2FA</CardTitle>
              <CardDescription>Enter your authenticator code to confirm.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="font-mono text-center text-lg tracking-widest"
              />
              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("overview")}>Cancel</Button>
                <Button variant="destructive" onClick={disable2FA} disabled={loading || code.length !== 6}>
                  {loading ? "Disabling..." : "Disable 2FA"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}