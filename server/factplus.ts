/**
 * Server-Side FactPlus REST API v1.0 Integration (Angola - AGT Electronic Invoicing)
 * Endpoint accepts HTTP POST with JSON payload and server-only `apikey`.
 */

const DEFAULT_FACTPLUS_API_URL = 'https://api.factplus.co.ao';

export type FactPlusDocType =
  | 'factura'
  | 'factura-recibo'
  | 'proforma'
  | 'nota-credito'
  | 'nota-debito';

export type FactPlusAlterStatus =
  | 'sent'
  | 'settled'
  | 'canceled'
  | 'accepted'
  | 'refused'
  | 'draft';

export interface FactPlusApiRawResponse {
  result?: 'success' | 'failure' | string;
  message?: string;
  data?: unknown;
}

export interface FiscalValidationCheck {
  key: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface LocalFiscalValidationResult {
  valid: boolean;
  checks: FiscalValidationCheck[];
  normalizedIssueDate: string;
  normalizedDueDate: string;
  cleanNif: string;
}

export interface FinancialRecordInput {
  id: string;
  student_name: string;
  guardian_name: string;
  nif: string;
  class_group: string;
  description: string;
  amount: number;
  payment_method: string;
  status: string;
  invoice_number: string;
  due_date: string;
  created_at?: string;
  factplus_reference?: string | null;
}

function isPrivateOrLoopbackHost(hostname: string): boolean {
  const host = hostname.trim().toLowerCase();
  if (!host) return true;
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '0.0.0.0' ||
    host === '::1' ||
    host === '[::1]' ||
    host.endsWith('.local') ||
    host.endsWith('.internal')
  ) {
    return true;
  }

  // IPv4 private / link-local ranges
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

export function resolveFactPlusApiUrl(): string {
  const raw = process.env.FACTPLUS_API_URL?.trim() || DEFAULT_FACTPLUS_API_URL;
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error('FACTPLUS_API_URL inválido.');
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error('FACTPLUS_API_URL deve usar HTTPS ou HTTP.');
  }
  if (isPrivateOrLoopbackHost(parsed.hostname)) {
    throw new Error('FACTPLUS_API_URL não pode apontar para endereços internos ou locais.');
  }
  return parsed.toString().replace(/\/$/, '');
}

export function getFactPlusApiKey(): string | null {
  const key = process.env.FACTPLUS_API_KEY?.trim();
  return key && key.length >= 16 ? key : null;
}

export function isFactPlusConfigured(): boolean {
  try {
    resolveFactPlusApiUrl();
    return Boolean(getFactPlusApiKey());
  } catch {
    return false;
  }
}

export function normalizeFactPlusDate(raw?: string | null, fallbackDate?: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const candidate = (raw || '').trim();

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

export function runLocalFiscalValidation(record: FinancialRecordInput): LocalFiscalValidationResult {
  const today = new Date().toISOString().slice(0, 10);
  const issueDate = normalizeFactPlusDate(record.created_at, today);
  let dueDate = normalizeFactPlusDate(record.due_date, issueDate);
  if (dueDate < issueDate) {
    dueDate = issueDate;
  }

  const cleanNif = String(record.nif || '').replace(/\s+/g, '');
  const nifValid = /^(999999999|\d{9,10})$/.test(cleanNif);
  const numericAmount = Number(record.amount);
  const amountValid = Number.isFinite(numericAmount) && numericAmount > 0;
  const guardianValid = Boolean(record.guardian_name && record.guardian_name.trim().length >= 2);
  const descriptionValid = Boolean(record.description && record.description.trim().length >= 3);
  const invoiceNumValid = Boolean(record.invoice_number && record.invoice_number.trim().length >= 3);
  const datesValid = /^\d{4}-\d{2}-\d{2}$/.test(issueDate) && /^\d{4}-\d{2}-\d{2}$/.test(dueDate);

  const checks: FiscalValidationCheck[] = [
    {
      key: 'nif',
      label: 'NIF do Adquirente (AGT)',
      passed: nifValid,
      detail: nifValid
        ? cleanNif === '999999999'
          ? '999999999 (Consumidor Final)'
          : `NIF válido: ${cleanNif}`
        : `NIF "${cleanNif || 'vazio'}" deve conter 9 a 10 dígitos ou 999999999.`
    },
    {
      key: 'amount',
      label: 'Montante em Kwanza (AOA)',
      passed: amountValid,
      detail: amountValid
        ? `AOA ${numericAmount.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}`
        : 'O montante da fatura deve ser superior a zero.'
    },
    {
      key: 'client',
      label: 'Titular / Encarregado',
      passed: guardianValid,
      detail: guardianValid ? record.guardian_name.trim() : 'Nome do encarregado obrigatório.'
    },
    {
      key: 'description',
      label: 'Descrição do Serviço Educativo',
      passed: descriptionValid,
      detail: descriptionValid
        ? `${record.description.trim()} (Isenção IVA M10)`
        : 'Descrição do item obrigatória.'
    },
    {
      key: 'dates',
      label: 'Datas de Emissão & Vencimento',
      passed: datesValid && invoiceNumValid,
      detail: `Emissão ${issueDate} • Vencimento ${dueDate}`
    }
  ];

  return {
    valid: checks.every((c) => c.passed),
    checks,
    normalizedIssueDate: issueDate,
    normalizedDueDate: dueDate,
    cleanNif: nifValid ? cleanNif : '999999999'
  };
}

async function callFactPlusEndpoint(payload: Record<string, unknown>): Promise<FactPlusApiRawResponse> {
  const apiKey = getFactPlusApiKey();
  if (!apiKey) {
    throw new Error('FACTPLUS_API_KEY não está configurada no servidor.');
  }
  const apiUrl = resolveFactPlusApiUrl();

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      ...payload,
      apikey: apiKey
    }),
    signal: AbortSignal.timeout(12000)
  });

  const text = await response.text();
  let parsed: FactPlusApiRawResponse | null = null;
  try {
    parsed = text ? (JSON.parse(text) as FactPlusApiRawResponse) : null;
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    const errMsg =
      parsed?.message || `FactPlus retornou estado HTTP ${response.status}.`;
    throw new Error(errMsg);
  }

  if (!parsed) {
    throw new Error('Resposta inválida da API FactPlus.');
  }

  return parsed;
}

