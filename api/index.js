// server/vercel-entry.ts
import express from "express";

// server/routes.ts
import crypto2 from "node:crypto";
import { Router } from "express";

// server/supabase.ts
import { createClient } from "@supabase/supabase-js";
var cachedClient = null;
var cachedConfigKey = "";
function cleanEnvValue(val) {
  if (!val) return null;
  const trimmed = val.trim().replace(/^["']|["']$/g, "").trim();
  return trimmed || null;
}
function resolveSupabaseUrl() {
  const candidates = [
    process.env.SUPABASE_URL,
    process.env.VITE_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_URL
  ];
  for (const raw of candidates) {
    const cleaned = cleanEnvValue(raw);
    if (cleaned && cleaned.startsWith("https://")) {
      return cleaned.replace(/\/+$/, "");
    }
  }
  const jwks = cleanEnvValue(process.env.SUPABASE_JWKS_URL);
  if (jwks && jwks.startsWith("https://")) {
    try {
      return new URL(jwks).origin;
    } catch {
      return null;
    }
  }
  return null;
}
function resolveSupabaseKey() {
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
function isSupabaseConfigured() {
  return Boolean(resolveSupabaseUrl() && resolveSupabaseKey());
}
function getSupabaseJwksUrl() {
  const explicitJwks = cleanEnvValue(process.env.SUPABASE_JWKS_URL);
  if (explicitJwks && explicitJwks.startsWith("https://")) {
    return explicitJwks;
  }
  const supabaseUrl = resolveSupabaseUrl();
  if (supabaseUrl) {
    return `${supabaseUrl}/auth/v1/.well-known/jwks.json`;
  }
  return null;
}
function isJwksConfigured() {
  return Boolean(cleanEnvValue(process.env.SUPABASE_JWKS_URL)?.startsWith("https://"));
}
function getSupabaseClient() {
  const url = resolveSupabaseUrl();
  const key = resolveSupabaseKey();
  if (!url || !key) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
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
function handleDbError(error, fallbackMessage) {
  if (error instanceof Error && error.message === "SUPABASE_NOT_CONFIGURED") {
    return {
      status: 503,
      message: "A base de dados Supabase ainda n\xE3o est\xE1 configurada. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nas vari\xE1veis de ambiente."
    };
  }
  const errObj = error;
  if (errObj?.code === "42P01" || errObj?.code === "PGRST205") {
    return {
      status: 503,
      message: "As tabelas do portal ainda n\xE3o foram criadas no Supabase. Execute o script supabase/schema.sql no SQL Editor do seu projeto."
    };
  }
  if (errObj?.code === "23505") {
    return {
      status: 409,
      message: "J\xE1 existe um registo com este identificador \xFAnico."
    };
  }
  console.error("Supabase operation error:", error);
  return {
    status: 500,
    message: fallbackMessage
  };
}

// server/auth.ts
import crypto from "node:crypto";
var IN_MEMORY_SESSION_SECRET = crypto.randomBytes(32).toString("hex");
function getSessionSecret() {
  return process.env.SESSION_SECRET?.trim() || IN_MEMORY_SESSION_SECRET;
}
function formatEducatorNameServer(name) {
  if (!name || !name.trim()) return "Tia";
  const trimmed = name.trim();
  if (/^tia\s+/i.test(trimmed)) {
    return trimmed.replace(/^tia\s+/i, "Tia ");
  }
  if (/^tia$/i.test(trimmed)) {
    return "Tia";
  }
  if (/^(profa\.?|prof\.?|educadora)\s+/i.test(trimmed)) {
    return trimmed.replace(/^(profa\.?|prof\.?|educadora)\s+/i, "Tia ");
  }
  return `Tia ${trimmed}`;
}
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}
function verifyPassword(password, storedHash) {
  const parts = storedHash.split(":");
  if (parts.length !== 2) return false;
  const [salt, originalHex] = parts;
  if (!salt || !originalHex) return false;
  const derivedBuf = crypto.scryptSync(password, salt, 64);
  const originalBuf = Buffer.from(originalHex, "hex");
  if (derivedBuf.length !== originalBuf.length) return false;
  return crypto.timingSafeEqual(derivedBuf, originalBuf);
}
function signSessionToken(user, ttlSeconds = 60 * 60 * 12) {
  const payload = {
    user,
    exp: Math.floor(Date.now() / 1e3) + ttlSeconds
  };
  const data = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = crypto.createHmac("sha256", getSessionSecret()).update(data).digest("base64url");
  return `${data}.${sig}`;
}
function verifySessionToken(token) {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  if (!data || !sig) return null;
  const expectedSig = crypto.createHmac("sha256", getSessionSecret()).update(data).digest("base64url");
  const sigBuf = Buffer.from(sig, "utf8");
  const expectedBuf = Buffer.from(expectedSig, "utf8");
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
  try {
    const decoded = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (!decoded?.user?.id || !decoded.exp || decoded.exp < Math.floor(Date.now() / 1e3)) {
      return null;
    }
    return decoded.user;
  } catch {
    return null;
  }
}
var jwksCache = null;
var JWKS_CACHE_TTL_MS = 5 * 60 * 1e3;
async function fetchJwksKeys(jwksUrl, forceRefresh = false) {
  if (!forceRefresh && jwksCache && jwksCache.url === jwksUrl && Date.now() - jwksCache.fetchedAt < JWKS_CACHE_TTL_MS) {
    return jwksCache.keys;
  }
  const response = await fetch(jwksUrl, {
    headers: { Accept: "application/json" }
  });
  if (!response.ok) {
    throw new Error(`JWKS fetch failed (${response.status})`);
  }
  const body = await response.json();
  const keys = Array.isArray(body?.keys) ? body.keys : [];
  jwksCache = { url: jwksUrl, keys, fetchedAt: Date.now() };
  return keys;
}
function verifyJwtSignatureWithJwk(alg, signingInput, signatureBuf, jwk) {
  const publicKey = crypto.createPublicKey({ key: jwk, format: "jwk" });
  const data = Buffer.from(signingInput, "utf8");
  switch (alg) {
    case "ES256":
      return crypto.verify("sha256", data, { key: publicKey, dsaEncoding: "ieee-p1363" }, signatureBuf);
    case "ES384":
      return crypto.verify("sha384", data, { key: publicKey, dsaEncoding: "ieee-p1363" }, signatureBuf);
    case "RS256":
      return crypto.verify("RSA-SHA256", data, publicKey, signatureBuf);
    case "RS384":
      return crypto.verify("RSA-SHA384", data, publicKey, signatureBuf);
    case "RS512":
      return crypto.verify("RSA-SHA512", data, publicKey, signatureBuf);
    case "EdDSA":
      return crypto.verify(null, data, publicKey, signatureBuf);
    default:
      return false;
  }
}
async function verifySupabaseJwtWithJwks(token) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const jwksUrl = getSupabaseJwksUrl();
  if (!jwksUrl || !isSupabaseConfigured()) return null;
  const [headerB64, payloadB64, sigB64] = parts;
  if (!headerB64 || !payloadB64 || !sigB64) return null;
  try {
    const header = JSON.parse(Buffer.from(headerB64, "base64url").toString("utf8"));
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (!header?.alg || !payload?.exp) return null;
    const nowSec = Math.floor(Date.now() / 1e3);
    if (payload.exp < nowSec) return null;
    if (typeof payload.nbf === "number" && payload.nbf > nowSec + 30) return null;
    let keys = await fetchJwksKeys(jwksUrl);
    let candidates = header.kid ? keys.filter((k) => k.kid === header.kid) : keys;
    if (candidates.length === 0 && header.kid) {
      keys = await fetchJwksKeys(jwksUrl, true);
      candidates = keys.filter((k) => k.kid === header.kid);
    }
    const signingInput = `${headerB64}.${payloadB64}`;
    const signatureBuf = Buffer.from(sigB64, "base64url");
    const verified = candidates.some(
      (jwk) => verifyJwtSignatureWithJwk(header.alg, signingInput, signatureBuf, jwk)
    );
    if (!verified) return null;
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    if (!email) return null;
    const supabase = getSupabaseClient();
    const { data: userRow, error } = await supabase.from("portal_users").select("id, name, email, role, title, avatar_letter, nif, status").eq("email", email).maybeSingle();
    if (error || !userRow || userRow.status !== "Ativo") {
      return null;
    }
    return {
      id: userRow.id,
      name: userRow.role === "educador" ? formatEducatorNameServer(userRow.name) : userRow.name,
      email: userRow.email,
      role: userRow.role,
      title: userRow.title,
      avatarLetter: userRow.avatar_letter,
      nif: userRow.nif || void 0
    };
  } catch {
    return null;
  }
}
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Sess\xE3o n\xE3o autenticada. Por favor inicie sess\xE3o." });
    return;
  }
  const token = authHeader.slice("Bearer ".length).trim();
  const sessionUser = verifySessionToken(token);
  if (sessionUser) {
    req.user = sessionUser;
    next();
    return;
  }
  const jwksUser = await verifySupabaseJwtWithJwks(token);
  if (!jwksUser) {
    res.status(401).json({ error: "Sess\xE3o expirada ou inv\xE1lida. Inicie sess\xE3o novamente." });
    return;
  }
  req.user = jwksUser;
  next();
}
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ error: "Sess\xE3o n\xE3o autenticada." });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: "Sem permiss\xE3o para aceder a este recurso." });
      return;
    }
    next();
  };
}

