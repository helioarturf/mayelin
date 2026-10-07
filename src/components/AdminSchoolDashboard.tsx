import React, { useState, useMemo } from 'react';
import {
  Search,
  Bell,
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  DollarSign,
  CreditCard,
  Download,
  Send,
  FileText,
  Users,
  Building2,
  GraduationCap,
  Lock,
  Unlock,
  Settings,
  LogOut,
  ChevronRight,
  Filter,
  ArrowUpRight,
  Check,
  Plus,
  Phone,
  Mail,
  Smartphone,
  RefreshCw,
  FileSpreadsheet,
  KeyRound,
  Activity,
  UserCheck,
  UserX,
  X,
  Printer,
  FileCode,
  Eye,
  SlidersHorizontal
} from 'lucide-react';

interface AdminSchoolDashboardProps {
  onClose?: () => void;
}

type AdminSection = 'overview' | 'classes' | 'finance' | 'hr' | 'comms' | 'settings';

interface ClassItem {
  id: string;
  name: string;
  cycle: string;
  capacity: number;
  enrolled: number;
  ratio: string;
  leadTeacher: string;
  subjects: string[];
  room: string;
  schedule: string;
}

interface FinancialRecord {
  id: string;
  studentName: string;
  guardianName: string;
  nif: string;
  classGroup: string;
  amount: number;
  paymentMethod: 'Multicaixa Express (MCX)' | 'Referência Multicaixa' | 'Transferência Bancária (AO06)' | 'TPA Presencial';
  status: 'Liquidado' | 'Aviso Enviado' | 'Em Aberto';
  invoiceNumber: string;
  dueDate: string;
  paidDate?: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  twoFactorEnabled: boolean;
  status: 'Ativo' | 'Revogado' | 'Pendente';
  lastAccess: string;
  accessLevel: 'Super Admin' | 'Docente' | 'SPO (Dados Sensíveis)' | 'Portaria / Segurança';
  email: string;
}

interface MassAnnouncement {
  id: string;
  title: string;
  channels: ('App Push' | 'E-mail' | 'SMS Alerta')[];
  date: string;
  openRate: number;
  recipientCount: number;
  authorizationsRequired: boolean;
  authorizationsSignedCount?: number;
  authorizationsTotal?: number;
  status: 'Enviada' | 'Em Processamento';
}

