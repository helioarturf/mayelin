import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  GraduationCap,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Plus,
  Heart,
  Smile,
  Send,
  X,
  Paperclip,
  Printer,
  Check,
  Activity,
  ArrowLeft,
  RefreshCw,
  Download
} from 'lucide-react';
import { formatEducatorName } from '../utils/formatters';
import {
  AuthUser,
  DbAttendanceRecord,
  DbChildObservation,
  DbClassroom,
  DbLessonPlan,
  DbPedagogicalIncident,
  DbStudent,
  ObservationCategory,
  ObservationPriority,
  portalApi
} from '../lib/api';

interface TeacherSchoolDashboardProps {
  authToken: string;
  currentUser: AuthUser;
  onClose?: () => void;
  headerPortalTarget?: HTMLElement | null;
}

type TeacherSection = 'overview' | 'attendance' | 'observations' | 'lessons' | 'incidents';
type AttendanceStatus = 'Presente' | 'Ausente' | 'Atrasado';

export default function TeacherSchoolDashboard({
  authToken,
  currentUser,
  onClose,
  headerPortalTarget
}: TeacherSchoolDashboardProps) {
  const [activeSection, setActiveSection] = useState<TeacherSection>('overview');
  const [activeClass, setActiveClass] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Supabase Live Data
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [classrooms, setClassrooms] = useState<DbClassroom[]>([]);
  const [students, setStudents] = useState<DbStudent[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<DbAttendanceRecord[]>([]);
  const [observationsList, setObservationsList] = useState<DbChildObservation[]>([]);
  const [lessonsList, setLessonsList] = useState<DbLessonPlan[]>([]);
  const [incidentsList, setIncidentsList] = useState<DbPedagogicalIncident[]>([]);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Modals
  const [newObsModal, setNewObsModal] = useState(false);
  const [newLessonModal, setNewLessonModal] = useState(false);
  const [newIncidentModal, setNewIncidentModal] = useState(false);
  const [pdfExportModal, setPdfExportModal] = useState(false);

  // Form: Observation
  const [obsStudentName, setObsStudentName] = useState('');
  const [obsCategory, setObsCategory] = useState<ObservationCategory>('Adaptação & Emoções');
  const [obsPriority, setObsPriority] = useState<ObservationPriority>('Rotina');
  const [obsText, setObsText] = useState('');
  const [obsNotifyParents, setObsNotifyParents] = useState(true);
  const [filterStudent, setFilterStudent] = useState<string>('todos');
  const [filterCategory, setFilterCategory] = useState<string>('todas');

  // Form: Lesson Plan
  const [lessonSubject, setLessonSubject] = useState('Exploração Sensorial & Natureza');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDate, setLessonDate] = useState('Esta semana');
  const [lessonTime, setLessonTime] = useState('09:30 - 10:30');
  const [lessonRoom, setLessonRoom] = useState('Sala de Atividades');
  const [lessonSummary, setLessonSummary] = useState('');

  // Form: Incident
  const [newIncStudent, setNewIncStudent] = useState('');
  const [newIncType, setNewIncType] = useState<'Mérito Positivo' | 'Apoio Socioemocional'>('Mérito Positivo');
  const [newIncTitle, setNewIncTitle] = useState('');
  const [newIncDesc, setNewIncDesc] = useState('');
  const [newIncSpo, setNewIncSpo] = useState(false);
  const [newIncNotify, setNewIncNotify] = useState(true);

  const educatorDisplayName = formatEducatorName(currentUser.name);
  const todayLabel = new Date().toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const loadWorkspace = useCallback(
    async (classroomFilter?: string) => {
      setLoading(true);
      setLoadError(null);
      try {
        const data = await portalApi.getEducatorWorkspace(authToken, classroomFilter || undefined);
        setClassrooms(data.classrooms);
        setStudents(data.students);
        setAttendanceRecords(data.attendanceRecords);
        setObservationsList(data.observations);
        setLessonsList(data.lessonPlans);
        setIncidentsList(data.incidents);

        const resolvedClass =
          classroomFilter ||
          (data.classrooms.length > 0 ? data.classrooms[0].name : '');
        if (!classroomFilter && resolvedClass) {
          setActiveClass(resolvedClass);
        }

        if (data.students.length > 0) {
          setObsStudentName((prev) =>
            data.students.some((s) => s.name === prev) ? prev : data.students[0].name
          );
          setNewIncStudent((prev) =>
            data.students.some((s) => s.name === prev) ? prev : data.students[0].name
          );
        } else {
          setObsStudentName('');
          setNewIncStudent('');
        }
      } catch (err) {
        setLoadError(
          err instanceof Error ? err.message : 'Erro ao carregar dados da turma no Supabase.'
        );
      } finally {
        setLoading(false);
      }
    },
    [authToken]
  );

  useEffect(() => {
    loadWorkspace(activeClass || undefined);
  }, [activeClass, loadWorkspace]);

  // Combine students + today's Supabase attendance records
  const attendanceList = useMemo(() => {
    const classStudents = activeClass
      ? students.filter((s) => s.classroom_name === activeClass)
      : students;

    return classStudents.map((st) => {
      const rec = attendanceRecords.find(
        (a) => a.student_name === st.name && a.classroom_name === st.classroom_name
      );
      return {
        id: st.id,
        number: st.student_number,
        name: st.name,
        classroom: st.classroom_name,
        status: (rec?.status || 'Presente') as AttendanceStatus,
        justification: rec?.justification || undefined
      };
    });
  }, [students, attendanceRecords, activeClass]);

  const filteredAttendance = useMemo(() => {
    if (!searchQuery.trim()) return attendanceList;
    const q = searchQuery.toLowerCase();
    return attendanceList.filter((s) => s.name.toLowerCase().includes(q));
  }, [attendanceList, searchQuery]);

  const attendanceStats = useMemo(() => {
    const total = attendanceList.length;
    const present = attendanceList.filter((s) => s.status === 'Presente').length;
    const absent = attendanceList.filter((s) => s.status === 'Ausente').length;
    const late = attendanceList.filter((s) => s.status === 'Atrasado').length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, late, rate };
  }, [attendanceList]);

  // Handlers
  const handleStatusChange = async (
    student: { id: string; number: number; name: string; classroom: string },
    newStatus: AttendanceStatus
  ) => {
    try {
      const { record } = await portalApi.saveAttendance(authToken, {
        studentId: student.id,
        studentNumber: student.number,
        studentName: student.name,
        classroomName: student.classroom,
        status: newStatus
      });
      if (record) {
        setAttendanceRecords((prev) => {
          const exists = prev.some(
            (r) => r.student_name === record.student_name && r.classroom_name === record.classroom_name
          );
          return exists
            ? prev.map((r) =>
                r.student_name === record.student_name && r.classroom_name === record.classroom_name
                  ? record
                  : r
              )
            : [record, ...prev];
        });
      }
      showToast(`Presença de ${student.name} atualizada para "${newStatus}".`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao guardar presença.');
    }
  };

  const handleMarkAllPresent = async () => {
    if (!activeClass || attendanceList.length === 0) return;
    try {
      const { records } = await portalApi.saveAttendance(authToken, {
        classroomName: activeClass,
        markAllPresent: true
      });
      if (records) {
        setAttendanceRecords((prev) => {
          const others = prev.filter((r) => r.classroom_name !== activeClass);
          return [...records, ...others];
        });
      }
      showToast(`Todas as ${attendanceList.length} crianças de ${activeClass} marcadas como presentes!`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao atualizar chamadas.');
    }
  };

  const handleAddObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!obsText.trim() || !obsStudentName) return;

    const target = attendanceList.find((s) => s.name === obsStudentName);
    setSubmitting(true);
    try {
      const { observation } = await portalApi.createObservation(authToken, {
        studentId: target?.id,
        studentNumber: target?.number || 1,
        studentName: obsStudentName,
        classroomName: target?.classroom || activeClass || 'Creche Mayelin',
        category: obsCategory,
        priority: obsPriority,
        text: obsText.trim(),
        notifiedParents: obsNotifyParents
      });

      setObservationsList((prev) => [observation, ...prev]);
      setObsText('');
      setNewObsModal(false);
      showToast(
        obsNotifyParents
          ? `Observação registada por ${educatorDisplayName} e visível para os encarregados!`
          : `Observação interna registada para ${obsStudentName}.`
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao guardar observação.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteObservation = async (obs: DbChildObservation) => {
    try {
      await portalApi.deleteObservation(authToken, obs.id);
      setObservationsList((prev) => prev.filter((o) => o.id !== obs.id));
      showToast(`Observação de ${obs.student_name} removida.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao remover observação.');
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim() || !lessonSummary.trim()) return;
    setSubmitting(true);
    try {
      const { lesson } = await portalApi.createLessonPlan(authToken, {
        classroomName: activeClass || 'Geral',
        subject: lessonSubject,
        title: lessonTitle.trim(),
        lessonDate: lessonDate.trim() || 'Esta semana',
        timeSlot: lessonTime.trim() || '09:30 - 10:30',
        room: lessonRoom.trim() || 'Sala de Atividades',
        summary: lessonSummary.trim()
      });
      setLessonsList((prev) => [lesson, ...prev]);
      setLessonTitle('');
      setLessonSummary('');
      setNewLessonModal(false);
      showToast('Plano de atividades guardado no Supabase.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao criar plano.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncStudent || !newIncTitle.trim() || !newIncDesc.trim()) return;
    setSubmitting(true);
    try {
      const { incident } = await portalApi.createIncident(authToken, {
        studentName: newIncStudent,
        type: newIncType,
        title: newIncTitle.trim(),
        description: newIncDesc.trim(),
        spoReferral: newIncSpo,
        notifiedFamily: newIncNotify,
        teacherNote: newIncSpo
          ? 'Encaminhado ao Gabinete de Psicologia (SPO).'
          : `Registado por ${educatorDisplayName}.`
      });
      setIncidentsList((prev) => [incident, ...prev]);
      setNewIncTitle('');
      setNewIncDesc('');
      setNewIncidentModal(false);
      showToast('Registo pedagógico guardado no Supabase.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao guardar ocorrência.');
    } finally {
      setSubmitting(false);
    }
  };

  const teacherSectionLabels: Record<TeacherSection, string> = {
    overview: 'Visão Geral',
    attendance: 'Chamadas & Presenças',
    observations: 'Observações & Desenvolvimento',
    lessons: 'Planos de Atividades',
    incidents: 'Méritos & Apoio SPO'
  };

  const educatorToolbarControls = (
    <>
      <div className="flex items-center gap-3 flex-wrap min-w-0">
        <div className="flex items-center gap-2 text-xs min-w-0">
          <span className="font-bold text-[#00a6c0] whitespace-nowrap">{educatorDisplayName}</span>
          <span className="text-[#c9b4a8]" aria-hidden="true">/</span>
          <span className="font-extrabold text-[#211a14] whitespace-nowrap truncate">
            {teacherSectionLabels[activeSection]}
          </span>
        </div>

        {classrooms.length > 0 && (
          <div className="flex items-center gap-1 bg-[#faebe1] rounded-lg p-0.5 border border-[#eee0d6] overflow-x-auto max-w-full">
            {classrooms.map((cls) => (
              <button
                key={cls.id}
                type="button"
                onClick={() => setActiveClass(cls.name)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  activeClass === cls.name
                    ? 'bg-white text-[#00a6c0]'
                    : 'text-[#5c3f42] hover:text-[#211a14]'
                }`}
              >
                {cls.name}
              </button>
            ))}
          </div>
        )}
        <span className="text-[11px] text-[#8c6b6d] capitalize hidden xl:inline whitespace-nowrap">
          {todayLabel}
        </span>
      </div>

      <div className="flex items-center justify-between md:justify-end gap-2 shrink-0">
        <button
          type="button"
          onClick={() => loadWorkspace(activeClass || undefined)}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl bg-[#faebe1] text-[#5c3f42] hover:bg-[#f4e6db] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#00a6c0]' : ''}`} />
          <span>Atualizar</span>
        </button>

        <button
          type="button"
          onClick={() => setPdfExportModal(true)}
          className="px-3.5 py-1.5 rounded-xl bg-[#00a6c0] text-white hover:bg-sky-700 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Imprimir Relatório</span>
        </button>
      </div>
    </>
  );

  return (
    <div
      role="region"
      aria-label="Painel da Educadora (Tia)"
      className="bg-[#fff8f5] text-[#211a14] w-full flex-1 flex flex-col overflow-hidden font-['Nunito_Sans'] antialiased min-h-0"
    >
      {headerPortalTarget && createPortal(educatorToolbarControls, headerPortalTarget)}

      {headerPortalTarget === undefined && (
        <header
          className="bg-white border-b border-[#eee0d6] px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 z-20"
          role="banner"
        >
          {educatorToolbarControls}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-[#5c3f42] hover:text-[#211a14] hover:bg-[#faebe1] transition-colors flex items-center gap-1.5 text-xs font-bold ml-1"
            >
              <ArrowLeft className="w-4 h-4 text-sky-600" />
              <span className="hidden sm:inline">Voltar ao Website</span>
            </button>
          )}
        </header>
      )}

      {/* BODY LAYOUT */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
        <nav
          className="w-full md:w-64 lg:w-[260px] bg-white text-[#5c3f42] p-3 sm:p-4 flex md:flex-col justify-between shrink-0 overflow-x-auto md:overflow-y-auto border-b md:border-b-0 md:border-r border-[#eee0d6]"
          aria-label="Fluxos de trabalho da educadora"
        >
          <div className="flex md:flex-col gap-1 w-full">
            <span className="text-[11px] font-bold text-[#8c6b6d] px-3 py-1.5 hidden md:block">
              Gestão Pedagógica
            </span>

            {[
              { id: 'overview', label: 'Visão Geral', icon: Activity, count: null },
              { id: 'attendance', label: 'Chamadas & Presenças', icon: Users, count: attendanceStats.total },
              { id: 'observations', label: 'Observações & Afeto', icon: Heart, count: observationsList.length },
              { id: 'lessons', label: 'Planos de Atividades', icon: BookOpen, count: lessonsList.length },
              { id: 'incidents', label: 'Méritos & Apoio SPO', icon: Smile, count: incidentsList.length }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id as TeacherSection)}
                  className={`min-h-[40px] md:w-full px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between gap-2.5 transition-colors text-left whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-[#00a6c0] text-white'
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
              <span className="text-[#8c6b6d]">Presentes hoje</span>
              <span className="font-bold tabular-nums text-emerald-700">
                {attendanceStats.present}/{attendanceStats.total}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8c6b6d]">Observações</span>
              <span className="font-bold tabular-nums text-[#ed145b]">{observationsList.length}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8c6b6d]">Avaliação</span>
              <span className="font-semibold text-[#5c3f42]">Qualitativa</span>
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
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
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
                onClick={() => loadWorkspace(activeClass || undefined)}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 cursor-pointer shrink-0"
              >
                Tentar Novamente
              </button>
            </div>
          )}

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-sky-200 border-t-[#00a6c0] rounded-full animate-spin" />
              <p className="text-xs font-bold text-[#5c3f42]">A carregar dados reais da turma...</p>
            </div>
          ) : (
            <>
              {/* 1. VISÃO GERAL */}
              {activeSection === 'overview' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#eee0d6]">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-extrabold font-['Quicksand'] text-[#211a14] tracking-tight">
                        {educatorDisplayName} {activeClass ? `· ${activeClass}` : ''}
                      </h1>
                      <p className="text-xs sm:text-sm text-[#5c3f42] mt-0.5">
                        Acompanhamento qualitativo sem notas · {attendanceStats.total} crianças na turma
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveSection('attendance')}
                        className="min-h-[40px] px-4 py-2 rounded-lg bg-white border border-[#eee0d6] hover:bg-[#faebe1] text-[#211a14] font-bold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5 text-[#00a6c0]" />
                        <span>Chamada do Dia</span>
                      </button>
                      <button
                        type="button"
                        disabled={attendanceList.length === 0}
                        onClick={() => setNewObsModal(true)}
                        className="min-h-[40px] px-4 py-2 rounded-lg bg-[#ed145b] hover:bg-pink-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Escrever Observação</span>
                      </button>
                    </div>
                  </div>

                  {/* Faixa de Métricas (4 Colunas) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#eee0d6]">
                      <div className="flex items-center justify-between text-xs font-bold text-[#5c3f42]">
                        <span>Taxa de Presença Hoje</span>
                        <Users className="w-4 h-4 text-emerald-700" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-extrabold font-['Quicksand'] tabular-nums text-[#211a14] mt-2">
                        {attendanceStats.rate}%
                      </p>
                      <p className="text-xs text-emerald-700 font-semibold mt-1.5 tabular-nums">
                        {attendanceStats.present} de {attendanceStats.total} presentes
                      </p>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#eee0d6]">
                      <div className="flex items-center justify-between text-xs font-bold text-[#5c3f42]">
                        <span>Observações da Turma</span>
                        <Heart className="w-4 h-4 text-[#ed145b]" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-extrabold font-['Quicksand'] tabular-nums text-[#211a14] mt-2">
                        {observationsList.length}
                      </p>
                      <p className="text-xs text-[#5c3f42] mt-1.5">
                        Registos qualitativos das Tias
                      </p>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#eee0d6]">
                      <div className="flex items-center justify-between text-xs font-bold text-[#5c3f42]">
                        <span>Atividades Planeadas</span>
                        <BookOpen className="w-4 h-4 text-[#00a6c0]" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-extrabold font-['Quicksand'] tabular-nums text-[#211a14] mt-2">
                        {lessonsList.length}
                      </p>
                      <p className="text-xs text-[#5c3f42] mt-1.5">
                        Sessões lúdicas registadas
                      </p>
                    </div>

                    <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#eee0d6]">
                      <div className="flex items-center justify-between text-xs font-bold text-[#5c3f42]">
                        <span>Méritos & Apoio SPO</span>
                        <Smile className="w-4 h-4 text-[#fd9924]" />
                      </div>
                      <p className="text-2xl sm:text-3xl font-extrabold font-['Quicksand'] tabular-nums text-[#211a14] mt-2">
                        {incidentsList.length}
                      </p>
                      <p className="text-xs text-[#5c3f42] mt-1.5">
                        Acompanhamento socioemocional
                      </p>
                    </div>
                  </div>

                  {attendanceList.length === 0 ? (
                    <div className="bg-white p-6 rounded-xl border border-[#eee0d6] text-xs text-[#5c3f42] space-y-2">
                      <p className="font-bold text-sm text-[#211a14]">Ainda não existem crianças matriculadas nesta turma.</p>
                      <p>
                        Solicite à Administração & Gestão que crie as turmas e matricule as crianças para começar a registar chamadas e observações diárias.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {/* Coluna Esquerda: Chamada Rápida da Turma */}
                      <section className="lg:col-span-7 bg-white rounded-xl border border-[#eee0d6] overflow-hidden">
                        <div className="px-5 py-4 border-b border-[#eee0d6] flex items-center justify-between gap-3">
                          <div>
                            <h2 className="text-sm font-bold font-['Quicksand'] text-[#211a14]">
                              Chamada Rápida {activeClass ? `· ${activeClass}` : ''}
                            </h2>
                            <p className="text-xs text-[#8c6b6d] tabular-nums">
                              {attendanceStats.present} presentes · {attendanceStats.absent} ausentes · {attendanceStats.late} atrasos
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleMarkAllPresent}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer"
                          >
                            Marcar Todos Presentes
                          </button>
                        </div>

                        <div className="divide-y divide-[#eee0d6]">
                          {attendanceList.slice(0, 6).map((st) => (
                            <div
                              key={st.id}
                              className="px-5 py-3 flex items-center justify-between gap-3 hover:bg-[#fff8f5] transition-colors text-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-[11px] font-bold tabular-nums text-[#8c6b6d] w-6">
                                  #{st.number}
                                </span>
                                <span className="font-bold text-[#211a14] truncate">{st.name}</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {(['Presente', 'Ausente', 'Atrasado'] as AttendanceStatus[]).map((statusOption) => (
                                  <button
                                    key={statusOption}
                                    type="button"
                                    onClick={() => handleStatusChange(st, statusOption)}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                                      st.status === statusOption
                                        ? statusOption === 'Presente'
                                          ? 'bg-emerald-600 text-white'
                                          : statusOption === 'Ausente'
                                          ? 'bg-rose-600 text-white'
                                          : 'bg-amber-500 text-white'
                                        : 'bg-[#faebe1] text-[#5c3f42] hover:bg-[#eee0d6]'
                                    }`}
                                  >
                                    {statusOption}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {attendanceList.length > 6 && (
                          <div className="px-5 py-3 bg-[#fffcf9] border-t border-[#eee0d6] text-right">
                            <button
                              type="button"
                              onClick={() => setActiveSection('attendance')}
                              className="text-xs font-bold text-[#00a6c0] hover:underline cursor-pointer"
                            >
                              Ver lista completa ({attendanceList.length})
                            </button>
                          </div>
                        )}
                      </section>

                      {/* Coluna Direita: Observações Recentes & Ações */}
                      <div className="lg:col-span-5 space-y-6">
                        <section className="bg-white rounded-xl border border-[#eee0d6] overflow-hidden">
                          <div className="px-5 py-4 border-b border-[#eee0d6] flex items-center justify-between gap-3">
                            <h2 className="text-sm font-bold font-['Quicksand'] text-[#211a14]">
                              Observações Recentes
                            </h2>
                            <button
                              type="button"
                              onClick={() => setActiveSection('observations')}
                              className="text-xs font-bold text-[#00a6c0] hover:underline whitespace-nowrap cursor-pointer"
                            >
                              Ver Todas
                            </button>
                          </div>

                          {observationsList.length === 0 ? (
                            <div className="p-6 text-center space-y-2 text-xs text-[#5c3f42]">
                              <p>Nenhuma observação registada ainda nesta turma.</p>
                              <button
                                type="button"
                                onClick={() => setNewObsModal(true)}
                                className="px-3.5 py-1.5 rounded-lg bg-[#ed145b] text-white font-bold hover:bg-pink-600 transition-colors cursor-pointer"
                              >
                                Escrever Primeira Observação
                              </button>
                            </div>
                          ) : (
                            <div className="divide-y divide-[#eee0d6]">
                              {observationsList.slice(0, 4).map((obs) => (
                                <div key={obs.id} className="px-5 py-3.5 space-y-1 text-xs">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-bold text-[#211a14] truncate">{obs.student_name}</span>
                                    <span className="text-[11px] font-semibold text-[#00a6c0] whitespace-nowrap">
                                      {obs.category}
                                    </span>
                                  </div>
                                  <p className="text-[#5c3f42] line-clamp-2 leading-relaxed">"{obs.text}"</p>
                                  <p className="text-[11px] text-[#8c6b6d] tabular-nums">
                                    {obs.priority} · {formatEducatorName(obs.recorded_by)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </section>

                        <section className="bg-white rounded-xl border border-[#eee0d6] overflow-hidden">
                          <div className="px-5 py-3.5 border-b border-[#eee0d6]">
                            <h2 className="text-sm font-bold font-['Quicksand'] text-[#211a14]">
                              Registos Pedagógicos
                            </h2>
                          </div>
                          <div className="divide-y divide-[#eee0d6]">
                            <button
                              type="button"
                              onClick={() => setNewLessonModal(true)}
                              className="w-full px-5 py-3 text-left text-xs font-bold text-[#211a14] hover:bg-[#fff8f5] flex items-center justify-between transition-colors cursor-pointer"
                            >
                              <span className="flex items-center gap-2.5">
                                <BookOpen className="w-4 h-4 text-[#00a6c0]" />
                                <span>Criar Plano de Atividade Lúdica</span>
                              </span>
                              <Plus className="w-3.5 h-3.5 text-[#8c6b6d]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setNewIncidentModal(true)}
                              className="w-full px-5 py-3 text-left text-xs font-bold text-[#211a14] hover:bg-[#fff8f5] flex items-center justify-between transition-colors cursor-pointer"
                            >
                              <span className="flex items-center gap-2.5">
                                <Smile className="w-4 h-4 text-[#fd9924]" />
                                <span>Registar Mérito / Apoio SPO</span>
                              </span>
                              <Plus className="w-3.5 h-3.5 text-[#8c6b6d]" />
                            </button>
                          </div>
                        </section>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. CHAMADAS */}
              {activeSection === 'attendance' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold font-['Quicksand'] text-[#211a14]">
                        Registo de Chamadas & Frequência Diária {activeClass ? `• ${activeClass}` : ''}
                      </h3>
                      <p className="text-xs text-[#5c3f42]">
                        {attendanceStats.present} Presentes • {attendanceStats.absent} Ausentes • {attendanceStats.late} Atrasos
                      </p>
                    </div>

                    {attendanceList.length > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllPresent}
                        className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Marcar Todos como Presente</span>
                      </button>
                    )}
                  </div>

                  <div className="bg-white rounded-2xl border border-[#eee0d6] overflow-hidden shadow-xs">
                    <div className="p-3 bg-[#fff8f5] border-b border-[#eee0d6] flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#5c3f42]">
                        Crianças Matriculadas ({attendanceList.length})
                      </span>
                      <div className="w-64">
                        <input
                          type="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Filtrar por nome..."
                          className="w-full text-xs px-3 py-1.5 rounded-xl border border-[#eee0d6] bg-white focus:outline-none focus:border-[#00a6c0]"
                        />
                      </div>
                    </div>

                    {filteredAttendance.length === 0 ? (
                      <div className="p-8 text-center text-xs text-[#5c3f42]">
                        Nenhuma criança encontrada nesta turma.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#fff8f5] border-b border-[#eee0d6] text-[#5c3f42] font-bold uppercase text-[10px] tracking-wider">
                            <tr>
                              <th className="p-3.5 w-12 text-center">Nº</th>
                              <th className="p-3.5">Nome da Criança</th>
                              <th className="p-3.5 text-center">Estado Hoje</th>
                              <th className="p-3.5">Observações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#eee0d6]">
                            {filteredAttendance.map((student) => (
                              <tr key={student.id} className="hover:bg-[#fff1e7]/70 transition-colors">
                                <td className="p-3.5 text-center font-bold text-[#8c6b6d]">{student.number}</td>
                                <td className="p-3.5 font-bold text-[#211a14]">{student.name}</td>
                                <td className="p-3.5">
                                  <div className="flex items-center justify-center gap-1.5">
                                    {(['Presente', 'Ausente', 'Atrasado'] as AttendanceStatus[]).map((st) => (
                                      <button
                                        key={st}
                                        type="button"
                                        onClick={() => handleStatusChange(student, st)}
                                        className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                                          student.status === st
                                            ? st === 'Presente'
                                              ? 'bg-emerald-600 text-white shadow-xs'
                                              : st === 'Ausente'
                                              ? 'bg-rose-600 text-white shadow-xs'
                                              : 'bg-amber-500 text-white shadow-xs'
                                            : 'bg-[#faebe1] text-[#5c3f42] hover:bg-[#f4e6db]'
                                        }`}
                                      >
                                        {st}
                                      </button>
                                    ))}
                                  </div>
                                </td>
                                <td className="p-3.5 text-[#5c3f42]">
                                  {student.justification ? (
                                    <span className="p-1.5 bg-[#fff8f5] border border-[#eee0d6] rounded-lg text-[11px] block">
                                      {student.justification}
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-[#8c6b6d] italic">Registo diário normal</span>
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

              {/* 3. OBSERVAÇÕES DA EDUCADORA (SEM NOTAS NEM PAUTAS) */}
              {activeSection === 'observations' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ed145b]" />
                        <h3 className="text-base font-bold font-['Quicksand'] text-[#211a14]">
                          Observações Importantes da Educadora {activeClass ? `• ${activeClass}` : ''}
                        </h3>
                      </div>
                      <p className="text-xs text-[#5c3f42] mt-1 max-w-2xl">
                        Na nossa creche <strong>não existem notas nem pautas numéricas</strong>. O acompanhamento é contínuo e qualitativo, baseado nas observações atentas das Tias sobre alimentação, soninho, autonomia, linguagem e afeto de cada criança.
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={attendanceList.length === 0}
                      onClick={() => setNewObsModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ed145b] to-[#fd9924] hover:from-pink-600 hover:to-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Escrever Observação</span>
                    </button>
                  </div>

                  {/* Filtro por Criança */}
                  {attendanceList.length > 0 && (
                    <div className="bg-white p-4 rounded-2xl border border-[#eee0d6] shadow-xs space-y-2.5">
                      <span className="text-[11px] font-bold text-[#8c6b6d] uppercase tracking-wider block">
                        Filtrar por Criança ({attendanceList.length} matriculadas):
                      </span>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        <button
                          type="button"
                          onClick={() => setFilterStudent('todos')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                            filterStudent === 'todos'
                              ? 'bg-[#00a6c0] text-white shadow-xs'
                              : 'bg-[#fff8f5] text-[#5c3f42] hover:bg-[#faebe1] border border-[#eee0d6]'
                          }`}
                        >
                          Todas as Crianças ({observationsList.length})
                        </button>

                        {attendanceList.map((st) => {
                          const count = observationsList.filter((o) => o.student_name === st.name).length;
                          return (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => setFilterStudent(st.name)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                                filterStudent === st.name
                                  ? 'bg-[#ed145b] text-white shadow-xs'
                                  : 'bg-[#fff8f5] text-[#5c3f42] hover:bg-[#faebe1] border border-[#eee0d6]'
                              }`}
                            >
                              <span>{st.name}</span>
                              <span className="text-[10px] opacity-80">({count})</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-1.5 overflow-x-auto pt-1 scrollbar-none">
                        {[
                          'todas',
                          'Adaptação & Emoções',
                          'Alimentação & Apetite',
                          'Soninho & Repouso',
                          'Desenvolvimento Motor',
                          'Linguagem & Interação',
                          'Saúde & Cuidados'
                        ].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setFilterCategory(cat)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer ${
                              filterCategory === cat
                                ? 'bg-[#211a14] text-white'
                                : 'bg-[#faebe1] text-[#5c3f42]'
                            }`}
                          >
                            {cat === 'todas' ? 'Todas as Dimensões' : cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lista de Observações */}
                  <div className="space-y-3.5">
                    {observationsList
                      .filter((obs) => filterStudent === 'todos' || obs.student_name === filterStudent)
                      .filter((obs) => filterCategory === 'todas' || obs.category === filterCategory)
                      .map((obs) => (
                        <div
                          key={obs.id}
                          className="bg-white rounded-2xl p-4 sm:p-5 border border-[#eee0d6] shadow-xs space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#eee0d6]">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#fd9924] to-[#ed145b] text-white flex items-center justify-center font-extrabold text-sm shrink-0">
                                {obs.student_name.charAt(0)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-bold text-sm text-[#211a14] font-['Quicksand']">
                                    {obs.student_name}
                                  </h4>
                                  <span className="text-[10px] bg-[#faebe1] text-[#5c3f42] px-2 py-0.5 rounded-md font-bold">
                                    Nº {obs.student_number}
                                  </span>
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                      obs.priority === 'Conquista / Marco'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : obs.priority === 'Importante'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-sky-100 text-sky-800'
                                    }`}
                                  >
                                    {obs.priority}
                                  </span>
                                </div>
                                <span className="text-[11px] text-[#8c6b6d]">
                                  {new Date(obs.created_at).toLocaleString('pt-PT')}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-auto">
                              <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#fff8f5] text-[#00a6c0] border border-[#eee0d6]">
                                {obs.category}
                              </span>
                              {obs.notified_parents ? (
                                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 border border-emerald-200">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Visível à Família</span>
                                </span>
                              ) : (
                                <span className="text-[11px] text-[#8c6b6d] bg-[#faebe1] px-2.5 py-1 rounded-xl font-bold">
                                  Registo Interno
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-xs sm:text-sm text-[#211a14] leading-relaxed bg-[#fff8f5] p-3.5 rounded-xl border border-[#eee0d6]/70">
                            "{obs.text}"
                          </p>

                          <div className="flex items-center justify-between text-[11px] text-[#5c3f42] pt-1">
                            <span className="flex items-center gap-1.5 font-bold">
                              <Smile className="w-3.5 h-3.5 text-[#fd9924]" />
                              <span>Registado com carinho por <strong>{formatEducatorName(obs.recorded_by)}</strong></span>
                            </span>

                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setObsStudentName(obs.student_name);
                                  setNewObsModal(true);
                                }}
                                className="text-[#00a6c0] hover:text-sky-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Nova observação</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteObservation(obs)}
                                className="text-rose-500 hover:text-rose-700 font-semibold hover:underline cursor-pointer text-[10px]"
                              >
                                Remover
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                    {observationsList
                      .filter((obs) => filterStudent === 'todos' || obs.student_name === filterStudent)
                      .filter((obs) => filterCategory === 'todas' || obs.category === filterCategory).length === 0 && (
                      <div className="p-8 text-center bg-white rounded-2xl border border-[#eee0d6] space-y-2">
                        <p className="text-sm font-bold text-[#211a14]">Nenhuma observação registada ainda.</p>
                        {attendanceList.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setNewObsModal(true)}
                            className="px-4 py-2 bg-[#00a6c0] text-white rounded-xl text-xs font-bold hover:bg-sky-700 transition-colors cursor-pointer"
                          >
                            Escrever Primeira Observação
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4. PLANOS DE ATIVIDADES */}
              {activeSection === 'lessons' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold font-['Quicksand'] text-[#211a14]">
                        Planos de Atividades Lúdicas {activeClass ? `• ${activeClass}` : ''}
                      </h3>
                      <p className="text-xs text-[#5c3f42]">
                        Organização semanal das brincadeiras educativas e estímulos sensoriais
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setNewLessonModal(true)}
                      className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#00a6c0] hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Novo Plano de Atividade</span>
                    </button>
                  </div>

                  {lessonsList.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl border border-[#eee0d6] text-center text-xs text-[#5c3f42]">
                      Nenhum plano de atividade registado para esta turma ainda.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {lessonsList.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs flex flex-col justify-between space-y-4"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-100 text-[#00a6c0]">
                                {lesson.subject}
                              </span>
                              <span className="text-xs text-[#8c6b6d] font-semibold">{lesson.time_slot}</span>
                            </div>

                            <h4 className="font-bold text-sm text-[#211a14] leading-snug">{lesson.title}</h4>

                            <p className="text-xs text-[#5c3f42] flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-[#8c6b6d]" />
                              <span>{lesson.lesson_date}</span> • <span>{lesson.room}</span>
                            </p>

                            <div className="p-3 bg-[#fff8f5] rounded-xl border border-[#eee0d6] text-xs text-[#5c3f42] leading-relaxed">
                              {lesson.summary}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[#eee0d6] text-[11px] text-[#8c6b6d] flex items-center justify-between">
                            <span>{formatEducatorName(lesson.created_by)}</span>
                            <span className="font-bold text-emerald-700">{lesson.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 5. OCORRÊNCIAS PEDAGÓGICAS */}
              {activeSection === 'incidents' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold font-['Quicksand'] text-[#211a14]">
                        Méritos Positivos & Apoio Socioemocional
                      </h3>
                      <p className="text-xs text-[#5c3f42]">
                        Comunicação afetuosa e articulação confidencial com o SPO
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={attendanceList.length === 0}
                      onClick={() => setNewIncidentModal(true)}
                      className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#00a6c0] hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Novo Registo</span>
                    </button>
                  </div>

                  {incidentsList.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl border border-[#eee0d6] text-center text-xs text-[#5c3f42]">
                      Nenhuma ocorrência ou mérito registado ainda.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {incidentsList.map((inc) => (
                        <div key={inc.id} className="bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                  inc.type === 'Mérito Positivo'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-purple-100 text-purple-800'
                                }`}
                              >
                                {inc.type}
                              </span>
                              <h4 className="font-bold text-sm text-[#211a14]">{inc.title}</h4>
                            </div>
                            <span className="text-xs text-[#8c6b6d] font-semibold">{inc.incident_date}</span>
                          </div>

                          <div className="p-3 bg-[#fff8f5] rounded-xl border border-[#eee0d6] text-xs text-[#5c3f42] leading-relaxed">
                            <p>
                              <strong className="text-[#211a14]">Criança:</strong> {inc.student_name}
                            </p>
                            <p className="mt-1">{inc.description}</p>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#eee0d6] text-xs">
                            <div className="flex items-center gap-2">
                              {inc.spo_referral && (
                                <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 font-bold text-[10px] border border-purple-200">
                                  Encaminhado ao SPO
                                </span>
                              )}
                              {inc.notified_family && (
                                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                                  Família Notificada
                                </span>
                              )}
                            </div>
                            <span className="text-[#8c6b6d] text-[11px] italic">
                              {inc.teacher_note || formatEducatorName(inc.created_by)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          </div>
        </main>
      </div>

      {/* MODAL: NOVA OBSERVAÇÃO DA TIA */}
      {newObsModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <h3 className="font-bold text-sm text-[#211a14] font-['Quicksand']">
                Nova Observação da Educadora (Tia)
              </h3>
              <button type="button" onClick={() => setNewObsModal(false)} className="p-1 text-[#8c6b6d]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddObservation} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Criança *</label>
                <select
                  value={obsStudentName}
                  onChange={(e) => setObsStudentName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6] bg-white text-[#211a14] font-semibold"
                >
                  {attendanceList.map((st) => (
                    <option key={st.id} value={st.name}>
                      Nº {st.number} - {st.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#5c3f42] block mb-1.5">Dimensão do Desenvolvimento</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Alimentação & Apetite', icon: '🍎' },
                    { label: 'Soninho & Repouso', icon: '😴' },
                    { label: 'Desenvolvimento Motor', icon: '🏃' },
                    { label: 'Linguagem & Interação', icon: '💬' },
                    { label: 'Adaptação & Emoções', icon: '❤️' },
                    { label: 'Saúde & Cuidados', icon: '🩺' }
                  ].map((cat) => (
                    <button
                      key={cat.label}
                      type="button"
                      onClick={() => setObsCategory(cat.label as ObservationCategory)}
                      className={`p-2 rounded-xl text-left font-semibold border flex items-center gap-2 cursor-pointer ${
                        obsCategory === cat.label
                          ? 'bg-[#faebe1] border-[#ed145b] text-[#ed145b]'
                          : 'bg-[#fff8f5] border-[#eee0d6] text-[#5c3f42]'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span className="truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Destaque</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Rotina', 'Conquista / Marco', 'Importante'] as ObservationPriority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setObsPriority(p)}
                      className={`p-2 rounded-xl font-bold text-xs border cursor-pointer ${
                        obsPriority === p
                          ? 'bg-[#211a14] border-[#211a14] text-white'
                          : 'bg-[#fff8f5] border-[#eee0d6] text-[#5c3f42]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Texto da Observação da Tia *</label>
                <textarea
                  rows={4}
                  required
                  value={obsText}
                  onChange={(e) => setObsText(e.target.value)}
                  placeholder="Descreva com carinho como correu o dia, apetite, soninho ou conquistas da criança..."
                  className="w-full p-3 rounded-xl border border-[#eee0d6] bg-[#fff8f5] text-[#211a14]"
                />
              </div>

              <div className="p-3 bg-pink-50/70 border border-pink-200/80 rounded-2xl space-y-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#5c3f42] font-semibold">Educadora Responsável:</span>
                  <span className="font-bold text-[#ed145b]">{educatorDisplayName}</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#211a14] pt-1.5 border-t border-pink-100">
                  <input
                    type="checkbox"
                    checked={obsNotifyParents}
                    onChange={(e) => setObsNotifyParents(e.target.checked)}
                    className="accent-[#ed145b] w-4 h-4 rounded"
                  />
                  <span>Partilhar no Portal dos Pais em tempo real</span>
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setNewObsModal(false)} className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-gradient-to-r from-[#ed145b] to-[#fd9924] text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'A guardar...' : 'Guardar Observação'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVO PLANO DE ATIVIDADE */}
      {newLessonModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <h3 className="font-bold text-sm text-[#211a14] font-['Quicksand']">Novo Plano de Atividade</h3>
              <button type="button" onClick={() => setNewLessonModal(false)} className="p-1 text-[#8c6b6d]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateLesson} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Área Lúdica</label>
                <select
                  value={lessonSubject}
                  onChange={(e) => setLessonSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6] bg-white"
                >
                  <option>Exploração Sensorial & Natureza</option>
                  <option>Linguagem & Roda de Histórias</option>
                  <option>Psicomotricidade & Movimento</option>
                  <option>Expressão Plástica & Música</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Título *</label>
                <input
                  type="text"
                  required
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#5c3f42] block mb-1">Data</label>
                  <input
                    type="text"
                    value={lessonDate}
                    onChange={(e) => setLessonDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#5c3f42] block mb-1">Horário</label>
                  <input
                    type="text"
                    value={lessonTime}
                    onChange={(e) => setLessonTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Sala / Espaço</label>
                <input
                  type="text"
                  value={lessonRoom}
                  onChange={(e) => setLessonRoom(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                />
              </div>
              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Descrição *</label>
                <textarea
                  rows={3}
                  required
                  value={lessonSummary}
                  onChange={(e) => setLessonSummary(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setNewLessonModal(false)} className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#00a6c0] text-white rounded-xl font-bold hover:bg-sky-700 cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'A guardar...' : 'Registar Plano'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVA OCORRÊNCIA / MÉRITO */}
      {newIncidentModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <h3 className="font-bold text-sm text-[#211a14] font-['Quicksand']">Registar Mérito / Apoio SPO</h3>
              <button type="button" onClick={() => setNewIncidentModal(false)} className="p-1 text-[#8c6b6d]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateIncident} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#5c3f42] block mb-1">Criança</label>
                  <select
                    value={newIncStudent}
                    onChange={(e) => setNewIncStudent(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#eee0d6] bg-white"
                  >
                    {attendanceList.map((st) => (
                      <option key={st.id} value={st.name}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#5c3f42] block mb-1">Tipo</label>
                  <select
                    value={newIncType}
                    onChange={(e) => setNewIncType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-[#eee0d6] bg-white"
                  >
                    <option value="Mérito Positivo">Mérito Positivo (Elogio)</option>
                    <option value="Apoio Socioemocional">Apoio Socioemocional (SPO)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Título *</label>
                <input
                  type="text"
                  required
                  value={newIncTitle}
                  onChange={(e) => setNewIncTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                />
              </div>
              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Descrição *</label>
                <textarea
                  rows={3}
                  required
                  value={newIncDesc}
                  onChange={(e) => setNewIncDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#5c3f42]">
                <input type="checkbox" checked={newIncSpo} onChange={(e) => setNewIncSpo(e.target.checked)} className="rounded text-[#00a6c0]" />
                <span>Encaminhar cópia ao Gabinete de Psicologia (SPO)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#5c3f42]">
                <input type="checkbox" checked={newIncNotify} onChange={(e) => setNewIncNotify(e.target.checked)} className="rounded text-[#00a6c0]" />
                <span>Notificar família</span>
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setNewIncidentModal(false)} className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#00a6c0] text-white rounded-xl font-bold hover:bg-sky-700 cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'A guardar...' : 'Submeter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EXPORTAR RELATÓRIO */}
      {pdfExportModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6]">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <h3 className="font-bold text-sm text-[#211a14] font-['Quicksand']">
                Relatório de Observações & Presenças
              </h3>
              <button type="button" onClick={() => setPdfExportModal(false)} className="p-1 text-[#8c6b6d]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#5c3f42]">
              Relatório com {observationsList.length} observações qualitativas e {attendanceList.length} presenças de <strong>{activeClass || 'Todas as Turmas'}</strong> assinado por <strong>{educatorDisplayName}</strong>.
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setPdfExportModal(false)} className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold text-xs">
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                  setPdfExportModal(false);
                }}
                className="px-4 py-2 bg-[#00a6c0] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Imprimir / PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