// server/factplus.ts
var DEFAULT_FACTPLUS_API_URL = "https://api.factplus.co.ao";
function isPrivateOrLoopbackHost(hostname) {
  const host = hostname.trim().toLowerCase();
  if (!host) return true;
  if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0" || host === "::1" || host === "[::1]" || host.endsWith(".local") || host.endsWith(".internal")) {
    return true;
  }
  const ipv4Match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [, a, b] = ipv4Match.map(Number);
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
  }
  return false;
}
function resolveFactPlusApiUrl() {
  const raw = process.env.FACTPLUS_API_URL?.trim() || DEFAULT_FACTPLUS_API_URL;
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("FACTPLUS_API_URL inv\xE1lido.");
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("FACTPLUS_API_URL deve usar HTTPS ou HTTP.");
  }
  if (isPrivateOrLoopbackHost(parsed.hostname)) {
    throw new Error("FACTPLUS_API_URL n\xE3o pode apontar para endere\xE7os internos ou locais.");
  }
  return parsed.toString().replace(/\/$/, "");
}
function getFactPlusApiKey() {
  const key = process.env.FACTPLUS_API_KEY?.trim();
  return key && key.length >= 16 ? key : null;
}
function isFactPlusConfigured() {
  try {
    resolveFactPlusApiUrl();
    return Boolean(getFactPlusApiKey());
  } catch {
    return false;
  }
}
function normalizeFactPlusDate(raw, fallbackDate) {
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const candidate = (raw || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(candidate)) {
    return candidate;
  }
  if (/^\d{4}-\d{2}-\d{2}T/.test(candidate)) {
    return candidate.slice(0, 10);
  }
  const ptMatch = candidate.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
  if (ptMatch) {
    const [, dd, mm, yyyy] = ptMatch;
    return `${yyyy}-${mm}-${dd}`;
  }
  if (fallbackDate && /^\d{4}-\d{2}-\d{2}/.test(fallbackDate)) {
    return fallbackDate.slice(0, 10);
  }
  return today;
}
function runLocalFiscalValidation(record) {
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const issueDate = normalizeFactPlusDate(record.created_at, today);
  let dueDate = normalizeFactPlusDate(record.due_date, issueDate);
  if (dueDate < issueDate) {
    dueDate = issueDate;
  }
  const cleanNif = String(record.nif || "").replace(/\s+/g, "");
  const nifValid = /^(999999999|\d{9,10})$/.test(cleanNif);
  const numericAmount = Number(record.amount);
  const amountValid = Number.isFinite(numericAmount) && numericAmount > 0;
  const guardianValid = Boolean(record.guardian_name && record.guardian_name.trim().length >= 2);
  const descriptionValid = Boolean(record.description && record.description.trim().length >= 3);
  const invoiceNumValid = Boolean(record.invoice_number && record.invoice_number.trim().length >= 3);
  const datesValid = /^\d{4}-\d{2}-\d{2}$/.test(issueDate) && /^\d{4}-\d{2}-\d{2}$/.test(dueDate);
  const checks = [
    {
      key: "nif",
      label: "NIF do Adquirente (AGT)",
      passed: nifValid,
      detail: nifValid ? cleanNif === "999999999" ? "999999999 (Consumidor Final)" : `NIF v\xE1lido: ${cleanNif}` : `NIF "${cleanNif || "vazio"}" deve conter 9 a 10 d\xEDgitos ou 999999999.`
    },
    {
      key: "amount",
      label: "Montante em Kwanza (AOA)",
      passed: amountValid,
      detail: amountValid ? `AOA ${numericAmount.toLocaleString("pt-PT", { minimumFractionDigits: 2 })}` : "O montante da fatura deve ser superior a zero."
    },
    {
      key: "client",
      label: "Titular / Encarregado",
      passed: guardianValid,
      detail: guardianValid ? record.guardian_name.trim() : "Nome do encarregado obrigat\xF3rio."
    },
    {
      key: "description",
      label: "Descri\xE7\xE3o do Servi\xE7o Educativo",
      passed: descriptionValid,
      detail: descriptionValid ? `${record.description.trim()} (Isen\xE7\xE3o IVA M10)` : "Descri\xE7\xE3o do item obrigat\xF3ria."
    },
    {
      key: "dates",
      label: "Datas de Emiss\xE3o & Vencimento",
      passed: datesValid && invoiceNumValid,
      detail: `Emiss\xE3o ${issueDate} \u2022 Vencimento ${dueDate}`
    }
  ];
  return {
    valid: checks.every((c) => c.passed),
    checks,
    normalizedIssueDate: issueDate,
    normalizedDueDate: dueDate,
    cleanNif: nifValid ? cleanNif : "999999999"
  };
}
async function callFactPlusEndpoint(payload) {
  const apiKey = getFactPlusApiKey();
  if (!apiKey) {
    throw new Error("FACTPLUS_API_KEY n\xE3o est\xE1 configurada no servidor.");
  }
  const apiUrl = resolveFactPlusApiUrl();
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      ...payload,
      apikey: apiKey
    }),
    signal: AbortSignal.timeout(12e3)
  });
  const text = await response.text();
  let parsed = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = null;
  }
  if (!response.ok) {
    const errMsg = parsed?.message || `FactPlus retornou estado HTTP ${response.status}.`;
    throw new Error(errMsg);
  }
  if (!parsed) {
    throw new Error("Resposta inv\xE1lida da API FactPlus.");
  }
  return parsed;
}
function extractFactPlusReference(data) {
  if (typeof data === "string" && data.trim()) {
    return data.trim();
  }
  if (Array.isArray(data) && data.length > 0) {
    const first = data[0];
    if (first && typeof first.reference === "string" && first.reference.trim()) {
      return first.reference.trim();
    }
  }
  if (data && typeof data === "object") {
    const obj = data;
    if (typeof obj.reference === "string" && obj.reference.trim()) {
      return obj.reference.trim();
    }
    if (typeof obj.document_reference === "string" && obj.document_reference.trim()) {
      return obj.document_reference.trim();
    }
  }
  return null;
}
async function createFactPlusDocument(record, validation, docType = "factura") {
  const payload = {
    apicall: "CREATE",
    document: {
      type: docType,
      date: validation.normalizedIssueDate,
      duedate: validation.normalizedDueDate,
      vref: record.invoice_number,
      currency: "AOA",
      exchange_rate: "0",
      observation: `Crian\xE7a: ${record.student_name} (${record.class_group}) \u2022 M\xE9todo: ${record.payment_method}`,
      retention: "0"
    },
    client: {
      name: record.guardian_name.trim(),
      nif: validation.cleanNif,
      city: "Luanda",
      address: "Luanda, Angola",
      country: "Angola"
    },
    items: [
      {
        itemcode: record.invoice_number,
        description: `${record.description || "Mensalidade Escolar"} - ${record.student_name}`,
        price: String(Number(record.amount)),
        quantity: "1",
        tax: "0",
        discount: "0",
        exemption_code: "M10",
        retention: "0"
      }
    ]
  };
  const raw = await callFactPlusEndpoint(payload);
  const success = raw.result === "success";
  const reference = extractFactPlusReference(raw.data);
  return {
    success,
    reference,
    message: raw.message || (success ? "Fatura validada e certificada pela API FactPlus." : "FactPlus recusou a valida\xE7\xE3o do documento."),
    raw
  };
}
async function viewFactPlusDocument(reference, docType) {
  const cleanRef = reference.trim();
  if (!cleanRef || cleanRef.length > 80) {
    throw new Error("Refer\xEAncia FactPlus inv\xE1lida.");
  }
  const documentPayload = { reference: cleanRef };
  if (docType) {
    documentPayload.type = docType;
  }
  const raw = await callFactPlusEndpoint({
    apicall: "VIEW",
    document: documentPayload
  });
  const success = raw.result === "success";
  let statusText = null;
  if (raw.data && typeof raw.data === "object" && !Array.isArray(raw.data)) {
    const obj = raw.data;
    if (typeof obj.status === "string") statusText = obj.status;
  } else if (Array.isArray(raw.data) && raw.data.length > 0) {
    const first = raw.data[0];
    if (first && typeof first.status === "string") statusText = first.status;
  }
  return {
    success,
    reference: extractFactPlusReference(raw.data) || cleanRef,
    statusText,
    message: raw.message || (success ? "Documento encontrado e validado na FactPlus." : "Documento n\xE3o encontrado ou inv\xE1lido na FactPlus."),
    raw
  };
}
async function alterFactPlusDocument(reference, docType, status, reason) {
  const raw = await callFactPlusEndpoint({
    apicall: "ALTER",
    document: {
      reference: reference.trim(),
      type: docType,
      status,
      reason: reason || ""
    }
  });
  return {
    success: raw.result === "success",
    message: raw.message || "Estado atualizado na FactPlus.",
    raw
  };
}

