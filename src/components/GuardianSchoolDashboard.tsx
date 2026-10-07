import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  DollarSign,
  CreditCard,
  Download,
  Send,
  FileText,
  Sparkles,
  ShieldCheck,
  Smartphone,
  Printer,
  Heart,
  Smile,
  FileSpreadsheet,
  Eye,
  X,
  KeyRound,
  Building2,
  GraduationCap,
  Utensils,
  BookOpen,
  Award,
  ArrowRight,
  Lock,
  RefreshCw,
  Baby,
  Check,
  ChevronRight
} from 'lucide-react';

interface GuardianSchoolDashboardProps {
  onClose?: () => void;
}

type GuardianSection = 'overview' | 'routine' | 'finance' | 'comms' | 'authorizations' | 'settings';

interface ChildProfile {
  id: string;
  name: string;
  classroom: string;
  cycle: string;
  leadTeacher: string;
  avatarLetter: string;
  status: string;
  presenceRate: number;
  averageGrade: number;
  financialStatus: 'Regularizada' | 'Pendente';
  newMessagesCount: number;
}

export default function GuardianSchoolDashboard({ onClose }: GuardianSchoolDashboardProps) {
  // Navigation & Active Section
  const [activeSection, setActiveSection] = useState<GuardianSection>('overview');

  // Selected Child Profile (Rodrigo Silva no Jardim de Infância vs. Sofia Silva no Maternal I)
  const childrenList: ChildProfile[] = [
    {
      id: 'rodrigo-silva',
      name: 'Rodrigo Silva',
      classroom: 'Jardim de Infância - Sala das Estrelinhas',
      cycle: 'Pré-Escolar & Jardim de Infância (4 a 5 anos)',
      leadTeacher: 'Profª Maria Clara Marques',
      avatarLetter: 'R',
      status: 'Presente na Atividade da Horta & Expressão',
      presenceRate: 98.2,
      averageGrade: 92.5,
      financialStatus: 'Regularizada',
      newMessagesCount: 1
    },
    {
      id: 'sofia-silva',
      name: 'Sofia Silva',
      classroom: 'Maternal I - Sala dos Primeiros Passos',
      cycle: 'Maternal I & II (1 a 2 anos)',
      leadTeacher: 'Educadora Teresa Melo',
      avatarLetter: 'S',
      status: 'Em Atividade Sensorial no Pátio',
      presenceRate: 99.0,
      averageGrade: 95.0,
      financialStatus: 'Regularizada',
      newMessagesCount: 0
    }
  ];

  const [activeChildId, setActiveChildId] = useState('rodrigo-silva');
  const activeChild = childrenList.find((c) => c.id === activeChildId) || childrenList[0];

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Modals
  const [reportCardModal, setReportCardModal] = useState(false);
  const [taxDeclarationModal, setTaxDeclarationModal] = useState(false);
  const [ibanModal, setIbanModal] = useState(false);
  const [multibancoModal, setMultibancoModal] = useState(false);
  const [receiptPreviewRecord, setReceiptPreviewRecord] = useState<any | null>(null);
  const [signAuthorizationModal, setSignAuthorizationModal] = useState(false);
  const [newMessageModal, setNewMessageModal] = useState(false);

  // Pilar 1: Assiduidade Semanal & Boletim Trimestral de Educação Infantil
  const routineHistory = [
    { day: 'Hoje (Terça)', entry: '08:24 (Portaria Central - Validação Biométrica)', meal: 'Almoço Biológico Completo (Peixe com legumes e fruta fresca)', activity: 'Oficina de Psicomotricidade & Modelagem com Argila' },
    { day: 'Segunda-feira', entry: '08:26 (Portaria Central - Validação Biométrica)', meal: 'Almoço Biológico Completo (Sopa da horta e arroz com frango)', activity: 'Oficina de Música & Canções em Roda' },
    { day: 'Sexta-feira (Semana Passada)', entry: '08:25 (Portaria Central)', meal: 'Almoço Completo', activity: 'Saída de Campo no Pomar da Escola' },
    { day: 'Quinta-feira', entry: '08:30 (Atestado Pediátrico Arquivado)', meal: 'Dieta Ligeira Monitorizada', activity: 'Cantinho de Leitura & Contação de Histórias' }
  ];

  const academicReport = [
    { subject: 'Linguagem e Expressão Oral', maker: 92, formative: 90, summative: 94, finalAverage: 92, assessment: 'Excelente', feedback: 'Expressão oral fluente, vocabulário rico e participação ativa nas rodas de conversa.' },
    { subject: 'Estimulação Sensorial e Lógica', maker: 88, formative: 86, summative: 90, finalAverage: 88, assessment: 'Muito Bom', feedback: 'Grande destreza na seriação de blocos lógicos, identificação de formas e texturas.' },
    { subject: 'Relações com a Natureza & Horta', maker: 95, formative: 92, summative: 93, finalAverage: 94, assessment: 'Excelente', feedback: 'Curiosidade exemplar no cuidado com as mudinhas, rega e preservação ambiental.' },
    { subject: 'Expressão Plástica & Criatividade', maker: 96, formative: 94, summative: 92, finalAverage: 94, assessment: 'Excelente', feedback: 'Criatividade ímpar na pintura com pigmentos naturais e modelagem de massinhas.' },
    { subject: 'Psicomotricidade & Autonomia', maker: 90, formative: 88, summative: 92, finalAverage: 90, assessment: 'Excelente', feedback: 'Excelente coordenação motora ampla no circuito e progressiva autonomia nas refeições.' }
  ];

  // Pilar 2: Financeiro em Moeda Nacional (Kwanza - Kz)
  const [financialHistory, setFinancialHistory] = useState([
    { id: 'inv-3', ref: 'FT-2025/0284', desc: 'Mensalidade Escolar - Fevereiro 2025', amount: 150000.0, method: 'Multicaixa Express (MCX)', status: 'Liquidado', date: '08/02/2025' },
    { id: 'inv-2', ref: 'FT-2025/0142', desc: 'Mensalidade Escolar - Janeiro 2025', amount: 150000.0, method: 'Referência Multicaixa', status: 'Liquidado', date: '08/01/2025' },
    { id: 'inv-1', ref: 'FT-2024/1899', desc: 'Mensalidade Escolar - Dezembro 2024', amount: 150000.0, method: 'Multicaixa Express (MCX)', status: 'Liquidado', date: '08/12/2024' }
  ]);

  // Pilar 3: Comunicações
  const [messagesList, setMessagesList] = useState([
    {
      id: 'msg-1',
      senderRole: 'Professora Titular (Jardim de Infância)',
      senderName: 'Profª Maria Clara Marques',
      date: 'Hoje, às 10:45',
      subject: 'Nota de Mérito: Participação exemplar na Horta Pedagógica',
      preview: 'Estimado Dr. António, o Rodrigo teve uma manhã brilhante no plantio das sementinhas de girassol e cooperou com todos os coleguinhas. Parabéns pelo apoio familiar!',
      unread: true
    },
    {
      id: 'msg-2',
      senderRole: 'Coordenação Pedagógica',
      senderName: 'Prof. Carlos Esteves',
      date: '02 de Março, 2025',
      subject: 'Confirmação: Oficina de Psicomotricidade Lúdica',
      preview: 'Confirmamos a participação do Rodrigo nas oficinas motoras de enriquecimento às quintas-feiras.',
      unread: false
    },
    {
      id: 'msg-3',
      senderRole: 'Secretaria Escolar',
      senderName: 'Dra. Manuela Castro',
      date: '25 de Fevereiro, 2025',
      subject: 'Renovação de Matrícula para o Ano Letivo 2025/2026',
      preview: 'Informamos que o período de renovação prioritária para irmãos (Rodrigo e Sofia) já está aberto.',
      unread: false
    }
  ]);

  // Pilar 4: Autorizações Digitais
  const [urgentAuth, setUrgentAuth] = useState<{
    id: string;
    title: string;
    date: string;
    transport: string;
    meal: string;
    medicalCheck: string;
    signed: boolean;
    hash?: string;
  }>({
    id: 'auth-luanda',
    title: 'Visita Pedagógica ao Parque Natural e Museu de História Natural de Luanda',
    date: '14 de Março de 2025 (08:30 às 15:30)',
    transport: 'Autocarro Escolar Climatizado com Cintos e Vigilância de 4 Educadoras',
    meal: 'Piquenique Nutritivo fornecido pelo Refeitório Biológico da Escola',
    medicalCheck: 'Kit de Primeiros Socorros + Ficha Médica de Alergias pré-validada',
    signed: false
  });

  const [signedAuthHistory, setSignedAuthHistory] = useState([
    {
      id: 'sa-1',
      title: 'Saída à Horta Biológica e Laboratório Maker de Compostagem',
      date: '20 de Fevereiro de 2025',
      signer: 'Dr. António Ferreira Silva (eIDAS PIN)',
      hash: 'sha256-e91b4c892837f401ad8b76ce81'
    },
    {
      id: 'sa-2',
      title: 'Torneio Inter-Escolar de Natação e Psicomotricidade Aquática',
      date: '15 de Janeiro de 2025',
      signer: 'Dr. António Ferreira Silva (Biometria Facial)',
      hash: 'sha256-8a7192bc51034fed8290192a02'
    }
  ]);

  const [pinInput, setPinInput] = useState('');

  const handleSignAuthorization = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput || pinInput.length < 4) {
      showToast('Por favor insira um código PIN de 4 dígitos válido.');
      return;
    }

    const newHash = `sha256-${Math.random().toString(36).substring(2, 10)}${Date.now()}`;
    setUrgentAuth((prev) => ({
      ...prev,
      signed: true,
      hash: newHash
    }));

    setSignedAuthHistory([
      {
        id: `sa-${Date.now()}`,
        title: urgentAuth.title,
        date: 'Hoje (Assinado Digitalmente)',
        signer: 'Dr. António Ferreira Silva (PIN Seguro)',
        hash: newHash
      },
      ...signedAuthHistory
    ]);

    setSignAuthorizationModal(false);
    setPinInput('');
    showToast('Autorização assinada digitalmente com validade jurídica (eIDAS & RGPD).');
  };

  return (
    <div
      role="region"
      aria-label="Painel do Responsável - Portal dos Encarregados de Educação"
      className="bg-[#f8fafc] text-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col min-h-[720px] max-h-[92vh] font-['Nunito_Sans'] antialiased"
    >
      {/* ========================================================================= */}
      {/* 1. TOPNAVBAR: IDENTIFICAÇÃO DO ENCARREGADO & CONTEXTO DO EDUCANDO ATIVO  */}
      {/* ========================================================================= */}
      <header
        className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 z-20"
        role="banner"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#fd9924] text-white flex items-center justify-center font-bold shadow-sm shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-bold font-['Quicksand'] text-slate-900 leading-tight">
                Portal dos Encarregados de Educação & Tutores
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-[#8c4f00] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Sessão Segura Encriptada
              </span>
              <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                RGPD • WCAG 2.1 AA
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Encarregado Autenticado: <strong>Dr. António Ferreira Silva</strong> • NIF: 5418409382 • Luanda
            </p>
          </div>
        </div>

        {/* Top Shortcuts: Regularização de Propinas & Notificações */}
        <div className="flex items-center justify-between md:justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveSection('finance')}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Propinas em Dia (Multicaixa)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('comms')}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Mensagens e Notificações"
          >
            <Send className="w-4 h-4 text-slate-700" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ed145b] rounded-full ring-2 ring-white" />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-1"
              aria-label="Fechar portal do encarregado"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* CARD DE CONTEXTO DO EDUCANDO SELECIONADO & MÉTRICAS RÁPIDAS               */}
      {/* ========================================================================= */}
      <section
        className="bg-gradient-to-r from-amber-50 via-orange-50/60 to-rose-50/40 border-b border-amber-200/80 px-4 sm:px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shrink-0"
        aria-label="Perfil do educando ativo"
      >
        {/* Child Profile & Brother Switcher */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#fd9924] text-white flex items-center justify-center font-extrabold text-lg shadow-sm shrink-0 border-2 border-white">
            {activeChild.avatarLetter}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold font-['Quicksand'] text-slate-900 leading-tight">
                {activeChild.name}
              </h2>
              <span className="text-xs font-bold text-[#fd9924] bg-white px-2.5 py-0.5 rounded-full border border-amber-200 shadow-2xs">
                {activeChild.classroom}
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {activeChild.status}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Professora Titular: <strong>{activeChild.leadTeacher}</strong> • {activeChild.cycle}
            </p>

            {/* Alternador de Irmãos */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] font-semibold text-slate-500">Irmãos Matriculados:</span>
              {childrenList.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    setActiveChildId(ch.id);
                    showToast(`Contexto alterado para ${ch.name} (${ch.classroom}).`);
                  }}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all ${
                    activeChildId === ch.id
                      ? 'bg-[#fd9924] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-400'
                  }`}
                >
                  {ch.name.split(' ')[0]} ({ch.classroom.split(' ')[0]})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Métricas Executivas Rápidas do Estudante */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs shrink-0">
          <div className="bg-white p-3 rounded-xl border border-amber-200/80 shadow-2xs">
            <span className="text-[11px] text-slate-500 block font-semibold">Taxa de Presença</span>
            <p className="text-lg font-bold font-['Quicksand'] text-emerald-700 mt-0.5">
              {activeChild.presenceRate}%
            </p>
            <span className="text-[10px] text-slate-400">0 faltas injustificadas</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-amber-200/80 shadow-2xs">
            <span className="text-[11px] text-slate-500 block font-semibold">Média Global</span>
            <p className="text-lg font-bold font-['Quicksand'] text-[#00a6c0] mt-0.5">
              {activeChild.averageGrade}%
            </p>
            <span className="text-[10px] text-sky-700 font-bold">Muito Bom (2º Trim.)</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-amber-200/80 shadow-2xs">
            <span className="text-[11px] text-slate-500 block font-semibold">Situação Financeira</span>
            <p className="text-lg font-bold font-['Quicksand'] text-emerald-700 mt-0.5">
              Regularizada
            </p>
            <span className="text-[10px] text-slate-400">Multicaixa Express Ativo</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-amber-200/80 shadow-2xs">
            <span className="text-[11px] text-slate-500 block font-semibold">Comunicação</span>
            <p className="text-lg font-bold font-['Quicksand'] text-[#ed145b] mt-0.5">
              {activeChild.newMessagesCount} Nova
            </p>
            <span className="text-[10px] text-pink-700 font-bold">Profª Titular</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. BODY LAYOUT: SIDENAVBAR + PAINÉIS FUNCIONAIS                           */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* SideNavBar Lateral */}
        <nav
          className="w-full md:w-64 bg-slate-900 text-slate-300 p-3 sm:p-4 flex md:flex-col justify-between shrink-0 overflow-x-auto md:overflow-y-auto border-r border-slate-800"
          aria-label="Módulos do encarregado de educação"
        >
          <div className="flex md:flex-col gap-1 w-full">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-1.5 hidden md:block">
              Área do Encarregado
            </span>

            <button
              type="button"
              onClick={() => setActiveSection('overview')}
              className={`min-h-[42px] w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all text-left whitespace-nowrap ${
                activeSection === 'overview'
                  ? 'bg-[#fd9924] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Smile className="w-4 h-4 shrink-0" />
              <span>Visão Integrada</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('routine')}
              className={`min-h-[42px] w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all text-left whitespace-nowrap ${
                activeSection === 'routine'
                  ? 'bg-[#fd9924] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Rotina & Boletim de Notas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('finance')}
              className={`min-h-[42px] w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all text-left whitespace-nowrap ${
                activeSection === 'finance'
                  ? 'bg-[#fd9924] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4 shrink-0" />
              <span>Propinas & Faturação</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('comms')}
              className={`min-h-[42px] w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all text-left whitespace-nowrap ${
                activeSection === 'comms'
                  ? 'bg-[#fd9924] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Send className="w-4 h-4 shrink-0" />
              <span>Canal Direto de Comunicação</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('authorizations')}
              className={`min-h-[42px] w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all text-left whitespace-nowrap ${
                activeSection === 'authorizations'
                  ? 'bg-[#fd9924] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Autorizações Digitais (eIDAS)</span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-800 hidden md:block">
            <div className="p-2.5 rounded-xl bg-slate-800/80 text-[11px] space-y-1">
              <p className="font-bold text-slate-200">Proteção de Dados do Menor</p>
              <p className="text-slate-400">
                Acesso encriptado auditado em conformidade com o RGPD.
              </p>
            </div>
          </div>
        </nav>

        {/* Main Workspace Area */}
        <main
          className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 bg-slate-50 focus:outline-none"
          tabIndex={-1}
        >
          {/* Toast Notification */}
          {toastMessage && (
            <div
              role="status"
              aria-live="polite"
              className="p-3.5 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECÇÃO 1: VISÃO INTEGRADA                                                 */}
          {/* ========================================================================= */}
          {activeSection === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Alerta de Ação Urgente Pendente: Visita Pedagógica em Luanda */}
              {!urgentAuth.signed && (
                <div className="bg-gradient-to-r from-pink-500 to-rose-600 text-white p-5 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Ação Requerida Urgente
                    </span>
                    <h3 className="font-['Quicksand'] font-bold text-base sm:text-lg">
                      {urgentAuth.title}
                    </h3>
                    <p className="text-xs text-pink-100">
                      Data da Saída: {urgentAuth.date} • Requer consentimento digital do encarregado de educação.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSignAuthorizationModal(true)}
                    className="min-h-[42px] px-5 py-2 rounded-xl bg-white text-[#ed145b] font-bold text-xs shadow-md hover:bg-pink-50 transition-all flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Assinar Digitalmente (PIN / Biometria)</span>
                  </button>
                </div>
              )}

              {/* Grid Resumo do Dia e Próximos Passos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Resumo de Assiduidade Hoje */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-['Quicksand'] font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#fd9924]" />
                      <span>Registo de Assiduidade de Hoje</span>
                    </h3>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      Entrada às 08:24
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                    <p className="font-bold text-slate-800">Portaria Central • Validação Biométrica</p>
                    <p className="text-slate-600">
                      Chegada acolhedora às 08:24 com apresentação do cartão escolar seguro.
                    </p>
                    <p className="text-slate-600">
                      Almoço servido às 12:15 com porção integral de peixe e salada da horta.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveSection('routine')}
                    className="text-xs font-bold text-[#fd9924] hover:underline flex items-center gap-1"
                  >
                    <span>Ver histórico semanal e boletim de notas completo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Próxima Cobrança Agendada */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-['Quicksand'] font-bold text-sm text-slate-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#00a6c0]" />
                      <span>Próxima Cobrança Agendada</span>
                    </h3>
                    <span className="text-[11px] font-bold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full">
                      Multicaixa Express
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-slate-900">Mensalidade Escolar - Março de 2025</span>
                      <span className="text-base text-slate-900">150.000,00 Kz</span>
                    </div>
                    <p className="text-slate-500">Vencimento a 08/03/2025 via Multicaixa / Débito em Conta</p>
                    <p className="text-emerald-700 font-semibold">IBAN Registado: AO06 0040 0000 8291 0281 9283 1</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveSection('finance')}
                    className="text-xs font-bold text-[#00a6c0] hover:underline flex items-center gap-1"
                  >
                    <span>Gerir métodos de pagamento e certidão fiscal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PILAR 1: ACOMPANHAMENTO DE ROTINA (FREQUÊNCIA & NOTAS DO ESTUDANTE)       */}
          {/* ========================================================================= */}
          {activeSection === 'routine' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold font-['Quicksand'] text-slate-900">
                    Acompanhamento de Rotina & Boletim Escolar • {activeChild.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Assiduidade com confirmação biométrica, refeições biológicas e pauta trimestral oficial
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setReportCardModal(true)}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#fd9924] text-white hover:bg-amber-600 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download do Boletim Oficial em PDF</span>
                </button>
              </div>

              {/* Assiduidade Semanal Cronológica */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Registo Diário Cronológico da Semana</span>
                </h4>

                <div className="divide-y divide-slate-100 text-xs">
                  {routineHistory.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 w-44">{item.day}</span>
                      <span className="text-slate-600 flex-1">{item.entry}</span>
                      <span className="text-slate-500 flex-1">{item.meal}</span>
                      <span className="text-[#00a6c0] font-semibold flex-1">{item.activity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Boletim Trimestral Detalhado */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      Boletim de Avaliação Trimestral Discriminado
                    </h4>
                    <p className="text-xs text-slate-500">
                      Rubricas: Trabalhos Maker (25%), Formativa (25%), Exame Sumativo (35%), Participação (15%)
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#00a6c0] bg-sky-50 border border-sky-200 px-3 py-1 rounded-full">
                    Média da Turma: 88.5%
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3">Disciplina Curricular</th>
                        <th className="p-3 text-center">Trabalho Maker</th>
                        <th className="p-3 text-center">Aval. Formativa</th>
                        <th className="p-3 text-center">Teste Sumativo</th>
                        <th className="p-3 text-center">Média Ponderada</th>
                        <th className="p-3 text-center">Parecer Qualitativo</th>
                        <th className="p-3">Apreciação Individualizada da Docente</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {academicReport.map((rep, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3 font-bold text-slate-900">{rep.subject}</td>
                          <td className="p-3 text-center font-semibold text-slate-700">{rep.maker}%</td>
                          <td className="p-3 text-center font-semibold text-slate-700">{rep.formative}%</td>
                          <td className="p-3 text-center font-semibold text-slate-700">{rep.summative}%</td>
                          <td className="p-3 text-center font-extrabold text-sm text-slate-900">
                            {rep.finalAverage}%
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                rep.assessment === 'Excelente'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-sky-100 text-sky-800'
                              }`}
                            >
                              {rep.assessment}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600 leading-relaxed max-w-xs">{rep.feedback}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PILAR 2: PAINEL FINANCEIRO, PROPINAS & FATURAÇÃO                          */}
          {/* ========================================================================= */}
          {activeSection === 'finance' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold font-['Quicksand'] text-slate-900">
                    Painel Financeiro, Propinas & Faturação Certificada (Kz)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Documentos fiscais comunicados à Administração Geral Tributária (AGT) com assinatura digital
                  </p>
                </div>

                {/* Ações Rápidas Financeiras */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setTaxDeclarationModal(true)}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Declaração AGT 2024</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMultibancoModal(true)}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>2ª Via Multicaixa / MCX</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIbanModal(true)}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Alterar IBAN (AO06)</span>
                  </button>
                </div>
              </div>

              {/* Tabela de Histórico de Liquidações */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">
                    Histórico de Mensalidades & Documentos Fiscais (Kz)
                  </h4>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    Todas Liquidadas
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3.5">Fatura Certificada</th>
                        <th className="p-3.5">Descrição</th>
                        <th className="p-3.5">Valor Liquidado (Kz)</th>
                        <th className="p-3.5">Método de Liquidação</th>
                        <th className="p-3.5">Data de Liquidação</th>
                        <th className="p-3.5 text-right">Recibo Oficial AGT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {financialHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3.5 font-bold font-mono text-slate-900">{item.ref}</td>
                          <td className="p-3.5 text-slate-700">{item.desc}</td>
                          <td className="p-3.5 font-extrabold text-slate-900">Kz {item.amount.toLocaleString('pt-PT')},00</td>
                          <td className="p-3.5 text-slate-600">{item.method}</td>
                          <td className="p-3.5 text-slate-500">{item.date}</td>
                          <td className="p-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => setReceiptPreviewRecord(item)}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-[#8c4f00] font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                            >
                              <Printer className="w-3 h-3" />
                              <span>Recibo AGT (PDF)</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PILAR 3: CANAL DIRETO DE COMUNICAÇÃO SEGURA                               */}
          {/* ========================================================================= */}
          {activeSection === 'comms' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold font-['Quicksand'] text-slate-900">
                    Canal Direto de Comunicação Segura • Segmentado por Polos
                  </h3>
                  <p className="text-xs text-slate-500">
                    Diálogo direto com a Professora Titular, Coordenação Pedagógica e Secretaria Geral
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setNewMessageModal(true)}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#00a6c0] hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Nova Mensagem Encriptada</span>
                </button>
              </div>

              {/* Feed Segmentado */}
              <div className="space-y-3">
                {messagesList.map((msg) => (
                  <div
                    key={msg.id}
                    className={`bg-white p-5 rounded-2xl border shadow-xs space-y-2.5 transition-all ${
                      msg.unread ? 'border-amber-300 ring-2 ring-amber-100/60' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {msg.senderRole}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">{msg.senderName}</h4>
                      </div>
                      <span className="text-xs text-slate-400 font-semibold">{msg.date}</span>
                    </div>

                    <p className="font-bold text-xs text-slate-800">{msg.subject}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{msg.preview}</p>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          showToast(`Resposta rápida aberta para ${msg.senderName}.`);
                        }}
                        className="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-[#00a6c0] font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Responder à Mensagem</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PILAR 4: AUTORIZAÇÕES DIGITAIS COM VALIDADE JURÍDICA (eIDAS & RGPD)       */}
          {/* ========================================================================= */}
          {activeSection === 'authorizations' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base font-bold font-['Quicksand'] text-slate-900">
                  Autorizações Digitais de Saída & Consentimentos (eIDAS & RGPD)
                </h3>
                <p className="text-xs text-slate-500">
                  Assinaturas digitais juridicamente vinculativas com registo de hash criptográfico
                </p>
              </div>

              {/* Cartão de Destaque Urgente (Visita Pedagógica) */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  urgentAuth.signed
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : 'bg-white border-rose-300 ring-2 ring-rose-100 shadow-md'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        urgentAuth.signed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {urgentAuth.signed ? 'Assinado Digitalmente' : 'Consentimento Pendente'}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">{urgentAuth.title}</h4>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">{urgentAuth.date}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3 text-xs text-slate-700">
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="font-bold block text-slate-900 mb-0.5">Transporte:</span>
                    {urgentAuth.transport}
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="font-bold block text-slate-900 mb-0.5">Alimentação:</span>
                    {urgentAuth.meal}
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="font-bold block text-slate-900 mb-0.5">Salvaguardas Médicas:</span>
                    {urgentAuth.medicalCheck}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {urgentAuth.signed ? (
                    <span className="text-xs text-emerald-800 font-mono font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Hash eIDAS: {urgentAuth.hash}
                    </span>
                  ) : (
                    <span className="text-xs text-rose-700 font-semibold">
                      Atenção: A falta de assinatura impede a participação do educando na visita.
                    </span>
                  )}

                  {!urgentAuth.signed && (
                    <button
                      type="button"
                      onClick={() => setSignAuthorizationModal(true)}
                      className="px-4 py-2 bg-[#ed145b] text-white rounded-xl text-xs font-bold hover:bg-pink-600 transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Assinar Digitalmente Agora</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Histórico de Autorizações Assinadas */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <h4 className="font-bold text-sm text-slate-900">
                  Histórico de Autorizações Assinadas & Consentimentos
                </h4>

                <div className="divide-y divide-slate-100 text-xs">
                  {signedAuthHistory.map((item) => (
                    <div key={item.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-900">{item.title}</p>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Assinado por {item.signer} • {item.date}
                        </p>
                      </div>
                      <span className="font-mono text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                        {item.hash}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ASSINATURA DIGITAL (PIN / BIOMETRIA) COM VALIDADE JURÍDICA        */}
      {/* ========================================================================= */}
      {signAuthorizationModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="sign-modal-title"
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#ed145b]" />
                <h3 id="sign-modal-title" className="font-bold text-sm text-slate-900 font-['Quicksand']">
                  Assinatura Digital de Consentimento
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSignAuthorizationModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                aria-label="Fechar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Está a autorizar a deslocação de <strong>{activeChild.name}</strong> para a <strong>{urgentAuth.title}</strong> no dia 14 de Março de 2025.
            </p>

            <form onSubmit={handleSignAuthorization} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Código PIN de Segurança do Encarregado (4 dígitos)
                </label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="••••"
                  className="w-full text-center text-lg tracking-widest p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#ed145b]"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500">
                A aposição do PIN gera um carimbo temporal e hash criptográfico nos termos do Regulamento eIDAS da União Europeia.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSignAuthorizationModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ed145b] text-white rounded-xl font-bold hover:bg-pink-600 flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Validar e Assinar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: BOLETIM ESCOLAR OFICIAL EM PDF                                    */}
      {/* ========================================================================= */}
      {reportCardModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#fd9924]" />
                <h3 id="report-modal-title" className="font-bold text-sm text-slate-900 font-['Quicksand']">
                  Boletim Trimestral Oficial (PDF)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReportCardModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-1.5">
              <p className="font-bold text-slate-900 text-sm">
                Boletim_Oficial_{activeChild.name.replace(/\s+/g, '_')}_2ºTrimestre_2024-2025.pdf
              </p>
              <p className="text-slate-600">Turma: {activeChild.classroom} • Média Ponderada: {activeChild.averageGrade}%</p>
              <p className="text-emerald-700 font-semibold">Chave de Homologação Pedagógica Válida</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReportCardModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Boletim oficial em PDF descarregado com sucesso.');
                  setReportCardModal(false);
                }}
                className="px-4 py-2 bg-[#fd9924] text-white rounded-xl font-bold text-xs hover:bg-amber-600 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descarregar Boletim PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DECLARAÇÃO DE DESPESAS DE EDUCAÇÃO PARA A AGT 2024               */}
      {/* ========================================================================= */}
      {taxDeclarationModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="tax-modal-title"
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 id="tax-modal-title" className="font-bold text-sm text-slate-900 font-['Quicksand']">
                  Declaração Anual de Propinas & Despesas (AGT 2024)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTaxDeclarationModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-2">
              <p className="font-bold text-slate-900">Declaracao_Despesas_Educacao_AGT_2024.pdf</p>
              <p className="text-slate-600">
                Total Faturado e Comunicado à AGT em 2024: <strong>1.500.000,00 Kz</strong>
              </p>
              <p className="text-slate-500 text-[11px]">
                NIF do Encarregado: 218 409 382 (Dr. António Ferreira Silva)
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTaxDeclarationModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Declaração fiscal de educação (AGT) descarregada com sucesso.');
                  setTaxDeclarationModal(false);
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descarregar Certidão AGT</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: 2ª VIA MULTIBANCO / MB WAY                                       */}
      {/* ========================================================================= */}
      {multibancoModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mb-modal-title"
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 id="mb-modal-title" className="font-bold text-sm text-slate-900 font-['Quicksand']">
                Emissão de Referência Multicaixa / MCX Express
              </h3>
              <button
                type="button"
                onClick={() => setMultibancoModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Entidade:</span>
                <span className="font-bold font-mono text-slate-900">00192 (EMIS)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Referência:</span>
                <span className="font-bold font-mono text-slate-900">829 102 918</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Montante:</span>
                <span className="font-bold text-slate-900">150.000,00 Kz</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMultibancoModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Notificação enviada para o seu aplicativo Multicaixa Express.');
                  setMultibancoModal(false);
                }}
                className="px-4 py-2 bg-amber-500 text-white rounded-xl font-bold text-xs hover:bg-amber-600 flex items-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Pagar com Multicaixa Express</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ALTERAÇÃO DE IBAN SEPA                                           */}
      {/* ========================================================================= */}
      {ibanModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="iban-modal-title"
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 id="iban-modal-title" className="font-bold text-sm text-slate-900 font-['Quicksand']">
                Atualizar IBAN para Débito em Conta Bancária
              </h3>
              <button
                type="button"
                onClick={() => setIbanModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast('Novo IBAN registado com sucesso para as próximas cobranças.');
                setIbanModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">Novo IBAN (Angola - AO06)</label>
                <input
                  type="text"
                  required
                  defaultValue="AO06 0040 0000 8291 0281 9283 1"
                  className="w-full p-2.5 font-mono text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#fd9924]"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500">
                A alteração entra em vigor no ciclo de faturação subsequente após validação com a entidade bancária.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIbanModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#fd9924] text-white rounded-xl font-bold hover:bg-amber-600"
                >
                  Confirmar Novo IBAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: RECIBO OFICIAL CERTIFICADO AT                                    */}
      {/* ========================================================================= */}
      {receiptPreviewRecord && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="rec-modal-title"
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 id="rec-modal-title" className="font-bold text-sm text-slate-900 font-['Quicksand']">
                Recibo de Quitação Certificado (AGT / Geral)
              </h3>
              <button
                type="button"
                onClick={() => setReceiptPreviewRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-1.5">
              <p className="font-bold text-slate-900">{receiptPreviewRecord.ref}</p>
              <p className="text-slate-600">{receiptPreviewRecord.desc}</p>
              <p className="text-slate-900 font-bold">Valor: {receiptPreviewRecord.amount.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</p>
              <p className="text-emerald-700 font-semibold">Liquidado via {receiptPreviewRecord.method}</p>
              <p className="text-slate-400 font-mono text-[10px]">Hash Fiscal: AGT-48192-2025</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReceiptPreviewRecord(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Recibo impresso em formato oficial certificado.');
                  setReceiptPreviewRecord(null);
                }}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir / PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: NOVA MENSAGEM ENCRIPTADA                                         */}
      {/* ========================================================================= */}
      {newMessageModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="msg-modal-title"
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 id="msg-modal-title" className="font-bold text-sm text-slate-900 font-['Quicksand']">
                Enviar Mensagem Encriptada
              </h3>
              <button
                type="button"
                onClick={() => setNewMessageModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast('Mensagem enviada com sucesso com encriptação e conformidade RGPD.');
                setNewMessageModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">Destinatário Institucional</label>
                <select className="w-full p-2.5 rounded-xl border border-slate-200 bg-white">
                  <option>Profª Maria Clara Marques (Educadora Titular - Jardim de Infância)</option>
                  <option>Prof. Carlos Esteves (Coordenação Pedagógica)</option>
                  <option>Dra. Manuela Castro (Secretaria Geral)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assunto</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dúvida sobre o trabalho da Feira da Ciência"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00a6c0]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mensagem</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Escreva a mensagem confidencial..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#00a6c0]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewMessageModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00a6c0] text-white rounded-xl font-bold hover:bg-sky-700 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
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
