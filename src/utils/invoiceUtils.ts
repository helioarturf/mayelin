/**
 * Utilitários de Faturação e Factura Electrónica (FE) para o Jardim Escola da Mayelin
 * Em estrita conformidade com a Administração Geral Tributária (AGT - Angola)
 * Regime Jurídico das Facturas (Decreto Presidencial n.º 312/18) e Código do IVA.
 */

import { Invoice, InvoiceItem, InvoiceType } from '../types';

export const SCHOOL_FISCAL_INFO = {
  companyName: 'Jardim Escola da Mayelin, Lda.',
  commercialBrand: 'Jardim Escola da Mayelin - Educação Infantil e Creche',
  nif: '5412894109',
  address: 'Avenida Principal, Quarteirão B, Centralidade do Kilamba / Belas',
  city: 'Luanda, Angola',
  phone: '+244 936 73 94 28',
  email: 'financeiro@mayelinkids.com',
  agtCertificateNumber: '1482/AGT',
  systemName: 'Mayelin ERP v2.4 (Certificado AGT)',
  multicaixaEntity: '00921',
  bankAccounts: [
    { bank: 'BFA (Banco de Fomento Angola)', iban: 'AO06 0006 0000 1234 5678 9012 3', swift: 'BFAMAOLU' },
    { bank: 'BAI (Banco Angolano de Investimentos)', iban: 'AO06 0040 0000 9876 5432 1098 7', swift: 'BAIMAOLU' }
  ]
};

/**
 * Catálogo de Itens e Serviços Pedagógicos
 */
export const INVOICE_ITEM_PRESETS = [
  {
    code: 'PROP-BER-01',
    description: 'Propina Mensal - Berçário Encantado',
    unitPrice: 180000,
    taxRate: 0,
    exemptionReasonCode: 'M02', // Isenção Art.º 12.º CIVA
    category: 'Propina'
  },
  {
    code: 'PROP-MAT-01',
    description: 'Propina Mensal - Maternal I & II',
    unitPrice: 165000,
    taxRate: 0,
    exemptionReasonCode: 'M02',
    category: 'Propina'
  },
  {
    code: 'PROP-JAR-01',
    description: 'Propina Mensal - Jardim de Infância & Pré-Escolar',
    unitPrice: 150000,
    taxRate: 0,
    exemptionReasonCode: 'M02',
    category: 'Propina'
  },
  {
    code: 'SERV-ALIM-01',
    description: 'Refeições Biológicas & Lanche Saudável da Horta (Mensal)',
    unitPrice: 45000,
    taxRate: 0,
    exemptionReasonCode: 'M02',
    category: 'Serviço'
  },
  {
    code: 'SERV-TRASP-01',
    description: 'Transporte Escolar Acompanhado (Ida e Volta)',
    unitPrice: 40000,
    taxRate: 0,
    exemptionReasonCode: 'M02',
    category: 'Transporte'
  },
  {
    code: 'MATR-CONF-01',
    description: 'Taxa de Matrícula / Confirmação Anual',
    unitPrice: 75000,
    taxRate: 0,
    exemptionReasonCode: 'M02',
    category: 'Secretaria'
  },
  {
    code: 'PROL-HOR-01',
    description: 'Prolongamento de Horário Acolhedor (até às 19h00)',
    unitPrice: 25000,
    taxRate: 0,
    exemptionReasonCode: 'M02',
    category: 'Serviço'
  },
  {
    code: 'UNIF-KIT-01',
    description: 'Kit Oficial de Fardamento (2 T-shirts + Calções + Bibe)',
    unitPrice: 35000,
    taxRate: 14, // Fardamento tributável à taxa geral de IVA
    exemptionReasonCode: undefined,
    category: 'Material'
  },
  {
    code: 'WORK-ING-01',
    description: 'Oficina Extracurricular de Vivências em Inglês & Música',
    unitPrice: 20000,
    taxRate: 0,
    exemptionReasonCode: 'M02',
    category: 'Oficina'
  }
];

/**
 * Formata um valor numérico em Kwanzas no padrão angolano (ex.: "Kz 150.000,00")
 */
export function formatKwanza(amount: number): string {
  if (isNaN(amount)) return 'Kz 0,00';
  const parts = Math.abs(amount).toFixed(2).split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const sign = amount < 0 ? '-' : '';
  return `${sign}Kz ${intPart},${parts[1]}`;
}

/**
 * Formata um número puro em Kwanzas sem o prefixo Kz (ex.: "150.000,00")
 */
