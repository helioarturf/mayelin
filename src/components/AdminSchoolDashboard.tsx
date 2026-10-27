import React, { useState, useMemo, useEffect } from 'react';
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
  ArrowLeft,
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
import { formatEducatorName } from '../utils/formatters';
import { Invoice, InvoiceType, Student } from '../types';
import { INITIAL_STUDENTS } from '../data/mockData';
import {
  INITIAL_INVOICES,
  formatKwanza,
  generateInvoiceNumber,
  generateAgtHash,
  generateAgtCvaCode,
  generateMulticaixaReference
} from '../utils/invoiceUtils';
import { alterFactPlusInvoice, createFactPlusInvoice } from '../utils/factplusApi';
import IssueInvoiceModal from './IssueInvoiceModal';
import BatchIssueInvoiceModal from './BatchIssueInvoiceModal';
import InvoiceDocumentView from './InvoiceDocumentView';

interface AdminSchoolDashboardProps {
  onClose?: () => void;
  students?: Student[];
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
  accessLevel: 'Super Admin' | 'Educadora (Tia)' | 'Docente' | 'SPO (Dados Sensíveis)' | 'Portaria / Segurança';
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

export default function AdminSchoolDashboard({ onClose, students }: AdminSchoolDashboardProps) {
  const effectiveStudents = students && students.length > 0 ? students : INITIAL_STUDENTS;
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
  const [receiptModalRecord, setReceiptModalRecord] = useState<any | null>(null);
  const [saftModalOpen, setSaftModalOpen] = useState(false);
  const [addClassModalOpen, setAddClassModalOpen] = useState(false);
  const [addStaffModalOpen, setAddStaffModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'Educadora (Tia)' | 'Portaria' | 'SPO' | 'Admin'>('Educadora (Tia)');
  const [commsModalOpen, setCommsModalOpen] = useState(false);

  // Estados da Facturação Electrónica (AGT)
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<Invoice | null>(null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [invoiceFilterType, setInvoiceFilterType] = useState<'all' | 'FE' | 'FRE' | 'pending' | 'liquidated'>('all');

  // Data: Turmas (Apenas Educação Infantil e Creche - 3 Ciclos de Desenvolvimento)
  const [classesList, setClassesList] = useState<ClassItem[]>([
    {
      id: 'c-1',
      name: 'Berçário Ninho de Afeto',
      cycle: 'Berçário',
      capacity: 14,
      enrolled: 14,
      ratio: '1:3 (Tia Educadora + 2 Auxiliares)',
      leadTeacher: 'Tia Denise Santos',
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
      ratio: '1:5 (Tia Educadora + Auxiliar)',
      leadTeacher: 'Tia Carla Mendes',
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
      ratio: '1:7 (Tia Educadora + Auxiliar)',
      leadTeacher: 'Tia Teresa Melo',
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
      ratio: '1:8 (Tia Educadora + Auxiliar)',
      leadTeacher: 'Tia Clara Marques',
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
      ratio: '1:10 (Tia Educadora + Auxiliar)',
      leadTeacher: 'Tia Sofia Neves',
      subjects: ['Literacia Emergente', 'Pensamento Matemático Concreto', 'Oficinas Maker', 'Autonomia & Cidadania'],
      room: 'Pavilhão A - Sala 01',
      schedule: '07:30 - 18:30 (Integral/Semi)'
    }
  ]);

  // Data: Facturas e Facturação Electrónica (FE / FRE - AGT)
  const [invoicesList, setInvoicesList] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem('mayelin_invoices');
      return saved ? JSON.parse(saved) : INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  });

  useEffect(() => {
    localStorage.setItem('mayelin_invoices', JSON.stringify(invoicesList));
  }, [invoicesList]);

  // Data: Recursos Humanos & RBAC
  const [staffList, setStaffList] = useState<StaffMember[]>([
    {
      id: 'staff-1',
      name: 'Tia Clara Marques',
      role: 'Educadora Titular (Jardim de Infância)',
      department: 'Corpo de Educadoras (Tias)',
      twoFactorEnabled: true,
      status: 'Ativo',
      lastAccess: 'Hoje, 09:18 (IP Institucional)',
      accessLevel: 'Educadora (Tia)',
      email: 'tia.clara@escolamayelin.pt'
    },
    {
      id: 'staff-2',
      name: 'Tia Teresa Melo',
      role: 'Educadora de Infância (Maternal)',
      department: 'Corpo de Educadoras (Tias)',
      twoFactorEnabled: true,
      status: 'Ativo',
      lastAccess: 'Hoje, 08:04 (Mobile App)',
      accessLevel: 'Educadora (Tia)',
      email: 'tia.teresa@escolamayelin.pt'
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
    let list = invoicesList;
    if (invoiceFilterType === 'FE') {
      list = list.filter((inv) => inv.documentType === 'FE');
    } else if (invoiceFilterType === 'FRE') {
      list = list.filter((inv) => inv.documentType === 'FRE');
    } else if (invoiceFilterType === 'pending') {
      list = list.filter(
        (inv) => inv.status === 'Emitida' || inv.status === 'Aviso Enviado' || inv.status === 'Em Aberto'
      );
    } else if (invoiceFilterType === 'liquidated') {
      list = list.filter((inv) => inv.status === 'Liquidada');
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (f) =>
        f.studentName.toLowerCase().includes(q) ||
        f.guardianName.toLowerCase().includes(q) ||
        f.guardianNif.includes(q) ||
        f.invoiceNumber.toLowerCase().includes(q) ||
        (f.electronic?.cvaCode && f.electronic.cvaCode.toLowerCase().includes(q))
    );
  }, [invoicesList, searchQuery, invoiceFilterType]);

  const nextInvoiceSequence = useMemo(() => {
    if (invoicesList.length === 0) return 150;
    return Math.max(...invoicesList.map((i) => i.sequenceNumber || 1)) + 1;
  }, [invoicesList]);

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
    setIsBatchModalOpen(true);
  };

  const handleSaveNewInvoice = (newInvoice: Invoice, openViewerImmediately: boolean) => {
    setInvoicesList((prev) => [newInvoice, ...prev]);
    setIsIssueModalOpen(false);
    showToast(
      `Factura Electrónica ${newInvoice.invoiceNumber} emitida e sincronizada com a AGT com sucesso!`
    );
    if (openViewerImmediately) {
      setSelectedInvoiceForView(newInvoice);
    }
  };

  const handleSaveBatch = (newInvoices: Invoice[]) => {
    setInvoicesList((prev) => [...newInvoices, ...prev]);
    setIsBatchModalOpen(false);
    showToast(
      `Lote de ${newInvoices.length} Facturas Electrónicas gerado e validado com sucesso pela AGT!`
    );
  };

  const handleMarkInvoiceAsPaid = (invoiceId: string) => {
    const invoice = invoicesList.find((inv) => inv.id === invoiceId);
    setInvoicesList((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          return {
            ...inv,
            status: 'Liquidada',
            paidAt: new Date().toISOString().split('T')[0]
          };
        }
        return inv;
      })
    );
    
