/**
 * Tipos e nota de integração FactPlus (Angola - Facturação Electrónica AGT).
 * Todas as chamadas à API FactPlus e credenciais (FACTPLUS_API_KEY)
 * são executadas exclusivamente no servidor Express (/api/admin/factplus/*).
 */

export type FactPlusDocumentType =
  | 'factura'
  | 'factura-recibo'
  | 'proforma'
  | 'nota-credito'
  | 'nota-debito';

export interface FactPlusResponse {
  result: 'success' | 'failure';
  message: string;
  data?: unknown;
}