export function formatCurrencyNumber(amount: number): string {
  if (isNaN(amount)) return '0,00';
  const parts = Math.abs(amount).toFixed(2).split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const sign = amount < 0 ? '-' : '';
  return `${sign}${intPart},${parts[1]}`;
}

/**
 * Calcula subtotal, descontos, IVA e total líquido a pagar
 */
export function calculateInvoiceTotals(items: InvoiceItem[]): {
  subtotal: number;
  totalDiscount: number;
  taxTotal: number;
  totalAmount: number;
} {
  let subtotal = 0;
  let totalDiscount = 0;
  let taxTotal = 0;

  for (const item of items) {
    const gross = item.quantity * item.unitPrice;
    subtotal += gross;

    const discount = item.discountPercent ? (gross * item.discountPercent) / 100 : 0;
    totalDiscount += discount;

    const net = gross - discount;
    if (item.taxRate > 0) {
      taxTotal += (net * item.taxRate) / 100;
    }
  }

  const totalAmount = subtotal - totalDiscount + taxTotal;
  return {
    subtotal: Math.round(subtotal),
    totalDiscount: Math.round(totalDiscount),
    taxTotal: Math.round(taxTotal),
    totalAmount: Math.round(totalAmount)
  };
}

/**
 * Gera um número sequencial e cronológico de documento fiscal
 * Ex.: "FE MAY2025/0001" ou "FRE MAY2025/0012"
 */
export function generateInvoiceNumber(type: InvoiceType, series: string, sequenceNumber: number): string {
  const padded = String(sequenceNumber).padStart(4, '0');
  return `${type} ${series}/${padded}`;
}

/**
 * Gera os 4 caracteres de validação do Hash da assinatura AGT
 * No padrão AGT, os caracteres 1, 11, 21 e 31 da assinatura em Base64 são impressos no documento.
 */
export function generateAgtHash(invoiceData: Partial<Invoice>): string {
  const raw = `${invoiceData.invoiceNumber}|${invoiceData.issueDate}|${invoiceData.totalAmount}|${SCHOOL_FISCAL_INFO.nif}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash << 5) - hash + raw.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(36).toUpperCase() + 'XZ89';
  return hex.substring(0, 4);
}

/**
 * Gera o Código de Validação da AGT (CVA) atribuído em tempo real no processo de Facturação Electrónica
 * Ex.: "AGT-2025-CVA-98412"
 */
export function generateAgtCvaCode(year = new Date().getFullYear(), seqNumber = 1): string {
  const randomSuffix = Math.floor(10000 + (seqNumber * 37) % 89999);
  return `AGT-${year}-CVA-${randomSuffix}`;
}

/**
 * Gera a referência de pagamento Multicaixa (9 dígitos formatados em blocos de 3)
 */
export function generateMulticaixaReference(invoiceId: string, amount: number): { entity: string; reference: string } {
  let seed = 0;
  for (let i = 0; i < invoiceId.length; i++) {
    seed = (seed * 31 + invoiceId.charCodeAt(i)) % 1000000000;
  }
  const refNum = Math.abs((seed + Math.floor(amount)) % 900000000) + 100000000;
  const str = String(refNum).padStart(9, '0');
  const formatted = `${str.slice(0, 3)} ${str.slice(3, 6)} ${str.slice(6, 9)}`;
  return {
    entity: SCHOOL_FISCAL_INFO.multicaixaEntity,
    reference: formatted
  };
}

/**
 * Gera URL / String de dados do QR Code da AGT para validação tributária imediata
 */
export function generateAgtQrCodeData(invoice: Invoice): string {
  const params = new URLSearchParams({
    nif_emissor: SCHOOL_FISCAL_INFO.nif,
    nif_adquirente: invoice.guardianNif || '999999999',
    doc_tipo: invoice.documentType,
    doc_num: invoice.invoiceNumber,
    data: invoice.issueDate,
    total: String(invoice.totalAmount),
    cva: invoice.electronic.cvaCode || '',
    hash4: invoice.agtHash,
    cert: SCHOOL_FISCAL_INFO.agtCertificateNumber
  });
  return `https://portaldocontribuinte.minfin.gov.ao/agt/validar-factura?${params.toString()}`;
}

/**
 * Gera o ficheiro XML da Factura Electrónica conforme o padrão UBL / AGT
 */
