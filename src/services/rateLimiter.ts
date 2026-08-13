interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

export function rateLimitByIP(ip: string): { allowed: boolean; remaining: number } {
  return checkRateLimit(`ip:${ip}`, 30, 60 * 1000);
}

export function rateLimitAuth(identifier: string): { allowed: boolean; remaining: number } {
  return checkRateLimit(`auth:${identifier}`, 5, 15 * 60 * 1000);
}

export function rateLimitCheckout(userId: string): { allowed: boolean; remaining: number } {
  return checkRateLimit(`checkout:${userId}`, 3, 60 * 1000);
}