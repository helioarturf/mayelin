import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Users,
  CheckCircle2,
  Clock,
  CreditCard,
  Send,
  FileText,
  ShieldCheck,
  Smartphone,
  Printer,
  Heart,
  Smile,
  X,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  Lock,
  RefreshCw,
  DollarSign,
  Plus,
  Megaphone,
  UserCheck,
  Loader2,
  AlertCircle
} from 'lucide-react';
import {
  portalApi,
  type AuthUser,
  type DbAnnouncement,
  type DbChildObservation,
  type DbDigitalConsent,
  type DbFinancialRecord,
  type DbPickupAuthorization,
  type DbPortalMessage,
  type DbRoutineLog,
  type DbStudent,
  type ObservationCategory
} from '../lib/api';
import { formatEducatorName } from '../utils/formatters';

interface GuardianSchoolDashboardProps {
  authToken: string;
  currentUser: AuthUser;
  onClose?: () => void;
  headerPortalTarget?: HTMLElement | null;
}

type GuardianSection = 'overview' | 'routine' | 'finance' | 'comms' | 'authorizations';

function getObservationIcon(category: ObservationCategory | string): string {
  switch (category) {
    case 'Alimentação & Apetite':
      return '🍎';
    case 'Soninho & Repouso':
      return '😴';
    case 'Desenvolvimento Motor':
      return '🏃';
    case 'Linguagem & Interação':
      return '💬';
    case 'Saúde & Cuidados':
      return '🩺';
    case 'Adaptação & Emoções':
    default:
      return '❤️';
  }
}