export function extractFactPlusReference(data: unknown): string | null {
  if (typeof data === 'string' && data.trim()) {
    return data.trim();
  }
  if (Array.isArray(data) && data.length > 0) {
    const first = data[0] as Record<string, unknown> | undefined;
    if (first && typeof first.reference === 'string' && first.reference.trim()) {
      return first.reference.trim();
    }
  }
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (typeof obj.reference === 'string' && obj.reference.trim()) {
      return obj.reference.trim();
    }
    if (typeof obj.document_reference === 'string' && obj.document_reference.trim()) {
      return obj.document_reference.trim();
    }
  }
  return null;
}

export async function createFactPlusDocument(
  record: FinancialRecordInput,
  validation: LocalFiscalValidationResult,
  docType: FactPlusDocType = 'factura'
): Promise<{
  success: boolean;
  reference: string | null;
  message: string;
  raw: FactPlusApiRawResponse;
}> {
  const payload = {
    apicall: 'CREATE',
    document: {
      type: docType,
      date: validation.normalizedIssueDate,
      duedate: validation.normalizedDueDate,
      vref: record.invoice_number,
      currency: 'AOA',
      exchange_rate: '0',
      observation: `Criança: ${record.student_name} (${record.class_group}) • Método: ${record.payment_method}`,
      retention: '0'
    },
    client: {
      name: record.guardian_name.trim(),
      nif: validation.cleanNif,
      city: 'Luanda',
      address: 'Luanda, Angola',
      country: 'Angola'
    },
    items: [
      {
        itemcode: record.invoice_number,
        description: `${record.description || 'Mensalidade Escolar'} - ${record.student_name}`,
        price: String(Number(record.amount)),
        quantity: '1',
        tax: '0',
        discount: '0',
        exemption_code: 'M10',
        retention: '0'
      }
    ]
  };

  const raw = await callFactPlusEndpoint(payload);
  const success = raw.result === 'success';
  const reference = extractFactPlusReference(raw.data);

  return {
    success,
    reference,
    message:
      raw.message ||
      (success
        ? 'Fatura validada e certificada pela API FactPlus.'
        : 'FactPlus recusou a validação do documento.'),
    raw
  };
}

export async function viewFactPlusDocument(
  reference: string,
  docType?: FactPlusDocType
): Promise<{
  success: boolean;
  reference: string;
  statusText: string | null;
  message: string;
  raw: FactPlusApiRawResponse;
}> {
  const cleanRef = reference.trim();
  if (!cleanRef || cleanRef.length > 80) {
    throw new Error('Referência FactPlus inválida.');
  }

  const documentPayload: Record<string, string> = { reference: cleanRef };
  if (docType) {
    documentPayload.type = docType;
  }

  const raw = await callFactPlusEndpoint({
    apicall: 'VIEW',
    document: documentPayload
  });

  const success = raw.result === 'success';
  let statusText: string | null = null;
  if (raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) {
    const obj = raw.data as Record<string, unknown>;
    if (typeof obj.status === 'string') statusText = obj.status;
  } else if (Array.isArray(raw.data) && raw.data.length > 0) {
    const first = raw.data[0] as Record<string, unknown>;
    if (first && typeof first.status === 'string') statusText = first.status;
  }

  return {
    success,
    reference: extractFactPlusReference(raw.data) || cleanRef,
    statusText,
    message:
      raw.message ||
      (success
        ? 'Documento encontrado e validado na FactPlus.'
        : 'Documento não encontrado ou inválido na FactPlus.'),
    raw
  };
}

export async function alterFactPlusDocument(
  reference: string,
  docType: 'factura' | 'factura-recibo',
  status: FactPlusAlterStatus,
  reason?: string
): Promise<{
  success: boolean;
  message: string;
  raw: FactPlusApiRawResponse;
}> {
  const raw = await callFactPlusEndpoint({
    apicall: 'ALTER',
    document: {
      reference: reference.trim(),
      type: docType,
      status,
      reason: reason || ''
    }
  });

  return {
    success: raw.result === 'success',
    message: raw.message || 'Estado atualizado na FactPlus.',
    raw
  };
}
