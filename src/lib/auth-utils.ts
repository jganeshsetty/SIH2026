// ============================================================================
// Farmora Cryptographic Utilities & JWT Token Manager
// ============================================================================

import crypto from 'node:crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'farmora_secret_jwt_key_2026_production_secure';

/**
 * Hashes raw password using Node.js scrypt derivation with random salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verifies raw password against stored salted scrypt hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, key] = storedHash.split(':');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
}

/**
 * Generates signed HMAC SHA256 JWT session token
 */
export function generateToken(payload: {
  uid: string;
  email: string;
  role: string;
  name: string;
}): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const bodyPayload = Buffer.from(JSON.stringify({
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30-day expiration
  })).toString('base64url');

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${bodyPayload}`)
    .digest('base64url');

  return `${header}.${bodyPayload}.${signature}`;
}

/**
 * Verifies signature and expiration of Farmora session token
 */
export function verifyToken(token: string): {
  uid: string;
  email: string;
  role: string;
  name: string;
} | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return decoded;
  } catch (err) {
    return null;
  }
}