export function generateInvoiceXmlPayload(invoice: Invoice): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>AGT_ANGOLA_FE_2.0</cbc:CustomizationID>
  <cbc:ProfileID>RegimeGeral_Ensino_Isento_Art12</cbc:ProfileID>
  <cbc:ID>${invoice.invoiceNumber}</cbc:ID>
  <cbc:IssueDate>${invoice.issueDate}</cbc:IssueDate>
  <cbc:DueDate>${invoice.dueDate}</cbc:DueDate>
  <cbc:InvoiceTypeCode listID="AGT_DOC_TYPES">${invoice.documentType}</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>AOA</cbc:DocumentCurrencyCode>
  
  <!-- Validação AGT -->
  <cac:AdditionalDocumentReference>
    <cbc:ID>${invoice.electronic.cvaCode || 'CONTINGENCIA'}</cbc:ID>
    <cbc:DocumentTypeCode>CVA_AGT</cbc:DocumentTypeCode>
  </cac:AdditionalDocumentReference>
  <cac:AdditionalDocumentReference>
    <cbc:ID>${invoice.agtCertificateNumber}</cbc:ID>
    <cbc:DocumentTypeCode>CERTIFICADO_SOFTWARE_AGT</cbc:DocumentTypeCode>
  </cac:AdditionalDocumentReference>
  <cac:AdditionalDocumentReference>
    <cbc:ID>${invoice.agtHash}</cbc:ID>
    <cbc:DocumentTypeCode>HASH_4_CHARS</cbc:DocumentTypeCode>
  </cac:AdditionalDocumentReference>

  <!-- Entidade Emissora (Jardim Escola da Mayelin) -->
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="AGT_NIF">${SCHOOL_FISCAL_INFO.nif}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${SCHOOL_FISCAL_INFO.companyName}</cbc:Name>
      </cac:PartyName>
      <cac:PostalAddress>
        <cbc:StreetName>${SCHOOL_FISCAL_INFO.address}</cbc:StreetName>
        <cbc:CityName>${SCHOOL_FISCAL_INFO.city}</cbc:CityName>
        <cac:Country>
          <cbc:IdentificationCode>AO</cbc:IdentificationCode>
        </cac:Country>
      </cac:PostalAddress>
    </cac:Party>
  </cac:AccountingSupplierParty>

  <!-- Adquirente (Encarregado de Educação) -->
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="AGT_NIF">${invoice.guardianNif || '999999999'}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${invoice.guardianName}</cbc:Name>
      </cac:PartyName>
      <cac:Contact>
        <cbc:ElectronicMail>${invoice.guardianEmail || 'geral@mayelinkids.com'}</cbc:ElectronicMail>
        <cbc:Note>Educando: ${invoice.studentName} | Turma: ${invoice.classroom}</cbc:Note>
      </cac:Contact>
    </cac:Party>
  </cac:AccountingCustomerParty>

  <!-- Meio de Pagamento Multicaixa -->
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode>Multicaixa</cbc:PaymentMeansCode>
    <cbc:InstructionNote>Entidade: ${invoice.paymentReference?.entity || '00921'} | Referência: ${invoice.paymentReference?.reference || ''}</cbc:InstructionNote>
  </cac:PaymentMeans>

  <!-- Totais Fiscais -->
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="AOA">${invoice.taxTotal.toFixed(2)}</cbc:TaxAmount>
  </cac:TaxTotal>

  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="AOA">${invoice.subtotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:AllowanceTotalAmount currencyID="AOA">${invoice.totalDiscount.toFixed(2)}</cbc:AllowanceTotalAmount>
    <cbc:TaxInclusiveAmount currencyID="AOA">${invoice.totalAmount.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="AOA">${invoice.totalAmount.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>

  <!-- Linhas da Factura -->
  ${invoice.items
    .map(
      (item, idx) => `
  <cac:InvoiceLine>
    <cbc:ID>${idx + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="EA">${item.quantity}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="AOA">${(item.quantity * item.unitPrice).toFixed(2)}</cbc:LineExtensionAmount>
    <cac:Item>
      <cbc:Description>${item.description}</cbc:Description>
      <cac:SellersItemIdentification>
        <cbc:ID>${item.code}</cbc:ID>
      </cac:SellersItemIdentification>
      <cac:ClassifiedTaxCategory>
        <cbc:Percent>${item.taxRate}</cbc:Percent>
        <cac:TaxScheme>
          <cbc:ID>IVA</cbc:ID>
          <cbc:TaxTypeCode>${item.exemptionReasonCode ? 'M02' : 'NOR'}</cbc:TaxTypeCode>
        </cac:TaxScheme>
      </cac:ClassifiedTaxCategory>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="AOA">${item.unitPrice.toFixed(2)}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>`
    )
    .join('')}
</Invoice>`;
}

/**
 * Faturas de exemplo iniciais para pré-carregamento no Portal
 */
export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-may-01',
    documentType: 'FE',
    invoiceNumber: 'FE MAY2025/0145',
    series: 'MAY2025',
    sequenceNumber: 145,
    issueDate: '2025-02-01',
    dueDate: '2025-02-10',
    studentId: 'lucas-mayelin',
    studentName: 'Lucas Oliveira Mayelin',
    classroom: 'Maternal I - Primeiros Passos',
    guardianName: 'Helena Mayelin',
    guardianNif: '5418172901',
    guardianEmail: 'helena.mayelin@gmail.com',
    guardianPhone: '+244 923 456 789',
    guardianAddress: 'Centralidade do Kilamba, Edifício B12, Apt 304, Luanda',
    items: [
      {
        id: 'it-1',
        code: 'PROP-MAT-01',
        description: 'Propina Maternal I - Mês de Fevereiro / 2025',
        quantity: 1,
        unitPrice: 165000,
        taxRate: 0,
        exemptionReasonCode: 'M02',
        totalItem: 165000
      }
    ],
    subtotal: 165000,
    totalDiscount: 0,
    taxTotal: 0,
    totalAmount: 165000,
    status: 'Liquidada',
    paymentMethod: 'Multicaixa Express (MCX)',
    paymentReference: {
      entity: '00921',
      reference: '849 201 452'
    },
    paidAt: '2025-02-05',
    electronic: {
      isElectronic: true,
      cvaCode: 'AGT-2025-CVA-98412',
      transmissionStatus: 'Validada_AGT',
      transmissionTimestamp: '2025-02-01T08:34:12+01:00',
      isContingency: false
    },
    agtHash: 'J7k2',
    agtCertificateNumber: '1482/AGT',
    notes: 'Liquidado via Multicaixa Express com confirmação automática pelo banco.'
  },
  {
    id: 'inv-may-02',
    documentType: 'FRE',
    invoiceNumber: 'FRE MAY2025/0146',
    series: 'MAY2025',
    sequenceNumber: 146,
    issueDate: '2025-02-02',
    dueDate: '2025-02-02',
    studentId: 'sofia-rocha',
    studentName: 'Sofia Rocha Ramos',
    classroom: 'Berçário Encantado - Ninho de Afeto',
    guardianName: 'Fernando Ramos',
    guardianNif: '5413904581',
    guardianEmail: 'fernando.ramos@corp.ao',
    guardianPhone: '+244 912 345 678',
    guardianAddress: 'Talatona, Condomínio Luanda Sul, Luanda',
    items: [
      {
        id: 'it-2',
        code: 'PROP-BER-01',
        description: 'Propina Berçário - Mês de Fevereiro / 2025',
        quantity: 1,
        unitPrice: 180000,
        taxRate: 0,
        exemptionReasonCode: 'M02',
        totalItem: 180000
      }
    ],
    subtotal: 180000,
    totalDiscount: 0,
    taxTotal: 0,
    totalAmount: 180000,
    status: 'Liquidada',
    paymentMethod: 'Multicaixa Express (MCX)',
    paymentReference: {
      entity: '00921',
      reference: '921 583 049'
    },
    paidAt: '2025-02-06',
    electronic: {
      isElectronic: true,
      cvaCode: 'AGT-2025-CVA-98413',
      transmissionStatus: 'Validada_AGT',
      transmissionTimestamp: '2025-02-02T10:15:40+01:00',
      isContingency: false
    },
    agtHash: 'A9b4',
    agtCertificateNumber: '1482/AGT',
    notes: 'Factura-Recibo emitida e liquidada no ato.'
  },
  {
    id: 'inv-may-03',
    documentType: 'FE',
    invoiceNumber: 'FE MAY2025/0147',
    series: 'MAY2025',
    sequenceNumber: 147,
    issueDate: '2025-02-03',
    dueDate: '2025-02-10',
    studentId: 'mateus-silva',
    studentName: 'Mateus Castro Silva',
    classroom: 'Jardim de Infância - Sala das Estrelinhas',
    guardianName: 'Rodrigo Silva',
    guardianNif: '5419842109',
    guardianEmail: 'rodrigo.silva@ao.com',
    guardianPhone: '+244 934 567 890',
    guardianAddress: 'Centralidade do Kilamba, Bloco C, Luanda',
    items: [
      {
        id: 'it-3',
        code: 'PROP-JAR-01',
        description: 'Propina Jardim de Infância - Mês de Fevereiro / 2025',
        quantity: 1,
        unitPrice: 150000,
        taxRate: 0,
        exemptionReasonCode: 'M02',
        totalItem: 150000
      }
    ],
    subtotal: 150000,
    totalDiscount: 0,
    taxTotal: 0,
    totalAmount: 150000,
    status: 'Aviso Enviado',
    paymentMethod: 'Referência Multicaixa',
    paymentReference: {
      entity: '00921',
      reference: '419 823 710'
    },
    electronic: {
      isElectronic: true,
      cvaCode: 'AGT-2025-CVA-98414',
      transmissionStatus: 'Validada_AGT',
      transmissionTimestamp: '2025-02-03T09:20:00+01:00',
      isContingency: false
    },
    agtHash: 'F3x1',
    agtCertificateNumber: '1482/AGT',
    notes: 'Lembrete de cobrança disparado por SMS e App Push.'
  },
  {
    id: 'inv-may-04',
    documentType: 'FE',
    invoiceNumber: 'FE MAY2025/0148',
    series: 'MAY2025',
    sequenceNumber: 148,
    issueDate: '2025-02-04',
    dueDate: '2025-02-10',
    studentId: 'beatriz-alcantara',
    studentName: 'Beatriz Alcantara',
    classroom: 'Pré-Escolar - Sala das Descobertas',
    guardianName: 'Diogo Alcantara',
    guardianNif: '5425489102',
    guardianEmail: 'diogo.alcantara@gmail.com',
    guardianPhone: '+244 928 112 233',
    guardianAddress: 'Camama, Luanda',
    items: [
      {
        id: 'it-4',
        code: 'PROP-JAR-01',
        description: 'Propina Pré-Escolar - Mês de Fevereiro / 2025',
        quantity: 1,
        unitPrice: 150000,
        taxRate: 0,
        exemptionReasonCode: 'M02',
        totalItem: 150000
      }
    ],
    subtotal: 150000,
    totalDiscount: 0,
    taxTotal: 0,
    totalAmount: 150000,
    status: 'Liquidada',
    paymentMethod: 'Transferência Bancária (AO06)',
    paymentReference: {
      entity: '00921',
      reference: '198 230 491'
    },
    paidAt: '2025-02-04',
    electronic: {
      isElectronic: true,
      cvaCode: 'AGT-2025-CVA-98415',
      transmissionStatus: 'Validada_AGT',
      transmissionTimestamp: '2025-02-04T11:45:22+01:00',
      isContingency: false
    },
    agtHash: 'K2p9',
    agtCertificateNumber: '1482/AGT',
    notes: 'Transferência comprovada e conciliada no extrato BFA.'
  },
  {
    id: 'inv-may-05',
    documentType: 'FE',
    invoiceNumber: 'FE MAY2025/0149',
    series: 'MAY2025',
    sequenceNumber: 149,
    issueDate: '2025-02-05',
    dueDate: '2025-02-10',
    studentId: 'tomas-mendonca',
    studentName: 'Tomás Mendonça',
    classroom: 'Maternal II - Sala dos Exploradores',
    guardianName: 'Patrícia Mendonça',
    guardianNif: '5422874190',
    guardianEmail: 'patricia.mendonca@ao.net',
    guardianPhone: '+244 945 678 123',
    guardianAddress: 'Kilamba, Bloco G, Luanda',
    items: [
      {
        id: 'it-5',
        code: 'PROP-MAT-01',
        description: 'Propina Maternal II - Mês de Fevereiro / 2025',
        quantity: 1,
        unitPrice: 165000,
        taxRate: 0,
        exemptionReasonCode: 'M02',
        totalItem: 165000
      }
    ],
    subtotal: 165000,
    totalDiscount: 0,
    taxTotal: 0,
    totalAmount: 165000,
    status: 'Aviso Enviado',
    paymentMethod: 'Referência Multicaixa',
    paymentReference: {
      entity: '00921',
      reference: '739 104 821'
    },
    electronic: {
      isElectronic: true,
      cvaCode: 'AGT-2025-CVA-98416',
      transmissionStatus: 'Validada_AGT',
      transmissionTimestamp: '2025-02-05T14:10:00+01:00',
      isContingency: false
    },
    agtHash: 'E8w5',
    agtCertificateNumber: '1482/AGT',
    notes: 'Aguardando liquidação por referência Multicaixa.'
  }
];