function formatDatePt(value?: string | null): string {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatCurrencyKz(amount: number): string {
  return `Kz ${Number(amount || 0).toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

export default function GuardianSchoolDashboard({
  authToken,
  currentUser,
  onClose,
  headerPortalTarget
}: GuardianSchoolDashboardProps) {
  const [activeSection, setActiveSection] = useState<GuardianSection>('overview');

  // Data from Supabase
  const [children, setChildren] = useState<DbStudent[]>([]);
  const [routineLogs, setRoutineLogs] = useState<DbRoutineLog[]>([]);
  const [observations, setObservations] = useState<DbChildObservation[]>([]);
  const [financialRecords, setFinancialRecords] = useState<DbFinancialRecord[]>([]);
  const [messages, setMessages] = useState<DbPortalMessage[]>([]);
  const [consents, setConsents] = useState<DbDigitalConsent[]>([]);
  const [pickupAuthorizations, setPickupAuthorizations] = useState<DbPickupAuthorization[]>([]);
  const [announcements, setAnnouncements] = useState<DbAnnouncement[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [activeChildId, setActiveChildId] = useState<string>('');
  const [obsCategoryFilter, setObsCategoryFilter] = useState<string>('todas');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  // Modals
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [receiptPreviewRecord, setReceiptPreviewRecord] = useState<DbFinancialRecord | null>(null);
  const [payModalRecord, setPayModalRecord] = useState<DbFinancialRecord | null>(null);
  const [selectedPayMethod, setSelectedPayMethod] = useState('Multicaixa Express (MCX)');

  const [consentToSign, setConsentToSign] = useState<DbDigitalConsent | null>(null);
  const [pinInput, setPinInput] = useState('');

  const [newMessageModal, setNewMessageModal] = useState(false);
  const [msgRecipient, setMsgRecipient] = useState('');
  const [msgSubject, setMsgSubject] = useState('');
  const [msgBody, setMsgBody] = useState('');

  const [pickupModalOpen, setPickupModalOpen] = useState(false);
  const [pickupPersonName, setPickupPersonName] = useState('');
  const [pickupRelationship, setPickupRelationship] = useState('Avó / Avô');
  const [pickupDocumentId, setPickupDocumentId] = useState('');
  const [pickupPhone, setPickupPhone] = useState('');
  const [pickupDate, setPickupDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [pickupTimeLimit, setPickupTimeLimit] = useState('18:30');

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await portalApi.getGuardianWorkspace(authToken);
      setChildren(data.children);
      setRoutineLogs(data.routineLogs);
      setObservations(data.observations);
      setFinancialRecords(data.financialRecords);
      setMessages(data.messages);
      setConsents(data.consents);
      setPickupAuthorizations(data.pickupAuthorizations);
      setAnnouncements(data.announcements);

      setActiveChildId((prev) => {
        if (prev && data.children.some((c) => c.id === prev)) return prev;
        return data.children[0]?.id || '';
      });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Erro ao carregar dados do encarregado.');
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const activeChild = useMemo(
    () => children.find((c) => c.id === activeChildId) || children[0] || null,
    [children, activeChildId]
  );

  // Scoped records for active child (or all if no child linked yet)
  const childObservations = useMemo(() => {
    if (!activeChild) return observations;
    return observations.filter((o) => o.student_id === activeChild.id || o.student_name === activeChild.name);
  }, [observations, activeChild]);

  const filteredObservations = useMemo(() => {
    if (obsCategoryFilter === 'todas') return childObservations;
    return childObservations.filter((o) => o.category === obsCategoryFilter);
  }, [childObservations, obsCategoryFilter]);

  const childRoutineLogs = useMemo(() => {
    if (!activeChild) return routineLogs;
    return routineLogs.filter((r) => r.student_id === activeChild.id);
  }, [routineLogs, activeChild]);

  const pendingFinancial = useMemo(
    () => financialRecords.filter((f) => f.status !== 'Liquidado'),
    [financialRecords]
  );

  const pendingConsents = useMemo(
    () => consents.filter((c) => !c.signed),
    [consents]
  );

  const signedConsents = useMemo(
    () => consents.filter((c) => c.signed),
    [consents]
  );

  const recipientOptions = useMemo(() => {
    const list: string[] = [];
    if (activeChild?.teacher_name) {
      list.push(`${formatEducatorName(activeChild.teacher_name)} (Educadora Titular - ${activeChild.classroom_name})`);
    }
    list.push('Coordenação Pedagógica');
    list.push('Secretaria Geral & Financeiro');
    return list;
  }, [activeChild]);

  useEffect(() => {
    if (!msgRecipient && recipientOptions.length > 0) {
      setMsgRecipient(recipientOptions[0]);
    }
  }, [msgRecipient, recipientOptions]);

  const handleOpenMessageModal = (preselectedRecipient?: string, preselectedSubject?: string) => {
    setMsgRecipient(preselectedRecipient || recipientOptions[0] || 'Secretaria Geral');
    setMsgSubject(preselectedSubject || '');
    setMsgBody('');
    setNewMessageModal(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgRecipient.trim() || !msgSubject.trim() || !msgBody.trim()) return;
    setSubmitting(true);
    try {
      const { message } = await portalApi.sendGuardianMessage(authToken, {
        studentId: activeChild?.id,
        recipientName: msgRecipient,
        subject: msgSubject,
        message: msgBody
      });
      setMessages((prev) => [message, ...prev]);
      setNewMessageModal(false);
      setMsgSubject('');
      setMsgBody('');
      showToast('Mensagem enviada e guardada na base de dados da escola.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao enviar mensagem.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreatePickupAuthorization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupPersonName.trim() || !pickupDocumentId.trim()) return;
    setSubmitting(true);
    try {
      const { authorization } = await portalApi.createPickupAuthorization(authToken, {
        studentId: activeChild?.id,
        personName: pickupPersonName,
        relationship: pickupRelationship,
        documentId: pickupDocumentId,
        phone: pickupPhone,
        authDate: pickupDate,
        timeLimit: pickupTimeLimit
      });
      setPickupAuthorizations((prev) => [authorization, ...prev]);
      setPickupModalOpen(false);
      setPickupPersonName('');
      setPickupDocumentId('');
      setPickupPhone('');
      showToast('Autorização de retirada submetida. A Direção/Portaria já pode validá-la.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao registar autorização.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentToSign || pinInput.trim().length < 4) {
      showToast('Insira um código PIN válido com pelo menos 4 dígitos.');
      return;
    }
    setSubmitting(true);
    try {
      const { consent } = await portalApi.signConsent(authToken, consentToSign.id, pinInput.trim());
      setConsents((prev) => prev.map((c) => (c.id === consent.id ? consent : c)));
      setConsentToSign(null);
      setPinInput('');
      showToast('Consentimento assinado digitalmente com sucesso.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao assinar documento.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!payModalRecord) return;
    setSubmitting(true);
    try {
      const { record } = await portalApi.payInvoice(authToken, payModalRecord.id, selectedPayMethod);
      setFinancialRecords((prev) => prev.map((r) => (r.id === record.id ? record : r)));
      setPayModalRecord(null);
      showToast(`Liquidação da fatura ${record.invoice_number} registada com sucesso.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao registar pagamento.');
    } finally {
      setSubmitting(false);
    }
  };

  const firstPendingConsent = pendingConsents[0] || null;
  const nextInvoice = pendingFinancial[0] || financialRecords[0] || null;

  const guardianSectionLabels: Record<GuardianSection, string> = {
    overview: 'Visão Integrada',
    routine: 'Rotina & Observações',
    finance: 'Propinas & Faturação',
    comms: 'Mensagens & Circulares',
    authorizations: 'Autorizações & Portaria'
  };

  const guardianToolbarControls = (
    <>
      <div className="flex items-center gap-3 flex-wrap min-w-0">
        <div className="flex items-center gap-2 text-xs min-w-0">
          <span className="font-bold text-[#8c4f00] whitespace-nowrap truncate max-w-[180px]">
            {currentUser.name}
          </span>
          <span className="text-[#c9b4a8]" aria-hidden="true">/</span>
          <span className="font-extrabold text-[#211a14] whitespace-nowrap truncate">
            {guardianSectionLabels[activeSection]}
          </span>
        </div>

        {children.length > 1 && (
          <div className="flex items-center gap-1 bg-[#faebe1] rounded-lg p-0.5 border border-[#eee0d6] overflow-x-auto max-w-full">
            {children.map((ch) => (
              <button
                key={ch.id}
                type="button"
                onClick={() => {
                  setActiveChildId(ch.id);
                  showToast(`Contexto alterado para ${ch.name} (${ch.classroom_name}).`);
                }}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  activeChild?.id === ch.id
                    ? 'bg-white text-[#fd9924]'
                    : 'text-[#5c3f42] hover:text-[#211a14]'
                }`}
              >
                {ch.name.split(' ')[0]}
              </button>
            ))}
          </div>
        )}

        {activeChild && children.length <= 1 && (
          <span className="text-[11px] text-[#5c3f42] hidden lg:inline whitespace-nowrap truncate">
            {activeChild.name} · {activeChild.classroom_name}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 flex-wrap">
        <button
          type="button"
          onClick={loadWorkspace}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg bg-[#faebe1] hover:bg-[#eee0d6] text-[#5c3f42] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap"
          title="Atualizar dados"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Atualizar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('finance')}
          className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
            pendingFinancial.length > 0
              ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
          }`}
        >
          <CheckCircle2
            className={`w-3.5 h-3.5 ${pendingFinancial.length > 0 ? 'text-amber-600' : 'text-emerald-600'}`}
          />
          <span>
            {pendingFinancial.length > 0
              ? `${pendingFinancial.length} Propina(s) Pendente(s)`
              : 'Propinas em Dia'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('comms')}
          className="relative p-2 rounded-lg text-[#5c3f42] hover:bg-[#faebe1] transition-colors cursor-pointer"
          aria-label="Mensagens e Circulares"
        >
          <Send className="w-4 h-4 text-[#5c3f42]" />
          {messages.some((m) => m.unread) && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ed145b] rounded-full" />
          )}
        </button>
      </div>
    </>
  );

  return (
    <div
      role="region"
      aria-label="Painel do Responsável - Portal dos Encarregados de Educação"
      className="bg-[#fff8f5] text-[#211a14] w-full flex-1 flex flex-col overflow-hidden font-['Nunito_Sans'] antialiased min-h-0"
    >
      {headerPortalTarget && createPortal(guardianToolbarControls, headerPortalTarget)}

      {headerPortalTarget === undefined && (
        <header
          className="bg-white border-b border-[#eee0d6] px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 z-20"
          role="banner"
        >
          {guardianToolbarControls}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-[#5c3f42] hover:text-[#211a14] hover:bg-[#faebe1] transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              aria-label="Voltar ao Website"
            >
              <ArrowLeft className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Voltar ao Website</span>
            </button>
          )}
        </header>
      )}

      {/* ========================================================================= */}
      {/* BODY LAYOUT: SIDENAVBAR + PAINEL PRINCIPAL                                */}
      {/* ========================================================================= */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
        <nav
          className="w-full md:w-64 lg:w-[260px] bg-white text-[#5c3f42] p-3 sm:p-4 flex md:flex-col justify-between shrink-0 overflow-x-auto md:overflow-y-auto border-b md:border-b-0 md:border-r border-[#eee0d6]"
          aria-label="Módulos do encarregado de educação"
        >
          <div className="flex md:flex-col gap-1 w-full">
            <span className="text-[11px] font-bold text-[#8c6b6d] px-3 py-1.5 hidden md:block">
              Área da Família
            </span>

            {(
              [
                { id: 'overview', label: 'Visão Integrada', icon: Smile, count: null },
                { id: 'routine', label: 'Rotina & Observações', icon: Heart, count: childObservations.length },
                { id: 'finance', label: 'Propinas & Faturação', icon: DollarSign, count: pendingFinancial.length > 0 ? pendingFinancial.length : null },
                { id: 'comms', label: 'Mensagens & Circulares', icon: Send, count: announcements.length + messages.length },
                { id: 'authorizations', label: 'Autorizações & Portaria', icon: ShieldCheck, count: pendingConsents.length > 0 ? pendingConsents.length : null }
              ] as const
            ).map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={`min-h-[40px] md:w-full px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between gap-2.5 transition-colors text-left whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#fd9924] text-white'
                      : 'text-[#5c3f42] hover:bg-[#fff1e7] hover:text-[#211a14]'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.count !== null && (
                    <span
                      className={`text-[11px] font-bold tabular-nums shrink-0 ${
                        isActive ? 'text-white/90' : 'text-[#8c6b6d]'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-4 mt-4 border-t border-[#eee0d6] hidden md:block space-y-2 px-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8c6b6d]">Observações</span>
              <span className="font-bold tabular-nums text-[#ed145b]">{childObservations.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8c6b6d]">Propinas em aberto</span>
              <span className="font-bold tabular-nums text-[#211a14]">{pendingFinancial.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8c6b6d]">Consentimentos</span>
              <span className="font-bold tabular-nums text-amber-700">{pendingConsents.length} pendente(s)</span>
            </div>
          </div>
        </nav>

        <main
          className="flex-1 min-h-0 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-[#fff8f5] focus:outline-none"
          tabIndex={-1}
        >
          <div className="max-w-7xl mx-auto w-full space-y-6">
          {toastMessage && (
            <div
              role="status"
              aria-live="polite"
              className="p-3.5 bg-[#211a14] text-white text-xs font-bold rounded-xl flex items-center gap-2 border border-[#5c3f42]"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {loadError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{loadError}</span>
              </div>
              <button
                type="button"
                onClick={loadWorkspace}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 cursor-pointer self-start sm:self-auto"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-[#5c3f42]">
              <Loader2 className="w-7 h-7 animate-spin text-[#fd9924]" />
              <p className="text-xs font-bold">A sincronizar os dados do seu educando...</p>
            </div>
          ) : (
            <>
              {/* ========================================================================= */}
              {/* SECÇÃO 1: VISÃO INTEGRADA                                                 */}
              {/* ========================================================================= */}
              {activeSection === 'overview' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Cabeçalho do Educando & Indicadores */}
                  {activeChild ? (
                    <section
                      aria-label="Perfil do educando ativo"
                      className="bg-white rounded-xl border border-[#eee0d6] overflow-hidden"
                    >
                      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#eee0d6]">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-[#fd9924] text-white flex items-center justify-center font-extrabold text-lg shrink-0">
                            {activeChild.avatar_letter}
                          </div>
                          <div className="min-w-0">
                            <h1 className="text-lg sm:text-xl font-extrabold font-['Quicksand'] text-[#211a14] leading-tight truncate">
                              {activeChild.name}
                            </h1>
                            <p className="text-xs text-[#5c3f42] mt-0.5 truncate">
                              {activeChild.classroom_name} · {activeChild.cycle} · Educadora{' '}
                              <strong className="text-[#00a6c0]">{formatEducatorName(activeChild.teacher_name)}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleOpenMessageModal()}
                            className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-[#faebe1] hover:bg-[#f4e6db] text-[#211a14] font-bold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5 text-[#ed145b]" />
                            <span>Enviar Mensagem</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setReportModalOpen(true)}
                            className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-[#fd9924] hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Relatório Qualitativo</span>
                          </button>
                        </div>
                      </div>

                      {/* 4 Células de Métricas com Divisores Finos (Sem Cartões Aninhados) */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#eee0d6]">
                        <div className="p-4">
                          <span className="text-[11px] text-[#8c6b6d] font-bold block">Assiduidade</span>
                          <p className="text-xl font-extrabold font-['Quicksand'] tabular-nums text-emerald-700 mt-1">
                            {activeChild.presence_rate}%
                          </p>
                          <span className="text-[11px] text-[#5c3f42]">Estado atual: {activeChild.status}</span>
                        </div>

                        <div className="p-4">
                          <span className="text-[11px] text-[#8c6b6d] font-bold block">Desenvolvimento</span>
                          <p className="text-sm font-extrabold font-['Quicksand'] text-[#00a6c0] mt-1.5 truncate">
                            {activeChild.development_status}
                          </p>
                          <span className="text-[11px] text-[#5c3f42]">Acompanhado pelas Tias</span>
                        </div>

                        <div className="p-4">
                          <span className="text-[11px] text-[#8c6b6d] font-bold block">Propinas (Kz)</span>
                          <p
                            className={`text-xl font-extrabold font-['Quicksand'] tabular-nums mt-1 ${
                              pendingFinancial.length > 0 ? 'text-amber-600' : 'text-emerald-700'
                            }`}
                          >
                            {pendingFinancial.length > 0 ? `${pendingFinancial.length} Pendente(s)` : 'Em dia'}
                          </p>
                          <span className="text-[11px] text-[#5c3f42]">Faturação em Kwanza</span>
                        </div>

                        <div className="p-4">
                          <span className="text-[11px] text-[#8c6b6d] font-bold block">Observações da Tia</span>
                          <p className="text-xl font-extrabold font-['Quicksand'] tabular-nums text-[#ed145b] mt-1">
                            {childObservations.length}
                          </p>
                          <span className="text-[11px] text-[#5c3f42]">Registos qualitativos</span>
                        </div>
                      </div>
                    </section>
                  ) : (
                    <section
                      aria-label="Sem educando vinculado"
                      className="bg-white rounded-xl border border-[#eee0d6] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[#fd9924] text-white flex items-center justify-center font-extrabold text-base shrink-0">
                          {currentUser.avatarLetter || 'E'}
                        </div>
                        <div>
                          <h1 className="text-base font-extrabold font-['Quicksand'] text-[#211a14]">
                            Nenhuma criança vinculada a esta conta ainda
                          </h1>
                          <p className="text-xs text-[#5c3f42] mt-0.5">
                            Solicite à Secretaria que associe a matrícula do seu educando ao seu e-mail.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenMessageModal(
                            'Secretaria Geral & Financeiro',
                            'Solicitação de vinculação de matrícula'
                          )
                        }
                        className="px-4 py-2 rounded-lg bg-[#ed145b] text-white text-xs font-bold hover:bg-pink-600 transition-colors shrink-0 cursor-pointer"
                      >
                        Contactar Secretaria
                      </button>
                    </section>
                  )}

                  {firstPendingConsent && (
                    <div className="bg-[#ed145b] text-white p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-pink-100 block">
                          Consentimento Digital Pendente · {firstPendingConsent.event_date}
                        </span>
                        <h2 className="font-['Quicksand'] font-bold text-base sm:text-lg">
                          {firstPendingConsent.title}
                        </h2>
                        <p className="text-xs text-pink-100">
                          Requer validação rápida com o código PIN do encarregado.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setConsentToSign(firstPendingConsent)}
                        className="min-h-[40px] px-4 py-2 rounded-lg bg-white text-[#ed145b] font-bold text-xs hover:bg-pink-50 transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Assinar Digitalmente</span>
                      </button>
                    </div>
                  )}

                  {/* Grelha Principal Assimétrica (7 + 5 Colunas) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Coluna Esquerda: Observações & Comunicados */}
                    <div className="lg:col-span-7 space-y-6">
                      <section className="bg-white rounded-xl border border-[#eee0d6] overflow-hidden">
                        <div className="px-5 py-4 border-b border-[#eee0d6] flex items-center justify-between gap-3">
                          <h2 className="font-['Quicksand'] font-bold text-sm text-[#211a14] flex items-center gap-2">
                            <Heart className="w-4 h-4 text-[#ed145b]" />
                            <span>Acompanhamento & Observações da Tia</span>
                          </h2>
                          <button
                            type="button"
                            onClick={() => setActiveSection('routine')}
                            className="text-xs font-bold text-[#fd9924] hover:underline flex items-center gap-1 whitespace-nowrap cursor-pointer"
                          >
                            <span>Ver Diário Completo</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {childObservations.length === 0 && childRoutineLogs.length === 0 ? (
                          <div className="p-6 text-xs text-[#5c3f42]">
                            Ainda não existem registos de rotina ou observações publicadas pela Educadora.
                          </div>
                        ) : (
                          <div className="divide-y divide-[#eee0d6]">
                            {childRoutineLogs.slice(0, 1).map((log) => (
                              <div key={log.id} className="px-5 py-4 space-y-1 text-xs bg-[#fffcf9]">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-[#211a14]">{log.day_label}</span>
                                  <span className="text-[11px] font-semibold text-emerald-700">Rotina do Dia</span>
                                </div>
                                <p className="text-[#5c3f42]">
                                  Entrada: {log.entry_info} · Alimentação: {log.meal_info}
                                </p>
                                <p className="text-[#00a6c0] font-semibold">{log.activity_info}</p>
                              </div>
                            ))}
                            {childObservations.slice(0, 3).map((obs) => (
                              <div key={obs.id} className="px-5 py-4 space-y-1.5 text-xs">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-[#ed145b]">
                                    {getObservationIcon(obs.category)} {obs.category}
                                  </span>
                                  <span className="text-[11px] text-[#8c6b6d] tabular-nums">
                                    {formatDatePt(obs.created_at)}
                                  </span>
                                </div>
                                <p className="font-bold text-[#211a14]">{obs.title}</p>
                                <p className="text-[#5c3f42] leading-relaxed">"{obs.text}"</p>
                                <p className="text-[11px] text-[#8c6b6d]">
                                  Por {formatEducatorName(obs.recorded_by)}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </section>

                      <section className="bg-white rounded-xl border border-[#eee0d6] overflow-hidden">
                        <div className="px-5 py-4 border-b border-[#eee0d6] flex items-center justify-between gap-3">
                          <h2 className="font-['Quicksand'] font-bold text-sm text-[#211a14] flex items-center gap-2">
                            <Megaphone className="w-4 h-4 text-[#ed145b]" />
                            <span>Comunicados Recentes da Escola</span>
                          </h2>
                          <button
                            type="button"
                            onClick={() => setActiveSection('comms')}
                            className="text-xs font-bold text-[#ed145b] hover:underline whitespace-nowrap cursor-pointer"
                          >
                            Ver Todos ({announcements.length})
                          </button>
                        </div>

                        {announcements.length > 0 ? (
                          <div className="divide-y divide-[#eee0d6]">
                            {announcements.slice(0, 3).map((ann) => (
                              <div key={ann.id} className="px-5 py-3.5 text-xs space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-[#211a14]">{ann.title}</span>
                                  <span className="text-[11px] text-[#8c6b6d] tabular-nums shrink-0">
                                    {ann.priority} · {formatDatePt(ann.created_at)}
                                  </span>
                                </div>
                                <p className="text-[#5c3f42] line-clamp-2">{ann.content}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="p-6 text-xs text-[#5c3f42]">
                            Sem comunicados publicados até ao momento.
                          </p>
                        )}
                      </section>
                    </div>

                    {/* Coluna Direita: Faturação & Ações Rápidas */}
                    <div className="lg:col-span-5 space-y-6">
                      <section className="bg-white p-5 rounded-xl border border-[#eee0d6] space-y-4">
                        <div className="flex items-center justify-between">
                          <h2 className="font-['Quicksand'] font-bold text-sm text-[#211a14] flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-[#00a6c0]" />
                            <span>Resumo de Faturação (Kz)</span>
                          </h2>
                          <button
                            type="button"
                            onClick={() => setActiveSection('finance')}
                            className="text-xs font-bold text-[#00a6c0] hover:underline cursor-pointer"
                          >
                            Ver Todas
                          </button>
                        </div>

                        {nextInvoice ? (
                          <div className="space-y-3 text-xs pt-1 border-t border-[#eee0d6]">
                            <div className="flex justify-between items-baseline gap-2 pt-2">
                              <span className="font-bold text-[#211a14]">{nextInvoice.description}</span>
                              <span className="text-base font-extrabold tabular-nums text-[#211a14] shrink-0">
                                {formatCurrencyKz(nextInvoice.amount)}
                              </span>
                            </div>
                            <p className="text-[#5c3f42] tabular-nums">
                              Fatura {nextInvoice.invoice_number} · Vencimento: {nextInvoice.due_date}
                            </p>
                            <div className="flex items-center justify-between pt-2">
                              <span
                                className={`text-xs font-bold ${
                                  nextInvoice.status === 'Liquidado' ? 'text-emerald-700' : 'text-amber-700'
                                }`}
                              >
                                Estado: {nextInvoice.status}
                              </span>
                              {nextInvoice.status !== 'Liquidado' && (
                                <button
                                  type="button"
                                  onClick={() => setPayModalRecord(nextInvoice)}
                                  className="px-3.5 py-1.5 bg-[#fd9924] hover:bg-amber-600 text-white rounded-lg font-bold text-xs cursor-pointer"
                                >
                                  Pagar Agora
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-[#5c3f42]">
                            Nenhuma fatura ou propina emitida para esta conta até ao momento.
                          </p>
                        )}
                      </section>

                      <section className="bg-white rounded-xl border border-[#eee0d6] overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-[#eee0d6]">
                          <h2 className="font-['Quicksand'] font-bold text-sm text-[#211a14]">
                            Serviços & Portaria
                          </h2>
                        </div>
                        <div className="divide-y divide-[#eee0d6]">
                          <button
                            type="button"
                            onClick={() => setPickupModalOpen(true)}
                            className="w-full px-5 py-3 text-left text-xs font-bold text-[#211a14] hover:bg-[#fff8f5] flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-2.5">
                              <UserCheck className="w-4 h-4 text-[#ed145b]" />
                              <span>Autorizar Retirada na Portaria</span>
                            </span>
                            <Plus className="w-3.5 h-3.5 text-[#8c6b6d]" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenMessageModal()}
                            className="w-full px-5 py-3 text-left text-xs font-bold text-[#211a14] hover:bg-[#fff8f5] flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-2.5">
                              <Send className="w-4 h-4 text-[#00a6c0]" />
                              <span>Contactar Educadora ou Secretaria</span>
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#8c6b6d]" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveSection('authorizations')}
                            className="w-full px-5 py-3 text-left text-xs font-bold text-[#211a14] hover:bg-[#fff8f5] flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-2.5">
                              <ShieldCheck className="w-4 h-4 text-emerald-700" />
                              <span>Gerir Consentimentos & Saídas ({pendingConsents.length})</span>
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#8c6b6d]" />
                          </button>
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* PILAR 1: ACOMPANHAMENTO DE ROTINA & OBSERVAÇÕES DA TIA                    */}
              {/* ========================================================================= */}
              {activeSection === 'routine' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold font-['Quicksand'] text-[#211a14]">
                        Rotina & Observações da Tia
                        {activeChild ? ` • ${activeChild.name}` : ''}
                      </h3>
                      <p className="text-xs text-[#5c3f42]">
                        Acompanhamento diário e pareceres qualitativos escritos pelas Educadoras (Tias)
                      </p>
                    </div>

                    {activeChild && (
                      <button
                        type="button"
                        onClick={() => setReportModalOpen(true)}
                        className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#fd9924] text-white hover:bg-amber-600 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer shrink-0"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Relatório Qualitativo (Imprimir / PDF)</span>
                      </button>
                    )}
                  </div>

                  {/* Registo Diário Cronológico */}
                  <div className="bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs space-y-3">
                    <h4 className="font-bold text-sm text-[#211a14] flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>Registo Diário Cronológico</span>
                    </h4>

                    {childRoutineLogs.length > 0 ? (
                      <div className="divide-y divide-[#eee0d6] text-xs">
                        {childRoutineLogs.map((item) => (
                          <div
                            key={item.id}
                            className="py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2"
                          >
                            <span className="font-bold text-[#211a14] md:w-44">{item.day_label}</span>
                            <span className="text-[#5c3f42] flex-1">{item.entry_info}</span>
                            <span className="text-[#5c3f42] flex-1">{item.meal_info}</span>
                            <span className="text-[#00a6c0] font-semibold flex-1">
                              {item.activity_info}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-[#fff8f5] rounded-xl border border-[#eee0d6] text-xs text-[#5c3f42]">
                        Nenhum registo de rotina diária lançado para este educando ainda.
                      </div>
                    )}
                  </div>

                  {/* Diário de Desenvolvimento & Observações Carinhosas da Tia (Sem notas) */}
                  <div className="bg-white rounded-2xl border border-[#eee0d6] p-5 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#eee0d6]">
                      <div>
                        <h4 className="font-bold text-sm text-[#211a14] flex items-center gap-2 font-['Quicksand']">
                          <Heart className="w-4 h-4 text-[#ed145b] fill-[#ed145b]" />
                          <span>Diário de Desenvolvimento & Observações da Educadora</span>
                        </h4>
                        <p className="text-xs text-[#5c3f42] mt-0.5">
                          {activeChild
                            ? `Registos qualitativos acompanhados por ${formatEducatorName(activeChild.teacher_name)}`
                            : 'Registos qualitativos publicados pelas Educadoras (Tias)'}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[#ed145b] bg-pink-50 border border-pink-200 px-3 py-1 rounded-full self-start sm:self-auto">
                        {childObservations.length} Observação(ões)
                      </span>
                    </div>

                    <div className="p-3.5 bg-gradient-to-r from-pink-50 to-amber-50 border border-pink-200/80 rounded-2xl text-xs text-[#5c3f42] flex items-start gap-2.5">
                      <span className="text-lg leading-none shrink-0">🌸</span>
                      <div className="leading-relaxed">
                        <strong className="text-[#211a14] block mb-0.5">
                          Metodologia Afetuosa da Creche Mayelin:
                        </strong>
                        Na nossa creche <strong>não existem notas nem pautas numéricas</strong>. O
                        desenvolvimento de cada criança é acompanhado continuamente através das
                        observações atentas das Tias sobre alimentação, soninho, motricidade,
                        linguagem e adaptação emocional.
                      </div>
                    </div>

                    {/* Filtros */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                      {[
                        { id: 'todas', label: 'Todas', icon: '📝' },
                        { id: 'Alimentação & Apetite', label: 'Alimentação', icon: '🍎' },
                        { id: 'Soninho & Repouso', label: 'Soninho', icon: '😴' },
                        { id: 'Desenvolvimento Motor', label: 'Motricidade', icon: '🏃' },
                        { id: 'Linguagem & Interação', label: 'Linguagem', icon: '💬' },
                        { id: 'Adaptação & Emoções', label: 'Afeto & Emoções', icon: '❤️' },
                        { id: 'Saúde & Cuidados', label: 'Saúde & Cuidados', icon: '🩺' }
                      ].map((cat) => {
                        const count =
                          cat.id === 'todas'
                            ? childObservations.length
                            : childObservations.filter((o) => o.category === cat.id).length;

                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setObsCategoryFilter(cat.id)}
                            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 text-xs ${
                              obsCategoryFilter === cat.id
                                ? 'bg-[#ed145b] text-white shadow-xs'
                                : 'bg-[#fff8f5] text-[#5c3f42] hover:bg-[#faebe1] border border-[#eee0d6]'
                            }`}
                          >
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                            <span
                              className={`text-[10px] px-1.5 rounded-full ${
                                obsCategoryFilter === cat.id
                                  ? 'bg-white/20 text-white'
                                  : 'bg-pink-100 text-[#ed145b]'
                              }`}
                            >
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="space-y-3 pt-1">
                      {filteredObservations.map((obs) => {
                        const educatorName = formatEducatorName(obs.recorded_by);
                        return (
                          <div
                            key={obs.id}
                            className="p-4 sm:p-5 rounded-2xl bg-white border border-[#eee0d6] hover:border-pink-200 transition-all space-y-2.5 shadow-2xs"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-base">{getObservationIcon(obs.category)}</span>
                                <span className="text-xs font-bold text-[#ed145b] bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-100">
                                  {obs.category}
                                </span>
                                <span
                                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                    obs.priority === 'Conquista / Marco'
                                      ? 'bg-amber-100 text-amber-800'
                                      : obs.priority === 'Importante'
                                      ? 'bg-rose-100 text-rose-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {obs.priority}
                                </span>
                              </div>
                              <span className="text-[11px] text-[#8c6b6d] font-semibold">
                                {formatDatePt(obs.created_at)}
                              </span>
                            </div>

                            <h5 className="font-bold text-xs sm:text-sm text-[#211a14] font-['Quicksand']">
                              {obs.title}
                            </h5>

                            <div className="p-3.5 bg-[#fff8f5] rounded-xl border border-[#eee0d6]/80 text-xs sm:text-sm text-[#211a14] leading-relaxed">
                              "{obs.text}"
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-[#eee0d6]/50 text-xs">
                              <span className="text-[#5c3f42] flex items-center gap-1.5 font-bold text-[11px]">
                                <Smile className="w-3.5 h-3.5 text-[#fd9924]" />
                                <span>
                                  Observação registada por <strong>{educatorName}</strong>
                                </span>
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenMessageModal(
                                    educatorName,
                                    `Sobre a observação: ${obs.title}`
                                  )
                                }
                                className="text-[#00a6c0] hover:text-sky-700 font-bold hover:underline cursor-pointer flex items-center gap-1 text-[11px]"
                              >
                                <Send className="w-3 h-3" />
                                <span>Responder à {educatorName}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {filteredObservations.length === 0 && (
                        <div className="p-6 text-center bg-[#fff8f5] rounded-2xl border border-[#eee0d6] text-xs text-[#5c3f42]">
                          Nenhuma observação registada pela Tia para esta seleção ainda.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* PILAR 2: PAINEL FINANCEIRO, PROPINAS & FATURAÇÃO                          */}
              {/* ========================================================================= */}
              {activeSection === 'finance' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold font-['Quicksand'] text-[#211a14]">
                        Propinas & Faturação Escolar (Kz)
                      </h3>
                      <p className="text-xs text-[#5c3f42]">
                        Consulte faturas emitidas pela Secretaria, liquide pendentes e imprima recibos
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-[#eee0d6] overflow-hidden shadow-xs">
                    <div className="p-4 bg-[#fff8f5] border-b border-[#eee0d6] flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[#211a14]">
                        Histórico de Mensalidades & Faturas ({financialRecords.length})
                      </h4>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          pendingFinancial.length > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {pendingFinancial.length > 0
                          ? `${pendingFinancial.length} Pendente(s)`
                          : 'Situação Regularizada'}
                      </span>
                    </div>

                    {financialRecords.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#fff8f5] border-b border-[#eee0d6] text-[#5c3f42] font-bold uppercase text-[10px] tracking-wider">
                            <tr>
                              <th className="p-3.5">Fatura</th>
                              <th className="p-3.5">Educando / Descrição</th>
                              <th className="p-3.5">Valor (Kz)</th>
                              <th className="p-3.5">Método</th>
                              <th className="p-3.5">Vencimento / Data</th>
                              <th className="p-3.5">Estado</th>
                              <th className="p-3.5 text-right">Ação</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#eee0d6]">
                            {financialRecords.map((item) => (
                              <tr key={item.id} className="hover:bg-[#fff1e7]/70 transition-colors">
                                <td className="p-3.5 font-bold font-mono text-[#211a14]">
                                  {item.invoice_number}
                                </td>
                                <td className="p-3.5 text-[#5c3f42]">
                                  <span className="font-bold text-[#211a14] block">
                                    {item.student_name}
                                  </span>
                                  <span>{item.description}</span>
                                </td>
                                <td className="p-3.5 font-extrabold text-[#211a14] whitespace-nowrap">
                                  {formatCurrencyKz(item.amount)}
                                </td>
                                <td className="p-3.5 text-[#5c3f42]">{item.payment_method}</td>
                                <td className="p-3.5 text-[#5c3f42]">
                                  {item.paid_date ? `Pago em ${item.paid_date}` : `Vence ${item.due_date}`}
                                </td>
                                <td className="p-3.5">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                      item.status === 'Liquidado'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : item.status === 'Aviso Enviado'
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {item.status}
                                  </span>
                                </td>
                                <td className="p-3.5 text-right">
                                  {item.status === 'Liquidado' ? (
                                    <button
                                      type="button"
                                      onClick={() => setReceiptPreviewRecord(item)}
                                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-[#8c4f00] font-bold rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <Printer className="w-3 h-3" />
                                      <span>Recibo</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setPayModalRecord(item)}
                                      className="px-3 py-1 bg-[#fd9924] hover:bg-amber-600 text-white font-bold rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <Smartphone className="w-3 h-3" />
                                      <span>Liquidar</span>
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-xs text-[#5c3f42]">
                        Nenhuma fatura registada para esta conta no momento.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* PILAR 3: CANAL DIRETO DE COMUNICAÇÃO & CIRCULARES                         */}
              {/* ========================================================================= */}
              {activeSection === 'comms' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold font-['Quicksand'] text-[#211a14]">
                        Canal Direto de Comunicação & Circulares
                      </h3>
                      <p className="text-xs text-[#5c3f42]">
                        Comunicação direta com a Tia (Educadora Titular), Coordenação e Secretaria Geral
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenMessageModal()}
                      className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#00a6c0] hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Nova Mensagem</span>
                    </button>
                  </div>

                  {/* Mensagens Diretas */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#8c6b6d]">
                      Mensagens Diretas ({messages.length})
                    </h4>

                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`bg-white p-5 rounded-2xl border shadow-xs space-y-2.5 transition-all ${
                          msg.unread ? 'border-amber-300 ring-2 ring-amber-100/60' : 'border-[#eee0d6]'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#faebe1] text-[#5c3f42]">
                              {msg.sender_role}
                            </span>
                            <h5 className="font-bold text-sm text-[#211a14]">
                              {msg.sender_name} → {msg.recipient_name}
                            </h5>
                          </div>
                          <span className="text-xs text-[#8c6b6d] font-semibold">
                            {formatDatePt(msg.created_at)}
                          </span>
                        </div>

                        <p className="font-bold text-xs text-[#211a14]">{msg.subject}</p>
                        <p className="text-xs text-[#5c3f42] leading-relaxed">{msg.preview}</p>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eee0d6]">
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenMessageModal(msg.recipient_name, `Re: ${msg.subject}`)
                            }
                            className="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-[#00a6c0] font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>Nova Mensagem no Assunto</span>
                          </button>
                        </div>
                      </div>
                    ))}

                    {messages.length === 0 && (
                      <div className="p-6 text-center bg-white rounded-2xl border border-[#eee0d6] text-xs text-[#5c3f42]">
                        Nenhuma mensagem enviada ou recebida ainda. Clique em "Nova Mensagem" para falar com a Educadora ou Secretaria.
                      </div>
                    )}
                  </div>

                  {/* Circulares da Escola */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#8c6b6d]">
                      Circulares & Avisos da Creche ({announcements.length})
                    </h4>

                    {announcements.map((ann) => (
                      <div
                        key={ann.id}
                        className="bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs space-y-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                ann.priority === 'urgente'
                                  ? 'bg-rose-100 text-rose-800'
                                  : ann.priority === 'importante'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {ann.priority}
                            </span>
                            <h5 className="font-bold text-sm text-[#211a14]">{ann.title}</h5>
                          </div>
                          <span className="text-xs text-[#8c6b6d]">
                            {formatDatePt(ann.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-[#5c3f42] leading-relaxed">{ann.content}</p>
                        <p className="text-[11px] text-[#8c6b6d] font-semibold">
                          Publicado por {ann.author}
                        </p>
                      </div>
                    ))}

                    {announcements.length === 0 && (
                      <div className="p-6 text-center bg-white rounded-2xl border border-[#eee0d6] text-xs text-[#5c3f42]">
                        Nenhuma circular publicada para os encarregados no momento.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* PILAR 4: AUTORIZAÇÕES DE RETIRADA & CONSENTIMENTOS DIGITAIS               */}
              {/* ========================================================================= */}
              {activeSection === 'authorizations' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold font-['Quicksand'] text-[#211a14]">
                        Autorizações de Retirada (Portaria) & Consentimentos Digitais
                      </h3>
                      <p className="text-xs text-[#5c3f42]">
                        Registe familiares autorizados para recolha na portaria ou assine consentimentos de saídas pedagógicas
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPickupModalOpen(true)}
                      className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#ed145b] hover:bg-pink-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Autorizar Pessoa para Retirada</span>
                    </button>
                  </div>

                  {/* Lista de Autorizações de Retirada na Portaria */}
                  <div className="bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs space-y-3">
                    <h4 className="font-bold text-sm text-[#211a14] flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#fd9924]" />
                      <span>Pessoas Autorizadas na Portaria ({pickupAuthorizations.length})</span>
                    </h4>

                    {pickupAuthorizations.length > 0 ? (
                      <div className="divide-y divide-[#eee0d6] text-xs">
                        {pickupAuthorizations.map((auth) => (
                          <div
                            key={auth.id}
                            className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-2"
                          >
                            <div>
                              <p className="font-bold text-[#211a14]">
                                {auth.person_name}{' '}
                                <span className="text-[#5c3f42] font-normal">
                                  ({auth.relationship})
                                </span>
                              </p>
                              <p className="text-[#5c3f42] text-[11px] mt-0.5">
                                Documento: {auth.document_id}
                                {auth.phone ? ` • Tel: ${auth.phone}` : ''} • Data: {auth.auth_date} (até{' '}
                                {auth.time_limit})
                              </p>
                            </div>
                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold self-start md:self-auto ${
                                auth.status === 'Aprovado'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {auth.status === 'Aprovado'
                                ? 'Aprovado pela Direção'
                                : 'Aguarda Validação da Direção'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-[#fff8f5] rounded-xl border border-[#eee0d6] text-xs text-[#5c3f42]">
                        Nenhuma autorização especial de retirada registada ainda. Utilize o botão acima para autorizar um familiar.
                      </div>
                    )}
                  </div>

                  {/* Consentimentos Pendentes */}
                  {pendingConsents.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-700">
                        Consentimentos Pendentes de Assinatura ({pendingConsents.length})
                      </h4>

                      {pendingConsents.map((consent) => (
                        <div
                          key={consent.id}
                          className="p-5 rounded-2xl bg-white border border-rose-300 ring-2 ring-rose-100 shadow-sm space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#eee0d6]/60">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                Pendente
                              </span>
                              <h5 className="font-bold text-sm text-[#211a14]">{consent.title}</h5>
                            </div>
                            <span className="text-xs text-[#5c3f42] font-semibold">
                              {consent.event_date}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#5c3f42]">
                            <div className="p-2.5 bg-[#fff8f5] rounded-xl">
                              <span className="font-bold block text-[#211a14] mb-0.5">Transporte:</span>
                              {consent.transport}
                            </div>
                            <div className="p-2.5 bg-[#fff8f5] rounded-xl">
                              <span className="font-bold block text-[#211a14] mb-0.5">Alimentação:</span>
                              {consent.meal}
                            </div>
                            <div className="p-2.5 bg-[#fff8f5] rounded-xl">
                              <span className="font-bold block text-[#211a14] mb-0.5">
                                Salvaguardas Médicas:
                              </span>
                              {consent.medical_check}
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => setConsentToSign(consent)}
                              className="px-4 py-2 bg-[#ed145b] text-white rounded-xl text-xs font-bold hover:bg-pink-600 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>Assinar Digitalmente com PIN</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Histórico de Consentimentos Assinados */}
                  <div className="bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs space-y-3">
                    <h4 className="font-bold text-sm text-[#211a14]">
                      Histórico de Consentimentos Assinados ({signedConsents.length})
                    </h4>

                    {signedConsents.length > 0 ? (
                      <div className="divide-y divide-[#eee0d6] text-xs">
                        {signedConsents.map((item) => (
                          <div
                            key={item.id}
                            className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-2"
                          >
                            <div>
                              <p className="font-bold text-[#211a14]">{item.title}</p>
                              <p className="text-[#5c3f42] text-[11px] mt-0.5">
                                Assinado por {item.signer || currentUser.name} •{' '}
                                {formatDatePt(item.signed_at || item.event_date)}
                              </p>
                            </div>
                            {item.signature_hash && (
                              <span className="font-mono text-[11px] bg-[#faebe1] text-[#5c3f42] px-2.5 py-1 rounded-md">
                                {item.signature_hash}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#5c3f42]">
                        Nenhum consentimento de saída pedagógica assinado até ao momento.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          </div>
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ASSINATURA DIGITAL COM PIN                                         */}
      {/* ========================================================================= */}
      {consentToSign && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="sign-modal-title"
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#ed145b]" />
                <h3 id="sign-modal-title" className="font-bold text-sm text-[#211a14] font-['Quicksand']">
                  Assinatura Digital de Consentimento
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setConsentToSign(null);
                  setPinInput('');
                }}
                className="p-1 rounded-lg text-[#8c6b6d] hover:text-[#5c3f42] cursor-pointer"
                aria-label="Fechar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#5c3f42] leading-relaxed">
              Está a autorizar <strong>{consentToSign.title}</strong> ({consentToSign.event_date})
              {activeChild ? ` para ${activeChild.name}` : ''}.
            </p>

            <form onSubmit={handleSignConsent} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">
                  Código PIN de Confirmação (mínimo 4 dígitos)
                </label>
                <input
                  type="password"
                  minLength={4}
                  maxLength={8}
                  required
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="••••"
                  className="w-full text-center text-lg tracking-widest p-2.5 rounded-xl border border-[#eee0d6] focus:outline-none focus:border-[#ed145b]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setConsentToSign(null);
                    setPinInput('');
                  }}
                  className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#ed145b] text-white rounded-xl font-bold hover:bg-pink-600 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>Validar e Assinar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NOVA AUTORIZAÇÃO DE RETIRADA (PORTARIA)                            */}
      {/* ========================================================================= */}
      {pickupModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pickup-modal-title"
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#ed145b]" />
                <h3 id="pickup-modal-title" className="font-bold text-sm text-[#211a14] font-['Quicksand']">
                  Autorizar Pessoa para Retirada na Portaria
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPickupModalOpen(false)}
                className="p-1 rounded-lg text-[#8c6b6d] hover:text-[#5c3f42] cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePickupAuthorization} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Nome Completo da Pessoa</label>
                <input
                  type="text"
                  required
                  value={pickupPersonName}
                  onChange={(e) => setPickupPersonName(e.target.value)}
                  placeholder="Ex: Maria Manuela Ferreira"
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6] focus:outline-none focus:border-[#ed145b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#5c3f42] block mb-1">Parentesco / Vínculo</label>
                  <select
                    value={pickupRelationship}
                    onChange={(e) => setPickupRelationship(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#eee0d6] bg-white"
                  >
                    <option value="Avó / Avô">Avó / Avô</option>
                    <option value="Tia / Tio">Tia / Tio</option>
                    <option value="Irmão / Irmã Maior">Irmão / Irmã Maior</option>
                    <option value="Motorista / Pessoa de Confiança">Pessoa de Confiança</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#5c3f42] block mb-1">BI / Passaporte</label>
                  <input
                    type="text"
                    required
                    value={pickupDocumentId}
                    onChange={(e) => setPickupDocumentId(e.target.value)}
                    placeholder="004819283LA041"
                    className="w-full p-2.5 rounded-xl border border-[#eee0d6] focus:outline-none focus:border-[#ed145b]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-[#5c3f42] block mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={pickupPhone}
                    onChange={(e) => setPickupPhone(e.target.value)}
                    placeholder="923 000 000"
                    className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#5c3f42] block mb-1">Data</label>
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#5c3f42] block mb-1">Hora Limite</label>
                  <input
                    type="time"
                    value={pickupTimeLimit}
                    onChange={(e) => setPickupTimeLimit(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPickupModalOpen(false)}
                  className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#ed145b] text-white rounded-xl font-bold hover:bg-pink-600 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Submeter Autorização</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RELATÓRIO QUALITATIVO DA CRIANÇA (IMPRIMIR / PDF)                  */}
      {/* ========================================================================= */}
      {reportModalOpen && activeChild && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#fd9924]" />
                <h3 id="report-modal-title" className="font-bold text-sm text-[#211a14] font-['Quicksand']">
                  Relatório Qualitativo de Desenvolvimento
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="p-1 rounded-lg text-[#8c6b6d] hover:text-[#5c3f42] cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#fff8f5] p-4 rounded-2xl border border-[#eee0d6] text-xs space-y-2 max-h-72 overflow-y-auto">
              <p className="font-bold text-[#211a14] text-sm">
                {activeChild.name} • {activeChild.classroom_name}
              </p>
              <p className="text-[#5c3f42]">
                Educadora Titular: <strong>{formatEducatorName(activeChild.teacher_name)}</strong>
              </p>
              <p className="text-[#5c3f42]">
                Estado de Desenvolvimento: <strong>{activeChild.development_status}</strong> • Assiduidade:{' '}
                <strong>{activeChild.presence_rate}%</strong>
              </p>
              <div className="pt-2 border-t border-[#eee0d6] space-y-2">
                <p className="font-bold text-[#211a14]">
                  Observações Qualitativas ({childObservations.length}):
                </p>
                {childObservations.length > 0 ? (
                  childObservations.map((obs) => (
                    <div key={obs.id} className="p-2.5 bg-white rounded-xl border border-[#eee0d6]">
                      <p className="font-bold text-[#ed145b]">
                        {obs.category} — {obs.title}
                      </p>
                      <p className="text-[#5c3f42] mt-0.5">{obs.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[#5c3f42]">Sem observações registadas ainda.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold text-xs cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setReportModalOpen(false);
                }}
                className="px-4 py-2 bg-[#fd9924] text-white rounded-xl font-bold text-xs hover:bg-amber-600 flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir / Guardar PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: LIQUIDAÇÃO DE PROPINA                                              */}
      {/* ========================================================================= */}
      {payModalRecord && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pay-modal-title"
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <h3 id="pay-modal-title" className="font-bold text-sm text-[#211a14] font-['Quicksand']">
                Registar Liquidação — {payModalRecord.invoice_number}
              </h3>
              <button
                type="button"
                onClick={() => setPayModalRecord(null)}
                className="p-1 rounded-lg text-[#8c6b6d] hover:text-[#5c3f42] cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#fff8f5] p-4 rounded-2xl border border-[#eee0d6] text-xs space-y-1.5">
              <p className="font-bold text-[#211a14]">{payModalRecord.description}</p>
              <p className="text-[#5c3f42]">Educando: {payModalRecord.student_name}</p>
              <p className="text-lg font-extrabold text-[#211a14]">
                {formatCurrencyKz(payModalRecord.amount)}
              </p>
            </div>

            <div className="text-xs">
              <label className="font-bold text-[#5c3f42] block mb-1">Método de Pagamento</label>
              <select
                value={selectedPayMethod}
                onChange={(e) => setSelectedPayMethod(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#eee0d6] bg-white"
              >
                <option value="Multicaixa Express (MCX)">Multicaixa Express (MCX)</option>
                <option value="Referência Multicaixa">Referência Multicaixa</option>
                <option value="Transferência Bancária">Transferência Bancária</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPayModalRecord(null)}
                className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmPayment}
                className="px-4 py-2 bg-amber-500 text-white rounded-xl font-bold text-xs hover:bg-amber-600 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Smartphone className="w-3.5 h-3.5" />}
                <span>Confirmar Pagamento</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RECIBO OFICIAL                                                     */}
      {/* ========================================================================= */}
      {receiptPreviewRecord && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="rec-modal-title"
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <h3 id="rec-modal-title" className="font-bold text-sm text-[#211a14] font-['Quicksand']">
                Recibo de Pagamento
              </h3>
              <button
                type="button"
                onClick={() => setReceiptPreviewRecord(null)}
                className="p-1 rounded-lg text-[#8c6b6d] hover:text-[#5c3f42] cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#fff8f5] p-4 rounded-2xl border border-[#eee0d6] text-xs space-y-1.5">
              <p className="font-bold text-[#211a14] font-mono">{receiptPreviewRecord.invoice_number}</p>
              <p className="text-[#5c3f42]">{receiptPreviewRecord.description}</p>
              <p className="text-[#5c3f42]">Educando: {receiptPreviewRecord.student_name}</p>
              <p className="text-[#211a14] font-bold">
                Valor: {formatCurrencyKz(receiptPreviewRecord.amount)}
              </p>
              <p className="text-emerald-700 font-semibold">
                Liquidado via {receiptPreviewRecord.payment_method}
                {receiptPreviewRecord.paid_date ? ` em ${receiptPreviewRecord.paid_date}` : ''}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReceiptPreviewRecord(null)}
                className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold text-xs cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setReceiptPreviewRecord(null);
                }}
                className="px-4 py-2 bg-[#211a14] text-white rounded-xl font-bold text-xs hover:bg-[#382b22] flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir / PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NOVA MENSAGEM                                                      */}
      {/* ========================================================================= */}
      {newMessageModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="msg-modal-title"
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <h3 id="msg-modal-title" className="font-bold text-sm text-[#211a14] font-['Quicksand']">
                Enviar Mensagem para a Escola
              </h3>
              <button
                type="button"
                onClick={() => setNewMessageModal(false)}
                className="p-1 rounded-lg text-[#8c6b6d] hover:text-[#5c3f42] cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Destinatário</label>
                <select
                  value={msgRecipient}
                  onChange={(e) => setMsgRecipient(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6] bg-white"
                >
                  {recipientOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Assunto</label>
                <input
                  type="text"
                  required
                  value={msgSubject}
                  onChange={(e) => setMsgSubject(e.target.value)}
                  placeholder="Ex: Dúvida sobre a rotina ou autorização"
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6] focus:outline-none focus:border-[#00a6c0]"
                />
              </div>

              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Mensagem</label>
                <textarea
                  rows={3}
                  required
                  value={msgBody}
                  onChange={(e) => setMsgBody(e.target.value)}
                  placeholder="Escreva a sua mensagem..."
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6] focus:outline-none focus:border-[#00a6c0]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewMessageModal(false)}
                  className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#00a6c0] text-white rounded-xl font-bold hover:bg-sky-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Enviar Mensagem</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
