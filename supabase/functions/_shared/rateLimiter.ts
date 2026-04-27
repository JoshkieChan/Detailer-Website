// Simple in-memory rate limiter for Supabase Edge Functions
// Note: For production, consider using a distributed cache like Upstash Redis

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitStore>();

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = store.get(identifier);

  // Clean up expired entries
  if (entry && entry.resetTime < now) {
    store.delete(identifier);
  }

  const currentEntry = store.get(identifier) || { count: 0, resetTime: now + config.windowMs };

  if (currentEntry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: currentEntry.resetTime,
    };
  }

  currentEntry.count++;
  store.set(identifier, currentEntry);

  return {
    allowed: true,
    remaining: config.maxRequests - currentEntry.count,
    resetTime: currentEntry.resetTime,
  };
}

// Get identifier from request (IP address or custom header)
export function getRateLimitIdentifier(req: Request): string {
  // Try to get from custom header first (for testing)
  const customId = req.headers.get('x-rate-limit-id');
  if (customId) return customId;

  // Fall back to IP address from Cloudflare/CF-Connecting-IP header
  const ip = req.headers.get('cf-connecting-ip') || 
             req.headers.get('x-forwarded-for')?.split(',')[0] || 
             'unknown';
  
  return ip;
}

// Clean up old entries periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetTime < now) {
      store.delete(key);
    }
  }
}, 60000); // Clean up every minute
