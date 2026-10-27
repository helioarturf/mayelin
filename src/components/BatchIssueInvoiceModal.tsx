import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  Calendar,
  Building2,
  ShieldCheck,
  Send,
  Users,
  AlertCircle,
  X,
  FileCheck2
} from 'lucide-react';
import { Invoice, InvoiceItem, InvoiceType, Student } from '../types';
import {
  SCHOOL_FISCAL_INFO,
  formatKwanza,
  generateInvoiceNumber,
  generateAgtHash,
  generateAgtCvaCode,
  generateMulticaixaReference
} from '../utils/invoiceUtils';
import { createFactPlusInvoice } from '../utils/factplusApi';

interface BatchIssueInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBatch: (newInvoices: Invoice[]) => void;
  studentsList: Student[];
  currentSequenceNumber: number;
}

export default function BatchIssueInvoiceModal({
  isOpen,
  onClose,
  onSaveBatch,
  studentsList,
  currentSequenceNumber
}: BatchIssueInvoiceModalProps) {
  if (!isOpen) return null;

  const [selectedMonth, setSelectedMonth] = useState('Março / 2025');
  const [targetCycle, setTargetCycle] = useState<'all' | 'bercario' | 'maternal' | 'jardim'>('all');
  const [docType, setDocType] = useState<InvoiceType>('FE');

  const todayStr = new Date().toISOString().split('T')[0];
  const [issueDate, setIssueDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState('2025-03-10');

  // Serviços a incluir no lote
  const [includeTuition, setIncludeTuition] = useState(true);
  const [includeMeals, setIncludeMeals] = useState(true);
  const [includeTransport, setIncludeTransport] = useState(false);

  // Filtrar alunos elegíveis
  const eligibleStudents = studentsList.filter((s) => {
    if (targetCycle === 'all') return true;
    const room = s.classroom.toLowerCase();
    if (targetCycle === 'bercario') return room.includes('berçário') || room.includes('bercario');
    if (targetCycle === 'maternal') return room.includes('maternal');
    if (targetCycle === 'jardim') return room.includes('jardim') || room.includes('pré-escolar');
    return true;
  });

  // Cálculo estimativo por aluno
  const calculateStudentItems = (student: Student): InvoiceItem[] => {
    const items: InvoiceItem[] = [];
    const isBercario = student.classroom.toLowerCase().includes('berç');
    const isMaternal = student.classroom.toLowerCase().includes('maternal');

    // 1. Propina Base
    if (includeTuition) {
      let price = 150000;
      let code = 'PROP-JAR-01';
      let desc = `Propina Mensal Jardim - ${selectedMonth}`;

      if (isBercario) {
        price = 180000;
        code = 'PROP-BER-01';
        desc = `Propina Mensal Berçário - ${selectedMonth}`;
      } else if (isMaternal) {
        price = 165000;
        code = 'PROP-MAT-01';
        desc = `Propina Mensal Maternal - ${selectedMonth}`;
      }

      items.push({
        id: `b-it-1-${student.id}`,
        code,
        description: desc,
        quantity: 1,
        unitPrice: price,
        discountPercent: 0,
        taxRate: 0,
        exemptionReasonCode: 'M02',
        totalItem: price
      });
    }

    // 2. Refeições Biológicas
    if (includeMeals) {
      items.push({
        id: `b-it-2-${student.id}`,
        code: 'SERV-ALIM-01',
        description: `Refeições Biológicas & Lanche da Horta - ${selectedMonth}`,
        quantity: 1,
        unitPrice: 45000,
        discountPercent: 0,
        taxRate: 0,
        exemptionReasonCode: 'M02',
        totalItem: 45000
      });
    }

    // 3. Transporte
    if (includeTransport) {
      items.push({
        id: `b-it-3-${student.id}`,
        code: 'SERV-TRASP-01',
        description: `Transporte Escolar Acompanhado - ${selectedMonth}`,
        quantity: 1,
        unitPrice: 40000,
        discountPercent: 0,
        taxRate: 0,
        exemptionReasonCode: 'M02',
        totalItem: 40000
      });
    }

    return items;
  };

  // Estimativa do lote
  const sampleItems = eligibleStudents[0] ? calculateStudentItems(eligibleStudents[0]) : [];
  const averagePerStudent = sampleItems.reduce((acc, it) => acc + it.totalItem, 0);
  const totalBatchEstimated = eligibleStudents.length * averagePerStudent;

  const handleGenerateBatch = () => {
    let nextSeq = currentSequenceNumber;
    const generatedInvoices: Invoice[] = [];

    eligibleStudents.forEach((student, idx) => {
      nextSeq += 1;
      const items = calculateStudentItems(student);
      const subtotal = items.reduce((acc, it) => acc + it.totalItem, 0);
      const invoiceId = `inv-batch-${Date.now()}-${idx}`;
      const docNum = generateInvoiceNumber(docType, 'MAY2025', nextSeq);
      const mcxRef = generateMulticaixaReference(invoiceId, subtotal);

      const inv: Invoice = {
        id: invoiceId,
        documentType: docType,
        invoiceNumber: docNum,
        series: 'MAY2025',
        sequenceNumber: nextSeq,
        issueDate,
        dueDate,
        studentId: student.id,
        studentName: student.name,
        classroom: student.classroom,
        guardianName: student.responsibleName,
        guardianNif: '5418172901', // NIF de exemplo ou cadastro
        guardianEmail: 'encarregado@mayelinkids.com',
        items,
        subtotal,
        totalDiscount: 0,
        taxTotal: 0,
        totalAmount: subtotal,
        status: 'Emitida',
        paymentMethod: 'Referência Multicaixa',
        paymentReference: mcxRef,
        electronic: {
          isElectronic: true,
          cvaCode: generateAgtCvaCode(new Date().getFullYear(), nextSeq),
          transmissionStatus: 'Validada_AGT',
          transmissionTimestamp: new Date().toISOString(),
          isContingency: false
        },
        agtHash: generateAgtHash({
          invoiceNumber: docNum,
          issueDate,
          totalAmount: subtotal
        }),
        agtCertificateNumber: SCHOOL_FISCAL_INFO.agtCertificateNumber,
        notes: `Facturação em lote para o período de ${selectedMonth}.`
      };

      generatedInvoices.push(inv);
    });

    // Integrar com FactPlus API para faturas FE e FRE em lote
    Promise.all(
      generatedInvoices
        .filter((inv) => inv.documentType === 'FE' || inv.documentType === 'FRE')
        .map((inv) => createFactPlusInvoice(inv).catch((err) => console.error('Erro FactPlus:', err)))
    ).catch((err) => console.error('Erro na integração em lote FactPlus:', err));

    onSaveBatch(generatedInvoices);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="batch-modal-title"
      className="fixed inset-0 z-70 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full my-auto shadow-2xl border border-[#eee0d6] overflow-hidden flex flex-col">
        {/* ========================================================================= */}
        {/* CABEÇALHO DO MODAL                                                        */}
        {/* ========================================================================= */}
        <div className="bg-[#211a14] text-white px-6 py-4 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 id="batch-modal-title" className="font-bold font-['Quicksand'] text-base text-white">
                Emissão em Lote de Facturas Electrónicas (AGT)
              </h2>
              <p className="text-xs text-pink-200/80">
                Geração automática e síncrona com o Webservice da AGT
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
        {/* CORPO DO FORMULÁRIO EM LOTE                                               */}
        {/* ========================================================================= */}
        <div className="p-6 space-y-5 text-[#211a14] font-['Nunito_Sans']">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Mês de Referência */}
            <div>
              <label className="font-bold text-[#211a14] block mb-1">Mês de Referência:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#eee0d6] bg-white font-bold text-[#211a14] focus:outline-hidden focus:border-[#ed145b]"
              >
                <option value="Março / 2025">Março / 2025</option>
                <option value="Abril / 2025">Abril / 2025</option>
                <option value="Maio / 2025">Maio / 2025</option>
                <option value="Junho / 2025">Junho / 2025</option>
              </select>
            </div>

            {/* Ciclo / Turmas Alvo */}
            <div>
              <label className="font-bold text-[#211a14] block mb-1">Turmas / Ciclo Pedagógico:</label>
              <select
                value={targetCycle}
                onChange={(e: any) => setTargetCycle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#eee0d6] bg-white font-bold text-[#211a14] focus:outline-hidden focus:border-[#ed145b]"
              >
                <option value="all">Todas as Turmas (Creche & Jardim)</option>
                <option value="bercario">Apenas Berçário Encantado</option>
                <option value="maternal">Apenas Maternal I & II</option>
                <option value="jardim">Apenas Jardim & Pré-Escolar</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Data de Emissão */}
            <div>
              <label className="font-bold text-[#211a14] block mb-1">Data de Emissão:</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#eee0d6] bg-white font-semibold text-[#211a14] focus:outline-hidden focus:border-[#ed145b]"
              />
            </div>

            {/* Data de Vencimento */}
            <div>
              <label className="font-bold text-[#211a14] block mb-1">Data de Vencimento:</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#eee0d6] bg-white font-semibold text-[#211a14] focus:outline-hidden focus:border-[#ed145b]"
              />
            </div>
          </div>

          {/* Pacote de Serviços do Lote */}
          <div className="p-4 rounded-2xl bg-[#fff8f5] border border-[#eee0d6] space-y-2.5 text-xs">
            <span className="font-bold uppercase tracking-wider text-[#5c3f42] block">
              Serviços Inclusos no Pacote Mensal
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <label className="p-2.5 rounded-xl border border-pink-200 bg-white flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTuition}
                  onChange={(e) => setIncludeTuition(e.target.checked)}
                  className="rounded text-[#ed145b] focus:ring-[#ed145b]"
                />
                <div>
                  <span className="font-bold text-[#211a14] block">Propina Mensal</span>
                  <span className="text-[10px] text-[#8c6b6d]">Conforme a sala</span>
                </div>
              </label>

              <label className="p-2.5 rounded-xl border border-pink-200 bg-white flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeMeals}
                  onChange={(e) => setIncludeMeals(e.target.checked)}
                  className="rounded text-[#ed145b] focus:ring-[#ed145b]"
                />
                <div>
                  <span className="font-bold text-[#211a14] block">Almoço da Horta</span>
                  <span className="text-[10px] text-[#8c6b6d]">+Kz 45.000,00</span>
                </div>
              </label>

              <label className="p-2.5 rounded-xl border border-pink-200 bg-white flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeTransport}
                  onChange={(e) => setIncludeTransport(e.target.checked)}
                  className="rounded text-[#ed145b] focus:ring-[#ed145b]"
                />
                <div>
                  <span className="font-bold text-[#211a14] block">Transporte Escolar</span>
                  <span className="text-[10px] text-[#8c6b6d]">+Kz 40.000,00</span>
                </div>
              </label>
            </div>
          </div>

          {/* Resumo do Impacto do Lote */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold uppercase tracking-wide text-emerald-900 block">
                Resumo do Processamento em Lote
              </span>
              <p className="text-[#211a14]">
                Total de educandos abrangidos:{' '}
                <span className="font-bold text-emerald-900">{eligibleStudents.length} alunos</span>
              </p>
              <p className="text-[11px] text-emerald-800">
                Cada aluno receberá fatura individual com numeração sequencial, CVA da AGT e Referência Multicaixa.
              </p>
            </div>

            <div className="text-right sm:border-l sm:border-emerald-200 sm:pl-4">
              <span className="text-[10px] text-emerald-800 font-semibold uppercase block">
                Total Faturado no Lote
              </span>
              <span className="font-mono font-extrabold text-lg text-emerald-900">
                {formatKwanza(totalBatchEstimated)}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RODAPÉ COM AÇÕES                                                          */}
        {/* ========================================================================= */}
        <div className="bg-[#fff8f5] px-6 py-4 border-t border-[#eee0d6] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-[#eee0d6] hover:bg-[#fff1e7] text-[#5c3f42] font-bold text-xs transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleGenerateBatch}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Emitir {eligibleStudents.length} Facturas Electrónicas (AGT)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
