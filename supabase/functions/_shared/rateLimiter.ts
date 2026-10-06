export interface RateLimitConfig { windowMs: number; maxRequests: number }

export async function checkRateLimit(identifier: string, config: RateLimitConfig): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const denied = { allowed: false, remaining: 0, resetTime: Date.now() + config.windowMs };
  try {
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const url = Deno.env.get('SUPABASE_URL');
    if (!key || !url) return denied;
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(identifier));
    const bucket = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
    const response = await fetch(url + '/rest/v1/rpc/consume_rate_limit', {
      method: 'POST',
      headers: { apikey: key, Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ bucket, window_ms: config.windowMs, maximum: config.maxRequests }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return denied;
    return await response.json();
  } catch {
    // Fail closed when the shared quota store is unavailable.
    return denied;
  }
}

export function getRateLimitIdentifier(req: Request): string {
  // Deployment must preserve trusted ingress IP headers. No client-defined
  // testing header can bypass the quota.
  const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  return new URL(req.url).pathname + ':' + ip;
}
