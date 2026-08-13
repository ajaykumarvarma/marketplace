import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Shield, Eye, EyeOff, Github, Mail, Lock, AlertTriangle } from "lucide-react";
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
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (lockTimer > 0) {
      const t = setTimeout(() => setLockTimer((s) => s - 1), 1000);
      return () => clearTimeout(t);
    }
    if (lockTimer === 0 && locked) setLocked(false);
  }, [lockTimer, locked]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;
    setError("");

    const { error: authError } = await signIn(email, password);
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
      router.push("/marketplace");
    }
  };

  return (
    <>
      <SEO title="Sign In — TradeVault" description="Sign in to your TradeVault account to buy and sell digital goods securely." />
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 mx-auto">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your TradeVault account</p>
          </div>

          {locked && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Account temporarily locked</p>
                <p className="text-xs text-muted-foreground">Too many failed attempts. Try again in {Math.floor(lockTimer / 60)}:{String(lockTimer % 60).padStart(2, "0")}.</p>
              </div>
            </div>
          )}

          {error && !locked && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
          )}

          {attempts > 0 && !locked && !error && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
              <p className="text-xs text-muted-foreground">{5 - attempts} attempts remaining before temporary lock</p>
            </div>
          )}

          <div className="space-y-4">
            <Button variant="outline" className="w-full gap-2 border-border hover:bg-muted" onClick={() => {}}>
              <Github className="h-4 w-4" />
              Continue with GitHub
            </Button>
            <Button variant="outline" className="w-full gap-2 border-border hover:bg-muted" onClick={() => {}}>
              <Mail className="h-4 w-4" />
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted border-border"
                disabled={locked}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
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

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={locked}>
              <Lock className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-primary hover:underline font-medium">
              Create one
            </Link>
          </p>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3 text-success" />
            <span>256-bit SSL encrypted</span>
          </div>
        </div>
      </div>
    </>
  );
}