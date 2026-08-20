import { supabase } from "@/integrations/supabase/client";

interface RateLimitState {
  count: number;
  resetAt: number;
  locked?: boolean;
  lockUntil?: number;
}

const memoryStore = new Map<string, RateLimitState>();

// Persist failed auth attempts to Supabase for cross-instance consistency
async function persistFailedAttempt(identifier: string) {
  try {
    await supabase.from("fraud_logs").insert({
      event_type: "failed_auth",
      user_id: identifier.startsWith("user:") ? identifier.slice(5) : null,
      metadata: { identifier, timestamp: new Date().toISOString() },
      reason: "Rate limit exceeded or failed authentication",
    });
  } catch {
    // Non-blocking: memory store is fallback
  }
}

export async function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60 * 1000,
  lockoutAfter?: number,
  lockoutDurationMs?: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number; locked?: boolean }> {
  const now = Date.now();
  const entry = memoryStore.get(key);

  // Check if currently locked out
  if (entry?.locked && entry.lockUntil && now < entry.lockUntil) {
    return { allowed: false, remaining: 0, resetAt: entry.lockUntil, locked: true };
  }

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    // Trigger lockout if configured
    if (lockoutAfter && entry.count >= lockoutAfter && lockoutDurationMs) {
      entry.locked = true;
      entry.lockUntil = now + lockoutDurationMs;
      await persistFailedAttempt(key);
      return { allowed: false, remaining: 0, resetAt: entry.lockUntil, locked: true };
    }
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

export async function rateLimitByIP(ip: string): Promise<{ allowed: boolean; remaining: number; locked?: boolean }> {
  const result = await checkRateLimit(`ip:${ip}`, 30, 60 * 1000);
  return { allowed: result.allowed, remaining: result.remaining, locked: result.locked };
}

export async function rateLimitAuth(identifier: string): Promise<{ allowed: boolean; remaining: number; locked?: boolean }> {
  // Stricter: 5 attempts per 15 min, lockout after 5 failed attempts for 30 min
  const result = await checkRateLimit(`auth:${identifier}`, 5, 15 * 60 * 1000, 5, 30 * 60 * 1000);
  return { allowed: result.allowed, remaining: result.remaining, locked: result.locked };
}

export async function rateLimitCheckout(userId: string): Promise<{ allowed: boolean; remaining: number; locked?: boolean }> {
  const result = await checkRateLimit(`checkout:${userId}`, 3, 60 * 1000);
  return { allowed: result.allowed, remaining: result.remaining, locked: result.locked };
}

// Clear rate limit for a key (e.g., after successful auth)
export function clearRateLimit(key: string) {
  memoryStore.delete(key);
}