import { useState, useEffect } from "react";
import { Copy, Users, DollarSign, Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReferralCode {
  code: string;
  clicks: number;
  conversions: number;
  commission_earned: number;
  commission_rate: number;
}

interface Referral {
  referred_id: string | null;
  signup_at: string | null;
  first_order_at: string | null;
  commission_amount: number;
  paid: boolean;
}

export default function ReferralsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  async function fetchData() {
    setLoading(true);
    const { data: codeData } = await supabase
      .from("referral_codes")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (!codeData) {
      // Generate code
      const newCode = `TV${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const { data: created } = await supabase
        .from("referral_codes")
        .insert({ user_id: user!.id, code: newCode })
        .select()
        .single();
      setReferralCode(created);
    } else {
      setReferralCode(codeData);
    }

    const { data: tracking } = await supabase
      .from("referral_tracking")
      .select("*")
      .eq("referrer_id", user!.id)
      .order("created_at", { ascending: false });

    setReferrals(tracking || []);
    setLoading(false);
  }

  function copyLink() {
    if (!referralCode) return;
    const url = `${window.location.origin}/auth/register?ref=${referralCode.code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast({ title: "Referral link copied!" });
    setTimeout(() => setCopied(false), 2000);
  }

  const totalCommission = referrals.reduce((sum, r) => sum + r.commission_amount, 0);

  return (
    <>
      <SEO title="Referrals — TradeVault" />
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-2xl font-bold mb-2">Referral Program</h1>
          <p className="text-muted-foreground mb-6">Invite friends and earn {referralCode?.commission_rate || 5}% commission on their first order.</p>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="border border-border rounded-lg bg-card p-6 mb-6">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Your Referral Link</label>
                <div className="flex gap-2">
                  <Input
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/auth/register?ref=${referralCode?.code}`}
                    readOnly
                    className="bg-muted border-border font-mono text-sm"
                  />
                  <Button onClick={copyLink} className="gap-2">
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <StatCard icon={<Users className="h-5 w-5" />} label="Clicks" value={referralCode?.clicks || 0} />
                <StatCard icon={<Users className="h-5 w-5" />} label="Signups" value={referralCode?.conversions || 0} />
                <StatCard icon={<DollarSign className="h-5 w-5" />} label="Earned" value={`$${(referralCode?.commission_earned || 0).toFixed(2)}`} />
              </div>

              <h2 className="font-display text-lg font-semibold mb-3">Referral History</h2>
              {referrals.length === 0 ? (
                <div className="text-center py-8 border border-border rounded-lg bg-card">
                  <Link2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No referrals yet. Share your link to get started!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {referrals.map((ref, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
                      <div>
                        <p className="text-sm font-medium">{ref.referred_id ? "Referred User" : "Pending"}</p>
                        <p className="text-xs text-muted-foreground">{ref.signup_at ? new Date(ref.signup_at).toLocaleDateString() : "Not signed up yet"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">${ref.commission_amount.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{ref.paid ? "Paid" : "Pending"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="border border-border rounded-lg bg-card p-4 text-center">
      <div className="text-primary mx-auto mb-1">{icon}</div>
      <p className="font-display text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}