// server/routes.ts
function normalizeRoleInput(role) {
  if (role === "admin") return "admin";
  if (role === "educador" || role === "professor") return "educador";
  return "pais";
}
function sendDbError(res, error, fallback) {
  const { status, message } = handleDbError(error, fallback);
  res.status(status).json({ error: message });
}
var ALLOWED_ANNOUNCEMENT_MIME_TYPES = /* @__PURE__ */ new Set([
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/webp"
]);
var MAX_ANNOUNCEMENT_FILE_BYTES = 3 * 1024 * 1024;
function sanitizeAnnouncementFilename(rawName) {
  const base = rawName.split(/[/\\]/).pop() || "circular-documento";
  const cleaned = base.replace(/[^\w.\-\s()]/g, "_").trim();
  return (cleaned || "circular-documento").slice(0, 140);
}
function parseValidatedAnnouncementAttachment(input) {
  if (!input || typeof input !== "object") return null;
  const obj = input;
  if (typeof obj.name !== "string" || typeof obj.dataUrl !== "string") {
    throw new Error("Dados do documento anexo inv\xE1lidos.");
  }
  const match = obj.dataUrl.match(/^data:([a-zA-Z0-9.+/-]+);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    throw new Error("Formato do ficheiro inv\xE1lido. Utilize PDF, Word, TXT ou imagem.");
  }
  const mime = match[1].toLowerCase();
  if (!ALLOWED_ANNOUNCEMENT_MIME_TYPES.has(mime)) {
    throw new Error("Tipo de ficheiro n\xE3o permitido. Aceite apenas PDF, DOC, DOCX, TXT, PNG, JPG ou WEBP.");
  }
  const byteSize = Buffer.byteLength(match[2], "base64");
  if (byteSize <= 0 || byteSize > MAX_ANNOUNCEMENT_FILE_BYTES) {
    throw new Error("O documento excede o limite m\xE1ximo de 3 MB.");
  }
  return {
    name: sanitizeAnnouncementFilename(obj.name),
    type: mime,
    size: byteSize,
    dataUrl: `data:${mime};base64,${match[2]}`
  };
}
function stripAnnouncementAttachmentData(row) {
  if (!row || typeof row !== "object") return row;
  const { attachment_data: _omitted, ...rest } = row;
  return rest;
}
function createApiRouter() {
  const router = Router();
  router.get("/health", async (_req, res) => {
    const hasUrl = Boolean(resolveSupabaseUrl());
    const hasKey = Boolean(resolveSupabaseKey());
    const configured = hasUrl && hasKey;
    const jwksConfigured = isJwksConfigured() || Boolean(getSupabaseJwksUrl());
    if (!configured) {
      res.json({ ok: true, supabaseConfigured: false, schemaReady: false, jwksConfigured, hasUrl, hasKey });
      return;
    }
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from("portal_users").select("id", { count: "exact", head: true });
      if (error) {
        res.json({ ok: true, supabaseConfigured: true, schemaReady: false, jwksConfigured, hasUrl, hasKey });
        return;
      }
      res.json({ ok: true, supabaseConfigured: true, schemaReady: true, jwksConfigured, hasUrl, hasKey });
    } catch {
      res.json({ ok: true, supabaseConfigured: true, schemaReady: false, jwksConfigured, hasUrl, hasKey });
    }
  });
  router.get("/auth/status", async (_req, res) => {
    const hasUrl = Boolean(resolveSupabaseUrl());
    const hasKey = Boolean(resolveSupabaseKey());
    const supabaseConfigured = hasUrl && hasKey;
    if (!supabaseConfigured) {
      res.json({
        supabaseConfigured: false,
        schemaReady: false,
        needsInitialSetup: false,
        hasUrl,
        hasKey
      });
      return;
    }
    try {
      const supabase = getSupabaseClient();
      const { count, error } = await supabase.from("portal_users").select("id", { count: "exact", head: true });
      if (error) {
        if (error.code === "42P01" || error.code === "PGRST205") {
          res.json({
            supabaseConfigured: true,
            schemaReady: false,
            needsInitialSetup: false
          });
          return;
        }
        throw error;
      }
      res.json({
        supabaseConfigured: true,
        schemaReady: true,
        needsInitialSetup: (count ?? 0) === 0
      });
    } catch (error) {
      sendDbError(res, error, "N\xE3o foi poss\xEDvel verificar o estado da autentica\xE7\xE3o.");
    }
  });
  router.post("/auth/setup-admin", async (req, res) => {
    const { name, email, password, nif } = req.body ?? {};
    if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string" || !name.trim() || !email.includes("@") || password.length < 8) {
      res.status(400).json({
        error: "Informe nome completo, e-mail v\xE1lido e uma palavra-passe com pelo menos 8 caracteres."
      });
      return;
    }
    try {
      const supabase = getSupabaseClient();
      const { count, error: countError } = await supabase.from("portal_users").select("id", { count: "exact", head: true });
      if (countError) throw countError;
      if ((count ?? 0) > 0) {
        res.status(409).json({
          error: "O administrador inicial j\xE1 foi configurado. Inicie sess\xE3o com as suas credenciais."
        });
        return;
      }
      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();
      const passwordHash = hashPassword(password);
      const { data: created, error: insertError } = await supabase.from("portal_users").insert({
        name: cleanName,
        email: cleanEmail,
        password_hash: passwordHash,
        role: "admin",
        title: "Dire\xE7\xE3o & Secretaria Geral",
        avatar_letter: cleanName.charAt(0).toUpperCase(),
        nif: typeof nif === "string" && nif.trim() ? nif.trim() : null,
        access_level: "Super Admin",
        department: "Secretaria e Conselho Executivo",
        two_factor_enabled: true,
        status: "Ativo",
        last_access: "Sess\xE3o Ativa Agora"
      }).select("id, name, email, role, title, avatar_letter, nif").single();
      if (insertError) throw insertError;
      const user = {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role,
        title: created.title,
        avatarLetter: created.avatar_letter,
        nif: created.nif || void 0
      };
      const token = signSessionToken(user);
      res.status(201).json({ token, user });
    } catch (error) {
      sendDbError(res, error, "Erro ao criar administrador inicial.");
    }
  });
  router.post("/auth/login", async (req, res) => {
    const { identifier, password, role } = req.body ?? {};
    if (typeof identifier !== "string" || typeof password !== "string" || !identifier.trim() || !password) {
      res.status(400).json({ error: "Preencha o e-mail/NIF e a palavra-passe." });
      return;
    }
    const cleanIdentifier = identifier.trim().toLowerCase();
    try {
      const supabase = getSupabaseClient();
      const isEmail = cleanIdentifier.includes("@");
      const query = supabase.from("portal_users").select("id, name, email, password_hash, role, title, avatar_letter, nif, status");
      const { data: userRow, error } = isEmail ? await query.eq("email", cleanIdentifier).maybeSingle() : await query.eq("nif", identifier.trim()).maybeSingle();
      if (error) throw error;
      if (!userRow || !verifyPassword(password, userRow.password_hash)) {
        res.status(401).json({ error: "Credenciais inv\xE1lidas. Verifique o e-mail/NIF e a palavra-passe." });
        return;
      }
      if (userRow.status !== "Ativo") {
        res.status(403).json({ error: "Este acesso encontra-se temporariamente suspenso pela Dire\xE7\xE3o." });
        return;
      }
      if (typeof role === "string" && role.trim()) {
        const requestedRole = normalizeRoleInput(role);
        if (userRow.role !== requestedRole) {
          res.status(403).json({
            error: `Esta conta pertence ao perfil "${userRow.role === "admin" ? "Administra\xE7\xE3o" : userRow.role === "educador" ? "Educadora (Tia)" : "Pais / Encarregados"}". Selecione o separador correspondente.`
          });
          return;
        }
      }
      const displayName = userRow.role === "educador" ? formatEducatorNameServer(userRow.name) : userRow.name;
      await supabase.from("portal_users").update({ last_access: `Hoje, ${(/* @__PURE__ */ new Date()).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}` }).eq("id", userRow.id);
      const sessionUser = {
        id: userRow.id,
        name: displayName,
        email: userRow.email,
        role: userRow.role,
        title: userRow.title,
        avatarLetter: userRow.avatar_letter,
        nif: userRow.nif || void 0
      };
      const token = signSessionToken(sessionUser);
      res.json({ token, user: sessionUser });
    } catch (error) {
      sendDbError(res, error, "Erro ao autenticar utilizador.");
    }
  });
  router.get("/auth/me", requireAuth, (req, res) => {
    res.json({ user: req.user });
  });
  router.post("/appointments", async (req, res) => {
    const { ageGroup, shift, parentName, childName, whatsapp, email, date, time, notes } = req.body ?? {};
    if (!["bercario", "maternal", "jardim"].includes(ageGroup) || !["matutino", "vespertino", "integral"].includes(shift) || typeof parentName !== "string" || !parentName.trim() || typeof childName !== "string" || !childName.trim() || typeof whatsapp !== "string" || !whatsapp.trim() || typeof email !== "string" || !email.includes("@") || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date.trim()) || typeof time !== "string" || !/^\d{2}:\d{2}$/.test(time.trim())) {
      res.status(400).json({ error: "Dados do agendamento inv\xE1lidos ou incompletos." });
      return;
    }
    const [yr, mo, dy] = date.trim().split("-").map(Number);
    const parsedDate = new Date(yr, mo - 1, dy);
    if (parsedDate.getFullYear() !== yr || parsedDate.getMonth() !== mo - 1 || parsedDate.getDate() !== dy) {
      res.status(400).json({ error: "Data de visita inv\xE1lida." });
      return;
    }
    const now = /* @__PURE__ */ new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    if (date.trim() < todayStr) {
      res.status(400).json({ error: "N\xE3o \xE9 poss\xEDvel agendar visitas em dias passados." });
      return;
    }
    const dayOfWeek = parsedDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      res.status(400).json({ error: "Agendamentos dispon\xEDveis apenas de segunda a sexta-feira (sem finais de semana)." });
      return;
    }
    const [hr, min] = time.trim().split(":").map(Number);
    const totalMinutes = hr * 60 + min;
    if (!Number.isFinite(hr) || !Number.isFinite(min) || hr > 23 || min > 59 || totalMinutes < 8 * 60 || totalMinutes > 17 * 60 + 30) {
      res.status(400).json({ error: "Hor\xE1rio fora do per\xEDodo de atendimento para visitas (08:00 \xE0s 17:30)." });
      return;
    }
    if (date.trim() === todayStr && totalMinutes <= now.getHours() * 60 + now.getMinutes()) {
      res.status(400).json({ error: "Este hor\xE1rio j\xE1 passou para a data de hoje. Selecione um hor\xE1rio futuro." });
      return;
    }
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from("visit_appointments").insert({
        age_group: ageGroup,
        shift,
        parent_name: parentName.trim(),
        child_name: childName.trim(),
        whatsapp: whatsapp.trim(),
        email: email.trim().toLowerCase(),
        visit_date: date.trim(),
        visit_time: time.trim(),
        notes: typeof notes === "string" ? notes.trim() : null,
        status: "Agendada"
      }).select("*").single();
      if (error) throw error;
      res.status(201).json({ appointment: data });
    } catch (error) {
      sendDbError(res, error, "N\xE3o foi poss\xEDvel registar o agendamento de visita.");
    }
  });
  router.get("/admin/overview", requireAuth, requireRole(["admin"]), async (_req, res) => {
    try {
      const supabase = getSupabaseClient();
      const [classesRes, financeRes, staffRes, announcementsRes, appointmentsRes, studentsRes, pickupsRes] = await Promise.all([
        supabase.from("classrooms").select("*").order("created_at", { ascending: true }),
        supabase.from("financial_records").select("*").order("created_at", { ascending: false }),
        supabase.from("portal_users").select("id, name, email, role, title, avatar_letter, nif, phone, access_level, department, two_factor_enabled, status, last_access, created_at").order("created_at", { ascending: false }),
        supabase.from("announcements").select("*").order("created_at", { ascending: false }),
        supabase.from("visit_appointments").select("*").order("created_at", { ascending: false }),
        supabase.from("students").select("*").order("student_number", { ascending: true }),
        supabase.from("pickup_authorizations").select("*").order("created_at", { ascending: false })
      ]);
      for (const r of [classesRes, financeRes, staffRes, announcementsRes, appointmentsRes, studentsRes, pickupsRes]) {
        if (r.error) throw r.error;
      }
      res.json({
        classrooms: classesRes.data ?? [],
        financialRecords: financeRes.data ?? [],
        staffList: staffRes.data ?? [],
        announcements: (announcementsRes.data ?? []).map((a) => stripAnnouncementAttachmentData(a)),
        appointments: appointmentsRes.data ?? [],
        students: studentsRes.data ?? [],
        pickupAuthorizations: pickupsRes.data ?? []
      });
    } catch (error) {
      sendDbError(res, error, "Erro ao carregar dados administrativos do Supabase.");
    }
  });
  router.post("/admin/classrooms", requireAuth, requireRole(["admin"]), async (req, res) => {
    const { name, cycle, capacity, leadTeacher, room, schedule, ratio, subjects } = req.body ?? {};
    if (typeof name !== "string" || !name.trim() || typeof cycle !== "string" || !cycle.trim() || typeof leadTeacher !== "string" || !leadTeacher.trim()) {
      res.status(400).json({ error: "Nome da turma, ciclo e educadora titular s\xE3o obrigat\xF3rios." });
      return;
    }
    try {
      const supabase = getSupabaseClient();
      const cleanTeacher = formatEducatorNameServer(leadTeacher);
      const parsedCap = Math.max(1, Number(capacity) || 18);
      const { data, error } = await supabase.from("classrooms").insert({
        name: name.trim(),
        cycle: cycle.trim(),
        capacity: parsedCap,
        enrolled: 0,
        ratio: typeof ratio === "string" && ratio.trim() ? ratio.trim() : "1:6 (Tia Educadora + Auxiliar)",
        lead_teacher: cleanTeacher,
        subjects: Array.isArray(subjects) && subjects.length > 0 ? subjects.map(String) : ["Desenvolvimento Sensorial", "Socializa\xE7\xE3o L\xFAdica", "Express\xE3o Criativa"],
        room: typeof room === "string" && room.trim() ? room.trim() : "Pavilh\xE3o Infantil",
        schedule: typeof schedule === "string" && schedule.trim() ? schedule.trim() : "07:30 - 18:30 (Integral/Semi)"
      }).select("*").single();
      if (error) throw error;
      res.status(201).json({ classroom: data });
    } catch (error) {
      sendDbError(res, error, "Erro ao criar turma.");
    }
  });
  router.post("/admin/staff", requireAuth, requireRole(["admin"]), async (req, res) => {
    const { name, email, password, accessRole, nif, phone } = req.body ?? {};
    if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !email.includes("@") || typeof password !== "string" || password.length < 8) {
      res.status(400).json({
        error: "Nome, e-mail v\xE1lido e palavra-passe inicial (m\xEDn. 8 caracteres) s\xE3o obrigat\xF3rios."
      });
      return;
    }
    const isEducadora = accessRole === "Educadora (Tia)" || accessRole === "educador";
    const isParent = accessRole === "Pais" || accessRole === "pais";
    const portalRole = isEducadora ? "educador" : isParent ? "pais" : "admin";
    const formattedName = isEducadora ? formatEducatorNameServer(name) : name.trim();
    const roleTitle = isEducadora ? "Educadora de Inf\xE2ncia (Tia)" : isParent ? "Encarregado de Educa\xE7\xE3o" : accessRole === "Portaria" ? "Agente de Portaria & Seguran\xE7a" : accessRole === "SPO" ? "T\xE9cnico de Psicologia (SPO)" : "Secretaria Geral & Gest\xE3o";
    const department = isEducadora ? "Corpo de Educadoras (Tias)" : isParent ? "Fam\xEDlias & Encarregados" : accessRole === "Portaria" ? "Opera\xE7\xF5es e Seguran\xE7a" : accessRole === "SPO" ? "SPO (Servi\xE7o de Psicologia e Orienta\xE7\xE3o)" : "Secretaria e Conselho Executivo";
    const accessLevel = isEducadora ? "Educadora (Tia)" : isParent ? "Encarregado" : accessRole === "Portaria" ? "Portaria / Seguran\xE7a" : accessRole === "SPO" ? "SPO (Dados Sens\xEDveis)" : "Super Admin";
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from("portal_users").insert({
        name: formattedName,
        email: email.trim().toLowerCase(),
        password_hash: hashPassword(password),
        role: portalRole,
        title: roleTitle,
        avatar_letter: formattedName.charAt(0).toUpperCase(),
        nif: typeof nif === "string" && nif.trim() ? nif.trim() : null,
        phone: typeof phone === "string" && phone.trim() ? phone.trim() : null,
        access_level: accessLevel,
        department,
        two_factor_enabled: true,
        status: "Ativo",
        last_access: "Conta criada (Pronta para login)"
      }).select("id, name, email, role, title, avatar_letter, nif, phone, access_level, department, two_factor_enabled, status, last_access, created_at").single();
      if (error) throw error;
      res.status(201).json({ staff: data });
    } catch (error) {
      sendDbError(res, error, "Erro ao cadastrar utilizador.");
    }
  });
  router.patch("/admin/staff/:id/status", requireAuth, requireRole(["admin"]), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body ?? {};
    if (!["Ativo", "Revogado"].includes(status)) {
      res.status(400).json({ error: "Estado inv\xE1lido." });
      return;
    }
    if (req.user?.id === id && status === "Revogado") {
      res.status(400).json({ error: "N\xE3o pode revogar a sua pr\xF3pria sess\xE3o de administrador." });
      return;
    }
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from("portal_users").update({ status }).eq("id", id).select("id, name, email, role, title, avatar_letter, nif, phone, access_level, department, two_factor_enabled, status, last_access, created_at").single();
      if (error) throw error;
      res.json({ staff: data });
    } catch (error) {
      sendDbError(res, error, "Erro ao atualizar estado do utilizador.");
    }
  });
  router.post("/admin/students", requireAuth, requireRole(["admin"]), async (req, res) => {
    const { name, classroomName, age, responsibleName, guardianEmail, allergies, medications } = req.body ?? {};
    if (typeof name !== "string" || !name.trim() || typeof classroomName !== "string" || !classroomName.trim() || typeof age !== "string" || !age.trim() || typeof responsibleName !== "string" || !responsibleName.trim()) {
      res.status(400).json({ error: "Nome da crian\xE7a, turma, idade e respons\xE1vel s\xE3o obrigat\xF3rios." });
      return;
    }
    try {
      const supabase = getSupabaseClient();
      const [{ data: cls }, { count: studentCount }, guardianRes] = await Promise.all([
        supabase.from("classrooms").select("id, cycle, lead_teacher, enrolled").eq("name", classroomName.trim()).maybeSingle(),
        supabase.from("students").select("id", { count: "exact", head: true }),
        typeof guardianEmail === "string" && guardianEmail.includes("@") ? supabase.from("portal_users").select("id").eq("email", guardianEmail.trim().toLowerCase()).maybeSingle() : Promise.resolve({ data: null, error: null })
      ]);
      const nextNumber = (studentCount ?? 0) + 1;
      const teacherName = cls?.lead_teacher ? formatEducatorNameServer(cls.lead_teacher) : "Tia Clara Marques";
      const { data, error } = await supabase.from("students").insert({
        student_number: nextNumber,
        name: name.trim(),
        classroom_id: cls?.id || null,
        classroom_name: classroomName.trim(),
        cycle: cls?.cycle || "Creche & Educa\xE7\xE3o Infantil",
        age: age.trim(),
        avatar_letter: name.trim().charAt(0).toUpperCase(),
        status: "Presente",
        guardian_user_id: guardianRes.data?.id || null,
        responsible_name: responsibleName.trim(),
        teacher_name: teacherName,
        allergies: Array.isArray(allergies) ? allergies.map(String).filter(Boolean) : [],
        medications: Array.isArray(medications) ? medications.map(String).filter(Boolean) : []
      }).select("*").single();
      if (error) throw error;
      if (cls?.id) {
        await supabase.from("classrooms").update({ enrolled: (cls.enrolled ?? 0) + 1 }).eq("id", cls.id);
      }
      res.status(201).json({ student: data });
    } catch (error) {
      sendDbError(res, error, "Erro ao matricular crian\xE7a.");
    }
  });
  router.post("/admin/financial", requireAuth, requireRole(["admin"]), async (req, res) => {
    const { studentId, studentName, guardianName, nif, classGroup, description, amount, paymentMethod, dueDate, status } = req.body ?? {};
    const numericAmount = Number(amount);
    if (typeof studentName !== "string" || !studentName.trim() || typeof guardianName !== "string" || !guardianName.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      res.status(400).json({ error: "Dados da fatura inv\xE1lidos." });
      return;
    }
    try {
      const supabase = getSupabaseClient();
      let guardianUserId = null;
      if (typeof studentId === "string" && studentId.trim()) {
        const { data: st } = await supabase.from("students").select("guardian_user_id").eq("id", studentId).maybeSingle();
        guardianUserId = st?.guardian_user_id ?? null;
      }
      const invoiceNumber = `FT-${(/* @__PURE__ */ new Date()).getFullYear()}/${String(Math.floor(1e3 + Math.random() * 9e3))}`;
      const { data, error } = await supabase.from("financial_records").insert({
        student_id: typeof studentId === "string" && studentId.trim() ? studentId : null,
        guardian_user_id: guardianUserId,
        student_name: studentName.trim(),
        guardian_name: guardianName.trim(),
        nif: typeof nif === "string" && nif.trim() ? nif.trim() : "999999999",
        class_group: typeof classGroup === "string" && classGroup.trim() ? classGroup.trim() : "Creche Mayelin",
        description: typeof description === "string" && description.trim() ? description.trim() : "Mensalidade Escolar",
        amount: numericAmount,
        payment_method: typeof paymentMethod === "string" && paymentMethod.trim() ? paymentMethod.trim() : "Multicaixa Express (MCX)",
        status: ["Liquidado", "Pendente", "Aviso Enviado"].includes(status) ? status : "Pendente",
        invoice_number: invoiceNumber,
        due_date: typeof dueDate === "string" && dueDate.trim() ? dueDate.trim() : (/* @__PURE__ */ new Date()).toLocaleDateString("pt-PT")
      }).select("*").single();
      if (error) throw error;
      res.status(201).json({ record: data });
    } catch (error) {
      sendDbError(res, error, "Erro ao emitir fatura.");
    }
  });
  router.patch("/admin/financial/:id/status", requireAuth, requireRole(["admin"]), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body ?? {};
    if (!["Liquidado", "Pendente", "Aviso Enviado"].includes(status)) {
      res.status(400).json({ error: "Estado financeiro inv\xE1lido." });
      return;
    }
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from("financial_records").update({
        status,
        paid_date: status === "Liquidado" ? (/* @__PURE__ */ new Date()).toLocaleDateString("pt-PT") : null
      }).eq("id", id).select("*").single();
      if (error) throw error;
      if (status === "Liquidado" && data?.factplus_reference && isFactPlusConfigured()) {
        try {
          await alterFactPlusDocument(String(data.factplus_reference), "factura", "settled");
        } catch {
        }
      }
      res.json({ record: data });
    } catch (error) {
      sendDbError(res, error, "Erro ao atualizar estado financeiro.");
    }
  });
  router.get("/admin/factplus/status", requireAuth, requireRole(["admin"]), (_req, res) => {
    let apiUrl = "https://api.factplus.co.ao";
    try {
      apiUrl = resolveFactPlusApiUrl();
    } catch {
    }
    res.json({
      configured: isFactPlusConfigured(),
      apiUrl
    });
  });
  router.post("/admin/financial/:id/validate-factplus", requireAuth, requireRole(["admin"]), async (req, res) => {
    const { id } = req.params;
    const body = req.body ?? {};
    const docType = body.docType === "factura-recibo" || body.docType === "proforma" ? body.docType : "factura";
    try {
      const supabase = getSupabaseClient();
      const { data: record, error: fetchError } = await supabase.from("financial_records").select("*").eq("id", id).maybeSingle();
      if (fetchError) throw fetchError;
      if (!record) {
        res.status(404).json({ error: "Fatura n\xE3o encontrada." });
        return;
      }
      const localValidation = runLocalFiscalValidation(record);
      const configured = isFactPlusConfigured();
      if (!localValidation.valid) {
        res.json({
          valid: false,
          configured,
          mode: "local-check",
          reference: record.factplus_reference ?? null,
          factplusStatus: "Dados Fiscais Inv\xE1lidos",
          message: "Corrija os campos assinalados antes de validar na FactPlus.",
          checks: localValidation.checks,
          record
        });
        return;
      }
      if (!configured) {
        res.json({
          valid: false,
          configured: false,
          mode: "local-only",
          reference: record.factplus_reference ?? null,
          factplusStatus: "API N\xE3o Configurada",
          message: "Pr\xE9-valida\xE7\xE3o AGT conclu\xEDda com sucesso. Para certifica\xE7\xE3o online na FactPlus, configure FACTPLUS_API_KEY nas vari\xE1veis secretas do servidor.",
          checks: localValidation.checks,
          record
        });
        return;
      }
      const providedRef = typeof body.reference === "string" && body.reference.trim() ? body.reference.trim() : null;
      const existingRef = typeof record.factplus_reference === "string" && record.factplus_reference.trim() ? record.factplus_reference.trim() : null;
      const targetRef = providedRef || existingRef;
      let valid = false;
      let mode = targetRef ? "view" : "create";
      let resultRef = targetRef;
      let statusLabel = "Pendente";
      let message = "";
      if (targetRef) {
        const viewRes = await viewFactPlusDocument(targetRef, docType);
        valid = viewRes.success;
        resultRef = viewRes.reference;
        statusLabel = viewRes.success ? viewRes.statusText ? `Validada (${viewRes.statusText})` : "Validada na FactPlus" : "N\xE3o Validada na FactPlus";
        message = viewRes.message;
      } else {
        const createRes = await createFactPlusDocument(record, localValidation, docType);
        valid = createRes.success;
        resultRef = createRes.reference;
        statusLabel = createRes.success ? "Certificada FactPlus" : "Rejeitada pela FactPlus";
        message = createRes.message;
      }
      let updatedRecord = record;
      let schemaColumnWarning = false;
      const { data: savedRecord, error: updateError } = await supabase.from("financial_records").update({
        factplus_reference: resultRef,
        factplus_status: statusLabel,
        factplus_validated_at: (/* @__PURE__ */ new Date()).toISOString(),
        factplus_message: message
      }).eq("id", id).select("*").maybeSingle();
      if (updateError) {
        const errCode = updateError.code;
        if (errCode === "42703" || errCode === "PGRST204") {
          schemaColumnWarning = true;
        } else {
          throw updateError;
        }
      } else if (savedRecord) {
        updatedRecord = savedRecord;
      }
      res.json({
        valid,
        configured: true,
        mode,
        reference: resultRef,
        factplusStatus: statusLabel,
        message,
        checks: localValidation.checks,
        schemaColumnWarning,
        record: updatedRecord
      });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Erro ao comunicar com a API FactPlus.";
      res.status(502).json({ error: errMsg });
    }
  });
  router.post("/admin/factplus/verify-reference", requireAuth, requireRole(["admin"]), async (req, res) => {
    const { reference, docType, financialRecordId } = req.body ?? {};
    if (typeof reference !== "string" || !reference.trim() || reference.trim().length > 80) {
      res.status(400).json({ error: "Indique uma refer\xEAncia de factura FactPlus v\xE1lida." });
      return;
    }
    if (!isFactPlusConfigured()) {
      res.status(503).json({
        error: "FACTPLUS_API_KEY n\xE3o est\xE1 configurada nas vari\xE1veis secretas do servidor."
      });
      return;
    }
    const parsedType = docType === "factura" || docType === "factura-recibo" || docType === "proforma" || docType === "nota-credito" || docType === "nota-debito" ? docType : void 0;
    try {
      const viewRes = await viewFactPlusDocument(reference.trim(), parsedType);
      let updatedRecord = null;
      if (typeof financialRecordId === "string" && financialRecordId.trim()) {
        const supabase = getSupabaseClient();
        const { data: saved, error: updateError } = await supabase.from("financial_records").update({
          factplus_reference: viewRes.reference,
          factplus_status: viewRes.success ? "Validada na FactPlus" : "N\xE3o Validada na FactPlus",
          factplus_validated_at: (/* @__PURE__ */ new Date()).toISOString(),
          factplus_message: viewRes.message
        }).eq("id", financialRecordId.trim()).select("*").maybeSingle();
        if (!updateError && saved) {
          updatedRecord = saved;
        }
      }
      res.json({
        valid: viewRes.success,
        reference: viewRes.reference,
        statusText: viewRes.statusText,
        message: viewRes.message,
        record: updatedRecord
      });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Erro ao consultar refer\xEAncia na FactPlus.";
      res.status(502).json({ error: errMsg });
    }
  });
  router.post("/admin/announcements", requireAuth, requireRole(["admin"]), async (req, res) => {
    const { title, content, channels, target, priority, authorizationsRequired, attachment } = req.body ?? {};
    let parsedAttachment = null;
    try {
      if (attachment !== void 0 && attachment !== null) {
        parsedAttachment = parseValidatedAnnouncementAttachment(attachment);
      }
    } catch (err) {
      res.status(400).json({ error: err instanceof Error ? err.message : "Documento anexo inv\xE1lido." });
      return;
    }
    const trimmedTitle = typeof title === "string" ? title.trim() : "";
    const trimmedContent = typeof content === "string" ? content.trim() : "";
    const finalContent = trimmedContent || (parsedAttachment ? `Consulte o documento anexo: ${parsedAttachment.name}` : "");
    if (!trimmedTitle || !finalContent) {
      res.status(400).json({ error: "T\xEDtulo e conte\xFAdo ou documento da circular s\xE3o obrigat\xF3rios." });
      return;
    }
    try {
      const supabase = getSupabaseClient();
      const { count: studentCount } = await supabase.from("students").select("id", { count: "exact", head: true });
      const totalRecipients = studentCount || 0;
      const basePayload = {
        title: trimmedTitle,
        content: finalContent,
        channels: Array.isArray(channels) && channels.length > 0 ? channels.map(String) : ["App Push", "E-mail"],
        target: ["todos", "pais", "educadoras", "professores"].includes(target) ? target : "todos",
        priority: ["normal", "importante", "urgente"].includes(priority) ? priority : "normal",
        author: req.user?.name || "Dire\xE7\xE3o Geral",
        open_rate: 100,
        recipient_count: totalRecipients,
        authorizations_required: Boolean(authorizationsRequired),
        authorizations_signed_count: 0,
        authorizations_total: totalRecipients,
        status: "Enviada"
      };
      const insertPayload = parsedAttachment ? {
        ...basePayload,
        attachment_name: parsedAttachment.name,
        attachment_type: parsedAttachment.type,
        attachment_size: parsedAttachment.size,
        attachment_data: parsedAttachment.dataUrl
      } : basePayload;
      let schemaColumnWarning = false;
      let { data, error } = await supabase.from("announcements").insert(insertPayload).select("*").single();
      if (error && parsedAttachment) {
        const errCode = error.code;
        if (errCode === "42703" || errCode === "PGRST204") {
          schemaColumnWarning = true;
          const fallbackRes = await supabase.from("announcements").insert(basePayload).select("*").single();
          data = fallbackRes.data;
          error = fallbackRes.error;
        }
      }
      if (error) throw error;
      res.status(201).json({
        announcement: stripAnnouncementAttachmentData(data),
        schemaColumnWarning
      });
    } catch (error) {
      sendDbError(res, error, "Erro ao publicar circular.");
    }
  });
  router.get("/announcements/:id/attachment", requireAuth, async (req, res) => {
    const { id } = req.params;
    try {
      const supabase = getSupabaseClient();
      const { data: ann, error } = await supabase.from("announcements").select("id, target, attachment_name, attachment_type, attachment_data").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!ann || !ann.attachment_data) {
        res.status(404).json({ error: "Documento anexo n\xE3o encontrado." });
        return;
      }
      const role = req.user?.role;
      const allowedByRole = role === "admin" || role === "educador" && ["todos", "educadoras", "professores"].includes(ann.target) || role === "pais" && ["todos", "pais"].includes(ann.target);
      if (!allowedByRole) {
        res.status(403).json({ error: "Sem permiss\xE3o para aceder a este documento." });
        return;
      }
      const match = String(ann.attachment_data).match(/^data:([a-zA-Z0-9.+/-]+);base64,([A-Za-z0-9+/=]+)$/);
      if (!match || !ALLOWED_ANNOUNCEMENT_MIME_TYPES.has(match[1].toLowerCase())) {
        res.status(400).json({ error: "Documento anexo inv\xE1lido ou corrompido." });
        return;
      }
      const fileBuffer = Buffer.from(match[2], "base64");
      const safeName = sanitizeAnnouncementFilename(String(ann.attachment_name || "circular-documento"));
      res.setHeader("Content-Type", match[1].toLowerCase());
      res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.send(fileBuffer);
    } catch (error) {
      sendDbError(res, error, "Erro ao descarregar documento anexo.");
    }
  });
  router.patch("/admin/appointments/:id", requireAuth, requireRole(["admin"]), async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body ?? {};
    try {
      const supabase = getSupabaseClient();
      const updates = {};
      if (["Agendada", "Confirmada", "Realizada", "Cancelada"].includes(status)) updates.status = status;
      if (typeof notes === "string") updates.notes = notes.trim();
      const { data, error } = await supabase.from("visit_appointments").update(updates).eq("id", id).select("*").single();
      if (error) throw error;
      res.json({ appointment: data });
    } catch (error) {
      sendDbError(res, error, "Erro ao atualizar visita.");
    }
  });
  router.patch("/admin/authorizations/:id", requireAuth, requireRole(["admin"]), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body ?? {};
    if (!["Aprovado", "Pendente"].includes(status)) {
      res.status(400).json({ error: "Estado inv\xE1lido." });
      return;
    }
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from("pickup_authorizations").update({ status }).eq("id", id).select("*").single();
      if (error) throw error;
      res.json({ authorization: data });
    } catch (error) {
      sendDbError(res, error, "Erro ao atualizar autoriza\xE7\xE3o de retirada.");
    }
  });
  router.get("/educator/workspace", requireAuth, requireRole(["educador", "admin"]), async (req, res) => {
    const classroomParam = typeof req.query.classroom === "string" ? req.query.classroom.trim() : "";
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    try {
      const supabase = getSupabaseClient();
      const [classesRes, studentsRes, attendanceRes, obsRes, lessonsRes, incidentsRes] = await Promise.all([
        supabase.from("classrooms").select("*").order("created_at", { ascending: true }),
        classroomParam ? supabase.from("students").select("*").eq("classroom_name", classroomParam).order("student_number", { ascending: true }) : supabase.from("students").select("*").order("student_number", { ascending: true }),
        supabase.from("attendance_records").select("*").eq("attendance_date", today),
        classroomParam ? supabase.from("child_observations").select("*").eq("classroom_name", classroomParam).order("created_at", { ascending: false }) : supabase.from("child_observations").select("*").order("created_at", { ascending: false }),
        classroomParam ? supabase.from("lesson_plans").select("*").eq("classroom_name", classroomParam).order("created_at", { ascending: false }) : supabase.from("lesson_plans").select("*").order("created_at", { ascending: false }),
        supabase.from("pedagogical_incidents").select("*").order("created_at", { ascending: false })
      ]);
      for (const r of [classesRes, studentsRes, attendanceRes, obsRes, lessonsRes, incidentsRes]) {
        if (r.error) throw r.error;
      }
      res.json({
        classrooms: classesRes.data ?? [],
        students: studentsRes.data ?? [],
        attendanceRecords: attendanceRes.data ?? [],
        observations: obsRes.data ?? [],
        lessonPlans: lessonsRes.data ?? [],
        incidents: incidentsRes.data ?? []
      });
    } catch (error) {
      sendDbError(res, error, "Erro ao carregar o espa\xE7o da Educadora (Tia).");
    }
  });
  router.post("/educator/attendance", requireAuth, requireRole(["educador", "admin"]), async (req, res) => {
    const { studentId, studentNumber, studentName, classroomName, status, justification, markAllPresent } = req.body ?? {};
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const recordedBy = formatEducatorNameServer(req.user?.name || "Tia Educadora");
    try {
      const supabase = getSupabaseClient();
      if (markAllPresent && typeof classroomName === "string" && classroomName.trim()) {
        const { data: classStudents, error: stErr } = await supabase.from("students").select("id, student_number, name, classroom_name").eq("classroom_name", classroomName.trim());
        if (stErr) throw stErr;
        if (!classStudents || classStudents.length === 0) {
          res.json({ records: [] });
          return;
        }
        const rows = classStudents.map((s) => ({
          student_id: s.id,
          student_number: s.student_number,
          student_name: s.name,
          classroom_name: s.classroom_name,
          attendance_date: today,
          status: "Presente",
          justification: null,
          recorded_by: recordedBy
        }));
        const { data: data2, error: error2 } = await supabase.from("attendance_records").upsert(rows, { onConflict: "student_name,classroom_name,attendance_date" }).select("*");
        if (error2) throw error2;
        res.json({ records: data2 ?? [] });
        return;
      }
      if (typeof studentName !== "string" || !studentName.trim() || typeof classroomName !== "string" || !classroomName.trim() || !["Presente", "Ausente", "Atrasado"].includes(status)) {
        res.status(400).json({ error: "Dados da chamada inv\xE1lidos." });
        return;
      }
      const { data, error } = await supabase.from("attendance_records").upsert(
        {
          student_id: typeof studentId === "string" ? studentId : null,
          student_number: Number(studentNumber) || 1,
          student_name: studentName.trim(),
          classroom_name: classroomName.trim(),
          attendance_date: today,
          status,
          justification: typeof justification === "string" && justification.trim() ? justification.trim() : null,
          recorded_by: recordedBy
        },
        { onConflict: "student_name,classroom_name,attendance_date" }
      ).select("*").single();
      if (error) throw error;
      res.json({ record: data });
    } catch (error) {
      sendDbError(res, error, "Erro ao registar presen\xE7a.");
    }
  });
  router.post("/educator/observations", requireAuth, requireRole(["educador", "admin"]), async (req, res) => {
    const { studentId, studentNumber, studentName, classroomName, category, priority, title, text, notifiedParents } = req.body ?? {};
    const allowedCategories = [
      "Adapta\xE7\xE3o & Emo\xE7\xF5es",
      "Alimenta\xE7\xE3o & Apetite",
      "Soninho & Repouso",
      "Desenvolvimento Motor",
      "Linguagem & Intera\xE7\xE3o",
      "Sa\xFAde & Cuidados"
    ];
    const allowedPriorities = ["Rotina", "Importante", "Conquista / Marco"];
    if (typeof studentName !== "string" || !studentName.trim() || typeof classroomName !== "string" || !classroomName.trim() || !allowedCategories.includes(category) || !allowedPriorities.includes(priority) || typeof text !== "string" || !text.trim()) {
      res.status(400).json({ error: "Preencha todos os campos da observa\xE7\xE3o sobre a crian\xE7a." });
      return;
    }
    try {
      const supabase = getSupabaseClient();
      const recordedBy = formatEducatorNameServer(req.user?.name || "Tia Educadora");
      let resolvedStudentId = typeof studentId === "string" && studentId.trim() ? studentId : null;
      let resolvedNumber = Number(studentNumber) || 1;
      if (!resolvedStudentId) {
        const { data: st } = await supabase.from("students").select("id, student_number").eq("name", studentName.trim()).maybeSingle();
        if (st) {
          resolvedStudentId = st.id;
          resolvedNumber = st.student_number;
        }
      }
      const { data, error } = await supabase.from("child_observations").insert({
        student_id: resolvedStudentId,
        student_number: resolvedNumber,
        student_name: studentName.trim(),
        classroom_name: classroomName.trim(),
        category,
        priority,
        title: typeof title === "string" && title.trim() ? title.trim() : `${category} \u2022 Registo da Tia`,
        text: text.trim(),
        recorded_by: recordedBy,
        notified_parents: notifiedParents !== false
      }).select("*").single();
      if (error) throw error;
      res.status(201).json({ observation: data });
    } catch (error) {
      sendDbError(res, error, "Erro ao guardar observa\xE7\xE3o.");
    }
  });
  router.delete("/educator/observations/:id", requireAuth, requireRole(["educador", "admin"]), async (req, res) => {
    const { id } = req.params;
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from("child_observations").delete().eq("id", id);
      if (error) throw error;
      res.json({ ok: true });
    } catch (error) {
      sendDbError(res, error, "Erro ao remover observa\xE7\xE3o.");
    }
  });
  router.post("/educator/lessons", requireAuth, requireRole(["educador", "admin"]), async (req, res) => {
    const { classroomName, subject, title, lessonDate, timeSlot, room, summary } = req.body ?? {};
    if (typeof subject !== "string" || !subject.trim() || typeof title !== "string" || !title.trim() || typeof summary !== "string" || !summary.trim()) {
      res.status(400).json({ error: "\xC1rea l\xFAdica, t\xEDtulo e descri\xE7\xE3o da atividade s\xE3o obrigat\xF3rios." });
      return;
    }
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from("lesson_plans").insert({
        classroom_name: typeof classroomName === "string" && classroomName.trim() ? classroomName.trim() : "Geral",
        subject: subject.trim(),
        title: title.trim(),
        lesson_date: typeof lessonDate === "string" && lessonDate.trim() ? lessonDate.trim() : "Esta semana",
        time_slot: typeof timeSlot === "string" && timeSlot.trim() ? timeSlot.trim() : "09:30 - 10:30",
        room: typeof room === "string" && room.trim() ? room.trim() : "Sala de Atividades",
        summary: summary.trim(),
        attachments: [],
        status: "Planeada",
        created_by: formatEducatorNameServer(req.user?.name || "Tia Educadora")
      }).select("*").single();
      if (error) throw error;
      res.status(201).json({ lesson: data });
    } catch (error) {
      sendDbError(res, error, "Erro ao criar plano de atividades.");
    }
  });
  router.post("/educator/incidents", requireAuth, requireRole(["educador", "admin"]), async (req, res) => {
    const { studentName, type, title, description, spoReferral, notifiedFamily, teacherNote } = req.body ?? {};
    if (typeof studentName !== "string" || !studentName.trim() || !["M\xE9rito Positivo", "Apoio Socioemocional"].includes(type) || typeof title !== "string" || !title.trim() || typeof description !== "string" || !description.trim()) {
      res.status(400).json({ error: "Dados do registo pedag\xF3gico inv\xE1lidos." });
      return;
    }
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from("pedagogical_incidents").insert({
        student_name: studentName.trim(),
        type,
        title: title.trim(),
        description: description.trim(),
        incident_date: `Hoje \xE0s ${(/* @__PURE__ */ new Date()).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}`,
        spo_referral: Boolean(spoReferral),
        notified_family: Boolean(notifiedFamily),
        teacher_note: typeof teacherNote === "string" ? teacherNote.trim() : null,
        created_by: formatEducatorNameServer(req.user?.name || "Tia Educadora")
      }).select("*").single();
      if (error) throw error;
      res.status(201).json({ incident: data });
    } catch (error) {
      sendDbError(res, error, "Erro ao registar ocorr\xEAncia pedag\xF3gica.");
    }
  });
  router.get("/guardian/workspace", requireAuth, requireRole(["pais", "admin"]), async (req, res) => {
    try {
      const supabase = getSupabaseClient();
      const isAdmin = req.user?.role === "admin";
      const userId = req.user?.id || "";
      const studentsQuery = supabase.from("students").select("*").order("student_number", { ascending: true });
      const { data: children, error: childErr } = isAdmin ? await studentsQuery : await studentsQuery.eq("guardian_user_id", userId);
      if (childErr) throw childErr;
      const childIds = (children ?? []).map((c) => c.id);
      const [routineRes, obsRes, financeRes, messagesRes, consentsRes, pickupsRes, announcementsRes] = await Promise.all([
        childIds.length > 0 ? supabase.from("routine_logs").select("*").in("student_id", childIds).order("created_at", { ascending: false }) : Promise.resolve({ data: [], error: null }),
        childIds.length > 0 ? supabase.from("child_observations").select("*").in("student_id", childIds).eq("notified_parents", true).order("created_at", { ascending: false }) : Promise.resolve({ data: [], error: null }),
        isAdmin ? supabase.from("financial_records").select("*").order("created_at", { ascending: false }) : supabase.from("financial_records").select("*").eq("guardian_user_id", userId).order("created_at", { ascending: false }),
        isAdmin ? supabase.from("portal_messages").select("*").order("created_at", { ascending: false }) : supabase.from("portal_messages").select("*").eq("guardian_user_id", userId).order("created_at", { ascending: false }),
        isAdmin ? supabase.from("digital_consents").select("*").order("created_at", { ascending: false }) : supabase.from("digital_consents").select("*").eq("guardian_user_id", userId).order("created_at", { ascending: false }),
        isAdmin ? supabase.from("pickup_authorizations").select("*").order("created_at", { ascending: false }) : supabase.from("pickup_authorizations").select("*").eq("guardian_user_id", userId).order("created_at", { ascending: false }),
        supabase.from("announcements").select("*").in("target", ["todos", "pais"]).order("created_at", { ascending: false })
      ]);
      for (const r of [routineRes, obsRes, financeRes, messagesRes, consentsRes, pickupsRes, announcementsRes]) {
        if (r.error) throw r.error;
      }
      res.json({
        children: children ?? [],
        routineLogs: routineRes.data ?? [],
        observations: obsRes.data ?? [],
        financialRecords: financeRes.data ?? [],
        messages: messagesRes.data ?? [],
        consents: consentsRes.data ?? [],
        pickupAuthorizations: pickupsRes.data ?? [],
        announcements: (announcementsRes.data ?? []).map((a) => stripAnnouncementAttachmentData(a))
      });
    } catch (error) {
      sendDbError(res, error, "Erro ao carregar o portal dos encarregados.");
    }
  });
  router.post("/guardian/authorizations", requireAuth, requireRole(["pais", "admin"]), async (req, res) => {
    const { studentId, personName, relationship, documentId, phone, authDate, timeLimit } = req.body ?? {};
    if (typeof personName !== "string" || !personName.trim() || typeof relationship !== "string" || !relationship.trim() || typeof documentId !== "string" || !documentId.trim()) {
      res.status(400).json({ error: "Preencha os dados da pessoa autorizada." });
      return;
    }
    try {
      const supabase = getSupabaseClient();
      if (req.user?.role === "pais" && typeof studentId === "string" && studentId.trim()) {
        const { data: st } = await supabase.from("students").select("guardian_user_id").eq("id", studentId).maybeSingle();
        if (st && st.guardian_user_id !== req.user.id) {
          res.status(403).json({ error: "Sem permiss\xE3o para esta crian\xE7a." });
          return;
        }
      }
      const { data, error } = await supabase.from("pickup_authorizations").insert({
        student_id: typeof studentId === "string" && studentId.trim() ? studentId : null,
        guardian_user_id: req.user?.id || null,
        person_name: personName.trim(),
        relationship: relationship.trim(),
        document_id: documentId.trim(),
        phone: typeof phone === "string" ? phone.trim() : "",
        auth_date: typeof authDate === "string" && authDate.trim() ? authDate.trim() : (/* @__PURE__ */ new Date()).toLocaleDateString("pt-PT"),
        time_limit: typeof timeLimit === "string" && timeLimit.trim() ? timeLimit.trim() : "18:30",
        status: "Pendente"
      }).select("*").single();
      if (error) throw error;
      res.status(201).json({ authorization: data });
    } catch (error) {
      sendDbError(res, error, "Erro ao registar autoriza\xE7\xE3o de retirada.");
    }
  });
  router.post("/guardian/consents/:id/sign", requireAuth, requireRole(["pais", "admin"]), async (req, res) => {
    const { id } = req.params;
    const { pin } = req.body ?? {};
    if (typeof pin !== "string" || pin.trim().length < 4) {
      res.status(400).json({ error: "Insira um c\xF3digo PIN de pelo menos 4 d\xEDgitos." });
      return;
    }
    try {
      const supabase = getSupabaseClient();
      const { data: consent, error: fetchErr } = await supabase.from("digital_consents").select("*").eq("id", id).maybeSingle();
      if (fetchErr) throw fetchErr;
      if (!consent) {
        res.status(404).json({ error: "Consentimento n\xE3o encontrado." });
        return;
      }
      if (req.user?.role === "pais" && consent.guardian_user_id && consent.guardian_user_id !== req.user.id) {
        res.status(403).json({ error: "Sem permiss\xE3o para assinar este documento." });
        return;
      }
      const signatureHash = `sha256-${crypto2.createHash("sha256").update(`${id}:${req.user?.id}:${Date.now()}`).digest("hex").slice(0, 24)}`;
      const { data: updated, error: updErr } = await supabase.from("digital_consents").update({
        signed: true,
        signer: `${req.user?.name || "Encarregado"} (PIN Validado)`,
        signature_hash: signatureHash,
        signed_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", id).select("*").single();
      if (updErr) throw updErr;
      res.json({ consent: updated });
    } catch (error) {
      sendDbError(res, error, "Erro ao assinar autoriza\xE7\xE3o.");
    }
  });
  router.post("/guardian/messages", requireAuth, requireRole(["pais", "admin"]), async (req, res) => {
    const { studentId, recipientName, subject, message } = req.body ?? {};
    if (typeof recipientName !== "string" || !recipientName.trim() || typeof subject !== "string" || !subject.trim() || typeof message !== "string" || !message.trim()) {
      res.status(400).json({ error: "Destinat\xE1rio, assunto e mensagem s\xE3o obrigat\xF3rios." });
      return;
    }
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.from("portal_messages").insert({
        student_id: typeof studentId === "string" && studentId.trim() ? studentId : null,
        guardian_user_id: req.user?.id || null,
        sender_role: "Encarregado de Educa\xE7\xE3o",
        sender_name: req.user?.name || "Encarregado",
        recipient_name: recipientName.trim(),
        subject: subject.trim(),
        preview: message.trim(),
        unread: false
      }).select("*").single();
      if (error) throw error;
      res.status(201).json({ message: data });
    } catch (error) {
      sendDbError(res, error, "Erro ao enviar mensagem.");
    }
  });
  router.post("/guardian/payments/:id/pay", requireAuth, requireRole(["pais", "admin"]), async (req, res) => {
    const { id } = req.params;
    const { method } = req.body ?? {};
    try {
      const supabase = getSupabaseClient();
      const { data: rec, error: fetchErr } = await supabase.from("financial_records").select("*").eq("id", id).maybeSingle();
      if (fetchErr) throw fetchErr;
      if (!rec) {
        res.status(404).json({ error: "Fatura n\xE3o encontrada." });
        return;
      }
      if (req.user?.role === "pais" && rec.guardian_user_id && rec.guardian_user_id !== req.user.id) {
        res.status(403).json({ error: "Sem permiss\xE3o para liquidar esta fatura." });
        return;
      }
      const { data: updated, error: updErr } = await supabase.from("financial_records").update({
        status: "Liquidado",
        payment_method: typeof method === "string" && method.trim() ? method.trim() : "Multicaixa Express (MCX)",
        paid_date: (/* @__PURE__ */ new Date()).toLocaleDateString("pt-PT")
      }).eq("id", id).select("*").single();
      if (updErr) throw updErr;
      res.json({ record: updated });
    } catch (error) {
      sendDbError(res, error, "Erro ao registar pagamento.");
    }
  });
  return router;
}

// server/vercel-entry.ts
var app = express();
app.use((req, _res, next) => {
  if (req.body !== void 0 && !req._body) {
    req._body = true;
  }
  next();
});
app.use(express.json({ limit: "6mb" }));
var apiRouter = createApiRouter();
app.use("/api", apiRouter);
app.use("/", apiRouter);
app.use((_req, res) => {
  res.status(404).json({ error: "Rota da API n\xE3o encontrada." });
});
app.use((err, _req, res, _next) => {
  console.error("Unhandled API error:", err);
  const message = err instanceof Error ? err.message : "Erro interno no servidor.";
  res.status(500).json({ error: message });
});
var vercel_entry_default = app;
export {
  vercel_entry_default as default
};
