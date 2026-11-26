import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;
let cachedConfigKey = '';

function cleanEnvValue(val?: string): string | null {
  if (!val) return null;
  const trimmed = val.trim().replace(/^["']|["']$/g, '').trim();
  return trimmed || null;
}

export function resolveSupabaseUrl(): string | null {
  const candidates = [
    process.env.SUPABASE_URL,
    process.env.VITE_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_URL
  ];
  for (const raw of candidates) {
    const cleaned = cleanEnvValue(raw);
    if (cleaned && cleaned.startsWith('https://')) {
      return cleaned.replace(/\/+$/, '');
    }
  }

  const jwks = cleanEnvValue(process.env.SUPABASE_JWKS_URL);
  if (jwks && jwks.startsWith('https://')) {
    try {
      return new URL(jwks).origin;
    } catch {
      return null;
    }
  }

  return null;
}

export function resolveSupabaseKey(): string | null {
  const candidates = [
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_SECRET_KEY,
    process.env.SUPABASE_ANON_KEY,
    process.env.SUPABASE_PUBLISHABLE_KEY,
    process.env.VITE_SUPABASE_ANON_KEY
  ];
  for (const raw of candidates) {
    const cleaned = cleanEnvValue(raw);
    if (cleaned) return cleaned;
  }
  return null;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(resolveSupabaseUrl() && resolveSupabaseKey());
}

export function getSupabaseJwksUrl(): string | null {
  const explicitJwks = cleanEnvValue(process.env.SUPABASE_JWKS_URL);
  if (explicitJwks && explicitJwks.startsWith('https://')) {
    return explicitJwks;
  }

  const supabaseUrl = resolveSupabaseUrl();
  if (supabaseUrl) {
    return `${supabaseUrl}/auth/v1/.well-known/jwks.json`;
  }

  return null;
}

export function isJwksConfigured(): boolean {
  return Boolean(cleanEnvValue(process.env.SUPABASE_JWKS_URL)?.startsWith('https://'));
}

export function getSupabaseClient(): SupabaseClient {
  const url = resolveSupabaseUrl();
  const key = resolveSupabaseKey();

  if (!url || !key) {
    throw new Error('SUPABASE_NOT_CONFIGURED');
  }

  const configKey = `${url}:${key.slice(0, 8)}`;
  if (!cachedClient || cachedConfigKey !== configKey) {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    cachedConfigKey = configKey;
  }

  return cachedClient;
}

export function handleDbError(error: unknown, fallbackMessage: string): { status: number; message: string } {
  if (error instanceof Error && error.message === 'SUPABASE_NOT_CONFIGURED') {
    return {
      status: 503,
      message: 'A base de dados Supabase ainda não está configurada. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente.'
    };
  }

  const errObj = error as { code?: string; message?: string } | null;
  if (errObj?.code === '42P01' || errObj?.code === 'PGRST205') {
    return {
      status: 503,
      message: 'As tabelas do portal ainda não foram criadas no Supabase. Execute o script supabase/schema.sql no SQL Editor do seu projeto.'
    };
  }

  if (errObj?.code === '23505') {
    return {
      status: 409,
      message: 'Já existe um registo com este identificador único.'
    };
  }

  console.error('Supabase operation error:', error);
  return {
    status: 500,
    message: fallbackMessage
  };
}
