/**
 * Session cookie signing.
 *
 * The cookie used to hold the literal string "authenticated", which meant
 * anyone could type `document.cookie = "outreach_auth=authenticated"` and be
 * inside the admin. The value is now an expiry plus an HMAC of that expiry,
 * so it cannot be forged without ADMIN_PASS.
 *
 * Web Crypto rather than node:crypto, because this runs in the proxy (Edge
 * runtime) as well as in route handlers.
 */

const COOKIE_NAME = 'outreach_auth';
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // one week, same as the old cookie
const encoder = new TextEncoder();

async function hmacKey() {
  const secret = process.env.ADMIN_PASS;
  if (!secret) return null;
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

const toHex = (buffer) =>
  Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('');

async function signature(payload) {
  const key = await hmacKey();
  if (!key) return null;
  return toHex(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)));
}

/** Compare without leaking where two digests diverge. */
function equalHex(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Returns the cookie value for a fresh session, or null if ADMIN_PASS is unset. */
export async function createSession() {
  const expiry = String(Date.now() + TTL_MS);
  const sig = await signature(expiry);
  return sig ? `${expiry}.${sig}` : null;
}

/** True only for a cookie this server signed, that has not expired. */
export async function verifySession(value) {
  if (typeof value !== 'string' || !value) return false;
  const split = value.lastIndexOf('.');
  if (split < 1) return false;

  const expiry = value.slice(0, split);
  const sig = value.slice(split + 1);
  if (!/^\d{1,15}$/.test(expiry) || Number(expiry) < Date.now()) return false;

  const expected = await signature(expiry);
  return expected !== null && equalHex(sig, expected);
}

export { COOKIE_NAME, TTL_MS };