    // Atualizar estado na FactPlus se for FE ou FRE
    if (invoice && (invoice.documentType === 'FE' || invoice.documentType === 'FRE')) {
      alterFactPlusInvoice(
        invoice.invoiceNumber,
        invoice.documentType,
        'Liquidada'
      ).catch((err) => console.error('Erro ao atualizar estado na FactPlus:', err));
    }
    
    showToast('Liquidação confirmada e recibo de quitação gerado no sistema!');
  };

  const handleCancelInvoice = (invoice: Invoice) => {
    const nextSeq = Math.max(...invoicesList.map((i) => i.sequenceNumber || 1)) + 1;
    const nceNumber = generateInvoiceNumber('NCE', 'MAY2025', nextSeq);
    const nceInvoice: Invoice = {
      ...invoice,
      id: `inv-nce-${Date.now()}`,
      documentType: 'NCE',
      invoiceNumber: nceNumber,
      sequenceNumber: nextSeq,
      issueDate: new Date().toISOString().split('T')[0],
      referencedInvoiceNumber: invoice.invoiceNumber,
      status: 'Liquidada',
      notes: `Anulação / Nota de Crédito Electrónica referente ao documento ${invoice.invoiceNumber}.`,
      electronic: {
        isElectronic: true,
        cvaCode: generateAgtCvaCode(new Date().getFullYear(), nextSeq),
        transmissionStatus: 'Validada_AGT',
        transmissionTimestamp: new Date().toISOString(),
        isContingency: false
      },
      agtHash: generateAgtHash({
        invoiceNumber: nceNumber,
        issueDate: new Date().toISOString().split('T')[0],
        totalAmount: invoice.totalAmount
      })
    };

    setInvoicesList((prev) => [
      nceInvoice,
      ...prev.map((i) => (i.id === invoice.id ? { ...i, status: 'Anulada' as const } : i))
    ]);

    // Cancelar factura original na FactPlus e criar NCE
    if (invoice.documentType === 'FE' || invoice.documentType === 'FRE') {
      alterFactPlusInvoice(
        invoice.invoiceNumber,
        invoice.documentType,
        'Anulada',
        `Anulada por Nota de Crédito ${nceNumber}`
      ).catch((err) => console.error('Erro ao cancelar factura na FactPlus:', err));
    }
    createFactPlusInvoice(nceInvoice).catch((err) => console.error('Erro ao criar NCE na FactPlus:', err));

    showToast(`Nota de Crédito Electrónica ${nceNumber} emitida com sucesso!`);
    setSelectedInvoiceForView(nceInvoice);
  };

  return (
    <div
      role="region"
      aria-label="Painel de Administração e Gestão Escolar"
      className="bg-[#fff8f5] text-[#211a14] w-full flex-1 flex flex-col overflow-hidden font-['Nunito_Sans'] antialiased min-h-0"
    >
      {/* ========================================================================= */}
      {/* 1. TOPNAVBAR - NAVEGAÇÃO EXECUTIVA & BARRA SUPERIOR INTEGRADA            */}
      {/* ========================================================================= */}
      <header
        className="bg-white border-b border-[#eee0d6] px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 z-20"
        role="banner"
      >
        {/* Brand & Active School Year */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-100 text-[#ed145b] flex items-center justify-center font-bold shadow-xs shrink-0">
            <Building2 className="w-5 h-5 text-[#ed145b]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-bold font-['Quicksand'] text-[#211a14] leading-tight">
                Administração & Gestão Escolar
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Ano Letivo {selectedYear} Ativo
              </span>
              <span
                className="text-[10px] font-semibold bg-[#faebe1] text-[#5c3f42] px-2 py-0.5 rounded border border-[#eee0d6]"
                title="Conforme o Regulamento Geral sobre a Proteção de Dados e diretrizes WCAG 2.1 AA"
              >
                RGPD • WCAG 2.1 AA
              </span>
            </div>
            <p className="text-[11px] text-[#5c3f42]">
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
            <Search className="w-4 h-4 text-[#8c6b6d] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="admin-global-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por educando, turma (Berçário, Maternal, Jardim), NIF ou processo..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#fff8f5] border border-[#eee0d6] focus:bg-white focus:border-[#ed145b] focus:ring-2 focus:ring-pink-100 focus:outline-none transition-all placeholder:text-[#8c6b6d]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8c6b6d] hover:text-[#5c3f42] text-xs"
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
              className="relative p-2 rounded-xl text-[#5c3f42] hover:bg-[#faebe1] focus:outline-none focus:ring-2 focus:ring-[#ed145b] transition-colors"
              aria-label="Central de notificações executivas"
              aria-expanded={notificationOpen}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ed145b] rounded-full ring-2 ring-white" />
            </button>

            {notificationOpen && (
              <div
                className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#eee0d6] p-3 z-50 text-xs animate-in fade-in zoom-in-95"
                role="dialog"
                aria-label="Notificações"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#eee0d6] mb-2">
                  <span className="font-bold text-[#211a14]">Alertas Executivos</span>
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
          <div className="flex items-center gap-2.5 pl-2 border-l border-[#eee0d6]">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#ed145b] to-purple-600 p-0.5 shadow-sm">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-xs text-[#ed145b]">
                MC
              </div>
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold text-[#211a14] block leading-tight">
                Dra. Manuela Castro
              </span>
              <span className="text-[10px] text-[#5c3f42] block leading-tight">
                Diretora da Secretaria Geral • 2FA Ativo
              </span>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-[#5c3f42] hover:text-[#211a14] hover:bg-[#faebe1] transition-colors flex items-center gap-1.5 text-xs font-bold"
              aria-label="Voltar ao Website"
              title="Voltar ao Website"
            >
              <ArrowLeft className="w-4 h-4 text-pink-600" />
              <span className="hidden sm:inline">Voltar ao Website</span>
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
          className="w-full md:w-64 bg-white text-[#5c3f42] p-3 sm:p-4 flex md:flex-col justify-between shrink-0 overflow-x-auto md:overflow-y-auto border-r border-[#eee0d6]"
          aria-label="Menu principal de gestão"
        >
          <div className="flex md:flex-col gap-1 w-full">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#8c6b6d] px-3 py-1.5 hidden md:block">
              Módulos Institucionais
            </span>

            <button
              type="button"
              onClick={() => setActiveSection('overview')}
              className={`min-h-[42px] w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all text-left whitespace-nowrap cursor-pointer ${
                activeSection === 'overview'
                  ? 'bg-[#ed145b] text-white shadow-md shadow-pink-500/20'
                  : 'text-[#5c3f42] hover:bg-[#fff1e7] hover:text-[#211a14]'
              }`}
            >
              <Activity className="w-4 h-4 shrink-0" />
              <span>Visão Geral</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('classes')}
              className={`min-h-[42px] w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all text-left whitespace-nowrap cursor-pointer ${
                activeSection === 'classes'
                  ? 'bg-[#ed145b] text-white shadow-md shadow-pink-500/20'
                  : 'text-[#5c3f42] hover:bg-[#fff1e7] hover:text-[#211a14]'
              }`}
            >
              <GraduationCap className="w-4 h-4 shrink-0" />
              <span>Utilizadores e Turmas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('finance')}
              className={`min-h-[42px] w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all text-left whitespace-nowrap cursor-pointer ${
                activeSection === 'finance'
                  ? 'bg-[#ed145b] text-white shadow-md shadow-pink-500/20'
                  : 'text-[#5c3f42] hover:bg-[#fff1e7] hover:text-[#211a14]'
              }`}
            >
              <DollarSign className="w-4 h-4 shrink-0" />
              <span>Gestão Financeira</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('hr')}
              className={`min-h-[42px] w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all text-left whitespace-nowrap cursor-pointer ${
                activeSection === 'hr'
                  ? 'bg-[#ed145b] text-white shadow-md shadow-pink-500/20'
                  : 'text-[#5c3f42] hover:bg-[#fff1e7] hover:text-[#211a14]'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Recursos Humanos & RBAC</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('comms')}
              className={`min-h-[42px] w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all text-left whitespace-nowrap cursor-pointer ${
                activeSection === 'comms'
                  ? 'bg-[#ed145b] text-white shadow-md shadow-pink-500/20'
                  : 'text-[#5c3f42] hover:bg-[#fff1e7] hover:text-[#211a14]'
              }`}
            >
              <Send className="w-4 h-4 shrink-0" />
              <span>Comunicação em Massa</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('settings')}
              className={`min-h-[42px] w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all text-left whitespace-nowrap cursor-pointer ${
                activeSection === 'settings'
                  ? 'bg-[#ed145b] text-white shadow-md shadow-pink-500/20'
                  : 'text-[#5c3f42] hover:bg-[#fff1e7] hover:text-[#211a14]'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Configurações & RGPD</span>
            </button>
          </div>

          <div className="pt-3 border-t border-[#eee0d6] hidden md:block">
            <div className="p-2.5 rounded-xl bg-[#faebe1] text-[11px] space-y-1 border border-[#eee0d6]">
              <p className="font-bold text-[#211a14]">Segurança de Dados</p>
              <p className="text-[#5c3f42]">
                Auditoria de sessões ativa com encriptação AES-256 e backups horários.
              </p>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
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
          {/* SECÇÃO 1: VISÃO GERAL (INDICADORES EXECUTIVOS GLOBAIS - MÉTRICAS-CHAVE)   */}
          {/* ========================================================================= */}
          {activeSection === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Executive Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total de Alunos Inscritos */}
                <div className="bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs hover:border-pink-200 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#5c3f42]">Total de Alunos Inscritos</span>
                    <div className="w-8 h-8 rounded-xl bg-pink-100 text-[#ed145b] flex items-center justify-center">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold font-['Quicksand'] text-[#211a14] mt-2">
                    482
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-bold">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>+3.4% vs. ano anterior (98% ocupação)</span>
                  </div>
                </div>

                {/* 2. Corpo de Educadoras (Tias) & Equipa */}
                <div className="bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs hover:border-sky-200 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#5c3f42]">Corpo de Educadoras (Tias) & Equipa</span>
                    <div className="w-8 h-8 rounded-xl bg-sky-100 text-[#00a6c0] flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold font-['Quicksand'] text-[#211a14] mt-2">
                    54
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-sky-700 font-bold">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    <span>100% com 2FA validado</span>
                  </div>
                </div>

                {/* 3. Faturação do Mês */}
                <div className="bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs hover:border-emerald-200 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#5c3f42]">Faturação do Mês</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-extrabold font-['Quicksand'] text-[#211a14] mt-2">
                    Kz 48.250.000
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-700 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>94.2% liquidação (5.8% pendente)</span>
                  </div>
                </div>

                {/* 4. Taxa de Entrega de Comunicados */}
                <div className="bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs hover:border-purple-200 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#5c3f42]">Taxa de Abertura Circular</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                      <Send className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold font-['Quicksand'] text-[#211a14] mt-2">
                    99.1%
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-purple-700 font-bold">
                    <span>28 circulares emitidas (App & E-mail)</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold font-['Quicksand'] text-[#211a14]">
                    Ações Rápidas de Coordenação Geral
                  </h3>
                  <span className="text-xs text-[#8c6b6d]">
                    Operações certificadas em lote
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={handleExportSaft}
                    className="p-3.5 rounded-xl bg-[#fff8f5] border border-[#eee0d6] hover:bg-pink-50 hover:border-pink-200 text-[#211a14] text-xs font-bold flex items-center gap-2.5 transition-all text-left"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-[#ed145b] shrink-0" />
                    <span>Exportar SAF-T (AO)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDispatchReminders}
                    className="p-3.5 rounded-xl bg-[#fff8f5] border border-[#eee0d6] hover:bg-amber-50 hover:border-amber-200 text-[#211a14] text-xs font-bold flex items-center gap-2.5 transition-all text-left"
                  >
                    <RefreshCw className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Lembretes de Propinas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSection('comms')}
                    className="p-3.5 rounded-xl bg-[#fff8f5] border border-[#eee0d6] hover:bg-sky-50 hover:border-sky-200 text-[#211a14] text-xs font-bold flex items-center gap-2.5 transition-all text-left"
                  >
                    <Send className="w-4 h-4 text-[#00a6c0] shrink-0" />
                    <span>Emitir Circular Urgente</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAddClassModalOpen(true)}
                    className="p-3.5 rounded-xl bg-[#fff8f5] border border-[#eee0d6] hover:bg-purple-50 hover:border-purple-200 text-[#211a14] text-xs font-bold flex items-center gap-2.5 transition-all text-left"
                  >
                    <Plus className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Adicionar Turma</span>
                  </button>
                </div>
              </div>

              {/* Status de Liquidação & Ciclos Formativos Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs space-y-3">
                  <h4 className="text-sm font-bold font-['Quicksand'] text-[#211a14]">
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
                    <div className="w-full bg-[#faebe1] h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '94.2%' }} />
                    </div>

                    <div className="flex justify-between font-semibold pt-2">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        28 Avisos Enviados (Kz 2.798.500)
                      </span>
                      <span className="text-amber-700 font-bold">5.8%</span>
                    </div>
                    <div className="w-full bg-[#faebe1] h-2.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '5.8%' }} />
                    </div>

                    <div className="flex justify-between font-semibold pt-2 text-[#5c3f42]">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#eee0d6]" />
                        Casos em Contencioso Judicial
                      </span>
                      <span className="text-emerald-600 font-bold">0 Casos (0%)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs space-y-3">
                  <h4 className="text-sm font-bold font-['Quicksand'] text-[#211a14]">
                    Segurança e Controlo de Acessos RBAC
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-[#fff8f5] border border-[#eee0d6] flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[#211a14]">Autenticação de Dois Fatores (2FA)</p>
                        <p className="text-[#5c3f42] text-[11px]">Obrigatória para todos os 54 colaboradores</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        100% Conforme
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#fff8f5] border border-[#eee0d6] flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[#211a14]">Proteção de Dados de Saúde (SPO)</p>
                        <p className="text-[#5c3f42] text-[11px]">Acesso estritamente restrito à Dra. Sofia Ramos</p>
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
                  <h3 className="text-base font-bold font-['Quicksand'] text-[#211a14]">
                    Gestão de Turmas, Lotação & Matriz Curricular
                  </h3>
                  <p className="text-xs text-[#5c3f42]">
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
              <div className="bg-white rounded-2xl border border-[#eee0d6] overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#fff8f5] border-b border-[#eee0d6] text-[#5c3f42] font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3.5">Turma & Ciclo</th>
                        <th className="p-3.5">Lotação / Rácio</th>
                        <th className="p-3.5">Educadora Titular (Tia) / Coordenadora</th>
                        <th className="p-3.5">Matriz de Disciplinas</th>
                        <th className="p-3.5 text-right">Ações Pedagógicas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eee0d6]">
                      {filteredClasses.map((item) => (
                        <tr key={item.id} className="hover:bg-[#fff1e7]/70 transition-colors">
                          <td className="p-3.5">
                            <p className="font-bold text-[#211a14]">{item.name}</p>
                            <span className="text-[10px] font-semibold text-[#5c3f42] block">
                              {item.cycle} • {item.room}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-bold ${
                                  item.enrolled >= item.capacity ? 'text-[#ed145b]' : 'text-[#211a14]'
                                }`}
                              >
                                {item.enrolled} / {item.capacity}
                              </span>
                              <span className="text-[10px] bg-[#faebe1] text-[#5c3f42] px-2 py-0.5 rounded-md font-semibold">
                                {item.ratio}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#8c6b6d] block mt-0.5">{item.schedule}</span>
                          </td>

                          <td className="p-3.5">
                            <span className="font-bold text-[#211a14] block">{item.leadTeacher}</span>
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
                                className="px-2.5 py-1 bg-[#faebe1] hover:bg-[#f4e6db] text-[#5c3f42] rounded-lg font-bold text-[11px] transition-colors"
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
                  <h3 className="text-base font-bold font-['Quicksand'] text-[#211a14]">
                    Gestão Financeira, Faturação e Multicaixa Express
                  </h3>
                  <p className="text-xs text-[#5c3f42]">
                    454 Propinas liquidadas • 28 com aviso enviado • 0 em contencioso • Valores em Kwanza (Kz)
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsIssueModalOpen(true)}
                    className="min-h-[38px] px-4 py-1.5 rounded-xl bg-[#ed145b] text-white font-bold text-xs shadow-md hover:bg-[#d0104f] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Emitir Factura (FE)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleIssueInvoiceBatch}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm hover:bg-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Emitir em Lote (AGT)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportSaft}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#211a14] text-white font-bold text-xs shadow-sm hover:bg-[#382b22] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar SAF-T (AO)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDispatchReminders}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-sm hover:bg-amber-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Disparar Lembretes</span>
                  </button>
                </div>
              </div>

              {/* Barra de Filtros de Facturação Electrónica */}
              <div className="flex items-center gap-1.5 sm:gap-2 border border-[#eee0d6] p-1.5 rounded-2xl bg-white overflow-x-auto text-xs">
                <span className="text-[11px] font-bold text-[#8c6b6d] px-2 flex items-center gap-1 shrink-0">
                  <Filter className="w-3.5 h-3.5" /> Filtros:
                </span>
                {[
                  { id: 'all', label: `Todos (${invoicesList.length})` },
                  { id: 'FE', label: `Facturas FE (${invoicesList.filter((i) => i.documentType === 'FE').length})` },
                  { id: 'FRE', label: `Facturas-Recibo FRE (${invoicesList.filter((i) => i.documentType === 'FRE').length})` },
                  { id: 'pending', label: `Por Liquidar (${invoicesList.filter((i) => i.status !== 'Liquidada' && i.status !== 'Anulada').length})` },
                  { id: 'liquidated', label: `Liquidadas (${invoicesList.filter((i) => i.status === 'Liquidada').length})` }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setInvoiceFilterType(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      invoiceFilterType === tab.id
                        ? 'bg-[#211a14] text-white'
                        : 'text-[#5c3f42] hover:bg-[#fff1e7]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tabela de Facturas e Registos Fiscais */}
              <div className="bg-white rounded-2xl border border-[#eee0d6] overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#fff8f5] border-b border-[#eee0d6] text-[#5c3f42] font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3.5">Documento & Certificação AGT</th>
                        <th className="p-3.5">Aluno & Turma</th>
                        <th className="p-3.5">Responsável Financeiro (NIF)</th>
                        <th className="p-3.5">Método de Liquidação</th>
                        <th className="p-3.5">Valor (Kz) & Vencimento</th>
                        <th className="p-3.5">Estado</th>
                        <th className="p-3.5 text-right">Ações Oficiais</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eee0d6]">
                      {filteredFinance.map((record) => (
                        <tr key={record.id} className="hover:bg-[#fff1e7]/70 transition-colors">
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold font-mono text-[#211a14] text-xs">
                                {record.invoiceNumber}
                              </span>
                              <span
                                className={`px-1.5 py-0.2 rounded font-extrabold text-[9px] ${
                                  record.documentType === 'FE'
                                    ? 'bg-pink-100 text-[#ed145b]'
                                    : record.documentType === 'FRE'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : record.documentType === 'NCE'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {record.documentType}
                              </span>
                            </div>
                            {record.electronic?.cvaCode ? (
                              <span className="text-[10px] text-emerald-700 font-mono block mt-0.5" title="Código de Validação da AGT">
                                ✓ CVA: {record.electronic.cvaCode}
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-700 font-mono block mt-0.5">
                                • Modo Contingência
                              </span>
                            )}
                          </td>

                          <td className="p-3.5">
                            <p className="font-bold text-[#211a14]">{record.studentName}</p>
                            <span className="text-[10px] text-[#5c3f42]">{record.classroom}</span>
                          </td>

                          <td className="p-3.5">
                            <span className="font-bold text-[#211a14] block">{record.guardianName}</span>
                            <span className="text-[10px] text-[#5c3f42] font-mono">
                              NIF: {record.guardianNif}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <span className="font-semibold text-[#5c3f42] flex items-center gap-1">
                              <CreditCard className="w-3.5 h-3.5 text-[#8c6b6d]" />
                              {record.paymentMethod || 'Multicaixa Express'}
                            </span>
                            {record.paymentReference?.reference && (
                              <span className="text-[10px] text-[#8c6b6d] font-mono block">
                                Ref: {record.paymentReference.reference}
                              </span>
                            )}
                          </td>

                          <td className="p-3.5">
                            <span className="font-bold text-[#211a14] font-mono">
                              {formatKwanza(record.totalAmount)}
                            </span>
                            <span className="text-[10px] text-[#5c3f42] block">Venc: {record.dueDate}</span>
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] inline-block ${
                                record.status === 'Liquidada'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : record.status === 'Anulada'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {record.status}
                            </span>
                            {record.paidAt && (
                              <span className="text-[9px] text-[#8c6b6d] block mt-0.5 font-mono">
                                Pago em: {record.paidAt}
                              </span>
                            )}
                          </td>

                          <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                            {/* Ver Factura Oficial A4 / PDF */}
                            <button
                              type="button"
                              onClick={() => setSelectedInvoiceForView(record)}
                              className="px-2.5 py-1 bg-white hover:bg-pink-50 border border-pink-200 text-[#ed145b] rounded-lg font-bold text-[11px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                              title="Visualizar e Imprimir Factura Electrónica (PDF/A4)"
                            >
                              <FileText className="w-3 h-3" />
                              <span>Ver FE</span>
                            </button>

                            {/* Recibo AGT (se Liquidada) */}
                            {record.status === 'Liquidada' && (
                              <button
                                type="button"
                                onClick={() =>
                                  setReceiptModalRecord({
                                    id: record.id,
                                    studentName: record.studentName,
                                    guardianName: record.guardianName,
                                    nif: record.guardianNif,
                                    classGroup: record.classroom,
                                    amount: record.totalAmount,
                                    paymentMethod: record.paymentMethod || 'Multicaixa Express (MCX)',
                                    status: 'Liquidado',
                                    invoiceNumber: record.invoiceNumber,
                                    dueDate: record.dueDate,
                                    paidDate: record.paidAt || record.dueDate
                                  })
                                }
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold text-[11px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                                title="Ver Recibo de Quitação AGT"
                              >
                                <Printer className="w-3 h-3" />
                                <span>Recibo</span>
                              </button>
                            )}

                            {/* Liquidar (se pendente) */}
                            {record.status !== 'Liquidada' && record.status !== 'Anulada' && (
                              <button
                                type="button"
                                onClick={() => handleMarkInvoiceAsPaid(record.id)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] transition-colors inline-flex items-center gap-0.5 cursor-pointer"
                                title="Registar Liquidação de Propina"
                              >
                                <Check className="w-3 h-3" />
                                <span>Liquidar</span>
                              </button>
                            )}

                            {/* Anular com NCE */}
                            {record.status !== 'Anulada' && record.documentType !== 'NCE' && (
                              <button
                                type="button"
                                onClick={() => handleCancelInvoice(record)}
                                className="px-1.5 py-1 text-rose-500 hover:bg-rose-50 rounded-lg font-bold text-[10px] transition-colors inline-flex items-center cursor-pointer"
                                title="Anular com Nota de Crédito Electrónica (NCE)"
                              >
                                Anular
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
          {/* SECÇÃO 4: RECURSOS HUMANOS & GESTÃO DE ACESSOS COM PRIVILÉGIOS (RBAC)     */}
          {/* ========================================================================= */}
          {activeSection === 'hr' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold font-['Quicksand'] text-[#211a14]">
                    Recursos Humanos & Gestão de Acessos com Privilégios (RBAC)
                  </h3>
                  <p className="text-xs text-[#5c3f42]">
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
              <div className="bg-white rounded-2xl border border-[#eee0d6] overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#fff8f5] border-b border-[#eee0d6] text-[#5c3f42] font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3.5">Colaborador</th>
                        <th className="p-3.5">Departamento & Função</th>
                        <th className="p-3.5">Nível de Acesso (RBAC)</th>
                        <th className="p-3.5">Segurança 2FA</th>
                        <th className="p-3.5">Último Acesso Registado</th>
                        <th className="p-3.5 text-right">Ação Preventiva</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eee0d6]">
                      {filteredStaff.map((staff) => (
                        <tr key={staff.id} className="hover:bg-[#fff1e7]/70 transition-colors">
                          <td className="p-3.5">
                            <p className="font-bold text-[#211a14]">{staff.name}</p>
                            <span className="text-[10px] text-[#5c3f42]">{staff.email}</span>
                          </td>

                          <td className="p-3.5">
                            <span className="font-semibold text-[#211a14] block">{staff.role}</span>
                            <span className="text-[10px] text-[#5c3f42]">{staff.department}</span>
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
                            <span className="text-[#5c3f42] font-mono text-[11px]">{staff.lastAccess}</span>
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
                  <h3 className="text-base font-bold font-['Quicksand'] text-[#211a14]">
                    Comunicação Geral & Disparo de Circulares em Massa
                  </h3>
                  <p className="text-xs text-[#5c3f42]">
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
                    className="bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs space-y-3 hover:border-pink-200 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="font-bold text-sm font-['Quicksand'] text-[#211a14]">
                        {ann.title}
                      </h4>
                      <span className="text-xs text-[#8c6b6d]">{ann.date}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {ann.channels.map((ch, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-[#faebe1] text-[#5c3f42] text-[10px] font-bold"
                        >
                          {ch}
                        </span>
                      ))}

                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Taxa de Leitura: {ann.openRate}%
                      </span>

                      <span className="text-xs font-bold text-[#5c3f42] bg-[#faebe1] px-2 py-0.5 rounded-md">
                        {ann.recipientCount} Encarregados Destinatários
                      </span>
                    </div>

                    {ann.authorizationsRequired && (
                      <div className="p-3 bg-pink-50/70 border border-pink-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-[#ed145b]">
                            Autorizações Digitais de Saída: {ann.authorizationsSignedCount} de {ann.authorizationsTotal} Colhidas
                          </p>
                          <p className="text-[11px] text-[#5c3f42]">
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
              <h3 className="text-base font-bold font-['Quicksand'] text-[#211a14]">
                Configurações da Instituição, Conformidade RGPD & Acessibilidade
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#eee0d6] space-y-3">
                  <h4 className="font-bold text-sm text-[#211a14] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Conformidade com o RGPD (Regulamento UE 2016/679)</span>
                  </h4>
                  <p className="text-xs text-[#5c3f42] leading-relaxed">
                    Todos os dados pessoais de alunos e encarregados são anonimizados nos relatórios estatísticos. O consentimento informado para captura fotográfica e saídas pedagógicas é auditado e armazenado com data/hora.
                  </p>
                  <div className="pt-2">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-full">
                      Encarregado de Proteção de Dados (DPO) Ativo
                    </span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#eee0d6] space-y-3">
                  <h4 className="font-bold text-sm text-[#211a14] flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-[#00a6c0]" />
                    <span>Padrões de Acessibilidade WCAG 2.1 AA</span>
                  </h4>
                  <p className="text-xs text-[#5c3f42] leading-relaxed">
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  AGT
                </div>
                <div>
                  <h3 id="receipt-modal-title" className="font-bold text-sm text-[#211a14] font-['Quicksand']">
                    Recibo de Quitação Certificado (AGT)
                  </h3>
                  <p className="text-[10px] text-[#5c3f42] font-mono">
                    {receiptModalRecord.invoiceNumber} • Software Certificado nº 1482/AGT • Luanda
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReceiptModalRecord(null)}
                className="p-1 rounded-lg text-[#8c6b6d] hover:text-[#5c3f42]"
                aria-label="Fechar recibo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#fff8f5] p-4 rounded-2xl border border-[#eee0d6] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#5c3f42]">Educando:</span>
                <span className="font-bold text-[#211a14]">{receiptModalRecord.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5c3f42]">Encarregado / NIF:</span>
                <span className="font-bold text-[#211a14]">
                  {receiptModalRecord.guardianName} (NIF {receiptModalRecord.nif})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5c3f42]">Turma (Ciclo):</span>
                <span className="font-bold text-[#211a14]">{receiptModalRecord.classGroup}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5c3f42]">Método de Liquidação:</span>
                <span className="font-bold text-[#211a14]">{receiptModalRecord.paymentMethod}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#eee0d6] text-sm">
                <span className="font-bold text-[#211a14]">Total Liquidado (Moeda Nacional):</span>
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
                className="px-4 py-2 bg-[#211a14] text-white rounded-xl text-xs font-bold hover:bg-[#382b22] flex items-center gap-1.5"
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-[#ed145b]" />
                <h3 id="saft-modal-title" className="font-bold text-sm text-[#211a14] font-['Quicksand']">
                  Exportação de Ficheiro Fiscal SAF-T (AO)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSaftModalOpen(false)}
                className="p-1 rounded-lg text-[#8c6b6d] hover:text-[#5c3f42]"
                aria-label="Fechar modal SAF-T"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#5c3f42] leading-relaxed">
              O ficheiro XML padrão da Administração Geral Tributária (AGT - Angola) inclui todos os lançamentos de faturação, recibos emitidos e auditoria de propinas em Kwanzas (Kz) do período corrente.
            </p>

            <div className="bg-[#fff8f5] p-3.5 rounded-xl border border-[#eee0d6] text-xs space-y-1.5">
              <p className="font-bold text-[#211a14]">SAF-T_AO_Mayelin_2024-10.xml</p>
              <p className="text-[11px] text-[#5c3f42]">Tamanho estimado: 1.2 MB • 482 Registos em Kwanzas</p>
              <p className="text-[11px] text-emerald-700 font-bold">Validação de Schema AGT: Aprovada</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSaftModalOpen(false)}
                className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl text-xs font-bold hover:bg-[#f4e6db]"
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <h3 id="addclass-modal-title" className="font-bold text-sm text-[#211a14] font-['Quicksand']">
                Criar Nova Turma de Educação Infantil
              </h3>
              <button
                type="button"
                onClick={() => setAddClassModalOpen(false)}
                className="p-1 rounded-lg text-[#8c6b6d] hover:text-[#5c3f42]"
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
                <label className="font-bold text-[#5c3f42] block mb-1">Nome da Turma</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Maternal II - Sala dos Girassóis ou Berçário B"
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6] focus:outline-none focus:border-[#ed145b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#5c3f42] block mb-1">Ciclo de Desenvolvimento</label>
                  <select className="w-full p-2.5 rounded-xl border border-[#eee0d6] bg-white">
                    <option>Berçário (3 meses a 1 ano)</option>
                    <option>Maternal I & II (1 a 3 anos)</option>
                    <option>Pré-Escolar & Jardim de Infância (3 a 5 anos)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#5c3f42] block mb-1">Lotação Máxima</label>
                  <input
                    type="number"
                    defaultValue={18}
                    className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Educadora Titular (Tia) / Coordenadora</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Tia Beatriz Lima (Educadora)"
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddClassModalOpen(false)}
                  className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold"
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <h3 id="addstaff-modal-title" className="font-bold text-sm text-[#211a14] font-['Quicksand']">
                Convidar Colaborador com Privilégios (RBAC)
              </h3>
              <button
                type="button"
                onClick={() => setAddStaffModalOpen(false)}
                className="p-1 rounded-lg text-[#8c6b6d] hover:text-[#5c3f42]"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newStaffName.trim() || !newStaffEmail.trim()) return;

                const isEducadora = newStaffRole === 'Educadora (Tia)';
                const processedName = isEducadora ? formatEducatorName(newStaffName) : newStaffName.trim();

                const newStaffItem: StaffMember = {
                  id: `staff-${Date.now()}`,
                  name: processedName,
                  role: isEducadora
                    ? 'Educadora de Infância (Tia)'
                    : newStaffRole === 'Portaria'
                    ? 'Agente de Portaria & Segurança'
                    : newStaffRole === 'SPO'
                    ? 'Técnico de Psicologia (SPO)'
                    : 'Secretaria Geral & Gestão',
                  department: isEducadora
                    ? 'Corpo de Educadoras (Tias)'
                    : newStaffRole === 'Portaria'
                    ? 'Operações e Segurança'
                    : newStaffRole === 'SPO'
                    ? 'SPO (Serviço de Psicologia e Orientação)'
                    : 'Secretaria e Conselho Executivo',
                  twoFactorEnabled: true,
                  status: 'Ativo',
                  lastAccess: 'Convite enviado (Pendente 2FA)',
                  accessLevel: isEducadora
                    ? 'Educadora (Tia)'
                    : newStaffRole === 'Portaria'
                    ? 'Portaria / Segurança'
                    : newStaffRole === 'SPO'
                    ? 'SPO (Dados Sensíveis)'
                    : 'Super Admin',
                  email: newStaffEmail.trim()
                };

                setStaffList([newStaffItem, ...staffList]);
                setNewStaffName('');
                setNewStaffEmail('');
                setAddStaffModalOpen(false);

                showToast(
                  isEducadora
                    ? `Educadora cadastrada com sucesso como "${processedName}" com o prefixo 'Tia'!`
                    : `Colaborador ${processedName} adicionado à equipa com sucesso.`
                );
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">
                  Nome Completo {newStaffRole === 'Educadora (Tia)' && <span className="text-[#ed145b] font-normal">• Prefixo "Tia" aplicado automaticamente</span>}
                </label>
                <input
                  type="text"
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder={
                    newStaffRole === 'Educadora (Tia)'
                      ? 'Ex: Paula Santos (ficará registada como Tia Paula Santos)'
                      : 'Ex: Gonçalo Ferreira'
                  }
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6] focus:outline-none focus:border-[#ed145b] text-[#211a14] bg-[#fff8f5]"
                />
                {newStaffRole === 'Educadora (Tia)' && newStaffName.trim() && (
                  <p className="text-[11px] text-[#ed145b] font-bold mt-1 flex items-center gap-1">
                    <span>Nome oficial no portal:</span>
                    <span className="bg-pink-100 text-[#ed145b] px-2 py-0.5 rounded-md">
                      {formatEducatorName(newStaffName)}
                    </span>
                  </p>
                )}
              </div>

              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">E-mail Institucional</label>
                <input
                  type="email"
                  required
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  placeholder="nome@escolamayelin.pt"
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6] focus:outline-none focus:border-[#ed145b] text-[#211a14] bg-[#fff8f5]"
                />
              </div>

              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Nível de Acesso (RBAC)</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6] bg-white text-[#211a14] focus:outline-none focus:border-[#ed145b]"
                >
                  <option value="Educadora (Tia)">Educadora (Tia - Diário de Cuidados, Observações & Frequência)</option>
                  <option value="Portaria">Portaria / Segurança (Apenas Saídas)</option>
                  <option value="SPO">SPO (Psicologia e Dados Sensíveis)</option>
                  <option value="Admin">Administrativo / Secretaria</option>
                </select>
              </div>

              {newStaffRole === 'Educadora (Tia)' && (
                <div className="p-3 bg-pink-50 border border-pink-200 rounded-xl text-[11px] text-[#5c3f42] flex items-start gap-2">
                  <span className="text-base leading-none">🌸</span>
                  <div>
                    <strong className="text-[#ed145b] block font-bold">Norma Pedagógica da Creche:</strong>
                    Por se tratar de uma creche acolhedora, todas as educadoras e berçaristas são tratadas carinhosamente por <strong>"Tia"</strong>. O prefixo é padronizado em todo o portal escolar, diários e comunicações às famílias.
                  </div>
                </div>
              )}

              <div className="p-3 bg-[#fff8f5] border border-[#eee0d6] rounded-xl text-[11px] text-[#5c3f42]">
                O colaborador receberá um link seguro de ativação com chave OTP para configuração mandatória de 2FA.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddStaffModalOpen(false)}
                  className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold cursor-pointer hover:bg-[#eee0d6]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ed145b] text-white rounded-xl font-bold hover:bg-pink-600 cursor-pointer shadow-xs active:scale-95"
                >
                  Cadastrar Colaborador
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <h3 id="comms-modal-title" className="font-bold text-sm text-[#211a14] font-['Quicksand']">
                Emitir Circular em Massa (Push, E-mail & SMS)
              </h3>
              <button
                type="button"
                onClick={() => setCommsModalOpen(false)}
                className="p-1 rounded-lg text-[#8c6b6d] hover:text-[#5c3f42]"
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
                <label className="font-bold text-[#5c3f42] block mb-1">Título da Circular</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Circular Geral: Preparação para as Férias de Natal"
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                />
              </div>

              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Canais de Disparo Simultâneo</label>
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
                <label className="font-bold text-[#5c3f42] block mb-1">Conteúdo da Circular</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Escreva a mensagem oficial que será enviada aos encarregados..."
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="auth-req" className="rounded text-[#ed145b]" />
                <label htmlFor="auth-req" className="font-semibold text-[#5c3f42] cursor-pointer">
                  Exigir assinatura digital de autorização do encarregado
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCommsModalOpen(false)}
                  className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold"
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

      {/* ========================================================================= */}
      {/* MODAL: EMISSÃO INDIVIDUAL DE FACTURA ELECTRÓNICA (FE / AGT)               */}
      {/* ========================================================================= */}
      <IssueInvoiceModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onSaveInvoice={handleSaveNewInvoice}
        studentsList={effectiveStudents}
        nextSequenceNumber={nextInvoiceSequence}
      />

      {/* ========================================================================= */}
      {/* MODAL: EMISSÃO EM LOTE DE FACTURAS ELECTRÓNICAS (AGT)                     */}
      {/* ========================================================================= */}
      <BatchIssueInvoiceModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onSaveBatch={handleSaveBatch}
        studentsList={effectiveStudents}
        currentSequenceNumber={nextInvoiceSequence}
      />

      {/* ========================================================================= */}
      {/* MODAL: VISUALIZADOR OFICIAL A4 / PDF DA FACTURA ELECTRÓNICA (AGT)          */}
      {/* ========================================================================= */}
      {selectedInvoiceForView && (
        <InvoiceDocumentView
          invoice={selectedInvoiceForView}
          onClose={() => setSelectedInvoiceForView(null)}
          onSendEmail={(inv) =>
            showToast(
              `Factura Electrónica ${inv.invoiceNumber} enviada por e-mail para ${inv.guardianEmail}!`
            )
          }
        />
      )}
    </div>
  );
}
