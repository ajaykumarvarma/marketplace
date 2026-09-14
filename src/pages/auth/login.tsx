import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Shield, Eye, EyeOff, Github, Mail, Lock, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    if (lockTimer > 0) {
      const t = setTimeout(() => setLockTimer((s) => s - 1), 1000);
      return () => clearTimeout(t);
    }
    if (lockTimer === 0 && locked) setLocked(false);
  }, [lockTimer, locked]);

  useEffect(() => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (locked || loading) return;
    setError("");
    setLoading(true);

    const { error: authError } = await signIn(email, password);
    setLoading(false);

    if (authError) {
      setAttempts((a) => {
        const next = a + 1;
        if (next >= 5) {
          setLocked(true);
          setLockTimer(300);
        }
        return next;
      });
      setError(authError.message);
    } else {
      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem("tradevault_remember_email", email);
      } else {
        localStorage.removeItem("tradevault_remember_email");
      }
      router.push("/marketplace");
    }
  };

  // Load remembered email on mount
  useEffect(() => {
    const remembered = localStorage.getItem("tradevault_remember_email");
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  return (
    <>
      <SEO title="Sign In — TradeVault" description="Sign in to your TradeVault account to buy and sell digital goods securely." />
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-12">
        {/* Rich background */}
        <div className="absolute inset-0 bg-mesh-violet" />
        <div className="absolute inset-0 bg-dot-pattern opacity-30" />
        <div className="absolute top-20 right-[10%] w-96 h-96 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-[5%] w-80 h-80 bg-gradient-to-tr from-accent/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

        <div className="relative w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-card-hover">
            <div className="text-center mb-6">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg mx-auto mb-4">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground mb-2">Welcome back</h1>
              <p className="text-sm text-muted-foreground">Sign in to your TradeVault account</p>
            </div>

            {locked && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 flex items-start gap-3 mb-4">
                <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Account temporarily locked</p>
                  <p className="text-xs text-muted-foreground">Too many failed attempts. Try again in {Math.floor(lockTimer / 60)}:{String(lockTimer % 60).padStart(2, "0")}.</p>
                </div>
              </div>
            )}

            {error && !locked && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 flex items-center gap-2 mb-4">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
                <p className="text-xs text-foreground">{error}</p>
              </div>
            )}

            {attempts > 0 && !locked && !error && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 flex items-center gap-2 mb-4">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                <p className="text-xs text-foreground">{5 - attempts} attempts remaining before temporary lock</p>
              </div>
            )}

            <div className="mb-4 space-y-2">
              <Button variant="outline" className="w-full gap-2 border-border bg-muted hover:border-primary/30 hover:bg-primary/5" onClick={() => {}}>
                <Github className="h-4 w-4" />
                Continue with GitHub
              </Button>
              <Button variant="outline" className="w-full gap-2 border-border bg-muted hover:border-primary/30 hover:bg-primary/5" onClick={() => {}}>
                <Mail className="h-4 w-4" />
                Continue with Google
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Label htmlFor="email" className="mb-2 block">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`bg-muted border-border ${emailError ? "border-red-400" : ""}`}
                  disabled={locked}
                  required
                />
                {emailError && <p className="text-xs text-red-400 mt-1">{emailError}</p>}
              </div>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/auth/forgot-password" className="text-xs text-primary hover:text-primary/80">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-muted border-border pr-10"
                    disabled={locked}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-border bg-muted accent-primary"
                />
                <label htmlFor="remember" className="text-xs text-muted-foreground">Remember my email</label>
              </div>

              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={locked || loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-primary hover:text-primary/80 font-medium">
                Create one
              </Link>
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