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
  ArrowLeft,
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
  developmentStatus: string;
  financialStatus: 'Regularizada' | 'Pendente';
  newMessagesCount: number;
}

export interface GuardianObservation {
  id: string;
  childId: string;
  date: string;
  category: 'Alimentação & Apetite' | 'Soninho & Repouso' | 'Desenvolvimento Motor' | 'Linguagem & Expressão' | 'Adaptação & Emoções' | 'Higiene & Cuidados';
  icon: string;
  priority: 'Conquista / Marco' | 'Rotina' | 'Importante';
  title: string;
  text: string;
  recordedBy: string;
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
      leadTeacher: 'Tia Clara Marques (Educadora de Infância)',
      avatarLetter: 'R',
      status: 'Presente na Atividade da Horta & Expressão',
      presenceRate: 98.2,
      developmentStatus: 'Pleno & Autônomo',
      financialStatus: 'Regularizada',
      newMessagesCount: 1
    },
    {
      id: 'sofia-silva',
      name: 'Sofia Silva',
      classroom: 'Maternal I - Sala dos Primeiros Passos',
      cycle: 'Maternal I & II (1 a 2 anos)',
      leadTeacher: 'Tia Teresa Melo (Educadora de Infância)',
      avatarLetter: 'S',
      status: 'Em Atividade Sensorial no Pátio',
      presenceRate: 99.0,
      developmentStatus: 'Adaptação Serena & Afetuosa',
      financialStatus: 'Regularizada',
      newMessagesCount: 0
    }
  ];

  const [activeChildId, setActiveChildId] = useState('rodrigo-silva');
  const activeChild = childrenList.find((c) => c.id === activeChildId) || childrenList[0];
  const [obsCategoryFilter, setObsCategoryFilter] = useState<string>('todas');

  // Observações Carinhosas das Tias (Sem notas nem pautas numéricas)
  const childObservations: GuardianObservation[] = [
    // Rodrigo Silva (Tia Clara)
    {
      id: 'g-obs-1',
      childId: 'rodrigo-silva',
      date: 'Hoje, às 12:30',
      category: 'Alimentação & Apetite',
      icon: '🍎',
      priority: 'Conquista / Marco',
      title: 'Almoço com excelente autonomia e apetite',
      text: 'O Rodrigo comeu com muito gosto toda a sopa de legumes biológicos e o peixinho fresco. Segurou os talheres com firmeza, bebeu o sumo natural e levou o pratinho à bancada com orgulho.',
      recordedBy: 'Tia Clara Marques (Educadora Titular)'
    },
    {
      id: 'g-obs-2',
      childId: 'rodrigo-silva',
      date: 'Hoje, às 10:15',
      category: 'Linguagem & Expressão',
      icon: '💬',
      priority: 'Rotina',
      title: 'Expressão oral rica na roda de histórias',
      text: 'Participou ativamente na roda da manhã. Expressou-se com vocabulário rico, partilhou as vivências em família com os amiguinhos e cantou as cantigas de roda gesticulando alegremente.',
      recordedBy: 'Tia Clara Marques (Educadora Titular)'
    },
    {
      id: 'g-obs-3',
      childId: 'rodrigo-silva',
      date: 'Ontem, às 15:40',
      category: 'Desenvolvimento Motor',
      icon: '🏃',
      priority: 'Conquista / Marco',
      title: 'Superação no circuito psicomotor de equilíbrio',
      text: 'Completou o percurso com blocos de madeira e saltou com os dois pezinhos juntos com muita segurança. Demonstrou coordenação motora ampla exemplar e incentivou os colegas.',
      recordedBy: 'Tia Clara Marques (Educadora Titular)'
    },
    {
      id: 'g-obs-4',
      childId: 'rodrigo-silva',
      date: 'Ontem, às 13:30',
      category: 'Soninho & Repouso',
      icon: '😴',
      priority: 'Rotina',
      title: 'Soneca tranquila de 1h30',
      text: 'Dormiu um sono tranquilo e reparador no ambiente climatizado ao som de música instrumental relaxante. Acordou bem disposto e com sorriso nos lábios.',
      recordedBy: 'Tia Clara Marques (Educadora Titular)'
    },
    {
      id: 'g-obs-5',
      childId: 'rodrigo-silva',
      date: '04 de Outubro, às 11:00',
      category: 'Adaptação & Emoções',
      icon: '❤️',
      priority: 'Conquista / Marco',
      title: 'Empatia e cooperação exemplar na horta',
      text: 'Ajudou os colegas a regar as mudinhas de alface na horta agroecológica com regador pequeno e partilhou os materiais com muita generosidade e carinho.',
      recordedBy: 'Tia Clara Marques (Educadora Titular)'
    },
    // Sofia Silva (Tia Teresa)
    {
      id: 'g-obs-6',
      childId: 'sofia-silva',
      date: 'Hoje, às 09:30',
      category: 'Adaptação & Emoções',
      icon: '❤️',
      priority: 'Conquista / Marco',
      title: 'Chegada carinhosa sem choro no Maternal',
      text: 'Chegou sorridente, deu um abraço apertadinho na Tia Teresa e foi diretamente para o tapete sensorial explorar os blocos de tecido e texturas com curiosidade.',
      recordedBy: 'Tia Teresa Melo (Educadora de Infância)'
    },
    {
      id: 'g-obs-7',
      childId: 'sofia-silva',
      date: 'Hoje, às 10:00',
      category: 'Alimentação & Apetite',
      icon: '🍎',
      priority: 'Rotina',
      title: 'Aceitação plena da frutinha fresca amassada',
      text: 'Aceitou com muita alegria toda a porção de banana raspadinha com aveia e tomou 160ml de leite materno. Excelente hidratação durante a manhã.',
      recordedBy: 'Tia Teresa Melo (Educadora de Infância)'
    },
    {
      id: 'g-obs-8',
      childId: 'sofia-silva',
      date: 'Ontem, às 16:00',
      category: 'Desenvolvimento Motor',
      icon: '🏃',
      priority: 'Conquista / Marco',
      title: 'Passinhos firmes empurrando o carrinho',
      text: 'Deu vários passinhos firmes empurrando o carrinho de madeira de apoio! Riu muito, bateu palmas e manteve o equilíbrio com auxílio afetuoso da Tia.',
      recordedBy: 'Tia Teresa Melo (Educadora de Infância)'
    },
    {
      id: 'g-obs-9',
      childId: 'sofia-silva',
      date: 'Ontem, às 11:15',
      category: 'Soninho & Repouso',
      icon: '😴',
      priority: 'Rotina',
      title: 'Soneca matinal de 50 minutos',
      text: 'Adormeceu suavemente com a sua mantinha favorita. Respiração serena e temperatura normal aferida de 36.5°C.',
      recordedBy: 'Tia Teresa Melo (Educadora de Infância)'
    }
  ];

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
      senderRole: 'Educadora Titular (Tia Clara)',
      senderName: 'Tia Clara Marques (Educadora)',
      date: 'Hoje, às 10:45',
      subject: 'Elogio Especial: Participação exemplar na Horta Pedagógica',
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
      className="bg-[#fff8f5] text-[#211a14] w-full flex-1 flex flex-col overflow-hidden font-['Nunito_Sans'] antialiased min-h-0"
    >
      {/* ========================================================================= */}
      {/* 1. TOPNAVBAR: IDENTIFICAÇÃO DO ENCARREGADO & CONTEXTO DO EDUCANDO ATIVO  */}
      {/* ========================================================================= */}
      <header
        className="bg-white border-b border-[#eee0d6] px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 z-20"
        role="banner"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#fd9924] flex items-center justify-center font-bold shadow-xs shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-bold font-['Quicksand'] text-[#211a14] leading-tight">
                Portal dos Encarregados de Educação & Tutores
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-[#8c4f00] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Sessão Segura Encriptada
              </span>
              <span className="text-[10px] font-semibold bg-[#faebe1] text-[#5c3f42] px-2 py-0.5 rounded border border-[#eee0d6]">
                RGPD • WCAG 2.1 AA
              </span>
            </div>
            <p className="text-[11px] text-[#5c3f42] mt-0.5">
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
            className="relative p-2 rounded-xl text-[#5c3f42] hover:bg-[#faebe1] transition-colors"
            aria-label="Mensagens e Notificações"
          >
            <Send className="w-4 h-4 text-[#5c3f42]" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ed145b] rounded-full ring-2 ring-white" />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-[#5c3f42] hover:text-[#211a14] hover:bg-[#faebe1] transition-colors flex items-center gap-1.5 text-xs font-bold ml-1"
              aria-label="Voltar ao Website"
              title="Voltar ao Website"
            >
              <ArrowLeft className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Voltar ao Website</span>
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
              <h2 className="text-base font-bold font-['Quicksand'] text-[#211a14] leading-tight">
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
            <p className="text-xs text-[#5c3f42] mt-1">
              Educadora Titular (Tia): <strong>{activeChild.leadTeacher}</strong> • {activeChild.cycle}
            </p>

            {/* Alternador de Irmãos */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] font-semibold text-[#5c3f42]">Irmãos Matriculados:</span>
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
                      : 'bg-white border border-[#eee0d6] text-[#5c3f42] hover:border-amber-400'
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
            <span className="text-[11px] text-[#5c3f42] block font-semibold">Taxa de Presença</span>
            <p className="text-lg font-bold font-['Quicksand'] text-emerald-700 mt-0.5">
              {activeChild.presenceRate}%
            </p>
            <span className="text-[10px] text-[#8c6b6d]">0 faltas injustificadas</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-amber-200/80 shadow-2xs">
            <span className="text-[11px] text-[#5c3f42] block font-semibold">Desenvolvimento</span>
            <p className="text-sm font-bold font-['Quicksand'] text-[#00a6c0] mt-1 leading-tight truncate">
              {activeChild.developmentStatus}
            </p>
            <span className="text-[10px] text-sky-700 font-bold">Acompanhado pelas Tias</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-amber-200/80 shadow-2xs">
            <span className="text-[11px] text-[#5c3f42] block font-semibold">Situação Financeira</span>
            <p className="text-lg font-bold font-['Quicksand'] text-emerald-700 mt-0.5">
              Regularizada
            </p>
            <span className="text-[10px] text-[#8c6b6d]">Multicaixa Express Ativo</span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-amber-200/80 shadow-2xs">
            <span className="text-[11px] text-[#5c3f42] block font-semibold">Comunicação</span>
            <p className="text-lg font-bold font-['Quicksand'] text-[#ed145b] mt-0.5">
              {activeChild.newMessagesCount} Nova
            </p>
            <span className="text-[10px] text-pink-700 font-bold">Educadora (Tia)</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. BODY LAYOUT: SIDENAVBAR + PAINÉIS FUNCIONAIS                           */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* SideNavBar Lateral */}
        <nav
          className="w-full md:w-64 bg-white text-[#5c3f42] p-3 sm:p-4 flex md:flex-col justify-between shrink-0 overflow-x-auto md:overflow-y-auto border-r border-[#eee0d6]"
          aria-label="Módulos do encarregado de educação"
        >
          <div className="flex md:flex-col gap-1 w-full">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#8c6b6d] px-3 py-1.5 hidden md:block">
              Área do Encarregado
            </span>

            <button
              type="button"
              onClick={() => setActiveSection('overview')}
              className={`min-h-[42px] w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all text-left whitespace-nowrap cursor-pointer ${
                activeSection === 'overview'
                  ? 'bg-[#fd9924] text-white shadow-md shadow-amber-500/20'
                  : 'text-[#5c3f42] hover:bg-[#fff1e7] hover:text-[#211a14]'
              }`}
            >
              <Smile className="w-4 h-4 shrink-0" />
              <span>Visão Integrada</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('routine')}
              className={`min-h-[42px] w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all text-left whitespace-nowrap cursor-pointer ${
                activeSection === 'routine'
                  ? 'bg-[#fd9924] text-white shadow-md shadow-amber-500/20'
                  : 'text-[#5c3f42] hover:bg-[#fff1e7] hover:text-[#211a14]'
              }`}
            >
              <Heart className="w-4 h-4 shrink-0" />
              <span>Rotina & Observações da Tia</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('finance')}
              className={`min-h-[42px] w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all text-left whitespace-nowrap cursor-pointer ${
                activeSection === 'finance'
                  ? 'bg-[#fd9924] text-white shadow-md shadow-amber-500/20'
                  : 'text-[#5c3f42] hover:bg-[#fff1e7] hover:text-[#211a14]'
              }`}
            >
              <DollarSign className="w-4 h-4 shrink-0" />
              <span>Propinas & Faturação</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('comms')}
              className={`min-h-[42px] w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all text-left whitespace-nowrap cursor-pointer ${
                activeSection === 'comms'
                  ? 'bg-[#fd9924] text-white shadow-md shadow-amber-500/20'
                  : 'text-[#5c3f42] hover:bg-[#fff1e7] hover:text-[#211a14]'
              }`}
            >
              <Send className="w-4 h-4 shrink-0" />
              <span>Canal Direto de Comunicação</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('authorizations')}
              className={`min-h-[42px] w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all text-left whitespace-nowrap cursor-pointer ${
                activeSection === 'authorizations'
                  ? 'bg-[#fd9924] text-white shadow-md shadow-amber-500/20'
                  : 'text-[#5c3f42] hover:bg-[#fff1e7] hover:text-[#211a14]'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Autorizações Digitais (eIDAS)</span>
            </button>
          </div>

          <div className="pt-3 border-t border-[#eee0d6] hidden md:block">
            <div className="p-2.5 rounded-xl bg-[#faebe1] text-[11px] space-y-1 border border-[#eee0d6]">
              <p className="font-bold text-[#211a14]">Proteção de Dados do Menor</p>
              <p className="text-[#5c3f42]">
                Acesso encriptado auditado em conformidade com o RGPD.
              </p>
            </div>
          </div>
        </nav>

        {/* Main Workspace Area */}
        <main
          className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 bg-[#fff8f5] focus:outline-none"
          tabIndex={-1}
        >
          {/* Toast Notification */}
          {toastMessage && (
            <div
              role="status"
              aria-live="polite"
              className="p-3.5 bg-[#211a14] text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 border border-[#5c3f42] animate-in fade-in slide-in-from-top-2"
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
                <div className="bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-['Quicksand'] font-bold text-sm text-[#211a14] flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#fd9924]" />
                      <span>Registo de Assiduidade de Hoje</span>
                    </h3>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      Entrada às 08:24
                    </span>
                  </div>

                  <div className="p-3 bg-[#fff8f5] rounded-xl border border-[#eee0d6] text-xs space-y-1.5">
                    <p className="font-bold text-[#211a14]">Portaria Central • Validação Biométrica</p>
                    <p className="text-[#5c3f42]">
                      Chegada acolhedora às 08:24 com apresentação do cartão escolar seguro.
                    </p>
                    <p className="text-[#5c3f42]">
                      Almoço servido às 12:15 com porção integral de peixe e salada da horta.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveSection('routine')}
                    className="text-xs font-bold text-[#fd9924] hover:underline flex items-center gap-1"
                  >
                    <span>Ver rotina diária e observações da Tia</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Próxima Cobrança Agendada */}
                <div className="bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-['Quicksand'] font-bold text-sm text-[#211a14] flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#00a6c0]" />
                      <span>Próxima Cobrança Agendada</span>
                    </h3>
                    <span className="text-[11px] font-bold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full">
                      Multicaixa Express
                    </span>
                  </div>

                  <div className="p-3 bg-[#fff8f5] rounded-xl border border-[#eee0d6] text-xs space-y-1">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-[#211a14]">Mensalidade Escolar - Março de 2025</span>
                      <span className="text-base text-[#211a14]">150.000,00 Kz</span>
                    </div>
                    <p className="text-[#5c3f42]">Vencimento a 08/03/2025 via Multicaixa / Débito em Conta</p>
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
          {/* PILAR 1: ACOMPANHAMENTO DE ROTINA & OBSERVAÇÕES DA TIA                    */}
          {/* ========================================================================= */}
          {activeSection === 'routine' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold font-['Quicksand'] text-[#211a14]">
                    Acompanhamento de Rotina & Observações da Tia • {activeChild.name}
                  </h3>
                  <p className="text-xs text-[#5c3f42]">
                    Assiduidade com confirmação biométrica, refeições biológicas e pareceres qualitativos da Educadora (Tia)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setReportCardModal(true)}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#fd9924] text-white hover:bg-amber-600 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-95 shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download do Relatório de Desenvolvimento (PDF)</span>
                </button>
              </div>

              {/* Assiduidade Semanal Cronológica */}
              <div className="bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs space-y-3">
                <h4 className="font-bold text-sm text-[#211a14] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Registo Diário Cronológico da Semana</span>
                </h4>

                <div className="divide-y divide-[#eee0d6] text-xs">
                  {routineHistory.map((item, idx) => (
                    <div key={idx} className="py-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <span className="font-bold text-[#211a14] w-44">{item.day}</span>
                      <span className="text-[#5c3f42] flex-1">{item.entry}</span>
                      <span className="text-[#5c3f42] flex-1">{item.meal}</span>
                      <span className="text-[#00a6c0] font-semibold flex-1">{item.activity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diário de Desenvolvimento & Observações Carinhosas da Tia (Sem notas numéricas) */}
              <div className="bg-white rounded-2xl border border-[#eee0d6] p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#eee0d6]">
                  <div>
                    <h4 className="font-bold text-sm text-[#211a14] flex items-center gap-2 font-['Quicksand']">
                      <Heart className="w-4 h-4 text-[#ed145b] fill-[#ed145b]" />
                      <span>Diário de Desenvolvimento & Observações da Educadora</span>
                    </h4>
                    <p className="text-xs text-[#5c3f42] mt-0.5">
                      Registos qualitativos e afetuosos realizados pela {activeChild.leadTeacher}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#ed145b] bg-pink-50 border border-pink-200 px-3 py-1 rounded-full self-start sm:self-auto">
                    {childObservations.filter((o) => o.childId === activeChild.id).length} Observações Registadas
                  </span>
                </div>

                {/* Aviso Pedagógico Explicativo da Creche */}
                <div className="p-3.5 bg-gradient-to-r from-pink-50 to-amber-50 border border-pink-200/80 rounded-2xl text-xs text-[#5c3f42] flex items-start gap-2.5">
                  <span className="text-lg leading-none shrink-0">🌸</span>
                  <div className="leading-relaxed">
                    <strong className="text-[#211a14] block mb-0.5">Metodologia Afetuosa da Creche Mayelin:</strong>
                    Na nossa creche e educação infantil <strong>não existem notas nem pautas numéricas</strong>. O progresso de cada criança é acompanhado de forma contínua e humanizada através das observações atentas das Tias sobre alimentação, soninho, motricidade, autonomia e socialização.
                  </div>
                </div>

                {/* Filtro por Categoria de Observação */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
                  {[
                    { id: 'todas', label: 'Todas as Observações', icon: '📝' },
                    { id: 'Alimentação & Apetite', label: 'Alimentação', icon: '🍎' },
                    { id: 'Soninho & Repouso', label: 'Soninho', icon: '😴' },
                    { id: 'Desenvolvimento Motor', label: 'Motricidade', icon: '🏃' },
                    { id: 'Linguagem & Expressão', label: 'Linguagem', icon: '💬' },
                    { id: 'Adaptação & Emoções', label: 'Afeto & Emoções', icon: '❤️' }
                  ].map((cat) => {
                    const count = cat.id === 'todas'
                      ? childObservations.filter((o) => o.childId === activeChild.id).length
                      : childObservations.filter((o) => o.childId === activeChild.id && o.category === cat.id).length;

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
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${obsCategoryFilter === cat.id ? 'bg-white/20 text-white' : 'bg-pink-100 text-[#ed145b]'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Lista de Cards de Observações */}
                <div className="space-y-3 pt-1">
                  {childObservations
                    .filter((obs) => obs.childId === activeChild.id)
                    .filter((obs) => obsCategoryFilter === 'todas' || obs.category === obsCategoryFilter)
                    .map((obs) => (
                      <div
                        key={obs.id}
                        className="p-4 sm:p-5 rounded-2xl bg-white border border-[#eee0d6] hover:border-pink-200 transition-all space-y-2.5 shadow-2xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{obs.icon}</span>
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
                              {obs.priority === 'Conquista / Marco' ? '🌟 Conquista' : obs.priority === 'Importante' ? '⚠️ Importante' : '🌱 Diário de Rotina'}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#8c6b6d] font-semibold">
                            {obs.date}
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
                            <span>Observação escrita com amor por <strong>{obs.recordedBy}</strong></span>
                          </span>

                          <button
                            type="button"
                            onClick={() => setNewMessageModal(true)}
                            className="text-[#00a6c0] hover:text-sky-700 font-bold hover:underline cursor-pointer flex items-center gap-1 text-[11px]"
                          >
                            <Send className="w-3 h-3" />
                            <span>Enviar mensagem à Tia</span>
                          </button>
                        </div>
                      </div>
                    ))}

                  {childObservations
                    .filter((obs) => obs.childId === activeChild.id)
                    .filter((obs) => obsCategoryFilter === 'todas' || obs.category === obsCategoryFilter).length === 0 && (
                    <div className="p-6 text-center bg-[#fff8f5] rounded-2xl border border-[#eee0d6] text-xs text-[#5c3f42]">
                      Nenhuma observação registada para esta categoria.
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
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold font-['Quicksand'] text-[#211a14]">
                    Painel Financeiro, Propinas & Faturação Certificada (Kz)
                  </h3>
                  <p className="text-xs text-[#5c3f42]">
                    Documentos fiscais comunicados à Administração Geral Tributária (AGT) com assinatura digital
                  </p>
                </div>

                {/* Ações Rápidas Financeiras */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setTaxDeclarationModal(true)}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#211a14] hover:bg-[#382b22] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
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
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#faebe1] hover:bg-[#f4e6db] text-[#211a14] font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Alterar IBAN (AO06)</span>
                  </button>
                </div>
              </div>

              {/* Tabela de Histórico de Liquidações */}
              <div className="bg-white rounded-2xl border border-[#eee0d6] overflow-hidden shadow-xs">
                <div className="p-4 bg-[#fff8f5] border-b border-[#eee0d6] flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#211a14]">
                    Histórico de Mensalidades & Documentos Fiscais (Kz)
                  </h4>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    Todas Liquidadas
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#fff8f5] border-b border-[#eee0d6] text-[#5c3f42] font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3.5">Fatura Certificada</th>
                        <th className="p-3.5">Descrição</th>
                        <th className="p-3.5">Valor Liquidado (Kz)</th>
                        <th className="p-3.5">Método de Liquidação</th>
                        <th className="p-3.5">Data de Liquidação</th>
                        <th className="p-3.5 text-right">Recibo Oficial AGT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eee0d6]">
                      {financialHistory.map((item) => (
                        <tr key={item.id} className="hover:bg-[#fff1e7]/70 transition-colors">
                          <td className="p-3.5 font-bold font-mono text-[#211a14]">{item.ref}</td>
                          <td className="p-3.5 text-[#5c3f42]">{item.desc}</td>
                          <td className="p-3.5 font-extrabold text-[#211a14]">Kz {item.amount.toLocaleString('pt-PT')},00</td>
                          <td className="p-3.5 text-[#5c3f42]">{item.method}</td>
                          <td className="p-3.5 text-[#5c3f42]">{item.date}</td>
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
                  <h3 className="text-base font-bold font-['Quicksand'] text-[#211a14]">
                    Canal Direto de Comunicação Segura • Segmentado por Polos
                  </h3>
                  <p className="text-xs text-[#5c3f42]">
                    Diálogo direto com a Tia (Educadora Titular), Coordenação Pedagógica e Secretaria Geral
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
                      msg.unread ? 'border-amber-300 ring-2 ring-amber-100/60' : 'border-[#eee0d6]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#faebe1] text-[#5c3f42]">
                          {msg.senderRole}
                        </span>
                        <h4 className="font-bold text-sm text-[#211a14]">{msg.senderName}</h4>
                      </div>
                      <span className="text-xs text-[#8c6b6d] font-semibold">{msg.date}</span>
                    </div>

                    <p className="font-bold text-xs text-[#211a14]">{msg.subject}</p>
                    <p className="text-xs text-[#5c3f42] leading-relaxed">{msg.preview}</p>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eee0d6]">
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
                <h3 className="text-base font-bold font-['Quicksand'] text-[#211a14]">
                  Autorizações Digitais de Saída & Consentimentos (eIDAS & RGPD)
                </h3>
                <p className="text-xs text-[#5c3f42]">
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#eee0d6]/60">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        urgentAuth.signed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {urgentAuth.signed ? 'Assinado Digitalmente' : 'Consentimento Pendente'}
                    </span>
                    <h4 className="font-bold text-sm text-[#211a14]">{urgentAuth.title}</h4>
                  </div>
                  <span className="text-xs text-[#5c3f42] font-semibold">{urgentAuth.date}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3 text-xs text-[#5c3f42]">
                  <div className="p-2.5 bg-[#fff8f5] rounded-xl">
                    <span className="font-bold block text-[#211a14] mb-0.5">Transporte:</span>
                    {urgentAuth.transport}
                  </div>
                  <div className="p-2.5 bg-[#fff8f5] rounded-xl">
                    <span className="font-bold block text-[#211a14] mb-0.5">Alimentação:</span>
                    {urgentAuth.meal}
                  </div>
                  <div className="p-2.5 bg-[#fff8f5] rounded-xl">
                    <span className="font-bold block text-[#211a14] mb-0.5">Salvaguardas Médicas:</span>
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
              <div className="bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs space-y-3">
                <h4 className="font-bold text-sm text-[#211a14]">
                  Histórico de Autorizações Assinadas & Consentimentos
                </h4>

                <div className="divide-y divide-[#eee0d6] text-xs">
                  {signedAuthHistory.map((item) => (
                    <div key={item.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <p className="font-bold text-[#211a14]">{item.title}</p>
                        <p className="text-[#5c3f42] text-[11px] mt-0.5">
                          Assinado por {item.signer} • {item.date}
                        </p>
                      </div>
                      <span className="font-mono text-[11px] bg-[#faebe1] text-[#5c3f42] px-2.5 py-1 rounded-md">
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#ed145b]" />
                <h3 id="sign-modal-title" className="font-bold text-sm text-[#211a14] font-['Quicksand']">
                  Assinatura Digital de Consentimento
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSignAuthorizationModal(false)}
                className="p-1 rounded-lg text-[#8c6b6d] hover:text-[#5c3f42]"
                aria-label="Fechar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#5c3f42] leading-relaxed">
              Está a autorizar a deslocação de <strong>{activeChild.name}</strong> para a <strong>{urgentAuth.title}</strong> no dia 14 de Março de 2025.
            </p>

            <form onSubmit={handleSignAuthorization} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">
                  Código PIN de Segurança do Encarregado (4 dígitos)
                </label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="••••"
                  className="w-full text-center text-lg tracking-widest p-2.5 rounded-xl border border-[#eee0d6] focus:outline-none focus:border-[#ed145b]"
                />
              </div>

              <div className="p-3 bg-[#fff8f5] rounded-xl border border-[#eee0d6] text-[11px] text-[#5c3f42]">
                A aposição do PIN gera um carimbo temporal e hash criptográfico nos termos do Regulamento eIDAS da União Europeia.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSignAuthorizationModal(false)}
                  className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold"
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
      {/* MODAL 2: RELATÓRIO DE DESENVOLVIMENTO & OBSERVAÇÕES EM PDF                */}
      {/* ========================================================================= */}
      {reportCardModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#fd9924]" />
                <h3 id="report-modal-title" className="font-bold text-sm text-[#211a14] font-['Quicksand']">
                  Relatório de Desenvolvimento da Criança (PDF)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReportCardModal(false)}
                className="p-1 rounded-lg text-[#8c6b6d] hover:text-[#5c3f42] cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#fff8f5] p-4 rounded-2xl border border-[#eee0d6] text-xs space-y-1.5">
              <p className="font-bold text-[#211a14] text-sm">
                Relatorio_Desenvolvimento_{activeChild.name.replace(/\s+/g, '_')}_2ºTrimestre_2024-2025.pdf
              </p>
              <p className="text-[#5c3f42]">
                Turma: {activeChild.classroom} • Acompanhado por: {activeChild.leadTeacher}
              </p>
              <p className="text-emerald-700 font-semibold flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Parecer Descritivo e Qualitativo Homologado pela Coordenação</span>
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReportCardModal(false)}
                className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold text-xs cursor-pointer hover:bg-[#eee0d6]"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Relatório de desenvolvimento da criança em PDF descarregado com sucesso.');
                  setReportCardModal(false);
                }}
                className="px-4 py-2 bg-[#fd9924] text-white rounded-xl font-bold text-xs hover:bg-amber-600 flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descarregar Relatório PDF</span>
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3 id="tax-modal-title" className="font-bold text-sm text-[#211a14] font-['Quicksand']">
                  Declaração Anual de Propinas & Despesas (AGT 2024)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTaxDeclarationModal(false)}
                className="p-1 rounded-lg text-[#8c6b6d] hover:text-[#5c3f42]"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#fff8f5] p-4 rounded-2xl border border-[#eee0d6] text-xs space-y-2">
              <p className="font-bold text-[#211a14]">Declaracao_Despesas_Educacao_AGT_2024.pdf</p>
              <p className="text-[#5c3f42]">
                Total Faturado e Comunicado à AGT em 2024: <strong>1.500.000,00 Kz</strong>
              </p>
              <p className="text-[#5c3f42] text-[11px]">
                NIF do Encarregado: 218 409 382 (Dr. António Ferreira Silva)
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTaxDeclarationModal(false)}
                className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold text-xs"
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <h3 id="mb-modal-title" className="font-bold text-sm text-[#211a14] font-['Quicksand']">
                Emissão de Referência Multicaixa / MCX Express
              </h3>
              <button
                type="button"
                onClick={() => setMultibancoModal(false)}
                className="p-1 rounded-lg text-[#8c6b6d] hover:text-[#5c3f42]"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#fff8f5] p-4 rounded-2xl border border-[#eee0d6] text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#5c3f42]">Entidade:</span>
                <span className="font-bold font-mono text-[#211a14]">00192 (EMIS)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5c3f42]">Referência:</span>
                <span className="font-bold font-mono text-[#211a14]">829 102 918</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5c3f42]">Montante:</span>
                <span className="font-bold text-[#211a14]">150.000,00 Kz</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMultibancoModal(false)}
                className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold text-xs"
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <h3 id="iban-modal-title" className="font-bold text-sm text-[#211a14] font-['Quicksand']">
                Atualizar IBAN para Débito em Conta Bancária
              </h3>
              <button
                type="button"
                onClick={() => setIbanModal(false)}
                className="p-1 rounded-lg text-[#8c6b6d] hover:text-[#5c3f42]"
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
                <label className="font-bold text-[#5c3f42] block mb-1">Novo IBAN (Angola - AO06)</label>
                <input
                  type="text"
                  required
                  defaultValue="AO06 0040 0000 8291 0281 9283 1"
                  className="w-full p-2.5 font-mono text-xs rounded-xl border border-[#eee0d6] focus:outline-none focus:border-[#fd9924]"
                />
              </div>

              <div className="p-3 bg-[#fff8f5] rounded-xl border border-[#eee0d6] text-[11px] text-[#5c3f42]">
                A alteração entra em vigor no ciclo de faturação subsequente após validação com a entidade bancária.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIbanModal(false)}
                  className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold"
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <h3 id="rec-modal-title" className="font-bold text-sm text-[#211a14] font-['Quicksand']">
                Recibo de Quitação Certificado (AGT / Geral)
              </h3>
              <button
                type="button"
                onClick={() => setReceiptPreviewRecord(null)}
                className="p-1 rounded-lg text-[#8c6b6d] hover:text-[#5c3f42]"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#fff8f5] p-4 rounded-2xl border border-[#eee0d6] text-xs space-y-1.5">
              <p className="font-bold text-[#211a14]">{receiptPreviewRecord.ref}</p>
              <p className="text-[#5c3f42]">{receiptPreviewRecord.desc}</p>
              <p className="text-[#211a14] font-bold">Valor: {receiptPreviewRecord.amount.toLocaleString('pt-AO', { minimumFractionDigits: 2 })} Kz</p>
              <p className="text-emerald-700 font-semibold">Liquidado via {receiptPreviewRecord.method}</p>
              <p className="text-[#8c6b6d] font-mono text-[10px]">Hash Fiscal: AGT-48192-2025</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReceiptPreviewRecord(null)}
                className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold text-xs"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Recibo impresso em formato oficial certificado.');
                  setReceiptPreviewRecord(null);
                }}
                className="px-4 py-2 bg-[#211a14] text-white rounded-xl font-bold text-xs hover:bg-[#382b22] flex items-center gap-1.5"
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <h3 id="msg-modal-title" className="font-bold text-sm text-[#211a14] font-['Quicksand']">
                Enviar Mensagem Encriptada
              </h3>
              <button
                type="button"
                onClick={() => setNewMessageModal(false)}
                className="p-1 rounded-lg text-[#8c6b6d] hover:text-[#5c3f42]"
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
                <label className="font-bold text-[#5c3f42] block mb-1">Destinatário Institucional</label>
                <select className="w-full p-2.5 rounded-xl border border-[#eee0d6] bg-white">
                  <option>Tia Clara Marques (Educadora Titular - Jardim de Infância)</option>
                  <option>Tia Teresa Melo (Educadora Titular - Maternal)</option>
                  <option>Prof. Carlos Esteves (Coordenação Pedagógica)</option>
                  <option>Dra. Manuela Castro (Secretaria Geral)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Assunto</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dúvida sobre o trabalho da Feira da Ciência"
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6] focus:outline-none focus:border-[#00a6c0]"
                />
              </div>

              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Mensagem</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Escreva a mensagem confidencial..."
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6] focus:outline-none focus:border-[#00a6c0]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewMessageModal(false)}
                  className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold"
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
