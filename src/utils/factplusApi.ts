/**
 * Integração com API FactPlus (Angola) - Facturação Electrónica AGT
 * Documentação: https://api.factplus.co.ao/documentation/
 */

import { Invoice, InvoiceItem } from '../types';

const FACTPLUS_API_URL = import.meta.env.VITE_FACTPLUS_API_URL || 'https://api.factplus.co.ao';
const FACTPLUS_API_KEY = import.meta.env.VITE_FACTPLUS_API_KEY || '6adb32d2abda1de3c6b0053000a3b601';

export interface FactPlusCreateInvoiceRequest {
  apicall: 'CREATE';
  apikey: string;
  document: {
    type: 'factura' | 'factura-recibo' | 'proforma' | 'nota-credito' | 'nota-debito';
    date: string;
    duedate: string;
    vref?: string;
    serie?: string;
    currency: string;
    exchange_rate?: string;
    observation?: string;
    retention?: string;
  };
  client: {
    name: string;
    nif: string;
    email?: string;
    city?: string;
    address?: string;
    postalcode?: string;
    country?: string;
  };
  items: Array<{
    itemcode: string;
    description: string;
    price: string;
    quantity: string;
    tax: string;
    discount: string;
    exemption_code?: string;
    retention?: string;
  }>;
}

export interface FactPlusResponse {
  result: 'success' | 'failure';
  message: string;
  data?: string | any;
}

export interface FactPlusAlterRequest {
  apicall: 'ALTER';
  apikey: string;
  document: {
    reference: string;
    type: 'factura' | 'factura-recibo';
    status: 'sent' | 'settled' | 'canceled' | 'accepted' | 'refused' | 'draft';
    reason?: string;
  };
}

/**
 * Mapear tipo de documento do sistema para FactPlus
 */
function mapDocumentType(type: string): 'factura' | 'factura-recibo' | 'proforma' | 'nota-credito' | 'nota-debito' {
  switch (type) {
    case 'FRE':
      return 'factura-recibo';
    case 'FP':
      return 'proforma';
    case 'NCE':
      return 'nota-credito';
    case 'NDE':
      return 'nota-debito';
    case 'FE':
    default:
      return 'factura';
  }
}

/**
 * Mapear estado do sistema para FactPlus
 */
function mapStatusForAlter(status: string): 'sent' | 'settled' | 'canceled' {
  switch (status) {
    case 'Liquidada':
      return 'settled';
    case 'Anulada':
      return 'canceled';
    case 'Emitida':
    case 'Aviso Enviado':
    case 'Em Aberto':
    default:
      return 'sent';
  }
}

/**
 * Criar factura na API FactPlus
 */
export async function createFactPlusInvoice(invoice: Invoice): Promise<FactPlusResponse> {
  try {
    const payload: FactPlusCreateInvoiceRequest = {
      apicall: 'CREATE',
      apikey: FACTPLUS_API_KEY,
      document: {
        type: mapDocumentType(invoice.documentType),
        date: invoice.issueDate,
        duedate: invoice.dueDate,
        vref: invoice.invoiceNumber,
        serie: invoice.series,
        currency: 'AOA',
        exchange_rate: '0',
        observation: invoice.notes || '',
        retention: '0'
      },
      client: {
        name: invoice.guardianName,
        nif: invoice.guardianNif || '999999999',
        email: invoice.guardianEmail || '',
        city: 'Luanda',
        address: invoice.guardianAddress || 'Angola',
        postalcode: '',
        country: 'Angola'
      },
      items: invoice.items.map((item: InvoiceItem) => ({
        itemcode: item.code,
        description: item.description,
        price: item.unitPrice.toString(),
        quantity: item.quantity.toString(),
        tax: item.taxRate.toString(),
        discount: (item.discountPercent || 0).toString(),
        exemption_code: item.exemptionReasonCode || '',
        retention: '0'
      }))
    };

    const response = await fetch(FACTPLUS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao criar factura na FactPlus:', error);
    return {
      result: 'failure',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * Alterar estado da factura na API FactPlus
 */
export async function alterFactPlusInvoice(
  reference: string,
  documentType: string,
  status: string,
  reason?: string
): Promise<FactPlusResponse> {
  try {
    const payload: FactPlusAlterRequest = {
      apicall: 'ALTER',
      apikey: FACTPLUS_API_KEY,
      document: {
        reference: reference,
        type: mapDocumentType(documentType) === 'factura-recibo' ? 'factura-recibo' : 'factura',
        status: mapStatusForAlter(status),
        reason: reason || ''
      }
    };

    const response = await fetch(FACTPLUS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao alterar estado na FactPlus:', error);
    return {
      result: 'failure',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

export { FACTPLUS_API_KEY, FACTPLUS_API_URL };
