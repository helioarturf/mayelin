import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  Bell,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  DollarSign,
  CreditCard,
  Download,
  Send,
  Users,
  Building2,
  GraduationCap,
  Settings,
  ArrowUpRight,
  ArrowLeft,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  Activity,
  UserCheck,
  UserX,
  X,
  Printer,
  FileCode,
  SlidersHorizontal,
  Baby,
  DoorOpen,
  Paperclip,
  Upload,
  FileText
} from 'lucide-react';
import { formatEducatorName } from '../utils/formatters';
import {
  AnnouncementAttachmentPayload,
  AuthUser,
  DbAnnouncement,
  DbClassroom,
  DbFinancialRecord,
  DbPickupAuthorization,
  DbStaffMember,
  DbStudent,
  DbVisitAppointment,
  FactPlusStatusResponse,
  FactPlusValidationResponse,
  FactPlusVerifyReferenceResponse,
  portalApi
} from '../lib/api';

interface AdminSchoolDashboardProps {
  authToken: string;
  currentUser: AuthUser;
  onClose?: () => void;
  headerPortalTarget?: HTMLElement | null;
}

type AdminSection = 'overview' | 'classes' | 'finance' | 'hr' | 'comms' | 'settings';

export default function AdminSchoolDashboard({
  authToken,
  currentUser,
  onClose,
  headerPortalTarget
}: AdminSchoolDashboardProps) {
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Supabase Live Data States
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [classesList, setClassesList] = useState<DbClassroom[]>([]);
  const [studentsList, setStudentsList] = useState<DbStudent[]>([]);
  const [financialRecords, setFinancialRecords] = useState<DbFinancialRecord[]>([]);
  const [staffList, setStaffList] = useState<DbStaffMember[]>([]);
  const [announcementsList, setAnnouncementsList] = useState<DbAnnouncement[]>([]);
  const [appointmentsList, setAppointmentsList] = useState<DbVisitAppointment[]>([]);
  const [pickupAuthorizations, setPickupAuthorizations] = useState<DbPickupAuthorization[]>([]);

  // Toast Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Modals
  const [receiptModalRecord, setReceiptModalRecord] = useState<DbFinancialRecord | null>(null);
  const [saftModalOpen, setSaftModalOpen] = useState(false);
  const [addClassModalOpen, setAddClassModalOpen] = useState(false);
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [addStaffModalOpen, setAddStaffModalOpen] = useState(false);
  const [addInvoiceModalOpen, setAddInvoiceModalOpen] = useState(false);
  const [commsModalOpen, setCommsModalOpen] = useState(false);

  // FactPlus Validation States
  const [factPlusStatus, setFactPlusStatus] = useState<FactPlusStatusResponse | null>(null);
  const [validatingInvoiceId, setValidatingInvoiceId] = useState<string | null>(null);
  const [validationResultModal, setValidationResultModal] = useState<FactPlusValidationResponse | null>(null);
  const [verifyRefModalOpen, setVerifyRefModalOpen] = useState(false);
  const [verifyRefInput, setVerifyRefInput] = useState('');
  const [verifyRefDocType, setVerifyRefDocType] = useState<'factura' | 'factura-recibo' | 'proforma'>('factura');
  const [verifyRefRecordId, setVerifyRefRecordId] = useState('');
  const [verifyingRef, setVerifyingRef] = useState(false);
  const [verifyRefResult, setVerifyRefResult] = useState<FactPlusVerifyReferenceResponse | null>(null);

  // Form: New Classroom
  const [className, setClassName] = useState('');
  const [classCycle, setClassCycle] = useState('Berçário (4 meses a 1 ano)');
  const [classCapacity, setClassCapacity] = useState(18);
  const [classLeadTeacher, setClassLeadTeacher] = useState('');
  const [classRoom, setClassRoom] = useState('');

  // Form: New Student
  const [studentName, setStudentName] = useState('');
  const [studentClassroom, setStudentClassroom] = useState('');
  const [studentAge, setStudentAge] = useState('');
  const [studentResponsible, setStudentResponsible] = useState('');
  const [studentGuardianEmail, setStudentGuardianEmail] = useState('');
  const [studentAllergies, setStudentAllergies] = useState('');

  // Form: New Staff / Guardian Account
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [newStaffNif, setNewStaffNif] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<
    'Educadora (Tia)' | 'Pais' | 'Portaria' | 'SPO' | 'Admin'
  >('Educadora (Tia)');

  // Form: New Invoice
  const [invStudentId, setInvStudentId] = useState('');
  const [invStudentName, setInvStudentName] = useState('');
  const [invGuardianName, setInvGuardianName] = useState('');
  const [invNif, setInvNif] = useState('');
  const [invClassGroup, setInvClassGroup] = useState('');
  const [invDescription, setInvDescription] = useState('Mensalidade Escolar');
  const [invAmount, setInvAmount] = useState('150000');
  const [invMethod, setInvMethod] = useState('Multicaixa Express (MCX)');
  const [invDueDate, setInvDueDate] = useState(new Date().toLocaleDateString('pt-PT'));

  // Form: New Announcement
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annTarget, setAnnTarget] = useState<'todos' | 'pais' | 'educadoras'>('todos');
  const [annPriority, setAnnPriority] = useState<'normal' | 'importante' | 'urgente'>('normal');
  const [annChannels, setAnnChannels] = useState<string[]>(['App Push', 'E-mail']);
  const [annAuthReq, setAnnAuthReq] = useState(false);
  const [annAttachment, setAnnAttachment] = useState<AnnouncementAttachmentPayload | null>(null);
  const [annAttachmentError, setAnnAttachmentError] = useState<string | null>(null);
  const [downloadingAnnId, setDownloadingAnnId] = useState<string | null>(null);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [data, fpStatus] = await Promise.all([
        portalApi.getAdminOverview(authToken),
        portalApi.getFactPlusStatus(authToken).catch(() => null)
      ]);
      setClassesList(data.classrooms);
      setStudentsList(data.students);
      setFinancialRecords(data.financialRecords);
      setStaffList(data.staffList);
      setAnnouncementsList(data.announcements);
      setAppointmentsList(data.appointments);
      setPickupAuthorizations(data.pickupAuthorizations);
      if (fpStatus) {
        setFactPlusStatus(fpStatus);
      }

      if (data.classrooms.length > 0 && !studentClassroom) {
        setStudentClassroom(data.classrooms[0].name);
      }
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : 'Erro ao carregar dados do Supabase.'
      );
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  // Real Aggregated Metrics
  const metrics = useMemo(() => {
    const totalStudents = studentsList.length;
    const totalCapacity = classesList.reduce((acc, c) => acc + (c.capacity || 0), 0);
    const occupancyPct = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0;
    const activeStaffCount = staffList.filter((s) => s.status === 'Ativo' && s.role !== 'pais').length;
    const totalStaffCount = staffList.length;
    const totalBilled = financialRecords.reduce((acc, r) => acc + Number(r.amount || 0), 0);
    const totalPaid = financialRecords
      .filter((r) => r.status === 'Liquidado')
      .reduce((acc, r) => acc + Number(r.amount || 0), 0);
    const totalPending = Math.max(0, totalBilled - totalPaid);
    const paidPct = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0;
    const pendingCount = financialRecords.filter((r) => r.status !== 'Liquidado').length;
    const pendingPickups = pickupAuthorizations.filter((p) => p.status === 'Pendente').length;
    const pendingAppointments = appointmentsList.filter((a) => a.status === 'Agendada').length;

    return {
      totalStudents,
      totalCapacity,
      occupancyPct,
      activeStaffCount,
      totalStaffCount,
      totalBilled,
      totalPaid,
      totalPending,
      paidPct,
      pendingCount,
      pendingPickups,
      pendingAppointments
    };
  }, [studentsList, classesList, staffList, financialRecords, pickupAuthorizations, appointmentsList]);

  // Search Filters
  const filteredClasses = useMemo(() => {
    if (!searchQuery.trim()) return classesList;
    const q = searchQuery.toLowerCase();
    return classesList.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.lead_teacher.toLowerCase().includes(q) ||
        c.cycle.toLowerCase().includes(q)
    );
  }, [classesList, searchQuery]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return studentsList;
    const q = searchQuery.toLowerCase();
    return studentsList.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.classroom_name.toLowerCase().includes(q) ||
        s.responsible_name.toLowerCase().includes(q)
    );
  }, [studentsList, searchQuery]);

  const filteredFinance = useMemo(() => {
    if (!searchQuery.trim()) return financialRecords;
    const q = searchQuery.toLowerCase();
    return financialRecords.filter(
      (f) =>
        f.student_name.toLowerCase().includes(q) ||
        f.guardian_name.toLowerCase().includes(q) ||
        f.nif.includes(q) ||
        f.invoice_number.toLowerCase().includes(q)
    );
  }, [financialRecords, searchQuery]);

  const filteredStaff = useMemo(() => {
    if (!searchQuery.trim()) return staffList;
    const q = searchQuery.toLowerCase();
    return staffList.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q) ||
        s.access_level.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
    );
  }, [staffList, searchQuery]);

  // Action Handlers
  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim() || !classLeadTeacher.trim()) return;
    setSubmitting(true);
    try {
      const { classroom } = await portalApi.createClassroom(authToken, {
        name: className.trim(),
        cycle: classCycle,
        capacity: Number(classCapacity) || 18,
        leadTeacher: classLeadTeacher.trim(),
        room: classRoom.trim() || 'Pavilhão Infantil'
      });
      setClassesList((prev) => [...prev, classroom]);
      if (!studentClassroom) setStudentClassroom(classroom.name);
      setClassName('');
      setClassLeadTeacher('');
      setClassRoom('');
      setAddClassModalOpen(false);
      showToast(`Turma "${classroom.name}" gravada com sucesso no Supabase!`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao criar turma.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentClassroom.trim() || !studentAge.trim() || !studentResponsible.trim()) {
      return;
    }
    setSubmitting(true);
    try {
      const { student } = await portalApi.createStudent(authToken, {
        name: studentName.trim(),
        classroomName: studentClassroom.trim(),
        age: studentAge.trim(),
        responsibleName: studentResponsible.trim(),
        guardianEmail: studentGuardianEmail.trim() || undefined,
        allergies: studentAllergies
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean)
      });
      setStudentsList((prev) => [...prev, student]);
      setClassesList((prev) =>
        prev.map((c) => (c.name === student.classroom_name ? { ...c, enrolled: c.enrolled + 1 } : c))
      );
      setStudentName('');
      setStudentAge('');
      setStudentResponsible('');
      setStudentGuardianEmail('');
      setStudentAllergies('');
      setAddStudentModalOpen(false);
      showToast(`Criança "${student.name}" matriculada na turma ${student.classroom_name}!`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao matricular criança.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim() || newStaffPassword.length < 8) return;
    setSubmitting(true);
    try {
      const { staff } = await portalApi.createStaff(authToken, {
        name: newStaffName.trim(),
        email: newStaffEmail.trim(),
        password: newStaffPassword,
        accessRole: newStaffRole,
        nif: newStaffNif.trim() || undefined
      });
      setStaffList((prev) => [staff, ...prev]);
      setNewStaffName('');
      setNewStaffEmail('');
      setNewStaffPassword('');
      setNewStaffNif('');
      setAddStaffModalOpen(false);
      showToast(
        newStaffRole === 'Educadora (Tia)'
          ? `Educadora cadastrada como "${staff.name}" com o prefixo "Tia"!`
          : `Conta de ${staff.name} criada no Supabase.`
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao criar utilizador.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStaffAccess = async (staff: DbStaffMember) => {
    const newStatus = staff.status === 'Ativo' ? 'Revogado' : 'Ativo';
    try {
      const { staff: updated } = await portalApi.updateStaffStatus(authToken, staff.id, newStatus);
      setStaffList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      showToast(
        newStatus === 'Revogado'
          ? `Acesso de ${updated.name} revogado no Supabase.`
          : `Acesso de ${updated.name} reativado.`
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao alterar estado do utilizador.');
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = Number(invAmount);
    if (!invStudentName.trim() || !invGuardianName.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      return;
    }
    setSubmitting(true);
    try {
      const { record } = await portalApi.createFinancialRecord(authToken, {
        studentId: invStudentId || undefined,
        studentName: invStudentName.trim(),
        guardianName: invGuardianName.trim(),
        nif: invNif.trim() || '999999999',
        classGroup: invClassGroup.trim() || 'Creche Mayelin',
        description: invDescription.trim() || 'Mensalidade Escolar',
        amount: numericAmount,
        paymentMethod: invMethod,
        dueDate: invDueDate.trim() || new Date().toLocaleDateString('pt-PT'),
        status: 'Pendente'
      });
      setFinancialRecords((prev) => [record, ...prev]);
      setInvStudentId('');
      setInvStudentName('');
      setInvGuardianName('');
      setInvNif('');
      setAddInvoiceModalOpen(false);
      showToast(`Fatura ${record.invoice_number} emitida e gravada no Supabase!`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao emitir fatura.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkInvoicePaid = async (record: DbFinancialRecord) => {
    try {
      const { record: updated } = await portalApi.updateFinancialStatus(authToken, record.id, 'Liquidado');
      setFinancialRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      showToast(`Fatura ${updated.invoice_number} marcada como Liquidada.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao atualizar fatura.');
    }
  };

  const handleValidateFactPlus = async (record: DbFinancialRecord) => {
    setValidatingInvoiceId(record.id);
    try {
      const result = await portalApi.validateInvoiceFactPlus(authToken, record.id);
      if (result.record) {
        setFinancialRecords((prev) =>
          prev.map((r) =>
            r.id === result.record.id
              ? {
                  ...result.record,
                  factplus_reference: result.reference ?? result.record.factplus_reference,
                  factplus_status: result.factplusStatus ?? result.record.factplus_status,
                  factplus_message: result.message ?? result.record.factplus_message
                }
              : r
          )
        );
      }
      setValidationResultModal(result);
      showToast(
        result.valid
          ? `Fatura ${record.invoice_number} validada na FactPlus!`
          : result.message
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao validar fatura na FactPlus.');
    } finally {
      setValidatingInvoiceId(null);
    }
  };

  const handleVerifyFactPlusReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyRefInput.trim()) return;
    setVerifyingRef(true);
    setVerifyRefResult(null);
    try {
      const res = await portalApi.verifyFactPlusReference(authToken, {
        reference: verifyRefInput.trim(),
        docType: verifyRefDocType,
        financialRecordId: verifyRefRecordId || undefined
      });
      setVerifyRefResult(res);
      if (res.record) {
        setFinancialRecords((prev) => prev.map((r) => (r.id === res.record!.id ? res.record! : r)));
      }
      showToast(res.valid ? `Referência ${res.reference} validada!` : res.message);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao consultar referência na FactPlus.');
    } finally {
      setVerifyingRef(false);
    }
  };

  const handleAnnouncementFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setAnnAttachmentError(null);
    if (!file) return;

    const allowedTypes = new Set([
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/webp'
    ]);
    const lowerName = file.name.toLowerCase();
    const resolvedType =
      file.type ||
      (lowerName.endsWith('.pdf')
        ? 'application/pdf'
        : lowerName.endsWith('.txt')
        ? 'text/plain'
        : lowerName.endsWith('.doc')
        ? 'application/msword'
        : lowerName.endsWith('.docx')
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : '');

    if (!allowedTypes.has(resolvedType)) {
      setAnnAttachmentError('Formato não suportado. Utilize PDF, Word (.doc/.docx), TXT ou imagem (PNG/JPG).');
      e.target.value = '';
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setAnnAttachmentError('O documento excede o limite máximo de 3 MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (!result.startsWith('data:')) {
        setAnnAttachmentError('Não foi possível ler o ficheiro selecionado.');
        return;
      }
      setAnnAttachment({
        name: file.name,
        type: resolvedType,
        size: file.size,
        dataUrl: result
      });

      if (!annTitle.trim()) {
        const cleanTitle = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
        if (cleanTitle) setAnnTitle(cleanTitle);
      }

      if (resolvedType === 'text/plain' && !annContent.trim()) {
        const textReader = new FileReader();
        textReader.onload = () => {
          if (typeof textReader.result === 'string' && textReader.result.trim()) {
            setAnnContent(textReader.result.trim().slice(0, 4000));
          }
        };
        textReader.readAsText(file, 'UTF-8');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadAnnouncementAttachment = async (ann: DbAnnouncement) => {
    setDownloadingAnnId(ann.id);
    try {
      await portalApi.downloadAnnouncementAttachment(authToken, ann.id, ann.attachment_name);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao descarregar documento anexo.');
    } finally {
      setDownloadingAnnId(null);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || (!annContent.trim() && !annAttachment)) return;
    setSubmitting(true);
    try {
      const { announcement, schemaColumnWarning } = await portalApi.createAnnouncement(authToken, {
        title: annTitle.trim(),
        content: annContent.trim(),
        channels: annChannels.length > 0 ? annChannels : ['App Push'],
        target: annTarget,
        priority: annPriority,
        authorizationsRequired: annAuthReq,
        attachment: annAttachment
      });
      setAnnouncementsList((prev) => [announcement, ...prev]);
      setAnnTitle('');
      setAnnContent('');
      setAnnAuthReq(false);
      setAnnAttachment(null);
      setAnnAttachmentError(null);
      setCommsModalOpen(false);
      showToast(
        schemaColumnWarning
          ? 'Circular publicada, mas execute a migração SQL do Supabase para guardar anexos.'
          : 'Circular publicada no Supabase para toda a comunidade!'
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao publicar circular.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAppointmentStatusChange = async (
    id: string,
    status: 'Agendada' | 'Confirmada' | 'Realizada' | 'Cancelada'
  ) => {
    try {
      const { appointment } = await portalApi.updateAppointmentStatus(authToken, id, status);
      setAppointmentsList((prev) => prev.map((a) => (a.id === appointment.id ? appointment : a)));
      showToast(`Visita atualizada para "${status}".`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao atualizar visita.');
    }
  };

  const handleAuthorizationStatusChange = async (id: string, status: 'Aprovado' | 'Pendente') => {
    try {
      const { authorization } = await portalApi.updateAuthorizationStatus(authToken, id, status);
      setPickupAuthorizations((prev) => prev.map((p) => (p.id === authorization.id ? authorization : p)));
      showToast(`Autorização de retirada marcada como "${status}".`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao atualizar autorização.');
    }
  };

  const toggleChannel = (ch: string) => {
    setAnnChannels((prev) => (prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]));
  };

  const userInitials = currentUser.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  const adminSectionMeta: Record<AdminSection, { label: string; subtitle: string }> = {
    overview: {
      label: 'Visão Geral',
      subtitle: 'Resumo institucional, ocupação das turmas e situação financeira'
    },
    classes: {
      label: 'Turmas & Crianças',
      subtitle: 'Gestão de salas, vagas, rácios e matrículas'
    },
    finance: {
      label: 'Gestão Financeira',
      subtitle: 'Propinas em Kwanza (Kz), liquidações e recibos AGT'
    },
    hr: {
      label: 'Equipa & Utilizadores',
      subtitle: 'Educadoras (Tias), encarregados e controlo de acesso'
    },
    comms: {
      label: 'Circulares, Visitas & Portaria',
      subtitle: 'Comunicação escolar, agendamentos e autorizações'
    },
    settings: {
      label: 'Configurações & RGPD',
      subtitle: 'Políticas de privacidade e conformidade institucional'
    }
  };

  const adminToolbarControls = (
    <>
      <div className="flex items-center gap-2 text-xs min-w-0">
        <span className="font-bold text-[#8c6b6d] whitespace-nowrap">Administração</span>
        <span className="text-[#c9b4a8]" aria-hidden="true">/</span>
        <span className="font-extrabold text-[#211a14] whitespace-nowrap truncate">
          {adminSectionMeta[activeSection].label}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-1 md:justify-end">
        <div className="flex-1 max-w-md">
          <label htmlFor="admin-global-search" className="sr-only">
            Pesquisar crianças, turmas, NIF ou colaboradores
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-[#8c6b6d] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="admin-global-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar criança, turma, NIF ou colaborador..."
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl bg-[#fff8f5] border border-[#eee0d6] focus:bg-white focus:border-[#ed145b] focus:ring-2 focus:ring-pink-100 focus:outline-none transition-all placeholder:text-[#8c6b6d]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8c6b6d] hover:text-[#5c3f42] text-xs cursor-pointer"
                aria-label="Limpar pesquisa"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={loadOverview}
          disabled={loading}
          className="px-2.5 py-1.5 rounded-xl bg-[#faebe1] hover:bg-[#eee0d6] text-[#5c3f42] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          title="Atualizar dados do Supabase"
          aria-label="Atualizar dados"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#ed145b]' : ''}`} />
          <span className="hidden sm:inline">Atualizar</span>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative p-2 rounded-xl text-[#5c3f42] hover:bg-[#faebe1] focus:outline-none transition-colors cursor-pointer"
            aria-label="Alertas pendentes"
          >
            <Bell className="w-4 h-4" />
            {(metrics.pendingAppointments > 0 || metrics.pendingPickups > 0 || metrics.pendingCount > 0) && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ed145b] rounded-full ring-2 ring-white" />
            )}
          </button>

          {notificationOpen && (
            <div
              className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#eee0d6] p-3 z-50 text-xs"
              role="dialog"
              aria-label="Notificações"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#eee0d6] mb-2">
                <span className="font-bold text-[#211a14]">Resumo Operacional</span>
                <button
                  type="button"
                  onClick={() => setNotificationOpen(false)}
                  className="text-[#8c6b6d] hover:text-[#211a14] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-900">
                  <p className="font-bold">{metrics.pendingCount} Faturas por Liquidar</p>
                </div>
                <div className="p-2 rounded-xl bg-pink-50 border border-pink-100 text-pink-900">
                  <p className="font-bold">{metrics.pendingAppointments} Visitas Agendadas pelo Website</p>
                </div>
                <div className="p-2 rounded-xl bg-sky-50 border border-sky-100 text-sky-900">
                  <p className="font-bold">{metrics.pendingPickups} Autorizações de Portaria Pendentes</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div
      role="region"
      aria-label="Painel de Administração e Gestão Escolar"
      className="bg-[#fff8f5] text-[#211a14] w-full flex-1 flex flex-col overflow-hidden font-['Nunito_Sans'] antialiased min-h-0"
    >
      {headerPortalTarget && createPortal(adminToolbarControls, headerPortalTarget)}

      {headerPortalTarget === undefined && (
        <header
          className="bg-white border-b border-[#eee0d6] px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 z-20"
          role="banner"
        >
          {adminToolbarControls}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-[#5c3f42] hover:text-[#211a14] hover:bg-[#faebe1] transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4 text-pink-600" />
              <span className="hidden sm:inline">Voltar ao Website</span>
            </button>
          )}
        </header>
      )}

      {/* 2. BODY LAYOUT */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
        <nav
          className="w-full md:w-64 lg:w-[260px] bg-white text-[#5c3f42] p-3 sm:p-4 flex md:flex-col justify-between shrink-0 overflow-x-auto md:overflow-y-auto border-b md:border-b-0 md:border-r border-[#eee0d6]"
          aria-label="Menu principal de gestão"
        >
          <div className="flex md:flex-col gap-1 w-full">
            <span className="text-[11px] font-bold text-[#8c6b6d] px-3 py-1.5 hidden md:block">
              Módulos de Gestão
            </span>

            {[
              { id: 'overview', label: 'Visão Geral', icon: Activity, count: null },
              { id: 'classes', label: 'Turmas & Crianças', icon: GraduationCap, count: metrics.totalStudents },
              { id: 'finance', label: 'Gestão Financeira', icon: DollarSign, count: metrics.pendingCount > 0 ? metrics.pendingCount : null },
              { id: 'hr', label: 'Equipa & Utilizadores', icon: Users, count: metrics.totalStaffCount },
              {
                id: 'comms',
                label: 'Circulares & Portaria',
                icon: Send,
                count: metrics.pendingAppointments + metrics.pendingPickups > 0 ? metrics.pendingAppointments + metrics.pendingPickups : null
              },
              { id: 'settings', label: 'Configurações & RGPD', icon: Settings, count: null }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id as AdminSection)}
                  className={`min-h-[40px] md:w-full px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between gap-2.5 transition-colors text-left whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#ed145b] text-white'
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
              <span className="text-[#8c6b6d]">Ocupação</span>
              <span className="font-bold tabular-nums text-[#211a14]">{metrics.occupancyPct}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8c6b6d]">Liquidado</span>
              <span className="font-bold tabular-nums text-emerald-700">{metrics.paidPct}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8c6b6d]">Pendências</span>
              <span className="font-bold tabular-nums text-[#ed145b]">
                {metrics.pendingAppointments + metrics.pendingPickups + metrics.pendingCount}
              </span>
            </div>
          </div>
        </nav>

        <main className="flex-1 min-h-0 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-[#fff8f5] focus:outline-none" tabIndex={-1}>
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
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-semibold">{loadError}</span>
              </div>
              <button
                type="button"
                onClick={loadOverview}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 cursor-pointer shrink-0"
              >
                Recarregar
              </button>
            </div>
          )}

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-pink-200 border-t-[#ed145b] rounded-full animate-spin" />
              <p className="text-xs font-bold text-[#5c3f42]">A carregar dados reais do Supabase...</p>
            </div>
          ) : (
            <>
              {/* SECÇÃO 1: VISÃO GERAL */}
              {activeSection === 'overview' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Cabeçalho de Secção com Ações Principais */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#eee0d6]">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-extrabold font-['Quicksand'] text-[#211a14] tracking-tight">
                        {adminSectionMeta.overview.label}
                      </h1>
                      <p className="text-xs sm:text-sm text-[#5c3f42] mt-0.5">
                        {classesList.length} turmas · {metrics.totalStudents} crianças · {metrics.activeStaffCount} membros de equipa
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      <button
                        type="button"
                        onClick={() => setAddClassModalOpen(true)}
                        className="min-h-[40px] px-4 py-2 rounded-lg bg-white border border-[#eee0d6] hover:bg-[#faebe1] text-[#211a14] font-bold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#ed145b]" />
                        <span>Criar Turma</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddStudentModalOpen(true)}
                        className="min-h-[40px] px-4 py-2 rounded-lg bg-[#ed145b] hover:bg-pink-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <Baby className="w-3.5 h-3.5" />
                        <span>Matricular Criança</span>
                      </button>
                    </div>
                  </div>

                  {/* Faixa de Métricas Principais (4 Colunas) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#eee0d6]">
                      <div className="flex items-center justify-between text-xs font-bold text-[#5c3f42]">
                        <span>Crianças Matriculadas</span>
                        <Baby className="w-4 h-4 text-[#ed145b]" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-extrabold font-['Quicksand'] tabular-nums text-[#211a14] mt-2">
                        {metrics.totalStudents}
                      </p>
                      <p className="text-xs text-[#5c3f42] mt-1.5 tabular-nums">
                        {metrics.occupancyPct}% de ocupação · {metrics.totalCapacity} vagas
                      </p>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#eee0d6]">
                      <div className="flex items-center justify-between text-xs font-bold text-[#5c3f42]">
                        <span>Equipa & Educadoras</span>
                        <Users className="w-4 h-4 text-[#00a6c0]" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-extrabold font-['Quicksand'] tabular-nums text-[#211a14] mt-2">
                        {metrics.activeStaffCount}
                      </p>
                      <p className="text-xs text-[#5c3f42] mt-1.5 tabular-nums">
                        {metrics.totalStaffCount} contas ativas no portal
                      </p>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#eee0d6]">
                      <div className="flex items-center justify-between text-xs font-bold text-[#5c3f42]">
                        <span>Faturação Registada</span>
                        <DollarSign className="w-4 h-4 text-emerald-700" />
                      </div>
                      <p className="text-2xl font-extrabold font-['Quicksand'] tabular-nums text-[#211a14] mt-2 truncate">
                        Kz {metrics.totalBilled.toLocaleString('pt-PT')}
                      </p>
                      <p className="text-xs text-emerald-700 font-semibold mt-1.5 tabular-nums">
                        {metrics.paidPct}% liquidado · {metrics.pendingCount} pendentes
                      </p>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#eee0d6]">
                      <div className="flex items-center justify-between text-xs font-bold text-[#5c3f42]">
                        <span>Visitas & Portaria</span>
                        <DoorOpen className="w-4 h-4 text-[#fd9924]" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-extrabold font-['Quicksand'] tabular-nums text-[#211a14] mt-2">
                        {appointmentsList.length}
                      </p>
                      <p className="text-xs text-[#5c3f42] mt-1.5 tabular-nums">
                        {metrics.pendingAppointments} visitas agendadas · {metrics.pendingPickups} autorizações
                      </p>
                    </div>
                  </div>

                  {/* Grelha Principal Assimétrica (8 + 4 Colunas) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Coluna Esquerda: Turmas & Visitas */}
                    <div className="lg:col-span-8 space-y-6">
                      {/* Tabela Resumo das Turmas */}
                      <section className="bg-white rounded-xl border border-[#eee0d6] overflow-hidden">
                        <div className="px-5 py-4 border-b border-[#eee0d6] flex items-center justify-between gap-3">
                          <div>
                            <h2 className="text-sm font-bold font-['Quicksand'] text-[#211a14]">
                              Lotação das Turmas & Educadoras Titulares
                            </h2>
                            <p className="text-xs text-[#8c6b6d]">
                              Distribuição atual por sala e ciclo infantil
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveSection('classes')}
                            className="text-xs font-bold text-[#ed145b] hover:underline whitespace-nowrap cursor-pointer"
                          >
                            Gerir Turmas
                          </button>
                        </div>

                        {classesList.length === 0 ? (
                          <div className="p-8 text-center space-y-3 text-xs text-[#5c3f42]">
                            <p className="font-bold text-sm text-[#211a14]">Ainda não existem turmas registadas.</p>
                            <button
                              type="button"
                              onClick={() => setAddClassModalOpen(true)}
                              className="px-4 py-2 rounded-lg bg-[#ed145b] text-white font-bold hover:bg-pink-600 transition-colors cursor-pointer"
                            >
                              Criar Primeira Turma
                            </button>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-[#fffcf9] border-b border-[#eee0d6] text-[#5c3f42] font-bold text-[11px]">
                                <tr>
                                  <th className="px-5 py-3">Turma</th>
                                  <th className="px-5 py-3">Educadora (Tia)</th>
                                  <th className="px-5 py-3">Ocupação</th>
                                  <th className="px-5 py-3 text-right">Matrículas</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#eee0d6]">
                                {classesList.slice(0, 5).map((cls) => {
                                  const pct = cls.capacity > 0 ? Math.min(100, Math.round((cls.enrolled / cls.capacity) * 100)) : 0;
                                  return (
                                    <tr key={cls.id} className="hover:bg-[#fff8f5] transition-colors">
                                      <td className="px-5 py-3">
                                        <p className="font-bold text-[#211a14]">{cls.name}</p>
                                        <span className="text-[11px] text-[#8c6b6d]">{cls.cycle}</span>
                                      </td>
                                      <td className="px-5 py-3 font-semibold text-[#00a6c0]">
                                        {formatEducatorName(cls.lead_teacher)}
                                      </td>
                                      <td className="px-5 py-3 w-36">
                                        <div className="flex items-center gap-2">
                                          <div className="flex-1 bg-[#faebe1] h-1.5 rounded-full overflow-hidden">
                                            <div
                                              className={`h-full rounded-full ${pct >= 90 ? 'bg-[#ed145b]' : 'bg-[#00a6c0]'}`}
                                              style={{ width: `${pct}%` }}
                                            />
                                          </div>
                                          <span className="text-[11px] font-bold tabular-nums text-[#5c3f42]">
                                            {pct}%
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-5 py-3 text-right font-bold tabular-nums text-[#211a14]">
                                        {cls.enrolled} / {cls.capacity}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </section>

                      {/* Visitas Agendadas Recentemente (Lista com divisores finos, sem cartões aninhados) */}
                      <section className="bg-white rounded-xl border border-[#eee0d6] overflow-hidden">
                        <div className="px-5 py-4 border-b border-[#eee0d6] flex items-center justify-between gap-3">
                          <div>
                            <h2 className="text-sm font-bold font-['Quicksand'] text-[#211a14]">
                              Visitas Agendadas pelo Website
                            </h2>
                            <p className="text-xs text-[#8c6b6d]">
                              Famílias interessadas em conhecer a creche
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveSection('comms')}
                            className="text-xs font-bold text-[#ed145b] hover:underline whitespace-nowrap cursor-pointer"
                          >
                            Gerir Todas
                          </button>
                        </div>

                        {appointmentsList.length === 0 ? (
                          <div className="p-6 text-center text-xs text-[#8c6b6d]">
                            Nenhuma visita agendada até ao momento.
                          </div>
                        ) : (
                          <div className="divide-y divide-[#eee0d6]">
                            {appointmentsList.slice(0, 4).map((apt) => (
                              <div
                                key={apt.id}
                                className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-[#fff8f5] transition-colors text-xs"
                              >
                                <div className="min-w-0">
                                  <p className="font-bold text-[#211a14] truncate">
                                    {apt.parent_name} · Criança: {apt.child_name}
                                  </p>
                                  <p className="text-[11px] text-[#5c3f42] tabular-nums mt-0.5">
                                    {apt.visit_date} às {apt.visit_time} · {apt.whatsapp}
                                  </p>
                                </div>
                                <span
                                  className={`text-[11px] font-bold whitespace-nowrap shrink-0 ${
                                    apt.status === 'Confirmada'
                                      ? 'text-emerald-700'
                                      : apt.status === 'Cancelada'
                                      ? 'text-rose-700'
                                      : 'text-[#ed145b]'
                                  }`}
                                >
                                  {apt.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </section>
                    </div>

                    {/* Coluna Direita: Resumo Financeiro & Ações Rápidas */}
                    <div className="lg:col-span-4 space-y-6">
                      <section className="bg-white p-5 rounded-xl border border-[#eee0d6] space-y-4">
                        <div className="flex items-center justify-between">
                          <h2 className="text-sm font-bold font-['Quicksand'] text-[#211a14]">
                            Faturação (Kz)
                          </h2>
                          <button
                            type="button"
                            onClick={() => setActiveSection('finance')}
                            className="text-xs font-bold text-[#ed145b] hover:underline cursor-pointer"
                          >
                            Ver Faturas
                          </button>
                        </div>

                        <div className="space-y-3 text-xs">
                          <div className="space-y-1.5">
                            <div className="flex justify-between font-semibold">
                              <span className="text-[#5c3f42]">Liquidado</span>
                              <span className="font-bold tabular-nums text-emerald-700">
                                Kz {metrics.totalPaid.toLocaleString('pt-PT')} ({metrics.paidPct}%)
                              </span>
                            </div>
                            <div className="w-full bg-[#faebe1] h-2 rounded-full overflow-hidden">
                              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${metrics.paidPct}%` }} />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between font-semibold">
                              <span className="text-[#5c3f42]">Em Aberto</span>
                              <span className="font-bold tabular-nums text-amber-700">
                                Kz {metrics.totalPending.toLocaleString('pt-PT')} ({metrics.totalBilled > 0 ? 100 - metrics.paidPct : 0}%)
                              </span>
                            </div>
                            <div className="w-full bg-[#faebe1] h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-amber-500 h-full rounded-full"
                                style={{ width: `${metrics.totalBilled > 0 ? 100 - metrics.paidPct : 0}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#eee0d6]">
                          <button
                            type="button"
                            onClick={() => setAddInvoiceModalOpen(true)}
                            className="w-full min-h-[38px] px-3.5 py-2 rounded-lg bg-[#faebe1] hover:bg-[#f4e6db] text-[#211a14] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-[#ed145b]" />
                            <span>Emitir Nova Fatura (Kz)</span>
                          </button>
                        </div>
                      </section>

                      <section className="bg-white rounded-xl border border-[#eee0d6] overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-[#eee0d6]">
                          <h2 className="text-sm font-bold font-['Quicksand'] text-[#211a14]">
                            Ações Rápidas
                          </h2>
                        </div>
                        <div className="divide-y divide-[#eee0d6]">
                          <button
                            type="button"
                            onClick={() => setAddStaffModalOpen(true)}
                            className="w-full px-5 py-3 text-left text-xs font-bold text-[#211a14] hover:bg-[#fff8f5] flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-2.5">
                              <Users className="w-4 h-4 text-[#00a6c0]" />
                              <span>Cadastrar Tia / Encarregado</span>
                            </span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-[#8c6b6d]" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setCommsModalOpen(true)}
                            className="w-full px-5 py-3 text-left text-xs font-bold text-[#211a14] hover:bg-[#fff8f5] flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-2.5">
                              <Send className="w-4 h-4 text-[#ed145b]" />
                              <span>Publicar Circular Escolar</span>
                            </span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-[#8c6b6d]" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setSaftModalOpen(true)}
                            className="w-full px-5 py-3 text-left text-xs font-bold text-[#211a14] hover:bg-[#fff8f5] flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-2.5">
                              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                              <span>Exportar Ficheiro SAF-T (AO)</span>
                            </span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-[#8c6b6d]" />
                          </button>
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              )}

              {/* SECÇÃO 2: TURMAS & CRIANÇAS MATRICULADAS */}
              {activeSection === 'classes' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold font-['Quicksand'] text-[#211a14]">
                        Gestão de Turmas & Matrículas
                      </h3>
                      <p className="text-xs text-[#5c3f42]">
                        Ciclos da Creche e Jardim de Infância • Registo real em Supabase
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setAddStudentModalOpen(true)}
                        className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#fd9924] text-white font-bold text-xs shadow-sm hover:bg-amber-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Baby className="w-4 h-4" />
                        <span>Matricular Criança</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAddClassModalOpen(true)}
                        className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#ed145b] text-white font-bold text-xs shadow-sm hover:bg-pink-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Adicionar Nova Turma</span>
                      </button>
                    </div>
                  </div>

                  {/* Classes Table */}
                  <div className="bg-white rounded-2xl border border-[#eee0d6] overflow-hidden shadow-xs">
                    {filteredClasses.length === 0 ? (
                      <div className="p-8 text-center space-y-2 text-xs text-[#5c3f42]">
                        <p className="font-bold text-sm text-[#211a14]">Nenhuma turma registada ainda.</p>
                        <p>Crie a primeira turma da creche (ex: Berçário Ninho de Afeto, Maternal I, Jardim) para matricular crianças.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#fff8f5] border-b border-[#eee0d6] text-[#5c3f42] font-bold uppercase text-[10px] tracking-wider">
                            <tr>
                              <th className="p-3.5">Turma & Ciclo</th>
                              <th className="p-3.5">Lotação / Rácio</th>
                              <th className="p-3.5">Educadora Titular (Tia)</th>
                              <th className="p-3.5">Áreas Lúdicas</th>
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
                                    <span className={`font-bold ${item.enrolled >= item.capacity ? 'text-[#ed145b]' : 'text-[#211a14]'}`}>
                                      {item.enrolled} / {item.capacity}
                                    </span>
                                    <span className="text-[10px] bg-[#faebe1] text-[#5c3f42] px-2 py-0.5 rounded-md font-semibold">
                                      {item.ratio}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-[#8c6b6d] block mt-0.5">{item.schedule}</span>
                                </td>
                                <td className="p-3.5">
                                  <span className="font-bold text-[#211a14] block">{formatEducatorName(item.lead_teacher)}</span>
                                </td>
                                <td className="p-3.5">
                                  <div className="flex flex-wrap gap-1 max-w-xs">
                                    {(item.subjects || []).map((sub, idx) => (
                                      <span key={idx} className="text-[10px] bg-pink-50 text-[#ed145b] px-1.5 py-0.5 rounded font-semibold">
                                        {sub}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Enrolled Students Table */}
                  <div className="bg-white rounded-2xl border border-[#eee0d6] overflow-hidden shadow-xs">
                    <div className="p-4 border-b border-[#eee0d6] bg-[#fff8f5] flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[#211a14] font-['Quicksand']">
                        Crianças Matriculadas ({filteredStudents.length})
                      </h4>
                    </div>
                    {filteredStudents.length === 0 ? (
                      <div className="p-8 text-center text-xs text-[#5c3f42]">
                        Nenhuma criança matriculada ainda. Clique em "Matricular Criança" acima.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#fff8f5] border-b border-[#eee0d6] text-[#5c3f42] font-bold uppercase text-[10px] tracking-wider">
                            <tr>
                              <th className="p-3.5 w-14">Nº</th>
                              <th className="p-3.5">Criança & Idade</th>
                              <th className="p-3.5">Turma & Tia</th>
                              <th className="p-3.5">Encarregado</th>
                              <th className="p-3.5">Alergias / Cuidados</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#eee0d6]">
                            {filteredStudents.map((st) => (
                              <tr key={st.id} className="hover:bg-[#fff1e7]/70 transition-colors">
                                <td className="p-3.5 font-bold text-[#8c6b6d]">#{st.student_number}</td>
                                <td className="p-3.5">
                                  <p className="font-bold text-[#211a14]">{st.name}</p>
                                  <span className="text-[10px] text-[#5c3f42]">{st.age}</span>
                                </td>
                                <td className="p-3.5">
                                  <p className="font-semibold text-[#211a14]">{st.classroom_name}</p>
                                  <span className="text-[10px] text-[#00a6c0] font-bold">{formatEducatorName(st.teacher_name)}</span>
                                </td>
                                <td className="p-3.5 text-[#5c3f42] font-semibold">{st.responsible_name}</td>
                                <td className="p-3.5">
                                  {st.allergies && st.allergies.length > 0 ? (
                                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-bold">
                                      {st.allergies.join(', ')}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-[#8c6b6d]">Sem restrições</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECÇÃO 3: GESTÃO FINANCEIRA */}
              {activeSection === 'finance' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold font-['Quicksand'] text-[#211a14]">
                        Gestão Financeira & Faturação em Kwanza (Kz)
                      </h3>
                      <p className="text-xs text-[#5c3f42]">
                        Controlo de propinas, referências Multicaixa Express e validação fiscal FactPlus (AGT)
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setVerifyRefResult(null);
                          setVerifyRefInput('');
                          setVerifyRefRecordId('');
                          setVerifyRefModalOpen(true);
                        }}
                        className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-white border border-[#eee0d6] hover:bg-[#fff8f5] text-[#211a14] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[#00a6c0]" />
                        <span>Validar por Referência</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSaftModalOpen(true)}
                        className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#faebe1] hover:bg-[#f4e6db] text-[#5c3f42] font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Exportar SAF-T (AO)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAddInvoiceModalOpen(true)}
                        className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#ed145b] hover:bg-pink-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Emitir Fatura (Kz)</span>
                      </button>
                    </div>
                  </div>

                  {/* Estado da Integração FactPlus */}
                  <div
                    className={`rounded-xl border px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                      factPlusStatus?.configured
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                        : 'bg-amber-50/80 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-2.5">
                      {factPlusStatus?.configured ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5 sm:mt-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
                      )}
                      <div>
                        <p className="font-bold">
                          {factPlusStatus?.configured
                            ? 'API FactPlus (Angola AGT) ligada no servidor'
                            : 'Pré-validação AGT ativa • Chave FactPlus ainda não configurada no servidor'}
                        </p>
                        <p className="text-[11px] opacity-85">
                          {factPlusStatus?.configured
                            ? `Endpoint ativo: ${factPlusStatus.apiUrl} • Clique em "Validar FactPlus" em qualquer fatura para certificar ou consultar.`
                            : 'Para certificação online na FactPlus, adicione a variável secreta FACTPLUS_API_KEY nas definições do ambiente do servidor.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-[#eee0d6] overflow-hidden shadow-xs">
                    {filteredFinance.length === 0 ? (
                      <div className="p-8 text-center text-xs text-[#5c3f42]">
                        Nenhum lançamento financeiro registado ainda.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#fff8f5] border-b border-[#eee0d6] text-[#5c3f42] font-bold uppercase text-[10px] tracking-wider">
                            <tr>
                              <th className="p-3.5">Criança & Turma</th>
                              <th className="p-3.5">Responsável Financeiro (NIF)</th>
                              <th className="p-3.5">Método & Fatura</th>
                              <th className="p-3.5">Valor (Kz) & Vencimento</th>
                              <th className="p-3.5">Estado / FactPlus</th>
                              <th className="p-3.5 text-right">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#eee0d6]">
                            {filteredFinance.map((record) => {
                              const isValidating = validatingInvoiceId === record.id;
                              const isFactPlusOk =
                                record.factplus_status?.includes('Certificada') ||
                                record.factplus_status?.includes('Validada');
                              return (
                                <tr key={record.id} className="hover:bg-[#fff1e7]/70 transition-colors">
                                  <td className="p-3.5">
                                    <p className="font-bold text-[#211a14]">{record.student_name}</p>
                                    <span className="text-[10px] text-[#5c3f42]">{record.class_group}</span>
                                  </td>
                                  <td className="p-3.5">
                                    <span className="font-bold text-[#211a14] block">{record.guardian_name}</span>
                                    <span className="text-[10px] text-[#5c3f42] font-mono">NIF: {record.nif}</span>
                                  </td>
                                  <td className="p-3.5">
                                    <span className="font-semibold text-[#5c3f42] flex items-center gap-1">
                                      <CreditCard className="w-3.5 h-3.5 text-[#8c6b6d]" />
                                      {record.payment_method}
                                    </span>
                                    <span className="text-[10px] text-[#8c6b6d] font-mono block">{record.invoice_number}</span>
                                    {record.factplus_reference && (
                                      <span className="text-[10px] text-[#00a6c0] font-mono font-bold block">
                                        FactPlus Ref: {record.factplus_reference}
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3.5">
                                    <span className="font-bold text-[#211a14] tabular-nums">
                                      Kz {Number(record.amount).toLocaleString('pt-PT')}
                                    </span>
                                    <span className="text-[10px] text-[#5c3f42] block">Venc: {record.due_date}</span>
                                  </td>
                                  <td className="p-3.5 space-y-1">
                                    <span
                                      className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] inline-block ${
                                        record.status === 'Liquidado'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-amber-100 text-amber-800'
                                      }`}
                                    >
                                      {record.status}
                                    </span>
                                    {record.factplus_status && (
                                      <span
                                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] block w-fit ${
                                          isFactPlusOk
                                            ? 'bg-sky-100 text-sky-900'
                                            : 'bg-rose-100 text-rose-800'
                                        }`}
                                      >
                                        {record.factplus_status}
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                                    <button
                                      type="button"
                                      disabled={isValidating}
                                      onClick={() => handleValidateFactPlus(record)}
                                      className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-[#00a6c0] rounded-lg font-bold text-[11px] transition-colors inline-flex items-center gap-1 cursor-pointer disabled:opacity-60"
                                    >
                                      {isValidating ? (
                                        <RefreshCw className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <ShieldCheck className="w-3 h-3" />
                                      )}
                                      <span>{isValidating ? 'A validar...' : 'Validar FactPlus'}</span>
                                    </button>
                                    {record.status !== 'Liquidado' && (
                                      <button
                                        type="button"
                                        onClick={() => handleMarkInvoicePaid(record)}
                                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                                      >
                                        Liquidar
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => setReceiptModalRecord(record)}
                                      className="px-2.5 py-1 bg-pink-50 hover:bg-pink-100 text-[#ed145b] rounded-lg font-bold text-[11px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <Printer className="w-3 h-3" />
                                      <span>Recibo AGT</span>
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECÇÃO 4: RECURSOS HUMANOS & UTILIZADORES */}
              {activeSection === 'hr' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold font-['Quicksand'] text-[#211a14]">
                        Equipa, Educadoras (Tias) & Encarregados (RBAC)
                      </h3>
                      <p className="text-xs text-[#5c3f42]">
                        {staffList.length} utilizadores registados no Supabase • Educadoras recebem automaticamente o prefixo "Tia"
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAddStaffModalOpen(true)}
                      className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#ed145b] text-white font-bold text-xs shadow-sm hover:bg-pink-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Cadastrar Utilizador</span>
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-[#eee0d6] overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#fff8f5] border-b border-[#eee0d6] text-[#5c3f42] font-bold uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="p-3.5">Utilizador</th>
                            <th className="p-3.5">Departamento & Função</th>
                            <th className="p-3.5">Nível de Acesso (RBAC)</th>
                            <th className="p-3.5">Último Acesso</th>
                            <th className="p-3.5 text-right">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eee0d6]">
                          {filteredStaff.map((staff) => (
                            <tr key={staff.id} className="hover:bg-[#fff1e7]/70 transition-colors">
                              <td className="p-3.5">
                                <p className="font-bold text-[#211a14]">
                                  {staff.role === 'educador' ? formatEducatorName(staff.name) : staff.name}
                                </p>
                                <span className="text-[10px] text-[#5c3f42]">{staff.email}</span>
                              </td>
                              <td className="p-3.5">
                                <span className="font-semibold text-[#211a14] block">{staff.title}</span>
                                <span className="text-[10px] text-[#5c3f42]">{staff.department}</span>
                              </td>
                              <td className="p-3.5">
                                <span
                                  className={`px-2 py-0.5 rounded font-bold text-[10px] inline-block ${
                                    staff.role === 'admin'
                                      ? 'bg-purple-100 text-purple-800'
                                      : staff.role === 'educador'
                                      ? 'bg-sky-100 text-sky-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {staff.access_level}
                                </span>
                              </td>
                              <td className="p-3.5">
                                <span className="text-[#5c3f42] font-mono text-[11px]">{staff.last_access}</span>
                              </td>
                              <td className="p-3.5 text-right">
                                {staff.id !== currentUser.id && (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleStaffAccess(staff)}
                                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors inline-flex items-center gap-1 cursor-pointer ${
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

              {/* SECÇÃO 5: COMUNICAÇÃO, VISITAS & PORTARIA */}
              {activeSection === 'comms' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold font-['Quicksand'] text-[#211a14]">
                        Circulares, Visitas Agendadas & Portaria
                      </h3>
                      <p className="text-xs text-[#5c3f42]">
                        {announcementsList.length} circulares • {appointmentsList.length} visitas • {pickupAuthorizations.length} autorizações de saída
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCommsModalOpen(true)}
                      className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#ed145b] text-white font-bold text-xs shadow-sm hover:bg-pink-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Nova Circular Multicanal</span>
                    </button>
                  </div>

                  {/* Circulares */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#8c6b6d]">
                      Circulares Oficiais
                    </h4>
                    {announcementsList.length === 0 ? (
                      <div className="bg-white p-6 rounded-2xl border border-[#eee0d6] text-xs text-[#5c3f42]">
                        Nenhuma circular publicada ainda.
                      </div>
                    ) : (
                      announcementsList.map((ann) => (
                        <div key={ann.id} className="bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs space-y-2.5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <h5 className="font-bold text-sm font-['Quicksand'] text-[#211a14]">{ann.title}</h5>
                            <span className="text-xs text-[#8c6b6d]">
                              {new Date(ann.created_at).toLocaleDateString('pt-PT')}
                            </span>
                          </div>
                          <p className="text-xs text-[#5c3f42] whitespace-pre-line">{ann.content}</p>
                          {ann.attachment_name && (
                            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#fff8f5] border border-[#eee0d6] px-3 py-2 text-xs">
                              <div className="flex items-center gap-2 min-w-0">
                                <Paperclip className="w-3.5 h-3.5 text-[#ed145b] shrink-0" />
                                <span className="font-bold text-[#211a14] truncate">{ann.attachment_name}</span>
                                {typeof ann.attachment_size === 'number' && ann.attachment_size > 0 && (
                                  <span className="text-[11px] text-[#8c6b6d] shrink-0">
                                    ({Math.max(1, Math.round(ann.attachment_size / 1024))} KB)
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                disabled={downloadingAnnId === ann.id}
                                onClick={() => handleDownloadAnnouncementAttachment(ann)}
                                className="px-2.5 py-1 rounded-lg bg-white border border-[#eee0d6] hover:bg-[#faebe1] text-[#ed145b] font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer disabled:opacity-60"
                              >
                                <Download className="w-3 h-3" />
                                <span>{downloadingAnnId === ann.id ? 'A descarregar...' : 'Descarregar Documento'}</span>
                              </button>
                            </div>
                          )}
                          <div className="flex flex-wrap items-center gap-2">
                            {(ann.channels || []).map((ch, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded-md bg-[#faebe1] text-[#5c3f42] text-[10px] font-bold">
                                {ch}
                              </span>
                            ))}
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              Público: {ann.target}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Visitas Agendadas */}
                  <div className="bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs space-y-3">
                    <h4 className="text-sm font-bold font-['Quicksand'] text-[#211a14] flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#ed145b]" />
                      <span>Visitas Agendadas pelo Website</span>
                    </h4>
                    {appointmentsList.length === 0 ? (
                      <p className="text-xs text-[#5c3f42]">Ainda não existem visitas agendadas.</p>
                    ) : (
                      <div className="divide-y divide-[#eee0d6] text-xs">
                        {appointmentsList.map((apt) => (
                          <div key={apt.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <p className="font-bold text-[#211a14]">
                                {apt.parent_name} • Criança: {apt.child_name}
                              </p>
                              <p className="text-[#5c3f42] text-[11px]">
                                {apt.age_group} ({apt.shift}) • {apt.visit_date} às {apt.visit_time} • {apt.whatsapp}
                              </p>
                            </div>
                            <select
                              value={apt.status}
                              onChange={(e) =>
                                handleAppointmentStatusChange(
                                  apt.id,
                                  e.target.value as 'Agendada' | 'Confirmada' | 'Realizada' | 'Cancelada'
                                )
                              }
                              className="px-2.5 py-1.5 rounded-lg border border-[#eee0d6] bg-[#fff8f5] font-bold text-xs"
                            >
                              <option value="Agendada">Agendada</option>
                              <option value="Confirmada">Confirmada</option>
                              <option value="Realizada">Realizada</option>
                              <option value="Cancelada">Cancelada</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Autorizações de Retirada */}
                  <div className="bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs space-y-3">
                    <h4 className="text-sm font-bold font-['Quicksand'] text-[#211a14]">
                      Autorizações de Retirada (Portaria)
                    </h4>
                    {pickupAuthorizations.length === 0 ? (
                      <p className="text-xs text-[#5c3f42]">Nenhuma autorização de retirada submetida pelos encarregados.</p>
                    ) : (
                      <div className="divide-y divide-[#eee0d6] text-xs">
                        {pickupAuthorizations.map((auth) => (
                          <div key={auth.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <p className="font-bold text-[#211a14]">
                                {auth.person_name} ({auth.relationship})
                              </p>
                              <p className="text-[#5c3f42] text-[11px]">
                                Doc: {auth.document_id} • {auth.auth_date} ({auth.time_limit})
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleAuthorizationStatusChange(
                                  auth.id,
                                  auth.status === 'Aprovado' ? 'Pendente' : 'Aprovado'
                                )
                              }
                              className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                                auth.status === 'Aprovado'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800 hover:bg-emerald-100 hover:text-emerald-800'
                              }`}
                            >
                              {auth.status}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECÇÃO 6: CONFIGURAÇÕES & RGPD */}
              {activeSection === 'settings' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <h3 className="text-base font-bold font-['Quicksand'] text-[#211a14]">
                    Configurações da Instituição, Conformidade RGPD & Acessibilidade
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-[#eee0d6] space-y-3">
                      <h4 className="font-bold text-sm text-[#211a14] flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Conformidade com o RGPD</span>
                      </h4>
                      <p className="text-xs text-[#5c3f42] leading-relaxed">
                        Os dados pessoais das crianças, registos de assiduidade e observações das Educadoras (Tias) são protegidos por controlo de acesso por perfil (RBAC) e armazenados com encriptação no Supabase.
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-[#eee0d6] space-y-3">
                      <h4 className="font-bold text-sm text-[#211a14] flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-[#00a6c0]" />
                        <span>Padrões de Acessibilidade WCAG 2.1 AA</span>
                      </h4>
                      <p className="text-xs text-[#5c3f42] leading-relaxed">
                        Interface com contraste cromático elevado, foco visível de teclado e áreas tácteis confortáveis em todos os ecrãs.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          </div>
        </main>
      </div>

      {/* MODAL: RECIBO AGT */}
      {receiptModalRecord && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <div>
                <h3 className="font-bold text-sm text-[#211a14] font-['Quicksand']">Recibo de Quitação (AGT)</h3>
                <p className="text-[10px] text-[#5c3f42] font-mono">{receiptModalRecord.invoice_number}</p>
              </div>
              <button type="button" onClick={() => setReceiptModalRecord(null)} className="p-1 text-[#8c6b6d]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-[#fff8f5] p-4 rounded-2xl border border-[#eee0d6] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#5c3f42]">Criança:</span>
                <span className="font-bold text-[#211a14]">{receiptModalRecord.student_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5c3f42]">Encarregado / NIF:</span>
                <span className="font-bold text-[#211a14]">
                  {receiptModalRecord.guardian_name} (NIF {receiptModalRecord.nif})
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#eee0d6] text-sm">
                <span className="font-bold text-[#211a14]">Valor:</span>
                <span className="font-extrabold text-emerald-700">
                  Kz {Number(receiptModalRecord.amount).toLocaleString('pt-PT')}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setReceiptModalRecord(null);
                }}
                className="px-4 py-2 bg-[#211a14] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SAF-T */}
      {saftModalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-[#ed145b]" />
                <h3 className="font-bold text-sm text-[#211a14] font-['Quicksand']">Exportação SAF-T (AO)</h3>
              </div>
              <button type="button" onClick={() => setSaftModalOpen(false)} className="p-1 text-[#8c6b6d]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#5c3f42]">
              Pronto para exportar {financialRecords.length} registos de faturação em Kwanzas (Kz).
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setSaftModalOpen(false)} className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl text-xs font-bold">
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Exportação SAF-T preparada com os registos atuais.');
                  setSaftModalOpen(false);
                }}
                className="px-4 py-2 bg-[#ed145b] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVA TURMA */}
      {addClassModalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <h3 className="font-bold text-sm text-[#211a14] font-['Quicksand']">Criar Nova Turma</h3>
              <button type="button" onClick={() => setAddClassModalOpen(false)} className="p-1 text-[#8c6b6d]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateClassroom} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Nome da Turma *</label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="Ex: Berçário Ninho de Afeto"
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6] focus:outline-none focus:border-[#ed145b]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#5c3f42] block mb-1">Ciclo</label>
                  <select
                    value={classCycle}
                    onChange={(e) => setClassCycle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#eee0d6] bg-white"
                  >
                    <option>Berçário (4 meses a 1 ano)</option>
                    <option>Maternal I & II (1 a 3 anos)</option>
                    <option>Pré-Escolar & Jardim de Infância (4 a 5 anos)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#5c3f42] block mb-1">Lotação Máxima</label>
                  <input
                    type="number"
                    min={1}
                    value={classCapacity}
                    onChange={(e) => setClassCapacity(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Educadora Titular (Tia) *</label>
                <input
                  type="text"
                  required
                  value={classLeadTeacher}
                  onChange={(e) => setClassLeadTeacher(e.target.value)}
                  placeholder="Ex: Clara Marques (prefixo Tia automático)"
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                />
                {classLeadTeacher.trim() && (
                  <p className="text-[11px] text-[#ed145b] font-bold mt-1">
                    Será registada como: {formatEducatorName(classLeadTeacher)}
                  </p>
                )}
              </div>
              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Sala / Pavilhão</label>
                <input
                  type="text"
                  value={classRoom}
                  onChange={(e) => setClassRoom(e.target.value)}
                  placeholder="Ex: Ala dos Bebés - Sala 01"
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setAddClassModalOpen(false)} className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#ed145b] text-white rounded-xl font-bold hover:bg-pink-600 cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'A guardar...' : 'Registar Turma'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: MATRICULAR CRIANÇA */}
      {addStudentModalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <h3 className="font-bold text-sm text-[#211a14] font-['Quicksand']">Matricular Criança no Supabase</h3>
              <button type="button" onClick={() => setAddStudentModalOpen(false)} className="p-1 text-[#8c6b6d]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateStudent} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Nome da Criança *</label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Ex: Lucas Oliveira"
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#5c3f42] block mb-1">Turma *</label>
                  {classesList.length > 0 ? (
                    <select
                      value={studentClassroom}
                      onChange={(e) => setStudentClassroom(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-[#eee0d6] bg-white"
                    >
                      {classesList.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={studentClassroom}
                      onChange={(e) => setStudentClassroom(e.target.value)}
                      placeholder="Ex: Maternal I"
                      className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                    />
                  )}
                </div>
                <div>
                  <label className="font-bold text-[#5c3f42] block mb-1">Idade *</label>
                  <input
                    type="text"
                    required
                    value={studentAge}
                    onChange={(e) => setStudentAge(e.target.value)}
                    placeholder="Ex: 2 anos e 4 meses"
                    className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Nome do Encarregado *</label>
                <input
                  type="text"
                  required
                  value={studentResponsible}
                  onChange={(e) => setStudentResponsible(e.target.value)}
                  placeholder="Ex: Helena Oliveira"
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                />
              </div>
              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">E-mail do Encarregado (para ligar ao Portal dos Pais)</label>
                <input
                  type="email"
                  value={studentGuardianEmail}
                  onChange={(e) => setStudentGuardianEmail(e.target.value)}
                  placeholder="pais@exemplo.com"
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                />
              </div>
              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Alergias (separadas por vírgula, se houver)</label>
                <input
                  type="text"
                  value={studentAllergies}
                  onChange={(e) => setStudentAllergies(e.target.value)}
                  placeholder="Ex: Intolerância à lactose"
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setAddStudentModalOpen(false)} className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#fd9924] text-white rounded-xl font-bold hover:bg-amber-600 cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'A matricular...' : 'Confirmar Matrícula'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CADASTRAR COLABORADOR / EDUCADORA / ENCARREGADO */}
      {addStaffModalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <h3 className="font-bold text-sm text-[#211a14] font-['Quicksand']">
                Cadastrar Utilizador do Portal
              </h3>
              <button type="button" onClick={() => setAddStaffModalOpen(false)} className="p-1 text-[#8c6b6d]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">
                  Perfil de Acesso *
                </label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6] bg-white"
                >
                  <option value="Educadora (Tia)">Educadora (Tia - Observações & Chamadas)</option>
                  <option value="Pais">Pais / Encarregado de Educação</option>
                  <option value="Portaria">Portaria / Segurança</option>
                  <option value="SPO">SPO (Psicologia e Apoio)</option>
                  <option value="Admin">Administração / Secretaria</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder={newStaffRole === 'Educadora (Tia)' ? 'Ex: Clara Marques' : 'Ex: António Silva'}
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6] bg-[#fff8f5]"
                />
                {newStaffRole === 'Educadora (Tia)' && newStaffName.trim() && (
                  <p className="text-[11px] text-[#ed145b] font-bold mt-1">
                    Prefixo aplicado automaticamente: <span className="bg-pink-100 px-2 py-0.5 rounded">{formatEducatorName(newStaffName)}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#5c3f42] block mb-1">E-mail de Acesso *</label>
                  <input
                    type="email"
                    required
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    placeholder="email@mayelinkids.com"
                    className="w-full p-2.5 rounded-xl border border-[#eee0d6] bg-[#fff8f5]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#5c3f42] block mb-1">NIF (Opcional)</label>
                  <input
                    type="text"
                    value={newStaffNif}
                    onChange={(e) => setNewStaffNif(e.target.value)}
                    placeholder="541..."
                    className="w-full p-2.5 rounded-xl border border-[#eee0d6] bg-[#fff8f5]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Palavra-passe Inicial (mín. 8 caracteres) *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newStaffPassword}
                  onChange={(e) => setNewStaffPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6] bg-[#fff8f5]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setAddStaffModalOpen(false)} className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#ed145b] text-white rounded-xl font-bold hover:bg-pink-600 cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'A guardar...' : 'Criar Conta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EMITIR FATURA */}
      {addInvoiceModalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <h3 className="font-bold text-sm text-[#211a14] font-['Quicksand']">Emitir Fatura de Propina (Kz)</h3>
              <button type="button" onClick={() => setAddInvoiceModalOpen(false)} className="p-1 text-[#8c6b6d]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs">
              {studentsList.length > 0 && (
                <div>
                  <label className="font-bold text-[#5c3f42] block mb-1">Selecionar Criança Matriculada</label>
                  <select
                    value={invStudentId}
                    onChange={(e) => {
                      const st = studentsList.find((s) => s.id === e.target.value);
                      setInvStudentId(e.target.value);
                      if (st) {
                        setInvStudentName(st.name);
                        setInvGuardianName(st.responsible_name);
                        setInvClassGroup(st.classroom_name);
                      }
                    }}
                    className="w-full p-2.5 rounded-xl border border-[#eee0d6] bg-white"
                  >
                    <option value="">-- Preencher manualmente --</option>
                    {studentsList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.classroom_name})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#5c3f42] block mb-1">Nome da Criança *</label>
                  <input
                    type="text"
                    required
                    value={invStudentName}
                    onChange={(e) => setInvStudentName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#5c3f42] block mb-1">Encarregado *</label>
                  <input
                    type="text"
                    required
                    value={invGuardianName}
                    onChange={(e) => setInvGuardianName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#5c3f42] block mb-1">NIF</label>
                  <input
                    type="text"
                    value={invNif}
                    onChange={(e) => setInvNif(e.target.value)}
                    placeholder="999999999"
                    className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#5c3f42] block mb-1">Montante (Kz) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={invAmount}
                    onChange={(e) => setInvAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Descrição</label>
                <input
                  type="text"
                  value={invDescription}
                  onChange={(e) => setInvDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#5c3f42] block mb-1">Método</label>
                  <select
                    value={invMethod}
                    onChange={(e) => setInvMethod(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#eee0d6] bg-white"
                  >
                    <option>Multicaixa Express (MCX)</option>
                    <option>Referência Multicaixa</option>
                    <option>Transferência Bancária (AO06)</option>
                    <option>TPA Presencial</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#5c3f42] block mb-1">Vencimento</label>
                  <input
                    type="text"
                    value={invDueDate}
                    onChange={(e) => setInvDueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setAddInvoiceModalOpen(false)} className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#ed145b] text-white rounded-xl font-bold hover:bg-pink-600 cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'A emitir...' : 'Emitir Fatura'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVA CIRCULAR */}
      {commsModalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <h3 className="font-bold text-sm text-[#211a14] font-['Quicksand']">Publicar Circular Oficial</h3>
              <button type="button" onClick={() => setCommsModalOpen(false)} className="p-1 text-[#8c6b6d]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Título *</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="Ex: Reunião de Boas-Vindas & Portfólio"
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#5c3f42] block mb-1">Destinatários</label>
                  <select
                    value={annTarget}
                    onChange={(e) => setAnnTarget(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[#eee0d6] bg-white"
                  >
                    <option value="todos">Toda a Comunidade</option>
                    <option value="pais">Apenas Pais / Encarregados</option>
                    <option value="educadoras">Apenas Educadoras (Tias)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#5c3f42] block mb-1">Prioridade</label>
                  <select
                    value={annPriority}
                    onChange={(e) => setAnnPriority(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[#eee0d6] bg-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="importante">Importante</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Canais</label>
                <div className="flex items-center gap-4 pt-1">
                  {['App Push', 'E-mail', 'SMS Alerta'].map((ch) => (
                    <label key={ch} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={annChannels.includes(ch)}
                        onChange={() => toggleChannel(ch)}
                        className="rounded text-[#ed145b]"
                      />
                      <span>{ch}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">
                  Conteúdo {annAttachment ? '(Opcional com documento anexo)' : '*'}
                </label>
                <textarea
                  rows={3}
                  required={!annAttachment}
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  placeholder={annAttachment ? 'Resumo adicional da circular (opcional)...' : 'Escreva o texto da circular...'}
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                />
              </div>

              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">
                  Importar Documento (PDF, Word, TXT ou Imagem até 3 MB)
                </label>
                {!annAttachment ? (
                  <label className="flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 border-dashed border-[#e8d5c8] bg-[#fff8f5] hover:border-[#ed145b] hover:bg-pink-50/40 transition-colors cursor-pointer text-[#5c3f42]">
                    <Upload className="w-4 h-4 text-[#ed145b] shrink-0" />
                    <span className="font-semibold text-xs">
                      Selecionar documento do computador ou telemóvel
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.webp"
                      onChange={handleAnnouncementFileChange}
                      className="sr-only"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between gap-2 p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-900">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold truncate text-xs">{annAttachment.name}</p>
                        <p className="text-[11px] opacity-80">
                          {Math.max(1, Math.round(annAttachment.size / 1024))} KB • Pronto para publicar
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAnnAttachment(null);
                        setAnnAttachmentError(null);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-rose-700 hover:bg-rose-50 font-bold text-[11px] shrink-0 cursor-pointer"
                    >
                      Remover
                    </button>
                  </div>
                )}
                {annAttachmentError && (
                  <p className="text-[11px] text-rose-700 font-semibold mt-1">{annAttachmentError}</p>
                )}
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={annAuthReq}
                  onChange={(e) => setAnnAuthReq(e.target.checked)}
                  className="rounded text-[#ed145b]"
                />
                <span className="font-semibold text-[#5c3f42]">Requer assinatura digital dos encarregados</span>
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCommsModalOpen(false);
                    setAnnAttachmentError(null);
                  }}
                  className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#ed145b] text-white rounded-xl font-bold hover:bg-pink-600 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'A publicar...' : 'Publicar Circular'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESULTADO DA VALIDAÇÃO FACTPLUS */}
      {validationResultModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <div className="flex items-center gap-2">
                <ShieldCheck className={`w-5 h-5 ${validationResultModal.valid ? 'text-emerald-600' : 'text-amber-600'}`} />
                <div>
                  <h3 className="font-bold text-sm text-[#211a14] font-['Quicksand']">
                    Validação Fiscal FactPlus (AGT)
                  </h3>
                  <p className="text-[11px] text-[#5c3f42] font-mono">
                    {validationResultModal.record.invoice_number}
                    {validationResultModal.reference ? ` • Ref FactPlus: ${validationResultModal.reference}` : ''}
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setValidationResultModal(null)} className="p-1 text-[#8c6b6d]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div
              className={`rounded-xl p-3.5 border text-xs ${
                validationResultModal.valid
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <p className="font-bold">{validationResultModal.factplusStatus}</p>
              <p className="mt-1 text-[11px]">{validationResultModal.message}</p>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#8c6b6d]">
                Verificações Fiscais da Fatura
              </p>
              <div className="divide-y divide-[#eee0d6] border border-[#eee0d6] rounded-xl overflow-hidden text-xs">
                {validationResultModal.checks.map((chk) => (
                  <div key={chk.key} className="px-3.5 py-2.5 flex items-start justify-between gap-3 bg-white">
                    <div>
                      <p className="font-bold text-[#211a14]">{chk.label}</p>
                      <p className="text-[11px] text-[#5c3f42]">{chk.detail}</p>
                    </div>
                    {chk.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {validationResultModal.schemaColumnWarning && (
              <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
                A fatura foi validada na FactPlus, mas as colunas de histórico FactPlus ainda não existem na tabela Supabase. Execute a migração SQL atualizada para guardar a referência permanentemente.
              </p>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setValidationResultModal(null)}
                className="px-4 py-2 bg-[#211a14] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VALIDAR REFERÊNCIA FACTPLUS EXISTENTE */}
      {verifyRefModalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#00a6c0]" />
                <h3 className="font-bold text-sm text-[#211a14] font-['Quicksand']">
                  Validar Factura por Referência FactPlus
                </h3>
              </div>
              <button type="button" onClick={() => setVerifyRefModalOpen(false)} className="p-1 text-[#8c6b6d]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleVerifyFactPlusReference} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Referência FactPlus *</label>
                <input
                  type="text"
                  required
                  value={verifyRefInput}
                  onChange={(e) => setVerifyRefInput(e.target.value)}
                  placeholder="Ex: FT 2026/1042"
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6] font-mono focus:outline-none focus:border-[#00a6c0]"
                />
              </div>

              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Tipo de Documento</label>
                <select
                  value={verifyRefDocType}
                  onChange={(e) => setVerifyRefDocType(e.target.value as 'factura' | 'factura-recibo' | 'proforma')}
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6] bg-white"
                >
                  <option value="factura">Factura</option>
                  <option value="factura-recibo">Factura-Recibo</option>
                  <option value="proforma">Factura Proforma</option>
                </select>
              </div>

              {financialRecords.length > 0 && (
                <div>
                  <label className="font-bold text-[#5c3f42] block mb-1">Associar a Lançamento (Opcional)</label>
                  <select
                    value={verifyRefRecordId}
                    onChange={(e) => setVerifyRefRecordId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#eee0d6] bg-white"
                  >
                    <option value="">-- Apenas consultar na FactPlus --</option>
                    {financialRecords.map((rec) => (
                      <option key={rec.id} value={rec.id}>
                        {rec.invoice_number} — {rec.student_name} (Kz {Number(rec.amount).toLocaleString('pt-PT')})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {verifyRefResult && (
                <div
                  className={`rounded-xl p-3 border text-xs ${
                    verifyRefResult.valid
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <p className="font-bold">
                    {verifyRefResult.valid ? 'Documento Válido na FactPlus' : 'Não Validado'}
                    {verifyRefResult.statusText ? ` (${verifyRefResult.statusText})` : ''}
                  </p>
                  <p className="text-[11px] mt-0.5">{verifyRefResult.message}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVerifyRefModalOpen(false)}
                  className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  disabled={verifyingRef || !factPlusStatus?.configured}
                  className="px-4 py-2 bg-[#00a6c0] text-white rounded-xl font-bold hover:bg-cyan-700 cursor-pointer disabled:opacity-60"
                >
                  {verifyingRef ? 'A consultar...' : 'Validar na FactPlus'}
                </button>
              </div>

              {!factPlusStatus?.configured && (
                <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                  Configure a variável secreta <span className="font-mono font-bold">FACTPLUS_API_KEY</span> no servidor para consultar referências online.
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
