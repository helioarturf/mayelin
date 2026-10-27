import React, { useState } from 'react';
import {
  Printer,
  Download,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Copy,
  QrCode,
  FileCode,
  AlertCircle,
  X,
  Send,
  ExternalLink
} from 'lucide-react';
import { Invoice } from '../types';
import {
  SCHOOL_FISCAL_INFO,
  formatKwanza,
  formatCurrencyNumber,
  generateInvoiceXmlPayload,
  generateAgtQrCodeData
} from '../utils/invoiceUtils';

interface InvoiceDocumentViewProps {
  invoice: Invoice;
  onClose: () => void;
  onSendEmail?: (invoice: Invoice) => void;
}

export default function InvoiceDocumentView({
  invoice,
  onClose,
  onSendEmail
}: InvoiceDocumentViewProps) {
  const [copiedCva, setCopiedCva] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Document labels
  const getDocumentTitle = () => {
    switch (invoice.documentType) {
      case 'FE':
        return 'FACTURA ELECTRÓNICA';
      case 'FRE':
        return 'FACTURA-RECIBO ELECTRÓNICA';
      case 'NCE':
        return 'NOTA DE CRÉDITO ELECTRÓNICA';
      case 'NDE':
        return 'NOTA DE DÉBITO ELECTRÓNICA';
      case 'FT':
        return 'FACTURA';
      case 'FR':
        return 'FACTURA-RECIBO';
      case 'FP':
        return 'FACTURA PRÓ-FORMA';
      case 'RC':
        return 'RECIBO DE QUITAÇÃO';
      default:
        return 'DOCUMENTO COMERCIAL';
    }
  };

  const isElectronic = invoice.electronic?.isElectronic ?? true;
  const isContingency = invoice.electronic?.isContingency ?? false;
  const cvaCode = invoice.electronic?.cvaCode || 'EM PROCESSAMENTO';

  // Copiar CVA
  const handleCopyCva = () => {
    if (invoice.electronic?.cvaCode) {
      navigator.clipboard.writeText(invoice.electronic.cvaCode);
      setCopiedCva(true);
      setTimeout(() => setCopiedCva(false), 2500);
    }
  };

  // Copiar Referência Multicaixa
  const handleCopyRef = () => {
    if (invoice.paymentReference?.reference) {
      navigator.clipboard.writeText(invoice.paymentReference.reference);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2500);
    }
  };

  // Descarregar XML da Factura Electrónica
  const handleDownloadXml = () => {
    const xml = generateInvoiceXmlPayload(invoice);
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.invoiceNumber.replace(/[\/\s]/g, '_')}_AGT.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Imprimir ou Guardar em PDF
  const handlePrint = () => {
    window.print();
  };

  // Disparar envio por e-mail
  const handleSendEmail = () => {
    if (onSendEmail) {
      onSendEmail(invoice);
    }
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  };

  const qrCodeUrl = generateAgtQrCodeData(invoice);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="invoice-doc-title"
      className="fixed inset-0 z-70 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:static print:bg-white print:overflow-visible"
    >
      <div className="bg-white rounded-3xl max-w-4xl w-full my-auto shadow-2xl border border-[#eee0d6] overflow-hidden flex flex-col max-h-[96vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* ========================================================================= */}
        {/* BARRA SUPERIOR DE AÇÕES (OCULTA NA IMPRESSÃO)                              */}
        {/* ========================================================================= */}
        <div className="bg-[#211a14] text-white px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-[#ed145b] border border-pink-500/30 flex items-center justify-center font-bold text-xs">
              AGT
            </div>
            <div>
              <span className="text-xs font-bold font-['Quicksand'] block text-white">
                {getDocumentTitle()} • {invoice.invoiceNumber}
              </span>
              <span className="text-[10px] text-pink-200/80 font-mono">
                {isElectronic
                  ? isContingency
                    ? 'Regime de Contingência AGT'
                    : 'Validada pela AGT (Angola)'
                  : 'Documento Padrão'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleDownloadXml}
              title="Descarregar XML oficial da Factura Electrónica"
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-pink-300" />
              <span className="hidden sm:inline">Descarregar XML</span>
            </button>

            <button
              type="button"
              onClick={handleSendEmail}
              disabled={emailSent}
              title="Enviar para o e-mail do Encarregado"
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">
                {emailSent ? 'Enviado!' : 'Enviar E-mail'}
              </span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-[#ed145b] hover:bg-[#d0104f] text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors ml-1 cursor-pointer"
              aria-label="Fechar visualização"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CORPO DO DOCUMENTO FISCAL (FORMATO A4 PADRONIZADO AGT)                     */}
        {/* ========================================================================= */}
        <div
          id="invoice-printable-area"
          className="p-6 sm:p-8 md:p-10 overflow-y-auto space-y-6 text-[#211a14] font-['Nunito_Sans'] print:p-0 print:overflow-visible print:space-y-4"
        >
          {/* 1. CABEÇALHO: IDENTIFICAÇÃO DO EMISSOR & TÍTULO DO DOCUMENTO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-[#eee0d6]">
            {/* Dados da Escola */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-pink-100 text-[#ed145b] flex items-center justify-center font-bold shadow-xs">
                  <Building2 className="w-6 h-6 text-[#ed145b]" />
                </div>
                <div>
                  <h2 className="font-bold font-['Quicksand'] text-base text-[#211a14] leading-tight">
                    {SCHOOL_FISCAL_INFO.companyName}
                  </h2>
                  <p className="text-[11px] font-semibold text-[#ed145b]">
                    {SCHOOL_FISCAL_INFO.commercialBrand}
                  </p>
                </div>
              </div>

              <div className="text-xs text-[#5c3f42] space-y-0.5 pt-1">
                <p>
                  <span className="font-bold text-[#211a14]">NIF:</span>{' '}
                  <span className="font-mono font-bold text-[#211a14]">{SCHOOL_FISCAL_INFO.nif}</span>
                </p>
                <p>{SCHOOL_FISCAL_INFO.address}</p>
                <p>{SCHOOL_FISCAL_INFO.city}</p>
                <p>
                  Telefone: {SCHOOL_FISCAL_INFO.phone} • E-mail: {SCHOOL_FISCAL_INFO.email}
                </p>
              </div>
            </div>

            {/* Identificação do Documento Fiscal */}
            <div className="md:text-right flex flex-col justify-between">
              <div>
                <div className="inline-block px-3 py-1 rounded-xl bg-pink-50 border border-pink-200 text-[#ed145b] font-extrabold text-sm uppercase tracking-wide">
                  {getDocumentTitle()}
                </div>
                <h1
                  id="invoice-doc-title"
                  className="font-mono font-extrabold text-xl sm:text-2xl text-[#211a14] mt-1.5"
                >
                  {invoice.invoiceNumber}
                </h1>
                <p className="text-[11px] text-[#8c6b6d] font-semibold">
                  Original • Vias Fiscais: 1.ª Via (Encarregado)
                </p>
              </div>

              <div className="mt-3 text-xs space-y-0.5 text-[#5c3f42]">
                <p>
                  <span className="font-bold text-[#211a14]">Data de Emissão:</span> {invoice.issueDate}
                </p>
                <p>
                  <span className="font-bold text-[#211a14]">Data de Vencimento:</span>{' '}
                  <span className="font-bold text-[#ed145b]">{invoice.dueDate}</span>
                </p>
                <p>
                  <span className="font-bold text-[#211a14]">Estado da Liquidação:</span>{' '}
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                      invoice.status === 'Liquidada'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {invoice.status}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* 2. CAIXA DE VALIDAÇÃO DA FACTURA ELECTRÓNICA PELA AGT */}
          {isElectronic && (
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs uppercase tracking-wide text-emerald-900">
                      {isContingency
                        ? 'Factura Emitida em Regime de Contingência (AGT)'
                        : 'Documento Validado pela Administração Geral Tributária (AGT)'}
                    </span>
                    <span className="px-2 py-0.2 rounded-md bg-emerald-600 text-white font-mono text-[10px] font-bold">
                      AO-AGT
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 font-mono">
                    <span className="font-bold">Código de Validação da AGT (CVA):</span>{' '}
                    <span className="font-bold text-emerald-900 underline">{cvaCode}</span>
                  </p>
                  <p className="text-[10px] text-emerald-700 font-mono">
                    Software Certificado n.º {SCHOOL_FISCAL_INFO.agtCertificateNumber} • Assinatura Digital RSA/SHA-256
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0 print:hidden">
                <button
                  type="button"
                  onClick={handleCopyCva}
                  className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                  title="Copiar código CVA"
                >
                  {copiedCva ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar CVA</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 3. DADOS DO ADQUIRENTE (ENCARREGADO DE EDUCAÇÃO & ALUNO) */}
          <div className="p-4 rounded-2xl bg-[#fff8f5] border border-[#eee0d6] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Encarregado */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#8c6b6d]">
                Adquirente / Encarregado(a) de Educação
              </span>
              <p className="font-bold text-sm text-[#211a14]">{invoice.guardianName}</p>
              <p className="text-[#5c3f42]">
                <span className="font-bold">NIF:</span>{' '}
                <span className="font-mono font-bold text-[#211a14]">
                  {invoice.guardianNif || 'Consumidor Final (999999999)'}
                </span>
              </p>
              {invoice.guardianAddress && (
                <p className="text-[#5c3f42]">{invoice.guardianAddress}</p>
              )}
              {invoice.guardianEmail && (
                <p className="text-[#5c3f42]">E-mail: {invoice.guardianEmail}</p>
              )}
            </div>

            {/* Educando / Aluno */}
            <div className="space-y-1 md:border-l md:border-[#eee0d6] md:pl-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#8c6b6d]">
                Educando(a) Beneficiário(a)
              </span>
              <p className="font-bold text-sm text-[#211a14]">{invoice.studentName}</p>
              <p className="text-[#5c3f42]">
                <span className="font-bold">Turma / Ciclo:</span> {invoice.classroom}
              </p>
              <p className="text-[#5c3f42]">
                <span className="font-bold">Ano Letivo:</span> 2024 / 2025
              </p>
              <p className="text-[#5c3f42]">
                <span className="font-bold">Modalidade:</span> Creche e Jardim Escola
              </p>
            </div>
          </div>

          {/* 4. TABELA DE ITENS / SERVIÇOS FATURADOS */}
          <div className="border border-[#eee0d6] rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fff1e7] border-b border-[#eee0d6] text-[#5c3f42] font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Código</th>
                    <th className="p-3">Descrição do Serviço / Artigo</th>
                    <th className="p-3 text-center">Qtd</th>
                    <th className="p-3 text-right">P. Unitário</th>
                    <th className="p-3 text-center">Desc (%)</th>
                    <th className="p-3 text-center">Taxa IVA</th>
                    <th className="p-3 text-right">Total Líquido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eee0d6]">
                  {invoice.items.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-[#fffaf7]/80">
                      <td className="p-3 font-mono font-bold text-[#8c6b6d]">{item.code}</td>
                      <td className="p-3">
                        <span className="font-bold text-[#211a14] block">{item.description}</span>
                        {item.exemptionReasonCode && (
                          <span className="text-[10px] text-[#8c6b6d]">
                            Isenção: Art.º 12.º do CIVA ({item.exemptionReasonCode})
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center font-bold text-[#211a14]">{item.quantity}</td>
                      <td className="p-3 text-right font-mono text-[#211a14]">
                        {formatCurrencyNumber(item.unitPrice)}
                      </td>
                      <td className="p-3 text-center font-mono text-[#8c6b6d]">
                        {item.discountPercent ? `${item.discountPercent}%` : '-'}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.taxRate === 0
                              ? 'bg-sky-50 text-sky-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {item.taxRate === 0 ? '0% (Isento)' : `${item.taxRate}%`}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-[#211a14]">
                        {formatCurrencyNumber(item.totalItem)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. QUADRO TRIBUTÁRIO (IVA) & TOTAIS FINAIS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Quadro de Isenção e Incidência de IVA */}
            <div className="space-y-3">
              <div className="bg-[#fff8f5] p-3.5 rounded-2xl border border-[#eee0d6] text-xs space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8c6b6d] block">
                  Quadro Discriminativo do Imposto sobre o Valor Acrescentado (IVA)
                </span>
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-[#eee0d6] text-[#5c3f42]">
                      <th className="pb-1">Taxa</th>
                      <th className="pb-1 text-right">Incidência (Kz)</th>
                      <th className="pb-1 text-right">Montante (Kz)</th>
                      <th className="pb-1 text-right">Motivo de Isenção</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    <tr>
                      <td className="pt-1.5 font-bold">0% (Isento)</td>
                      <td className="pt-1.5 text-right">{formatCurrencyNumber(invoice.subtotal)}</td>
                      <td className="pt-1.5 text-right font-bold">0,00</td>
                      <td className="pt-1.5 text-right text-[10px] font-sans text-[#8c6b6d]">
                        M02 - Art.º 12.º CIVA
                      </td>
                    </tr>
                    {invoice.taxTotal > 0 && (
                      <tr>
                        <td className="pt-1 font-bold text-amber-700">14% (Geral)</td>
                        <td className="pt-1 text-right font-bold">
                          {formatCurrencyNumber(invoice.subtotal - invoice.totalDiscount)}
                        </td>
                        <td className="pt-1 text-right font-bold text-amber-800">
                          {formatCurrencyNumber(invoice.taxTotal)}
                        </td>
                        <td className="pt-1 text-right text-[10px] font-sans text-[#8c6b6d]">-</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Informação de Pagamento Multicaixa */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
                    Pagamento via Multicaixa / MCX Express
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyRef}
                    className="text-[10px] font-bold text-amber-800 hover:text-amber-950 underline cursor-pointer print:hidden"
                  >
                    {copiedRef ? 'Referência copiada!' : 'Copiar Referência'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div className="bg-white p-2 rounded-xl border border-amber-200">
                    <span className="text-[10px] text-amber-800 font-sans block">Entidade</span>
                    <span className="font-extrabold text-sm text-[#211a14]">
                      {invoice.paymentReference?.entity || SCHOOL_FISCAL_INFO.multicaixaEntity}
                    </span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-amber-200">
                    <span className="text-[10px] text-amber-800 font-sans block">Referência</span>
                    <span className="font-extrabold text-sm text-[#211a14]">
                      {invoice.paymentReference?.reference || '921 482 104'}
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-[#5c3f42] space-y-0.5 pt-1">
                  <p>
                    <span className="font-bold">IBAN BFA:</span> {SCHOOL_FISCAL_INFO.bankAccounts[0].iban}
                  </p>
                  <p>
                    <span className="font-bold">IBAN BAI:</span> {SCHOOL_FISCAL_INFO.bankAccounts[1].iban}
                  </p>
                </div>
              </div>
            </div>

            {/* Caixa de Totais Finais */}
            <div className="bg-[#fff8f5] p-5 rounded-2xl border border-[#eee0d6] flex flex-col justify-between space-y-3">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[#5c3f42]">
                  <span>Total Ilíquido (Subtotal):</span>
                  <span className="font-mono font-bold text-[#211a14]">
                    {formatKwanza(invoice.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[#5c3f42]">
                  <span>Descontos Comerciais:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    - {formatKwanza(invoice.totalDiscount)}
                  </span>
                </div>
                <div className="flex justify-between text-[#5c3f42]">
                  <span>Total de Imposto (IVA):</span>
                  <span className="font-mono font-bold text-[#211a14]">
                    {formatKwanza(invoice.taxTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[#5c3f42]">
                  <span>Retenção na Fonte (0%):</span>
                  <span className="font-mono font-bold text-[#211a14]">Kz 0,00</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#eee0d6]">
                <div className="flex items-baseline justify-between">
                  <span className="font-extrabold text-sm sm:text-base text-[#211a14] font-['Quicksand']">
                    Total Líquido a Liquidar:
                  </span>
                  <div className="text-right">
                    <span className="font-extrabold font-mono text-xl sm:text-2xl text-[#ed145b]">
                      {formatKwanza(invoice.totalAmount)}
                    </span>
                    <span className="text-[10px] text-[#8c6b6d] block font-sans">
                      Moeda Nacional: Kwanzas (Kz / AOA)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 6. RODAPÉ DE CERTIFICAÇÃO FISCAL, HASH & QR CODE DA AGT */}
          <div className="pt-4 border-t border-[#eee0d6] grid grid-cols-1 md:grid-cols-4 gap-4 items-center text-xs">
            {/* QR Code Simulado e Certificado */}
            <div className="flex items-center gap-3 md:col-span-1">
              <div className="w-20 h-20 bg-white p-1 rounded-xl border border-[#eee0d6] flex items-center justify-center shrink-0 shadow-2xs">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full text-[#211a14]"
                  fill="currentColor"
                  aria-label="QR Code Tributário AGT"
                >
                  {/* Padrão visual elegante simulador de QR Code tributário AGT */}
                  <rect x="5" y="5" width="25" height="25" fill="#211a14" />
                  <rect x="9" y="9" width="17" height="17" fill="white" />
                  <rect x="13" y="13" width="9" height="9" fill="#211a14" />

                  <rect x="70" y="5" width="25" height="25" fill="#211a14" />
                  <rect x="74" y="9" width="17" height="17" fill="white" />
                  <rect x="78" y="13" width="9" height="9" fill="#211a14" />

                  <rect x="5" y="70" width="25" height="25" fill="#211a14" />
                  <rect x="9" y="74" width="17" height="17" fill="white" />
                  <rect x="13" y="78" width="9" height="9" fill="#211a14" />

                  {/* Pixels de dados centrais */}
                  <rect x="35" y="10" width="6" height="6" />
                  <rect x="45" y="15" width="6" height="6" />
                  <rect x="55" y="10" width="6" height="6" />
                  <rect x="35" y="25" width="6" height="6" />
                  <rect x="45" y="30" width="12" height="6" />
                  <rect x="15" y="45" width="6" height="6" />
                  <rect x="25" y="45" width="6" height="6" />
                  <rect x="35" y="45" width="6" height="6" />
                  <rect x="45" y="45" width="6" height="6" />
                  <rect x="55" y="45" width="6" height="6" />
                  <rect x="70" y="45" width="6" height="6" />
                  <rect x="80" y="45" width="6" height="6" />
                  <rect x="35" y="60" width="6" height="6" />
                  <rect x="45" y="60" width="6" height="6" />
                  <rect x="55" y="60" width="6" height="6" />
                  <rect x="35" y="75" width="6" height="6" />
                  <rect x="45" y="75" width="12" height="6" />
                  <rect x="65" y="75" width="6" height="6" />
                  <rect x="75" y="75" width="6" height="6" />
                  <rect x="85" y="75" width="6" height="6" />
                  <rect x="65" y="60" width="6" height="6" />
                  <rect x="75" y="60" width="6" height="6" />
                  <rect x="85" y="60" width="6" height="6" />
                </svg>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-[#ed145b] uppercase block">
                  QR Code AGT
                </span>
                <p className="text-[9px] text-[#5c3f42] leading-tight">
                  Aponte a câmara para validar este documento no Portal do Contribuinte.
                </p>
              </div>
            </div>

            {/* Informações Obrigatórias do Regime Jurídico das Facturas */}
            <div className="md:col-span-3 text-[10px] text-[#5c3f42] space-y-1">
              <p className="font-mono font-bold text-[#211a14]">
                {invoice.agtHash}-Processado por programa certificado n.º{' '}
                {SCHOOL_FISCAL_INFO.agtCertificateNumber} • {SCHOOL_FISCAL_INFO.systemName}
              </p>
              <p>
                Os bens e serviços constantes desta factura foram colocados à disposição do adquirente
                na data de emissão. Documento emitido nos termos do Decreto Presidencial n.º 312/18 e
                Regulamento da Facturação Electrónica da República de Angola.
              </p>
              <div className="flex items-center gap-3 pt-1 text-[9px] text-[#8c6b6d] font-mono">
                <span>Série: {invoice.series}</span>
                <span>•</span>
                <span>Assinatura: RSA/SHA-256</span>
                <span>•</span>
                <span>CVA: {cvaCode}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RODAPÉ DO MODAL (AÇÕES INFERIORES)                                         */}
        {/* ========================================================================= */}
        <div className="bg-[#fff8f5] px-6 py-3.5 border-t border-[#eee0d6] flex items-center justify-between shrink-0 print:hidden">
          <div className="text-xs text-[#5c3f42] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Fatura em conformidade com o CIVA e AGT Angola</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-[#eee0d6] hover:bg-[#fff1e7] text-[#5c3f42] font-bold text-xs transition-colors cursor-pointer"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#211a14] hover:bg-[#382b22] text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Documento</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
