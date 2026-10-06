export async function verifyWebhook({
  body, verifierToken, webhookId, webhookTimestamp, webhookSignature, now = Date.now(),
}: { body: string; verifierToken: string; webhookId: string; webhookTimestamp: string; webhookSignature: string; now?: number }) {
  const timestamp = Number(webhookTimestamp);
  if (!Number.isFinite(timestamp) || Math.abs(now / 1000 - timestamp) > 300 || !webhookId) return false;
  try {
    const decode = (value: string) => Uint8Array.from(atob(value), char => char.charCodeAt(0));
    const key = await crypto.subtle.importKey('raw', decode(verifierToken), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const content = new TextEncoder().encode(webhookId + '.' + webhookTimestamp + '.' + body);
    for (const entry of webhookSignature.split(' ')) {
      const [version, signature] = entry.split(',');
      if (version === 'v1' && signature && await crypto.subtle.verify('HMAC', key, decode(signature), content)) return true;
    }
  } catch { return false; }
  return false;
}
