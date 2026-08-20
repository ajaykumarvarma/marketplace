import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Shield, Eye, EyeOff, Github, Mail, Store, User, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: "Weak", color: "bg-muted" };
  if (score <= 3) return { score, label: "Fair", color: "bg-muted" };
  if (score <= 4) return { score, label: "Good", color: "bg-muted" };
  return { score, label: "Strong", color: "bg-muted" };
}

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState<"buyer" | "seller">("buyer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  useEffect(() => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  }, [email]);

  useEffect(() => {
    if (password && password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
    } else {
      setPasswordError("");
    }
  }, [password]);

  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setConfirmError("Passwords do not match");
    } else {
      setConfirmError("");
    }
  }, [confirmPassword, password]);

  const isFormValid = email && !emailError && password.length >= 8 && passwordsMatch && username.length >= 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setError("Please fix the errors above");
      return;
    }
    setError("");
    setLoading(true);

    const { error: authError } = await signUp(email, password, accountType);
    setLoading(false);

    if (authError) {
      setError(authError.message);
    } else {
      const refCode = router.query.ref as string;
      if (refCode) {
        const { data: refData } = await supabase
          .from("referral_codes")
          .select("user_id")
          .eq("code", refCode)
          .maybeSingle();
        if (refData) {
          await supabase.from("referral_tracking").insert({
            referrer_id: refData.user_id,
            referral_code: refCode,
            commission_amount: 0,
            paid: false,
          });
        }
      }
      router.push("/marketplace");
    }
  };

  return (
    <>
      <SEO title="Create Account — TradeVault" description="Create your TradeVault account. Start buying or selling digital goods securely today." />
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted border border-border mx-auto mb-3">
              <Shield className="h-6 w-6 text-muted-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">Create your account</h1>
            <p className="text-sm text-muted-foreground">Join thousands trading digital goods securely</p>
          </div>

          {error && (
            <div className="bg-muted border border-border rounded-lg p-3 flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0" />
              <p className="text-xs text-foreground">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg mb-4">
            <button
              type="button"
              onClick={() => setAccountType("buyer")}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${accountType === "buyer" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            >
              <User className="h-4 w-4" />
              Buyer
            </button>
            <button
              type="button"
              onClick={() => setAccountType("seller")}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${accountType === "seller" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            >
              <Store className="h-4 w-4" />
              Seller
            </button>
          </div>

          <div className="mb-4">
            <Button variant="outline" className="w-full gap-2 border-border mb-2" onClick={() => {}}>
              <Github className="h-4 w-4" />
              Continue with GitHub
            </Button>
            <Button variant="outline" className="w-full gap-2 border-border" onClick={() => {}}>
              <Mail className="h-4 w-4" />
              Continue with Google
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-medium">Or continue with email</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="username" className="mb-2 block">Username</Label>
              <Input id="username" type="text" placeholder="trader123" value={username} onChange={(e) => setUsername(e.target.value)} className="bg-muted border-border" required minLength={3} />
              {username.length > 0 && username.length < 3 && (
                <p className="text-xs text-foreground mt-1">Username must be at least 3 characters</p>
              )}
            </div>
            <div className="mb-4">
              <Label htmlFor="email" className="mb-2 block">Email</Label>
              <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={`bg-muted border-border ${emailError ? "border-foreground" : ""}`} required />
              {emailError && <p className="text-xs text-foreground mt-1">{emailError}</p>}
            </div>
            <div className="mb-4">
              <Label htmlFor="password" className="mb-2 block">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} className={`bg-muted border-border pr-10 ${passwordError ? "border-foreground" : ""}`} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${passwordStrength.color} rounded-full transition-all`} style={{ width: `${(passwordStrength.score / 5) * 100}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{passwordStrength.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="flex items-center gap-1 text-xs">
                      {password.length >= 8 ? <CheckCircle className="h-3 w-3 text-muted-foreground" /> : <XCircle className="h-3 w-3 text-muted-foreground/60" />}
                      <span className={password.length >= 8 ? "text-muted-foreground" : "text-muted-foreground/60"}>8+ characters</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {/[A-Z]/.test(password) ? <CheckCircle className="h-3 w-3 text-muted-foreground" /> : <XCircle className="h-3 w-3 text-muted-foreground/60" />}
                      <span className={/[A-Z]/.test(password) ? "text-muted-foreground" : "text-muted-foreground/60"}>Uppercase</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {/[0-9]/.test(password) ? <CheckCircle className="h-3 w-3 text-muted-foreground" /> : <XCircle className="h-3 w-3 text-muted-foreground/60" />}
                      <span className={/[0-9]/.test(password) ? "text-muted-foreground" : "text-muted-foreground/60"}>Number</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {/[^A-Za-z0-9]/.test(password) ? <CheckCircle className="h-3 w-3 text-muted-foreground" /> : <XCircle className="h-3 w-3 text-muted-foreground/60" />}
                      <span className={/[^A-Za-z0-9]/.test(password) ? "text-muted-foreground" : "text-muted-foreground/60"}>Special char</span>
                    </div>
                  </div>
                </div>
              )}
              {passwordError && <p className="text-xs text-foreground mt-1">{passwordError}</p>}
            </div>

            <div className="mb-4">
              <Label htmlFor="confirmPassword" className="mb-2 block">Confirm Password</Label>
              <Input id="confirmPassword" type="password" placeholder="Repeat your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`bg-muted border-border ${confirmError ? "border-foreground" : ""}`} required />
              {confirmError && <p className="text-xs text-foreground mt-1">{confirmError}</p>}
              {passwordsMatch && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Passwords match</p>}
            </div>

            <div className="flex items-start gap-2 mb-4">
              <input type="checkbox" id="terms" className="mt-1 h-4 w-4 rounded border-border bg-muted accent-primary" required />
              <label htmlFor="terms" className="text-xs text-muted-foreground">
                I agree to the <Link href="/terms" className="text-foreground hover:text-muted-foreground">Terms of Service</Link> and <Link href="/privacy" className="text-foreground hover:text-muted-foreground">Privacy Policy</Link>
              </label>
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading || !isFormValid}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account? <Link href="/auth/login" className="text-foreground hover:text-muted-foreground font-medium">Sign in</Link>
          </p>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
            <Shield className="h-3 w-3 text-muted-foreground" />
            <span>256-bit SSL encrypted</span>
          </div>
        </div>
      </div>
    </>
  );
}