import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Building2,
  ShieldCheck,
  Send,
  Calendar,
  CreditCard,
  User,
  Users,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  Calculator
} from 'lucide-react';
import { Invoice, InvoiceItem, InvoiceType, Student } from '../types';
import {
  SCHOOL_FISCAL_INFO,
  INVOICE_ITEM_PRESETS,
  calculateInvoiceTotals,
  formatKwanza,
  generateInvoiceNumber,
  generateAgtHash,
  generateAgtCvaCode,
  generateMulticaixaReference
} from '../utils/invoiceUtils';
import { createFactPlusInvoice } from '../utils/factplusApi';

interface IssueInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveInvoice: (newInvoice: Invoice, openViewerImmediately: boolean) => void;
  studentsList: Student[];
  nextSequenceNumber: number;
}

export default function IssueInvoiceModal({
  isOpen,
  onClose,
  onSaveInvoice,
  studentsList,
  nextSequenceNumber
}: IssueInvoiceModalProps) {
  if (!isOpen) return null;

  // 1. Tipo de Documento
  const [docType, setDocType] = useState<InvoiceType>('FE');

  // 2. Aluno e Encarregado
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    studentsList[0]?.id || ''
  );

  const initialStudent = studentsList.find((s) => s.id === selectedStudentId) || studentsList[0];

  const [studentName, setStudentName] = useState(initialStudent?.name || '');
  const [classroom, setClassroom] = useState(initialStudent?.classroom || 'Maternal I');
  const [guardianName, setGuardianName] = useState(initialStudent?.responsibleName || 'Helena Mayelin');
  const [guardianNif, setGuardianNif] = useState('5418172901');
  const [guardianEmail, setGuardianEmail] = useState('encarregado@mayelinkids.com');
  const [guardianPhone, setGuardianPhone] = useState('+244 923 456 789');
  const [guardianAddress, setGuardianAddress] = useState('Centralidade do Kilamba, Luanda');

  // Atualizar dados ao selecionar outro educando
  const handleSelectStudent = (sId: string) => {
    setSelectedStudentId(sId);
    const stu = studentsList.find((s) => s.id === sId);
    if (stu) {
      setStudentName(stu.name);
      setClassroom(stu.classroom);
      setGuardianName(stu.responsibleName);
    }
  };

  // 3. Metadados e Datas
  const todayStr = new Date().toISOString().split('T')[0];
  const dueDefaultStr = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [series] = useState('MAY2025');
  const [issueDate, setIssueDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState(dueDefaultStr);
  const [paymentMethod, setPaymentMethod] = useState<
    'Multicaixa Express (MCX)' | 'Referência Multicaixa' | 'Transferência Bancária (AO06)' | 'TPA Presencial' | 'Numerário'
  >('Multicaixa Express (MCX)');
  const [isContingency, setIsContingency] = useState(false);
  const [notes, setNotes] = useState('Propina mensal com acompanhamento pedagógico integrado.');

  // 4. Linhas de Faturação
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: `it-${Date.now()}`,
      code: 'PROP-MAT-01',
      description: 'Propina Mensal - Maternal (Mês Corrente)',
      quantity: 1,
      unitPrice: 165000,
      discountPercent: 0,
      taxRate: 0,
      exemptionReasonCode: 'M02',
      totalItem: 165000
    }
  ]);

  // Totais calculados em tempo real
  const totals = calculateInvoiceTotals(items);

  // Adicionar item do catálogo pré-definido
  const handleAddPresetItem = (presetCode: string) => {
    const preset = INVOICE_ITEM_PRESETS.find((p) => p.code === presetCode);
    if (!preset) return;

    const newItem: InvoiceItem = {
      id: `it-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      code: preset.code,
      description: preset.description,
      quantity: 1,
      unitPrice: preset.unitPrice,
      discountPercent: 0,
      taxRate: preset.taxRate,
      exemptionReasonCode: preset.exemptionReasonCode,
      totalItem: preset.unitPrice
    };

    setItems((prev) => [...prev, newItem]);
  };

  // Adicionar linha personalizada
  const handleAddCustomLine = () => {
    const newItem: InvoiceItem = {
      id: `it-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      code: 'SERV-AVULSO',
      description: 'Serviço Pedagógico / Atividade',
      quantity: 1,
      unitPrice: 20000,
      discountPercent: 0,
      taxRate: 0,
      exemptionReasonCode: 'M02',
      totalItem: 20000
    };
    setItems((prev) => [...prev, newItem]);
  };

  // Atualizar campo de um item
  const handleUpdateItem = (
    id: string,
    field: keyof InvoiceItem,
    value: string | number | undefined
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };
        const gross = (updated.quantity || 1) * (updated.unitPrice || 0);
        const discount = updated.discountPercent ? (gross * updated.discountPercent) / 100 : 0;
        const net = gross - discount;
        const tax = updated.taxRate ? (net * updated.taxRate) / 100 : 0;
        updated.totalItem = Math.round(net + tax);
        return updated;
      })
    );
  };

  // Remover item
  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  // Submissão do Formulário
  const handleSubmit = async (openPreview: boolean) => {
    const generatedDocNumber = generateInvoiceNumber(docType, series, nextSequenceNumber);
    const invoiceId = `inv-${Date.now()}`;
    const mcxRef = generateMulticaixaReference(invoiceId, totals.totalAmount);

    const isLiquidada = docType === 'FRE';

    const newInvoice: Invoice = {
      id: invoiceId,
      documentType: docType,
      invoiceNumber: generatedDocNumber,
      series,
      sequenceNumber: nextSequenceNumber,
      issueDate,
      dueDate: isLiquidada ? issueDate : dueDate,
      studentId: selectedStudentId,
      studentName,
      classroom,
      guardianName,
      guardianNif: guardianNif.trim() || '999999999',
      guardianEmail,
      guardianPhone,
      guardianAddress,
      items,
      subtotal: totals.subtotal,
      totalDiscount: totals.totalDiscount,
      taxTotal: totals.taxTotal,
      totalAmount: totals.totalAmount,
      status: isLiquidada ? 'Liquidada' : 'Emitida',
      paymentMethod,
      paymentReference: mcxRef,
      paidAt: isLiquidada ? issueDate : undefined,
      electronic: {
        isElectronic: docType === 'FE' || docType === 'FRE' || docType === 'NCE',
        cvaCode: isContingency ? undefined : generateAgtCvaCode(new Date().getFullYear(), nextSequenceNumber),
        transmissionStatus: isContingency ? 'Contingencia' : 'Validada_AGT',
        transmissionTimestamp: new Date().toISOString(),
        isContingency
      },
      agtHash: generateAgtHash({
        invoiceNumber: generatedDocNumber,
        issueDate,
        totalAmount: totals.totalAmount
      }),
      agtCertificateNumber: SCHOOL_FISCAL_INFO.agtCertificateNumber,
      notes
    };

    // Integrar com FactPlus API se não for em contingência
    if (!isContingency && (docType === 'FE' || docType === 'FRE')) {
      try {
        const factPlusResult = await createFactPlusInvoice(newInvoice);
        if (factPlusResult.result === 'success') {
          console.log('Factura enviada com sucesso para FactPlus:', factPlusResult.data);
        } else {
          console.warn('Aviso FactPlus:', factPlusResult.message);
        }
      } catch (error) {
        console.error('Erro na integração FactPlus:', error);
      }
    }

    onSaveInvoice(newInvoice, openPreview);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="issue-invoice-modal-title"
      className="fixed inset-0 z-70 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl max-w-4xl w-full my-auto shadow-2xl border border-[#eee0d6] overflow-hidden flex flex-col max-h-[94vh]">
        {/* ========================================================================= */}
        {/* CABEÇALHO DO MODAL                                                        */}
        {/* ========================================================================= */}
        <div className="bg-[#211a14] text-white px-6 py-4 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ed145b] text-white flex items-center justify-center font-bold shadow-md">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 id="issue-invoice-modal-title" className="font-bold font-['Quicksand'] text-base text-white">
                Emitir Documento Fiscal / Factura Electrónica (AGT)
              </h2>
              <p className="text-xs text-pink-200/80">
                Software Certificado n.º {SCHOOL_FISCAL_INFO.agtCertificateNumber} • Luanda, Angola
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* CORPO DO FORMULÁRIO COM SELEÇÃO E GRELHA DE ITENS                         */}
        {/* ========================================================================= */}
        <div className="p-6 overflow-y-auto space-y-6 text-[#211a14] font-['Nunito_Sans']">
          {/* 1. SELEÇÃO DO TIPO DE DOCUMENTO FISCAL */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#5c3f42] block mb-2">
              Tipo de Documento Fiscal (República de Angola)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                {
                  type: 'FE' as InvoiceType,
                  title: 'Factura Electrónica (FE)',
                  desc: 'Cobrança a débito / liquidar até vencimento',
                  badge: 'AGT Obrigatório'
                },
                {
                  type: 'FRE' as InvoiceType,
                  title: 'Factura-Recibo (FRE)',
                  desc: 'Liquidação e quitação imediata no ato',
                  badge: 'Pago no Ato'
                },
                {
                  type: 'FP' as InvoiceType,
                  title: 'Factura Pró-forma (FP)',
                  desc: 'Cotação / Orçamento informativo sem valor fiscal',
                  badge: 'Informativo'
                },
                {
                  type: 'NCE' as InvoiceType,
                  title: 'Nota de Crédito (NCE)',
                  desc: 'Retificação ou estorno de fatura emitida',
                  badge: 'Estorno'
                }
              ].map((opt) => (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setDocType(opt.type)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    docType === opt.type
                      ? 'border-[#ed145b] bg-pink-50/70 ring-2 ring-[#ed145b]/20 shadow-xs'
                      : 'border-[#eee0d6] bg-white hover:bg-[#fff8f5]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold font-mono text-sm text-[#211a14]">{opt.type}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold bg-[#faebe1] text-[#ed145b]">
                      {opt.badge}
                    </span>
                  </div>
                  <p className="font-bold text-xs text-[#211a14] leading-tight">{opt.title}</p>
                  <p className="text-[10px] text-[#5c3f42] mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 2. DADOS DO EDUCANDO & ENCARREGADO */}
          <div className="bg-[#fff8f5] p-4 sm:p-5 rounded-2xl border border-[#eee0d6] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#ed145b] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Dados do Educando e Encarregado(a)
              </span>
              <span className="text-[11px] font-mono text-[#8c6b6d]">
                Previsão: {generateInvoiceNumber(docType, series, nextSequenceNumber)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Seleção do Aluno */}
              <div>
                <label className="font-bold text-[#211a14] block mb-1">Aluno Matriculado:</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => handleSelectStudent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#eee0d6] bg-white font-bold text-[#211a14] focus:outline-hidden focus:border-[#ed145b]"
                >
                  {studentsList.map((stu) => (
                    <option key={stu.id} value={stu.id}>
                      {stu.name} ({stu.classroom})
                    </option>
                  ))}
                </select>
              </div>

              {/* Turma */}
              <div>
                <label className="font-bold text-[#211a14] block mb-1">Turma / Ciclo Pedagógico:</label>
                <input
                  type="text"
                  value={classroom}
                  onChange={(e) => setClassroom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#eee0d6] bg-white font-semibold text-[#211a14] focus:outline-hidden focus:border-[#ed145b]"
                />
              </div>

              {/* Nome do Encarregado */}
              <div>
                <label className="font-bold text-[#211a14] block mb-1">Nome do Encarregado(a):</label>
                <input
                  type="text"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#eee0d6] bg-white font-semibold text-[#211a14] focus:outline-hidden focus:border-[#ed145b]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* NIF do Encarregado */}
              <div>
                <label className="font-bold text-[#211a14] block mb-1">
                  NIF do Encarregado (AGT):
                </label>
                <input
                  type="text"
                  value={guardianNif}
                  onChange={(e) => setGuardianNif(e.target.value)}
                  placeholder="Ex: 5418172901 ou 999999999"
                  className="w-full px-3 py-2 rounded-xl border border-[#eee0d6] bg-white font-mono font-bold text-[#211a14] focus:outline-hidden focus:border-[#ed145b]"
                />
              </div>

              {/* E-mail */}
              <div>
                <label className="font-bold text-[#211a14] block mb-1">E-mail para Envio da FE:</label>
                <input
                  type="email"
                  value={guardianEmail}
                  onChange={(e) => setGuardianEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#eee0d6] bg-white text-[#211a14] focus:outline-hidden focus:border-[#ed145b]"
                />
              </div>

              {/* Morada */}
              <div>
                <label className="font-bold text-[#211a14] block mb-1">Endereço Residencial:</label>
                <input
                  type="text"
                  value={guardianAddress}
                  onChange={(e) => setGuardianAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#eee0d6] bg-white text-[#211a14] focus:outline-hidden focus:border-[#ed145b]"
                />
              </div>
            </div>
          </div>

          {/* 3. DATAS & MÉTODO DE PAGAMENTO */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="font-bold text-[#211a14] block mb-1">Data de Emissão:</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#eee0d6] bg-white text-[#211a14] font-semibold focus:outline-hidden focus:border-[#ed145b]"
              />
            </div>

            <div>
              <label className="font-bold text-[#211a14] block mb-1">Data de Vencimento:</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={docType === 'FRE'}
                className="w-full px-3 py-2 rounded-xl border border-[#eee0d6] bg-white text-[#211a14] font-semibold focus:outline-hidden focus:border-[#ed145b] disabled:opacity-50"
              />
            </div>

            <div>
              <label className="font-bold text-[#211a14] block mb-1">Canal de Liquidação Previsto:</label>
              <select
                value={paymentMethod}
                onChange={(e: any) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#eee0d6] bg-white text-[#211a14] font-semibold focus:outline-hidden focus:border-[#ed145b]"
              >
                <option value="Multicaixa Express (MCX)">Multicaixa Express (MCX)</option>
                <option value="Referência Multicaixa">Referência Multicaixa</option>
                <option value="Transferência Bancária (AO06)">Transferência Bancária (AO06)</option>
                <option value="TPA Presencial">TPA Presencial</option>
                <option value="Numerário">Numerário / Caixa</option>
              </select>
            </div>
          </div>

          {/* 4. GRELHA DE LINHAS DE FATURAÇÃO */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#5c3f42] block">
                  Artigos e Serviços Pedagógicos a Faturar
                </span>
                <p className="text-[11px] text-[#8c6b6d]">
                  Isenção de IVA para serviços pedagógicos (Código M02 - Artigo 12.º do CIVA)
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Seletor rápido de catálogo */}
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddPresetItem(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                  className="px-3 py-1.5 rounded-xl border border-pink-200 bg-pink-50 text-[#ed145b] font-bold text-xs focus:outline-hidden cursor-pointer"
                >
                  <option value="" disabled>
                    + Adicionar do Catálogo Mayelin...
                  </option>
                  {INVOICE_ITEM_PRESETS.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.description} ({formatKwanza(p.unitPrice)})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleAddCustomLine}
                  className="px-3 py-1.5 rounded-xl bg-[#211a14] hover:bg-[#382b22] text-white font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Linha Livre</span>
                </button>
              </div>
            </div>

            {/* Tabela de Linhas */}
            <div className="border border-[#eee0d6] rounded-2xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#fff1e7] border-b border-[#eee0d6] text-[#5c3f42] font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-2.5">Código</th>
                      <th className="p-2.5">Descrição do Artigo</th>
                      <th className="p-2.5 text-center w-20">Qtd</th>
                      <th className="p-2.5 text-right w-28">Preço (Kz)</th>
                      <th className="p-2.5 text-center w-20">Desc (%)</th>
                      <th className="p-2.5 text-center w-24">Taxa IVA</th>
                      <th className="p-2.5 text-right w-28">Total (Kz)</th>
                      <th className="p-2.5 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eee0d6]">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-[#fffaf7]">
                        <td className="p-2 font-mono">
                          <input
                            type="text"
                            value={item.code}
                            onChange={(e) => handleUpdateItem(item.id, 'code', e.target.value)}
                            className="w-full px-2 py-1 rounded-lg border border-[#eee0d6] font-mono text-[11px] font-bold text-[#8c6b6d]"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) =>
                              handleUpdateItem(item.id, 'description', e.target.value)
                            }
                            className="w-full px-2 py-1 rounded-lg border border-[#eee0d6] font-bold text-[12px] text-[#211a14]"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 1)
                            }
                            className="w-16 px-2 py-1 rounded-lg border border-[#eee0d6] text-center font-bold text-[#211a14]"
                          />
                        </td>
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)
                            }
                            className="w-24 px-2 py-1 rounded-lg border border-[#eee0d6] text-right font-mono font-bold text-[#211a14]"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discountPercent || 0}
                            onChange={(e) =>
                              handleUpdateItem(
                                item.id,
                                'discountPercent',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-16 px-2 py-1 rounded-lg border border-[#eee0d6] text-center font-mono text-[#8c6b6d]"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <select
                            value={item.taxRate}
                            onChange={(e) => {
                              const rate = parseInt(e.target.value);
                              handleUpdateItem(item.id, 'taxRate', rate);
                              handleUpdateItem(
                                item.id,
                                'exemptionReasonCode',
                                rate === 0 ? 'M02' : undefined
                              );
                            }}
                            className="w-22 px-1.5 py-1 rounded-lg border border-[#eee0d6] text-[11px] font-bold"
                          >
                            <option value={0}>0% (M02)</option>
                            <option value={14}>14% (Geral)</option>
                          </select>
                        </td>
                        <td className="p-2 text-right font-mono font-extrabold text-[#211a14]">
                          {formatKwanza(item.totalItem)}
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={items.length <= 1}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 disabled:opacity-30 cursor-pointer"
                            title="Remover linha"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 5. RESUMO FISCAL E TRANSMISSÃO AGT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Opções de Comunicação AGT */}
            <div className="p-4 rounded-2xl bg-[#fff8f5] border border-[#eee0d6] text-xs space-y-3">
              <span className="font-bold uppercase tracking-wider text-[#ed145b] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Comunicação com a AGT (República de Angola)
              </span>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!isContingency}
                  onChange={(e) => setIsContingency(!e.target.checked)}
                  className="mt-0.5 rounded text-[#ed145b] focus:ring-[#ed145b]"
                />
                <div className="space-y-0.5">
                  <span className="font-bold text-[#211a14] block">
                    Transmissão Electrónica Instantânea (Webservice AGT)
                  </span>
                  <p className="text-[11px] text-[#5c3f42]">
                    Submete o XML assinado digitalmente à AGT e recebe o Código de Validação CVA oficial.
                  </p>
                </div>
              </label>

              {isContingency && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
                  <span>
                    Atenção: A fatura será emitida em modo de contingência local e aguardará envio
                    diferido.
                  </span>
                </div>
              )}

              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Notas / Observações Fiscais:</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#eee0d6] bg-white text-xs focus:outline-hidden focus:border-[#ed145b]"
                  placeholder="Observações que constarão no documento..."
                />
              </div>
            </div>

            {/* Totais do Documento */}
            <div className="bg-[#fff1e7]/80 p-5 rounded-2xl border border-pink-200 space-y-2 text-xs flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between text-[#5c3f42]">
                  <span>Total Ilíquido:</span>
                  <span className="font-mono font-bold text-[#211a14]">
                    {formatKwanza(totals.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[#5c3f42]">
                  <span>Total de Descontos:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    - {formatKwanza(totals.totalDiscount)}
                  </span>
                </div>
                <div className="flex justify-between text-[#5c3f42]">
                  <span>Total IVA (0% Pedagógico / 14% Acessório):</span>
                  <span className="font-mono font-bold text-[#211a14]">
                    {formatKwanza(totals.taxTotal)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-pink-200">
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-sm text-[#211a14] font-['Quicksand']">
                    Total a Liquidar:
                  </span>
                  <span className="font-extrabold font-mono text-2xl text-[#ed145b]">
                    {formatKwanza(totals.totalAmount)}
                  </span>
                </div>
                <p className="text-[10px] text-right text-[#8c6b6d] mt-0.5">
                  Valor em Kwanzas (Kz / AOA)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RODAPÉ DO MODAL (AÇÕES DE GRAVAÇÃO E EMISSÃO)                             */}
        {/* ========================================================================= */}
        <div className="bg-[#fff8f5] px-6 py-4 border-t border-[#eee0d6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#5c3f42]">
            <span>Geração de hash fiscal e referência Multicaixa automatizada.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white border border-[#eee0d6] hover:bg-[#fff1e7] text-[#5c3f42] font-bold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="px-4 py-2.5 rounded-xl bg-[#211a14] hover:bg-[#382b22] text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
            >
              Apenas Emitir
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="px-5 py-2.5 rounded-xl bg-[#ed145b] hover:bg-[#d0104f] text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Emitir e Ver Factura Oficial</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
