import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { getSupabaseClient, getSupabaseJwksUrl, isSupabaseConfigured } from './supabase.ts';

// Ephemeral fallback secret generated in memory if SESSION_SECRET is not set
const IN_MEMORY_SESSION_SECRET = crypto.randomBytes(32).toString('hex');

function getSessionSecret(): string {
  return process.env.SESSION_SECRET?.trim() || IN_MEMORY_SESSION_SECRET;
}

export type PortalRole = 'admin' | 'educador' | 'pais';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: PortalRole;
  title: string;
  avatarLetter: string;
  nif?: string;
}

export interface AuthRequest extends Request {
  user?: SessionUser;
}

export function formatEducatorNameServer(name: string): string {
  if (!name || !name.trim()) return 'Tia';
  const trimmed = name.trim();
  if (/^tia\s+/i.test(trimmed)) {
    return trimmed.replace(/^tia\s+/i, 'Tia ');
  }
  if (/^tia$/i.test(trimmed)) {
    return 'Tia';
  }
  if (/^(profa\.?|prof\.?|educadora)\s+/i.test(trimmed)) {
    return trimmed.replace(/^(profa\.?|prof\.?|educadora)\s+/i, 'Tia ');
  }
  return `Tia ${trimmed}`;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, originalHex] = parts;
  if (!salt || !originalHex) return false;
  const derivedBuf = crypto.scryptSync(password, salt, 64);
  const originalBuf = Buffer.from(originalHex, 'hex');
  if (derivedBuf.length !== originalBuf.length) return false;
  return crypto.timingSafeEqual(derivedBuf, originalBuf);
}

interface TokenPayload {
  user: SessionUser;
  exp: number;
}

export function signSessionToken(user: SessionUser, ttlSeconds = 60 * 60 * 12): string {
  const payload: TokenPayload = {
    user,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds
  };
  const data = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(data)
    .digest('base64url');
  return `${data}.${sig}`;
}

export function verifySessionToken(token: string): SessionUser | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  if (!data || !sig) return null;

  const expectedSig = crypto
    .createHmac('sha256', getSessionSecret())
    .update(data)
    .digest('base64url');

  const sigBuf = Buffer.from(sig, 'utf8');
  const expectedBuf = Buffer.from(expectedSig, 'utf8');
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const decoded = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as TokenPayload;
    if (!decoded?.user?.id || !decoded.exp || decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return decoded.user;
  } catch {
    return null;
  }
}

interface JwkKey extends crypto.JsonWebKey {
  kid?: string;
  alg?: string;
  use?: string;
}

interface JwksCache {
  url: string;
  keys: JwkKey[];
  fetchedAt: number;
}

let jwksCache: JwksCache | null = null;
const JWKS_CACHE_TTL_MS = 5 * 60 * 1000;

async function fetchJwksKeys(jwksUrl: string, forceRefresh = false): Promise<JwkKey[]> {
  if (
    !forceRefresh &&
    jwksCache &&
    jwksCache.url === jwksUrl &&
    Date.now() - jwksCache.fetchedAt < JWKS_CACHE_TTL_MS
  ) {
    return jwksCache.keys;
  }

  const response = await fetch(jwksUrl, {
    headers: { Accept: 'application/json' }
  });
  if (!response.ok) {
    throw new Error(`JWKS fetch failed (${response.status})`);
  }

  const body = (await response.json()) as { keys?: JwkKey[] };
  const keys = Array.isArray(body?.keys) ? body.keys : [];
  jwksCache = { url: jwksUrl, keys, fetchedAt: Date.now() };
  return keys;
}

function verifyJwtSignatureWithJwk(
  alg: string,
  signingInput: string,
  signatureBuf: Buffer,
  jwk: JwkKey
): boolean {
  const publicKey = crypto.createPublicKey({ key: jwk, format: 'jwk' });
  const data = Buffer.from(signingInput, 'utf8');

  switch (alg) {
    case 'ES256':
      return crypto.verify('sha256', data, { key: publicKey, dsaEncoding: 'ieee-p1363' }, signatureBuf);
    case 'ES384':
      return crypto.verify('sha384', data, { key: publicKey, dsaEncoding: 'ieee-p1363' }, signatureBuf);
    case 'RS256':
      return crypto.verify('RSA-SHA256', data, publicKey, signatureBuf);
    case 'RS384':
      return crypto.verify('RSA-SHA384', data, publicKey, signatureBuf);
    case 'RS512':
      return crypto.verify('RSA-SHA512', data, publicKey, signatureBuf);
    case 'EdDSA':
      return crypto.verify(null, data, publicKey, signatureBuf);
    default:
      return false;
  }
}

export async function verifySupabaseJwtWithJwks(token: string): Promise<SessionUser | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const jwksUrl = getSupabaseJwksUrl();
  if (!jwksUrl || !isSupabaseConfigured()) return null;

  const [headerB64, payloadB64, sigB64] = parts;
  if (!headerB64 || !payloadB64 || !sigB64) return null;

  try {
    const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf8')) as {
      alg?: string;
      kid?: string;
    };
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as {
      sub?: string;
      email?: string;
      exp?: number;
      nbf?: number;
    };

    if (!header?.alg || !payload?.exp) return null;
    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.exp < nowSec) return null;
    if (typeof payload.nbf === 'number' && payload.nbf > nowSec + 30) return null;

    let keys = await fetchJwksKeys(jwksUrl);
    let candidates = header.kid ? keys.filter((k) => k.kid === header.kid) : keys;

    if (candidates.length === 0 && header.kid) {
      keys = await fetchJwksKeys(jwksUrl, true);
      candidates = keys.filter((k) => k.kid === header.kid);
    }

    const signingInput = `${headerB64}.${payloadB64}`;
    const signatureBuf = Buffer.from(sigB64, 'base64url');
    const verified = candidates.some((jwk) =>
      verifyJwtSignatureWithJwk(header.alg as string, signingInput, signatureBuf, jwk)
    );

    if (!verified) return null;

    const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
    if (!email) return null;

    const supabase = getSupabaseClient();
    const { data: userRow, error } = await supabase
      .from('portal_users')
      .select('id, name, email, role, title, avatar_letter, nif, status')
      .eq('email', email)
      .maybeSingle();

    if (error || !userRow || userRow.status !== 'Ativo') {
      return null;
    }

    return {
      id: userRow.id,
      name: userRow.role === 'educador' ? formatEducatorNameServer(userRow.name) : userRow.name,
      email: userRow.email,
      role: userRow.role,
      title: userRow.title,
      avatarLetter: userRow.avatar_letter,
      nif: userRow.nif || undefined
    };
  } catch {
    return null;
  }
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Sessão não autenticada. Por favor inicie sessão.' });
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();
  const sessionUser = verifySessionToken(token);
  if (sessionUser) {
    req.user = sessionUser;
    next();
    return;
  }

  const jwksUser = await verifySupabaseJwtWithJwks(token);
  if (!jwksUser) {
    res.status(401).json({ error: 'Sessão expirada ou inválida. Inicie sessão novamente.' });
    return;
  }

  req.user = jwksUser;
  next();
}

export function requireRole(allowedRoles: PortalRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Sessão não autenticada.' });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Sem permissão para aceder a este recurso.' });
      return;
    }
    next();
  };
}