export default function AdminSchoolDashboard({ onClose }: AdminSchoolDashboardProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('2024/2025');
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Toast Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Modal States
  const [receiptModalRecord, setReceiptModalRecord] = useState<FinancialRecord | null>(null);
  const [saftModalOpen, setSaftModalOpen] = useState(false);
  const [addClassModalOpen, setAddClassModalOpen] = useState(false);
  const [addStaffModalOpen, setAddStaffModalOpen] = useState(false);
  const [commsModalOpen, setCommsModalOpen] = useState(false);

  // Data: Turmas (Apenas Educação Infantil e Creche - 3 Ciclos de Desenvolvimento)
  const [classesList, setClassesList] = useState<ClassItem[]>([
    {
      id: 'c-1',
      name: 'Berçário Ninho de Afeto',
      cycle: 'Berçário',
      capacity: 14,
      enrolled: 14,
      ratio: '1:3 (Educadora + 2 Auxiliares)',
      leadTeacher: 'Educadora Denise Santos',
      subjects: ['Estimulação Sensorial', 'Psicomotricidade Inicial', 'Massagem Shantala', 'Lactário & Acolhimento'],
      room: 'Ala dos Bebés - Sala 01 (Climatizada & Acústica)',
      schedule: '07:30 - 18:30 (Integral/Semi)'
    },
    {
      id: 'c-2',
      name: 'Maternal I - Primeiros Passos',
      cycle: 'Maternal I & II',
      capacity: 16,
      enrolled: 16,
      ratio: '1:5 (Educadora + Auxiliar)',
      leadTeacher: 'Educadora Carla Mendes',
      subjects: ['Linguagem Oral', 'Exploração Sensorial', 'Primeiros Passos', 'Musicalização Infantil'],
      room: 'Pavilhão Baby - Sala 02',
      schedule: '07:30 - 18:30 (Integral/Semi)'
    },
    {
      id: 'c-3',
      name: 'Maternal II - Sala dos Exploradores',
      cycle: 'Maternal I & II',
      capacity: 18,
      enrolled: 18,
      ratio: '1:7 (Educadora + Auxiliar)',
      leadTeacher: 'Educadora Teresa Melo',
      subjects: ['Expressão Corporal', 'Iniciação ao Desfralde', 'Socialização Lúdica', 'Pintura & Texturas'],
      room: 'Pavilhão Baby - Sala 03',
      schedule: '07:30 - 18:30 (Integral/Semi)'
    },
    {
      id: 'c-4',
      name: 'Pré-Escolar - Sala das Descobertas',
      cycle: 'Pré-Escolar & Jardim de Infância',
      capacity: 20,
      enrolled: 20,
      ratio: '1:8 (Educadora + Auxiliar)',
      leadTeacher: 'Profª Maria Clara Marques',
      subjects: ['Pré-Letramento Lúdico', 'Raciocínio Concreto', 'Natureza & Horta', 'Inglês Lúdico'],
      room: 'Pavilhão A - Sala 02',
      schedule: '07:30 - 18:30 (Integral/Semi)'
    },
    {
      id: 'c-5',
      name: 'Jardim de Infância - Sala das Estrelinhas',
      cycle: 'Pré-Escolar & Jardim de Infância',
      capacity: 22,
      enrolled: 21,
      ratio: '1:10 (Educador + Auxiliar)',
      leadTeacher: 'Prof. António Silva',
      subjects: ['Literacia Emergente', 'Pensamento Matemático Concreto', 'Oficinas Maker', 'Autonomia & Cidadania'],
      room: 'Pavilhão A - Sala 01',
      schedule: '07:30 - 18:30 (Integral/Semi)'
    }
  ]);

  // Data: Gestão Financeira em Moeda Nacional (Kwanza - Kz)
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([
    {
      id: 'fin-1',
      studentName: 'Lucas Oliveira Mayelin',
      guardianName: 'Helena Mayelin',
      nif: '5418172901',
      classGroup: 'Maternal I - Primeiros Passos',
      amount: 165000.0,
      paymentMethod: 'Multicaixa Express (MCX)',
      status: 'Liquidado',
      invoiceNumber: 'FT-2024/0981',
      dueDate: '08/10/2024',
      paidDate: '05/10/2024'
    },
    {
      id: 'fin-2',
      studentName: 'Sofia Rocha Ramos',
      guardianName: 'Fernando Ramos',
      nif: '5413904581',
      classGroup: 'Berçário Ninho de Afeto',
      amount: 180000.0,
      paymentMethod: 'Multicaixa Express (MCX)',
      status: 'Liquidado',
      invoiceNumber: 'FT-2024/0982',
      dueDate: '08/10/2024',
      paidDate: '06/10/2024'
    },
    {
      id: 'fin-3',
      studentName: 'Mateus Castro Silva',
      guardianName: 'Rodrigo Silva',
      nif: '5419842109',
      classGroup: 'Jardim de Infância - Sala das Estrelinhas',
      amount: 150000.0,
      paymentMethod: 'Referência Multicaixa',
      status: 'Aviso Enviado',
      invoiceNumber: 'FT-2024/0983',
      dueDate: '10/10/2024'
    },
    {
      id: 'fin-4',
      studentName: 'Beatriz Alcantara',
      guardianName: 'Diogo Alcantara',
      nif: '5425489102',
      classGroup: 'Pré-Escolar - Sala das Descobertas',
      amount: 150000.0,
      paymentMethod: 'Transferência Bancária (AO06)',
      status: 'Liquidado',
      invoiceNumber: 'FT-2024/0984',
      dueDate: '08/10/2024',
      paidDate: '04/10/2024'
    },
    {
      id: 'fin-5',
      studentName: 'Tomás Mendonça',
      guardianName: 'Patrícia Mendonça',
      nif: '5422874190',
      classGroup: 'Maternal II - Sala dos Exploradores',
      amount: 165000.0,
      paymentMethod: 'Referência Multicaixa',
      status: 'Aviso Enviado',
      invoiceNumber: 'FT-2024/0985',
      dueDate: '10/10/2024'
    }
  ]);

  // Data: Recursos Humanos & RBAC
  const [staffList, setStaffList] = useState<StaffMember[]>([
    {
      id: 'staff-1',
      name: 'Prof. António Silva',
      role: 'Professor Titular 1º Ciclo',
      department: 'Corpo Docente',
      twoFactorEnabled: true,
      status: 'Ativo',
      lastAccess: 'Hoje, 09:18 (IP Institucional)',
      accessLevel: 'Docente',
      email: 'a.silva@escolamayelin.pt'
    },
    {
      id: 'staff-2',
      name: 'Educadora Teresa Melo',
      role: 'Educadora de Infância',
      department: 'Educação Pré-Escolar',
      twoFactorEnabled: true,
      status: 'Ativo',
      lastAccess: 'Hoje, 08:04 (Mobile App)',
      accessLevel: 'Docente',
      email: 't.melo@escolamayelin.pt'
    },
    {
      id: 'staff-3',
      name: 'Dra. Sofia Ramos',
      role: 'Psicóloga Escolar & Coord. Inclusão',
      department: 'SPO (Serviço de Psicologia e Orientação)',
      twoFactorEnabled: true,
      status: 'Ativo',
      lastAccess: 'Ontem, 16:42 (VPN Segura)',
      accessLevel: 'SPO (Dados Sensíveis)',
      email: 's.ramos.spo@escolamayelin.pt'
    },
    {
      id: 'staff-4',
      name: 'Manuel Oliveira',
      role: 'Chefe de Segurança & Portaria',
      department: 'Operações e Segurança',
      twoFactorEnabled: true,
      status: 'Ativo',
      lastAccess: 'Hoje, 07:30 (Terminal Portaria)',
      accessLevel: 'Portaria / Segurança',
      email: 'portaria@escolamayelin.pt'
    },
    {
      id: 'staff-5',
      name: 'Dra. Manuela Castro',
      role: 'Diretora da Secretaria Geral',
      department: 'Secretaria e Conselho Executivo',
      twoFactorEnabled: true,
      status: 'Ativo',
      lastAccess: 'Sessão Ativa Agora (Conselho)',
      accessLevel: 'Super Admin',
      email: 'manuela.castro@escolamayelin.pt'
    }
  ]);

  // Data: Circulares e Comunicações em Massa
  const [announcementsList, setAnnouncementsList] = useState<MassAnnouncement[]>([
    {
      id: 'ann-1',
      title: 'Circular de Saída Pedagógica ao Bosque dos Sentidos',
      channels: ['App Push', 'E-mail'],
      date: '04 de Outubro, 2024',
      openRate: 99.4,
      recipientCount: 62,
      authorizationsRequired: true,
      authorizationsSignedCount: 58,
      authorizationsTotal: 62,
      status: 'Enviada'
    },
    {
      id: 'ann-2',
      title: 'Atualização do Plano de Segurança e Prevenção Sazonal',
      channels: ['App Push', 'E-mail', 'SMS Alerta'],
      date: '01 de Outubro, 2024',
      openRate: 98.8,
      recipientCount: 482,
      authorizationsRequired: false,
      status: 'Enviada'
    },
    {
      id: 'ann-3',
      title: 'Convocatória para Eleição da Associação de Pais e Encarregados',
      channels: ['E-mail', 'App Push'],
      date: '28 de Setembro, 2024',
      openRate: 99.1,
      recipientCount: 482,
      authorizationsRequired: false,
      status: 'Enviada'
    }
  ]);

  // Filtered queries across modules
  const filteredClasses = useMemo(() => {
    if (!searchQuery.trim()) return classesList;
    const q = searchQuery.toLowerCase();
    return classesList.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.leadTeacher.toLowerCase().includes(q) ||
        c.cycle.toLowerCase().includes(q)
    );
  }, [classesList, searchQuery]);

  const filteredFinance = useMemo(() => {
    if (!searchQuery.trim()) return financialRecords;
    const q = searchQuery.toLowerCase();
    return financialRecords.filter(
      (f) =>
        f.studentName.toLowerCase().includes(q) ||
        f.guardianName.toLowerCase().includes(q) ||
        f.nif.includes(q) ||
        f.invoiceNumber.toLowerCase().includes(q)
    );
  }, [financialRecords, searchQuery]);

  const filteredStaff = useMemo(() => {
    if (!searchQuery.trim()) return staffList;
    const q = searchQuery.toLowerCase();
    return staffList.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.accessLevel.toLowerCase().includes(q)
    );
  }, [staffList, searchQuery]);

  // Handlers
  const handleToggleStaffAccess = (id: string) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const newStatus = s.status === 'Ativo' ? 'Revogado' : 'Ativo';
          showToast(
            newStatus === 'Revogado'
              ? `Acesso preventivo de ${s.name} revogado com sucesso!`
              : `Acesso de ${s.name} reativado com validação 2FA.`
          );
          return { ...s, status: newStatus };
        }
        return s;
      })
    );
  };

  const handleDispatchReminders = () => {
    showToast('28 lembretes de liquidação de propinas disparados via Multicaixa Express, E-mail e Push!');
  };

  const handleExportSaft = () => {
    setSaftModalOpen(true);
  };

  const handleIssueInvoiceBatch = () => {
    showToast('Lote de 482 faturas certificadas geradas e sincronizadas com a Administração Geral Tributária (AGT).');
  };

  return (
    <div
      role="region"
      aria-label="Painel de Administração e Gestão Escolar"
      className="bg-[#f8fafc] text-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col min-h-[680px] max-h-[90vh] font-['Nunito_Sans'] antialiased"
    >
      {/* ========================================================================= */}
      {/* 1. TOPNAVBAR - NAVEGAÇÃO EXECUTIVA & BARRA SUPERIOR INTEGRADA            */}
      {/* ========================================================================= */}
      <header
        className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 z-20"
        role="banner"
      >
        {/* Brand & Active School Year */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0f172a] text-white flex items-center justify-center font-bold shadow-sm shrink-0">
            <Building2 className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-bold font-['Quicksand'] text-slate-900 leading-tight">
                Administração & Gestão Escolar
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Ano Letivo {selectedYear} Ativo
              </span>
              <span
                className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200"
                title="Conforme o Regulamento Geral sobre a Proteção de Dados e diretrizes WCAG 2.1 AA"
              >
                RGPD • WCAG 2.1 AA
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Jardim Escola da Mayelin • Educação Infantil & Creche • Luanda, Angola
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md mx-0 md:mx-4">
          <label htmlFor="admin-global-search" className="sr-only">
            Barra de pesquisa global de alunos, turmas, NIF ou processos
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="admin-global-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por educando, turma (Berçário, Maternal, Jardim), NIF ou processo..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#ed145b] focus:ring-2 focus:ring-pink-100 focus:outline-none transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                aria-label="Limpar pesquisa"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Executive Right Controls: Notifications & Dra. Manuela Castro Profile */}
        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
          {/* Notifications Center */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#ed145b] transition-colors"
              aria-label="Central de notificações executivas"
              aria-expanded={notificationOpen}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ed145b] rounded-full ring-2 ring-white" />
            </button>

            {notificationOpen && (
              <div
                className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 text-xs animate-in fade-in zoom-in-95"
                role="dialog"
                aria-label="Notificações"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="font-bold text-slate-900">Alertas Executivos</span>
                  <span className="text-[10px] bg-pink-100 text-[#ed145b] font-bold px-1.5 py-0.5 rounded">
                    2 Pendentes
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-900">
                    <p className="font-bold">28 Propinas com Vencimento Próximo</p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Lembretes automáticos por Débito Direto e Multibanco prontos para envio.
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900">
                    <p className="font-bold">Circular Saída ao Bosque</p>
                    <p className="text-[11px] text-emerald-800 mt-0.5">
                      58 de 62 autorizações digitais assinadas pelos encarregados.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile: Dra. Manuela Castro (Directora da Secretaria Geral) */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#ed145b] to-purple-600 p-0.5 shadow-sm">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-xs text-[#ed145b]">
                MC
              </div>
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold text-slate-900 block leading-tight">
                Dra. Manuela Castro
              </span>
              <span className="text-[10px] text-slate-500 block leading-tight">
                Diretora da Secretaria Geral • 2FA Ativo
              </span>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Fechar painel"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. BODY LAYOUT: SIDENAVBAR + MAIN CONTENT AREA                           */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* SideNavBar Lateral */}
        <nav
          className="w-full md:w-64 bg-slate-900 text-slate-300 p-3 sm:p-4 flex md:flex-col justify-between shrink-0 overflow-x-auto md:overflow-y-auto border-r border-slate-800"
          aria-label="Menu principal de gestão"
        >
          <div className="flex md:flex-col gap-1 w-full">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 py-1.5 hidden md:block">
              Módulos Institucionais
            </span>

            <button
              type="button"
              onClick={() => setActiveSection('overview')}
              className={`min-h-[42px] w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all text-left whitespace-nowrap ${
                activeSection === 'overview'
                  ? 'bg-[#ed145b] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4 shrink-0" />
              <span>Visão Geral</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('classes')}
              className={`min-h-[42px] w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all text-left whitespace-nowrap ${
                activeSection === 'classes'
                  ? 'bg-[#ed145b] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>Utilizadores e Turmas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('finance')}
              className={`min-h-[42px] w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all text-left whitespace-nowrap ${
                activeSection === 'finance'
                  ? 'bg-[#ed145b] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <DollarSign className="w-4 h-4 shrink-0" />
              <span>Gestão Financeira</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('hr')}
              className={`min-h-[42px] w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all text-left whitespace-nowrap ${
                activeSection === 'hr'
                  ? 'bg-[#ed145b] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Recursos Humanos & RBAC</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('comms')}
              className={`min-h-[42px] w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all text-left whitespace-nowrap ${
                activeSection === 'comms'
                  ? 'bg-[#ed145b] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Send className="w-4 h-4 shrink-0" />
              <span>Comunicação em Massa</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('settings')}
              className={`min-h-[42px] w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all text-left whitespace-nowrap ${
                activeSection === 'settings'
                  ? 'bg-[#ed145b] text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Configurações & RGPD</span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-800 hidden md:block">
            <div className="p-2.5 rounded-xl bg-slate-800/80 text-[11px] space-y-1">
              <p className="font-bold text-slate-200">Segurança de Dados</p>
              <p className="text-slate-400">
                Auditoria de sessões ativa com encriptação AES-256 e backups horários.
              </p>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
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
          {/* SECÇÃO 1: VISÃO GERAL (INDICADORES EXECUTIVOS GLOBAIS - MÉTRICAS-CHAVE)   */}
          {/* ========================================================================= */}
          {activeSection === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Executive Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total de Alunos Inscritos */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-pink-200 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Total de Alunos Inscritos</span>
                    <div className="w-8 h-8 rounded-xl bg-pink-100 text-[#ed145b] flex items-center justify-center">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold font-['Quicksand'] text-slate-900 mt-2">
                    482
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-bold">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>+3.4% vs. ano anterior (98% ocupação)</span>
                  </div>
                </div>

                {/* 2. Corpo Docente e Colaboradores */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-sky-200 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Corpo Docente & Equipa</span>
                    <div className="w-8 h-8 rounded-xl bg-sky-100 text-[#00a6c0] flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold font-['Quicksand'] text-slate-900 mt-2">
                    54
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-sky-700 font-bold">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    <span>100% com 2FA validado</span>
                  </div>
                </div>

                {/* 3. Faturação do Mês */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-200 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Faturação do Mês</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold font-['Quicksand'] text-slate-900 mt-2">
                    Kz 48.250.000
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-700 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>94.2% liquidação (5.8% pendente)</span>
                  </div>
                </div>

                {/* 4. Taxa de Entrega de Comunicados */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-200 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Taxa de Abertura Circular</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                      <Send className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold font-['Quicksand'] text-slate-900 mt-2">
                    99.1%
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-purple-700 font-bold">
                    <span>28 circulares emitidas (App & E-mail)</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold font-['Quicksand'] text-slate-900">
                    Ações Rápidas de Coordenação Geral
                  </h3>
                  <span className="text-xs text-slate-400">
                    Operações certificadas em lote
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={handleExportSaft}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-pink-50 hover:border-pink-200 text-slate-800 text-xs font-bold flex items-center gap-2.5 transition-all text-left"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-[#ed145b] shrink-0" />
                    <span>Exportar SAF-T (AO)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDispatchReminders}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-amber-50 hover:border-amber-200 text-slate-800 text-xs font-bold flex items-center gap-2.5 transition-all text-left"
                  >
                    <RefreshCw className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Lembretes de Propinas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSection('comms')}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-sky-50 hover:border-sky-200 text-slate-800 text-xs font-bold flex items-center gap-2.5 transition-all text-left"
                  >
                    <Send className="w-4 h-4 text-[#00a6c0] shrink-0" />
                    <span>Emitir Circular Urgente</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAddClassModalOpen(true)}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-purple-50 hover:border-purple-200 text-slate-800 text-xs font-bold flex items-center gap-2.5 transition-all text-left"
                  >
                    <Plus className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Adicionar Turma</span>
                  </button>
                </div>
              </div>

              {/* Status de Liquidação & Ciclos Formativos Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <h4 className="text-sm font-bold font-['Quicksand'] text-slate-900">
                    Distribuição da Faturação do Mês (Kz 48.250.000)
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        454 Propinas Liquidadas (Kz 45.451.500)
                      </span>
                      <span className="text-emerald-700 font-bold">94.2%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '94.2%' }} />
                    </div>

                    <div className="flex justify-between font-semibold pt-2">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        28 Avisos Enviados (Kz 2.798.500)
                      </span>
                      <span className="text-amber-700 font-bold">5.8%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '5.8%' }} />
                    </div>

                    <div className="flex justify-between font-semibold pt-2 text-slate-500">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                        Casos em Contencioso Judicial
                      </span>
                      <span className="text-emerald-600 font-bold">0 Casos (0%)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <h4 className="text-sm font-bold font-['Quicksand'] text-slate-900">
                    Segurança e Controlo de Acessos RBAC
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800">Autenticação de Dois Fatores (2FA)</p>
                        <p className="text-slate-500 text-[11px]">Obrigatória para todos os 54 colaboradores</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        100% Conforme
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800">Proteção de Dados de Saúde (SPO)</p>
                        <p className="text-slate-500 text-[11px]">Acesso estritamente restrito à Dra. Sofia Ramos</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px]">
                        Nível Máximo
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECÇÃO 2: CONTROLO TOTAL - GESTÃO DE UTILIZADORES, TURMAS E LOTAÇÃO       */}
          {/* ========================================================================= */}
          {activeSection === 'classes' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold font-['Quicksand'] text-slate-900">
                    Gestão de Turmas, Lotação & Matriz Curricular
                  </h3>
                  <p className="text-xs text-slate-500">
                    Supervisão pedagógica dos 3 ciclos de desenvolvimento: Berçário, Maternal I & II, Pré-Escolar & Jardim de Infância
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAddClassModalOpen(true)}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#ed145b] text-white font-bold text-xs shadow-sm hover:bg-pink-600 transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar Nova Turma</span>
                  </button>
                </div>
              </div>

              {/* Classes Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3.5">Turma & Ciclo</th>
                        <th className="p-3.5">Lotação / Rácio</th>
                        <th className="p-3.5">Professor Titular / Coordenador</th>
                        <th className="p-3.5">Matriz de Disciplinas</th>
                        <th className="p-3.5 text-right">Ações Pedagógicas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredClasses.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3.5">
                            <p className="font-bold text-slate-900">{item.name}</p>
                            <span className="text-[10px] font-semibold text-slate-500 block">
                              {item.cycle} • {item.room}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-bold ${
                                  item.enrolled >= item.capacity ? 'text-[#ed145b]' : 'text-slate-800'
                                }`}
                              >
                                {item.enrolled} / {item.capacity}
                              </span>
                              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                                {item.ratio}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">{item.schedule}</span>
                          </td>

                          <td className="p-3.5">
                            <span className="font-bold text-slate-800 block">{item.leadTeacher}</span>
                            <span className="text-[10px] text-emerald-600 font-semibold">Avaliações em dia</span>
                          </td>

                          <td className="p-3.5">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {item.subjects.map((sub, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] bg-pink-50 text-[#ed145b] px-1.5 py-0.5 rounded font-semibold"
                                >
                                  {sub}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => showToast(`Transferência de educando aberta para a turma ${item.name}.`)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] transition-colors"
                              >
                                Transferir
                              </button>
                              <button
                                type="button"
                                onClick={() => showToast(`Currículo atribuído com sucesso para ${item.name}.`)}
                                className="px-2.5 py-1 bg-pink-50 hover:bg-pink-100 text-[#ed145b] rounded-lg font-bold text-[11px] transition-colors"
                              >
                                Currículo
                              </button>
                            </div>
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
          {/* SECÇÃO 3: GESTÃO FINANCEIRA, FATURAÇÃO E DÉBITO DIRETO                    */}
          {/* ========================================================================= */}
          {activeSection === 'finance' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold font-['Quicksand'] text-slate-900">
                    Gestão Financeira, Faturação e Multicaixa Express
                  </h3>
                  <p className="text-xs text-slate-500">
                    454 Propinas liquidadas • 28 com aviso enviado • 0 em contencioso • Valores em Kwanza (Kz)
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleExportSaft}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-sm hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar SAF-T (AO)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleIssueInvoiceBatch}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Emitir Faturas em Lote</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDispatchReminders}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-sm hover:bg-amber-600 transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Disparar Lembretes</span>
                  </button>
                </div>
              </div>

              {/* Financial Records Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3.5">Aluno & Turma</th>
                        <th className="p-3.5">Responsável Financeiro (NIF)</th>
                        <th className="p-3.5">Método de Liquidação</th>
                        <th className="p-3.5">Valor (Kz) & Vencimento</th>
                        <th className="p-3.5">Estado</th>
                        <th className="p-3.5 text-right">Recibo AGT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredFinance.map((record) => (
                        <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3.5">
                            <p className="font-bold text-slate-900">{record.studentName}</p>
                            <span className="text-[10px] text-slate-500">{record.classGroup}</span>
                          </td>

                          <td className="p-3.5">
                            <span className="font-bold text-slate-800 block">{record.guardianName}</span>
                            <span className="text-[10px] text-slate-500 font-mono">NIF: {record.nif}</span>
                          </td>

                          <td className="p-3.5">
                            <span className="font-semibold text-slate-700 flex items-center gap-1">
                              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                              {record.paymentMethod}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{record.invoiceNumber}</span>
                          </td>

                          <td className="p-3.5">
                            <span className="font-bold text-slate-900">
                              Kz {record.amount.toLocaleString('pt-PT')},00
                            </span>
                            <span className="text-[10px] text-slate-500 block">Venc: {record.dueDate}</span>
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                                record.status === 'Liquidado'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {record.status}
                            </span>
                          </td>

                          <td className="p-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => setReceiptModalRecord(record)}
                              className="px-2.5 py-1 bg-pink-50 hover:bg-pink-100 text-[#ed145b] rounded-lg font-bold text-[11px] transition-colors inline-flex items-center gap-1"
                            >
                              <Printer className="w-3 h-3" />
                              <span>Recibo AGT</span>
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
          {/* SECÇÃO 4: RECURSOS HUMANOS & GESTÃO DE ACESSOS COM PRIVILÉGIOS (RBAC)     */}
          {/* ========================================================================= */}
          {activeSection === 'hr' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold font-['Quicksand'] text-slate-900">
                    Recursos Humanos & Gestão de Acessos com Privilégios (RBAC)
                  </h3>
                  <p className="text-xs text-slate-500">
                    54 Profissionais ativos • Política estrita de Duplo Fator (2FA) • Segregação de funções
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setAddStaffModalOpen(true)}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#ed145b] text-white font-bold text-xs shadow-sm hover:bg-pink-600 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Convidar Novo Colaborador</span>
                </button>
              </div>

              {/* Staff Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3.5">Colaborador</th>
                        <th className="p-3.5">Departamento & Função</th>
                        <th className="p-3.5">Nível de Acesso (RBAC)</th>
                        <th className="p-3.5">Segurança 2FA</th>
                        <th className="p-3.5">Último Acesso Registado</th>
                        <th className="p-3.5 text-right">Ação Preventiva</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStaff.map((staff) => (
                        <tr key={staff.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3.5">
                            <p className="font-bold text-slate-900">{staff.name}</p>
                            <span className="text-[10px] text-slate-500">{staff.email}</span>
                          </td>

                          <td className="p-3.5">
                            <span className="font-semibold text-slate-800 block">{staff.role}</span>
                            <span className="text-[10px] text-slate-500">{staff.department}</span>
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded font-bold text-[10px] inline-block ${
                                staff.accessLevel === 'Super Admin'
                                  ? 'bg-purple-100 text-purple-800'
                                  : staff.accessLevel === 'SPO (Dados Sensíveis)'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : staff.accessLevel === 'Portaria / Segurança'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {staff.accessLevel}
                            </span>
                          </td>

                          <td className="p-3.5">
                            {staff.twoFactorEnabled ? (
                              <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>2FA Ativo</span>
                              </span>
                            ) : (
                              <span className="text-red-600 font-bold text-[11px]">2FA Inativo</span>
                            )}
                          </td>

                          <td className="p-3.5">
                            <span className="text-slate-600 font-mono text-[11px]">{staff.lastAccess}</span>
                          </td>

                          <td className="p-3.5 text-right">
                            {staff.accessLevel !== 'Super Admin' && (
                              <button
                                type="button"
                                onClick={() => handleToggleStaffAccess(staff.id)}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors inline-flex items-center gap-1 ${
                                  staff.status === 'Ativo'
                                    ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                }`}
                              >
                                {staff.status === 'Ativo' ? (
                                  <>
                                    <UserX className="w-3.5 h-3.5" />
                                    <span>Revogar</span>
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-3.5 h-3.5" />
                                    <span>Reativar</span>
                                  </>
                                )}
                              </button>
                            )}
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
          {/* SECÇÃO 5: COMUNICAÇÃO GERAL & DISPARO DE COMUNICADOS EM MASSA             */}
          {/* ========================================================================= */}
          {activeSection === 'comms' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold font-['Quicksand'] text-slate-900">
                    Comunicação Geral & Disparo de Circulares em Massa
                  </h3>
                  <p className="text-xs text-slate-500">
                    28 Circulares emitidas • 99.1% Taxa de Abertura • Assinaturas Digitais Auditadas
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setCommsModalOpen(true)}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#ed145b] text-white font-bold text-xs shadow-sm hover:bg-pink-600 transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Nova Circular Multicanal</span>
                </button>
              </div>

              {/* Announcements Feed */}
              <div className="space-y-3">
                {announcementsList.map((ann) => (
                  <div
                    key={ann.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:border-pink-200 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="font-bold text-sm font-['Quicksand'] text-slate-900">
                        {ann.title}
                      </h4>
                      <span className="text-xs text-slate-400">{ann.date}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {ann.channels.map((ch, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold"
                        >
                          {ch}
                        </span>
                      ))}

                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Taxa de Leitura: {ann.openRate}%
                      </span>

                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {ann.recipientCount} Encarregados Destinatários
                      </span>
                    </div>

                    {ann.authorizationsRequired && (
                      <div className="p-3 bg-pink-50/70 border border-pink-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-[#ed145b]">
                            Autorizações Digitais de Saída: {ann.authorizationsSignedCount} de {ann.authorizationsTotal} Colhidas
                          </p>
                          <p className="text-[11px] text-slate-600">
                            93.5% de adesão assinada com autenticação digital pela App.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => showToast('Lista nominal das 58 assinaturas digitais exportada.')}
                          className="px-3 py-1 bg-white border border-pink-200 text-[#ed145b] rounded-lg font-bold text-xs hover:bg-pink-50"
                        >
                          Ver Lista de Assinaturas
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECÇÃO 6: CONFIGURAÇÕES, RGPD & WCAG 2.1 AA                               */}
          {/* ========================================================================= */}
          {activeSection === 'settings' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h3 className="text-base font-bold font-['Quicksand'] text-slate-900">
                Configurações da Instituição, Conformidade RGPD & Acessibilidade
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Conformidade com o RGPD (Regulamento UE 2016/679)</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Todos os dados pessoais de alunos e encarregados são anonimizados nos relatórios estatísticos. O consentimento informado para captura fotográfica e saídas pedagógicas é auditado e armazenado com data/hora.
                  </p>
                  <div className="pt-2">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-full">
                      Encarregado de Proteção de Dados (DPO) Ativo
                    </span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-[#00a6c0]" />
                    <span>Padrões de Acessibilidade WCAG 2.1 AA</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    A interface garante suporte completo para leitores de ecrã (VoiceOver, NVDA), rácio de contraste cromático superior a 4.5:1, foco visível de teclado e áreas tácteis mínimas de 44px.
                  </p>
                  <div className="pt-2">
                    <span className="px-2.5 py-1 bg-sky-50 text-sky-800 font-bold text-xs rounded-full">
                      Certificado de Acessibilidade Nível AA
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: RECIBO CERTIFICADO PELA ADMINISTRAÇÃO GERAL TRIBUTÁRIA (AGT)     */}
      {/* ========================================================================= */}
      {receiptModalRecord && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="receipt-modal-title"
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  AGT
                </div>
                <div>
                  <h3 id="receipt-modal-title" className="font-bold text-sm text-slate-900 font-['Quicksand']">
                    Recibo de Quitação Certificado (AGT)
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {receiptModalRecord.invoiceNumber} • Software Certificado nº 1482/AGT • Luanda
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReceiptModalRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                aria-label="Fechar recibo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Educando:</span>
                <span className="font-bold text-slate-900">{receiptModalRecord.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Encarregado / NIF:</span>
                <span className="font-bold text-slate-900">
                  {receiptModalRecord.guardianName} (NIF {receiptModalRecord.nif})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Turma (Ciclo):</span>
                <span className="font-bold text-slate-900">{receiptModalRecord.classGroup}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Método de Liquidação:</span>
                <span className="font-bold text-slate-900">{receiptModalRecord.paymentMethod}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                <span className="font-bold text-slate-800">Total Liquidado (Moeda Nacional):</span>
                <span className="font-extrabold text-emerald-700">
                  Kz {receiptModalRecord.amount.toLocaleString('pt-PT')},00
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between text-xs text-emerald-800">
              <span className="font-bold">Assinatura Digital & Hash AGT Válidos</span>
              <span className="text-[10px] font-mono">AGT-9481-AO</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  showToast('Recibo AGT impresso com formato oficial certificado em Kwanza.');
                  setReceiptModalRecord(null);
                }}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir / PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EXPORTAÇÃO FICHEIRO FISCAL SAF-T (AO)                            */}
      {/* ========================================================================= */}
      {saftModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="saft-modal-title"
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-[#ed145b]" />
                <h3 id="saft-modal-title" className="font-bold text-sm text-slate-900 font-['Quicksand']">
                  Exportação de Ficheiro Fiscal SAF-T (AO)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSaftModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                aria-label="Fechar modal SAF-T"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              O ficheiro XML padrão da Administração Geral Tributária (AGT - Angola) inclui todos os lançamentos de faturação, recibos emitidos e auditoria de propinas em Kwanzas (Kz) do período corrente.
            </p>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-1.5">
              <p className="font-bold text-slate-800">SAF-T_AO_Mayelin_2024-10.xml</p>
              <p className="text-[11px] text-slate-500">Tamanho estimado: 1.2 MB • 482 Registos em Kwanzas</p>
              <p className="text-[11px] text-emerald-700 font-bold">Validação de Schema AGT: Aprovada</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSaftModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Ficheiro SAF-T (AO) transferido com sucesso para a contabilidade.');
                  setSaftModalOpen(false);
                }}
                className="px-4 py-2 bg-[#ed145b] text-white rounded-xl text-xs font-bold hover:bg-pink-600 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descarregar XML Certificado (AO)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADICIONAR NOVA TURMA                                             */}
      {/* ========================================================================= */}
      {addClassModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="addclass-modal-title"
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 id="addclass-modal-title" className="font-bold text-sm text-slate-900 font-['Quicksand']">
                Criar Nova Turma de Educação Infantil
              </h3>
              <button
                type="button"
                onClick={() => setAddClassModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast('Nova turma adicionada ao plano curricular infantil com sucesso!');
                setAddClassModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nome da Turma</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Maternal II - Sala dos Girassóis ou Berçário B"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#ed145b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ciclo de Desenvolvimento</label>
                  <select className="w-full p-2.5 rounded-xl border border-slate-200 bg-white">
                    <option>Berçário (3 meses a 1 ano)</option>
                    <option>Maternal I & II (1 a 3 anos)</option>
                    <option>Pré-Escolar & Jardim de Infância (3 a 5 anos)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lotação Máxima</label>
                  <input
                    type="number"
                    defaultValue={18}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Professor Titular / Educador</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Profa. Beatriz Lima"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddClassModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ed145b] text-white rounded-xl font-bold hover:bg-pink-600"
                >
                  Registar Turma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: CONVIDAR NOVO COLABORADOR (RH / RBAC)                            */}
      {/* ========================================================================= */}
      {addStaffModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="addstaff-modal-title"
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 id="addstaff-modal-title" className="font-bold text-sm text-slate-900 font-['Quicksand']">
                Convidar Colaborador com Privilégios (RBAC)
              </h3>
              <button
                type="button"
                onClick={() => setAddStaffModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast('Convite institucional enviado com ativação mandatória de 2FA.');
                setAddStaffModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Prof. Gonçalo Ferreira"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">E-mail Institucional</label>
                <input
                  type="email"
                  required
                  placeholder="nome@escolamayelin.pt"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nível de Acesso (RBAC)</label>
                <select className="w-full p-2.5 rounded-xl border border-slate-200 bg-white">
                  <option value="Docente">Docente (Diário e Frequência)</option>
                  <option value="Portaria">Portaria / Segurança (Apenas Saídas)</option>
                  <option value="SPO">SPO (Psicologia e Dados Sensíveis)</option>
                  <option value="Admin">Administrativo / Secretaria</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
                O colaborador receberá um link seguro de ativação com chave OTP para configuração mandatória de 2FA.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddStaffModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ed145b] text-white rounded-xl font-bold hover:bg-pink-600"
                >
                  Enviar Convite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: NOVA CIRCULAR MULTICANAL EM MASSA                                */}
      {/* ========================================================================= */}
      {commsModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="comms-modal-title"
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 id="comms-modal-title" className="font-bold text-sm text-slate-900 font-['Quicksand']">
                Emitir Circular em Massa (Push, E-mail & SMS)
              </h3>
              <button
                type="button"
                onClick={() => setCommsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast('Circular em massa disparada simultaneamente por Push, E-mail e SMS.');
                setCommsModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">Título da Circular</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Circular Geral: Preparação para as Férias de Natal"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Canais de Disparo Simultâneo</label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-[#ed145b]" />
                    <span>App Push</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-[#ed145b]" />
                    <span>E-mail Oficial</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" className="rounded text-[#ed145b]" />
                    <span>SMS de Alerta Urgente</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Conteúdo da Circular</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Escreva a mensagem oficial que será enviada aos encarregados..."
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="auth-req" className="rounded text-[#ed145b]" />
                <label htmlFor="auth-req" className="font-semibold text-slate-700 cursor-pointer">
                  Exigir assinatura digital de autorização do encarregado
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCommsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ed145b] text-white rounded-xl font-bold hover:bg-pink-600 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Disparar Circular Agora</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
