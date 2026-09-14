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
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-12">
        {/* Rich background */}
        <div className="absolute inset-0 bg-mesh-cool" />
        <div className="absolute inset-0 bg-dot-pattern opacity-30" />
        <div className="absolute top-20 right-[10%] w-96 h-96 bg-gradient-to-bl from-cyan-500/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-[5%] w-80 h-80 bg-gradient-to-tr from-violet-500/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-blue-500/15 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

        <div className="relative w-full max-w-md">
          <div className="bg-card/80 backdrop-blur-md border border-border/60 rounded-2xl p-8 shadow-card-hover">
            <div className="text-center mb-6">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg mx-auto mb-4">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">Create your account</h1>
              <p className="text-sm text-muted-foreground">Join thousands trading digital goods securely</p>
            </div>

            {error && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 mb-4 backdrop-blur-sm">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                <p className="text-xs text-foreground">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 p-1 bg-muted/50 backdrop-blur-sm rounded-lg mb-4 border border-border/40">
              <button
                type="button"
                onClick={() => setAccountType("buyer")}
                className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${accountType === "buyer" ? "bg-card text-foreground shadow-md border border-border/60" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
              >
                <User className="h-4 w-4" />
                Buyer
              </button>
              <button
                type="button"
                onClick={() => setAccountType("seller")}
                className={`flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${accountType === "seller" ? "bg-card text-foreground shadow-md border border-border/60" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
              >
                <Store className="h-4 w-4" />
                Seller
              </button>
            </div>

            <div className="mb-4">
              <Button variant="outline" className="w-full gap-2 border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:bg-primary/5 mb-2" onClick={() => {}}>
                <Github className="h-4 w-4" />
                Continue with GitHub
              </Button>
              <Button variant="outline" className="w-full gap-2 border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:bg-primary/5" onClick={() => {}}>
                <Mail className="h-4 w-4" />
                Continue with Google
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/60" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card/80 px-2 text-muted-foreground font-medium backdrop-blur-sm">Or continue with email</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Label htmlFor="username" className="mb-2 block">Username</Label>
                <Input id="username" type="text" placeholder="trader123" value={username} onChange={(e) => setUsername(e.target.value)} className="bg-muted/50 border-border/60 backdrop-blur-sm" required minLength={3} />
                {username.length > 0 && username.length < 3 && (
                  <p className="text-xs text-red-400 mt-1">Username must be at least 3 characters</p>
                )}
              </div>
              <div className="mb-4">
                <Label htmlFor="email" className="mb-2 block">Email</Label>
                <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={`bg-muted/50 border-border/60 backdrop-blur-sm ${emailError ? "border-red-400" : ""}`} required />
                {emailError && <p className="text-xs text-red-400 mt-1">{emailError}</p>}
              </div>
              <div className="mb-4">
                <Label htmlFor="password" className="mb-2 block">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} className={`bg-muted/50 border-border/60 backdrop-blur-sm pr-10 ${passwordError ? "border-red-400" : ""}`} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${passwordStrength.score <= 2 ? "bg-red-400" : passwordStrength.score <= 3 ? "bg-amber-400" : passwordStrength.score <= 4 ? "bg-primary" : "bg-emerald-400"}`} style={{ width: `${(passwordStrength.score / 5) * 100}%` }} />
                      </div>
                      <span className={`text-xs font-medium ${passwordStrength.score <= 2 ? "text-red-400" : passwordStrength.score <= 3 ? "text-amber-400" : passwordStrength.score <= 4 ? "text-primary" : "text-emerald-400"}`}>{passwordStrength.label}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <div className="flex items-center gap-1 text-xs">
                        {password.length >= 8 ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-muted-foreground/60" />}
                        <span className={password.length >= 8 ? "text-emerald-400" : "text-muted-foreground/60"}>8+ characters</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        {/[A-Z]/.test(password) ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-muted-foreground/60" />}
                        <span className={/[A-Z]/.test(password) ? "text-emerald-400" : "text-muted-foreground/60"}>Uppercase</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        {/[0-9]/.test(password) ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-muted-foreground/60" />}
                        <span className={/[0-9]/.test(password) ? "text-emerald-400" : "text-muted-foreground/60"}>Number</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        {/[^A-Za-z0-9]/.test(password) ? <CheckCircle className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-muted-foreground/60" />}
                        <span className={/[^A-Za-z0-9]/.test(password) ? "text-emerald-400" : "text-muted-foreground/60"}>Special char</span>
                      </div>
                    </div>
                  </div>
                )}
                {passwordError && <p className="text-xs text-red-400 mt-1">{passwordError}</p>}
              </div>

              <div className="mb-4">
                <Label htmlFor="confirmPassword" className="mb-2 block">Confirm Password</Label>
                <Input id="confirmPassword" type="password" placeholder="Repeat your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`bg-muted/50 border-border/60 backdrop-blur-sm ${confirmError ? "border-red-400" : ""}`} required />
                {confirmError && <p className="text-xs text-red-400 mt-1">{confirmError}</p>}
                {passwordsMatch && <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Passwords match</p>}
              </div>

              <div className="flex items-start gap-2 mb-4">
                <input type="checkbox" id="terms" className="mt-1 h-4 w-4 rounded border-border/60 bg-muted/50 accent-primary" required />
                <label htmlFor="terms" className="text-xs text-muted-foreground">
                  I agree to the <Link href="/terms" className="text-primary hover:text-primary/80">Terms of Service</Link> and <Link href="/privacy" className="text-primary hover:text-primary/80">Privacy Policy</Link>
                </label>
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-primary to-blue-500 hover:opacity-90 text-white shadow-lg shadow-primary/25 border-0" disabled={loading || !isFormValid}>
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
              Already have an account? <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium">Sign in</Link>
            </p>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
              <Shield className="h-3 w-3 text-primary" />
              <span>256-bit SSL encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}