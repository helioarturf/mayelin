import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  BookOpen,
  FileText,
  Sparkles,
  Download,
  Save,
  FileSpreadsheet,
  Plus,
  Search,
  Heart,
  Smile,
  Send,
  Eye,
  X,
  ChevronRight,
  Paperclip,
  Printer,
  SlidersHorizontal,
  Check,
  UserCheck,
  UserX,
  Activity,
  Award,
  ArrowLeft,
  HelpCircle
} from 'lucide-react';

interface TeacherSchoolDashboardProps {
  onClose?: () => void;
}

type TeacherSection = 'overview' | 'attendance' | 'grades' | 'lessons' | 'incidents' | 'settings';

type AttendanceStatus = 'Presente' | 'Ausente' | 'Atrasado';

interface StudentAttendance {
  id: string;
  name: string;
  number: number;
  status: AttendanceStatus;
  justification?: string;
  note?: string;
}

interface StudentGrade {
  id: string;
  name: string;
  number: number;
  formative: number; // 25%
  makerProject: number; // 25%
  summativeExam: number; // 35%
  participation: number; // 15%
}

interface LessonPlan {
  id: string;
  subject: string;
  title: string;
  date: string;
  time: string;
  room: string;
  summary: string;
  attachments: { name: string; type: string; size: string }[];
  status: 'Planeada' | 'Lecionada' | 'Em Curso';
}

interface PedagogicalIncident {
  id: string;
  studentName: string;
  type: 'Mérito Positivo' | 'Apoio Socioemocional';
  title: string;
  description: string;
  date: string;
  spoReferral: boolean;
  notifiedFamily: boolean;
  teacherNote?: string;
}

export default function TeacherSchoolDashboard({ onClose }: TeacherSchoolDashboardProps) {
  // Navigation & Header State
  const [activeSection, setActiveSection] = useState<TeacherSection>('overview');
  const [activeClass, setActiveClass] = useState('Jardim de Infância (Estrelinhas)');
  const currentTerm = '2º Trimestre';
  const currentDate = 'Terça-feira, 08 de Outubro de 2024';

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Search Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [previewAttachment, setPreviewAttachment] = useState<{ name: string; type: string } | null>(null);
  const [newLessonModal, setNewLessonModal] = useState(false);
  const [newIncidentModal, setNewIncidentModal] = useState(false);
  const [pdfExportModal, setPdfExportModal] = useState(false);

  // 1. Pilar de Chamadas e Frequência
  const [attendanceList, setAttendanceList] = useState<StudentAttendance[]>([
    { id: 'st-1', number: 1, name: 'Afonso Magalhães', status: 'Presente' },
    { id: 'st-2', number: 2, name: 'Beatriz Alcantara', status: 'Presente' },
    { id: 'st-3', number: 3, name: 'Carolina Neves', status: 'Presente' },
    {
      id: 'st-4',
      number: 4,
      name: 'Diogo Figueiredo',
      status: 'Ausente',
      justification: 'Atestado médico pediatria recebido (gastroenterite ligeira)'
    },
    { id: 'st-5', number: 5, name: 'Eduardo Silveira', status: 'Presente' },
    {
      id: 'st-6',
      number: 6,
      name: 'Francisca Lopes',
      status: 'Atrasado',
      justification: 'Atraso de 15 min justificado na portaria por trânsito'
    },
    { id: 'st-7', number: 7, name: 'Gonçalo Pereira', status: 'Presente' },
    { id: 'st-8', number: 8, name: 'Helena Rocha', status: 'Presente' },
    { id: 'st-9', number: 9, name: 'Inês Carvalho', status: 'Presente' },
    { id: 'st-10', number: 10, name: 'João Miguel Vaz', status: 'Presente' },
    { id: 'st-11', number: 11, name: 'Lucas Oliveira Mayelin', status: 'Presente' },
    { id: 'st-12', number: 12, name: 'Madalena Santos', status: 'Presente' },
    { id: 'st-13', number: 13, name: 'Martim Gomes', status: 'Presente' },
    { id: 'st-14', number: 14, name: 'Matilde Duarte', status: 'Presente' },
    { id: 'st-15', number: 15, name: 'Pedro Henrique Costa', status: 'Presente' },
    { id: 'st-16', number: 16, name: 'Rodrigo Alvares', status: 'Presente' },
    { id: 'st-17', number: 17, name: 'Salvador Ribeiro', status: 'Presente' },
    { id: 'st-18', number: 18, name: 'Sofia Rocha Ramos', status: 'Presente' },
    { id: 'st-19', number: 19, name: 'Tiago Meneses', status: 'Presente' },
    { id: 'st-20', number: 20, name: 'Tomás Mendonça', status: 'Presente' },
    { id: 'st-21', number: 21, name: 'Vicente Faria', status: 'Presente' },
    { id: 'st-22', number: 22, name: 'Vitória Pires', status: 'Presente' },
    { id: 'st-23', number: 23, name: 'Xavier Morais', status: 'Presente' },
    { id: 'st-24', number: 24, name: 'Yasmin Fernandes', status: 'Presente' }
  ]);

  // Ações de Chamada em Lote
  const handleMarkAllPresent = () => {
    setAttendanceList((prev) =>
      prev.map((s) => ({ ...s, status: 'Presente', justification: undefined }))
    );
    showToast('Todos os 24 alunos marcados como presentes na sessão matinal.');
  };

  const handleSyncAttendanceSecretary = () => {
    showToast('Folha de presenças sincronizada e enviada para a Secretaria Geral com sucesso.');
  };

  // 2. Pilar de Notas e Pautas de Educação Infantil
  const [selectedSubject, setSelectedSubject] = useState<'Linguagem e Expressão Oral' | 'Estimulação Sensorial e Lógica' | 'Psicomotricidade & Esquema Corporal' | 'Expressão Plástica & Criatividade'>('Linguagem e Expressão Oral');

  const [gradesList, setGradesList] = useState<StudentGrade[]>([
    { id: 'g-1', number: 1, name: 'Afonso Magalhães', formative: 84, makerProject: 90, summativeExam: 82, participation: 88 },
    { id: 'g-2', number: 2, name: 'Beatriz Alcantara', formative: 92, makerProject: 95, summativeExam: 94, participation: 96 },
    { id: 'g-3', number: 3, name: 'Carolina Neves', formative: 78, makerProject: 82, summativeExam: 75, participation: 80 },
    { id: 'g-4', number: 4, name: 'Diogo Figueiredo', formative: 70, makerProject: 75, summativeExam: 68, participation: 72 },
    { id: 'g-5', number: 5, name: 'Eduardo Silveira', formative: 88, makerProject: 85, summativeExam: 86, participation: 90 },
    { id: 'g-6', number: 6, name: 'Francisca Lopes', formative: 80, makerProject: 88, summativeExam: 78, participation: 85 },
    { id: 'g-7', number: 7, name: 'Lucas Oliveira Mayelin', formative: 95, makerProject: 98, summativeExam: 92, participation: 95 },
    { id: 'g-8', number: 8, name: 'Sofia Rocha Ramos', formative: 88, makerProject: 92, summativeExam: 85, participation: 90 }
  ]);

  // Função para cálculo ponderado oficial de Educação Infantil:
  // Observação Contínua (25%), Projetos Sensoriais / Horta (25%), Psicomotricidade & Cognitivo (35%), Autonomia (15%)
  const calculateFinalAverage = (g: StudentGrade) => {
    const avg = g.formative * 0.25 + g.makerProject * 0.25 + g.summativeExam * 0.35 + g.participation * 0.15;
    return Math.round(avg);
  };

  const getQualitativeAssessment = (score: number) => {
    if (score >= 90) return { label: 'Excelente', color: 'bg-emerald-100 text-emerald-800' };
    if (score >= 75) return { label: 'Muito Bom', color: 'bg-sky-100 text-sky-800' };
    if (score >= 60) return { label: 'Suficiente', color: 'bg-amber-100 text-amber-800' };
    return { label: 'Suficiente com Apoio', color: 'bg-rose-100 text-rose-800' };
  };

  const handleUpdateGrade = (id: string, field: keyof StudentGrade, value: number) => {
    setGradesList((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  };

  // 3. Pilar de Cronograma Curricular e Planos de Aula
  const [lessonsList, setLessonsList] = useState<LessonPlan[]>([
    {
      id: 'les-1',
      subject: 'Ciências da Natureza',
      title: 'Ecossistemas do Bosque e Ciclo da Água',
      date: 'Quarta-feira, 09 de Outubro',
      time: '09:00 - 10:30',
      room: 'Laboratório Maker & Horta',
      summary: 'Observação prática das camadas do solo, retenção hídrica nas raízes do alecrim e experiências com recipientes graduados.',
      attachments: [
        { name: 'Guia_Exploracao_Bosque.pdf', type: 'PDF', size: '2.4 MB' },
        { name: 'Slides_Ciclo_Agua_Interativo.pptx', type: 'Apresentação', size: '5.1 MB' }
      ],
      status: 'Planeada'
    },
    {
      id: 'les-2',
      subject: 'Matemática Concreta',
      title: 'Frações com Material Cuisenaire e Blocos Geométricos',
      date: 'Quinta-feira, 10 de Outubro',
      time: '10:45 - 12:15',
      room: 'Sala 102 - Painel Interativo',
      summary: 'Manipulação de barras coloridas para equivalências entre 1/2, 1/4 e 1/8. Resolução de desafios em pares.',
      attachments: [
        { name: 'Ficha_Pratica_Cuisenaire_Equivalencias.pdf', type: 'PDF', size: '1.8 MB' }
      ],
      status: 'Planeada'
    },
    {
      id: 'les-3',
      subject: 'Português e Literacia',
      title: 'Oficina de Escrita Criativa - Diário da Viagem ao Futuro',
      date: 'Sexta-feira, 11 de Outubro',
      time: '14:00 - 15:30',
      room: 'Biblioteca Infantil & Cantinho de Leitura',
      summary: 'Produção textual orientada com introdução de adjetivos descritivos e pontuação expressiva.',
      attachments: [
        { name: 'Grelha_Autoavaliacao_Escrita_Criativa.pdf', type: 'PDF', size: '920 KB' }
      ],
      status: 'Planeada'
    }
  ]);

  // 4. Pilar de Ocorrências Pedagógicas e Apoio Socioemocional
  const [incidentsList, setIncidentsList] = useState<PedagogicalIncident[]>([
    {
      id: 'inc-1',
      studentName: 'Beatriz Alcantara',
      type: 'Mérito Positivo',
      title: 'Empatia e Cooperação Excepcional no Trabalho de Laboratório',
      description: 'Durante a atividade em grupo com os microscópios de bolso, a aluna auxiliou com paciência dois colegas com dificuldades motoras, incentivando a participação de todos.',
      date: 'Ontem às 15:20',
      spoReferral: false,
      notifiedFamily: true,
      teacherNote: 'Elogio formal enviado na caderneta digital aos encarregados de educação.'
    },
    {
      id: 'inc-2',
      studentName: 'Diogo Figueiredo',
      type: 'Apoio Socioemocional',
      title: 'Agitação e Fadiga Cognitiva com Dificuldade de Concentração',
      description: 'Demonstrou irritabilidade atípica após o intervalo e rejeição das tarefas de cópia. Conversa acolhedora no cantinho da calma surtiu efeito temporário.',
      date: 'Segunda-feira às 11:15',
      spoReferral: true,
      notifiedFamily: true,
      teacherNote: 'Encaminhado para consulta de observação conjunta com o SPO (Dra. Sofia Ramos).'
    }
  ]);

  // Form State para Nova Ocorrência
  const [newIncStudent, setNewIncStudent] = useState('Lucas Oliveira Mayelin');
  const [newIncType, setNewIncType] = useState<'Mérito Positivo' | 'Apoio Socioemocional'>('Mérito Positivo');
  const [newIncTitle, setNewIncTitle] = useState('');
  const [newIncDesc, setNewIncDesc] = useState('');
  const [newIncSpo, setNewIncSpo] = useState(false);
  const [newIncNotify, setNewIncNotify] = useState(true);

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIncTitle.trim() || !newIncDesc.trim()) return;

    const newInc: PedagogicalIncident = {
      id: `inc-${Date.now()}`,
      studentName: newIncStudent,
      type: newIncType,
      title: newIncTitle,
      description: newIncDesc,
      date: 'Hoje, há momentos',
      spoReferral: newIncSpo,
      notifiedFamily: newIncNotify,
      teacherNote: newIncSpo
        ? 'Protocolo de triagem acionado com o Gabinete de Psicologia (SPO).'
        : 'Registo pedagógico arquivado no portfólio do aluno.'
    };

    setIncidentsList([newInc, ...incidentsList]);
    setNewIncTitle('');
    setNewIncDesc('');
    setNewIncidentModal(false);
    showToast(
      newIncNotify
        ? 'Ocorrência registada e notificação enviada à família pela App escolar.'
        : 'Ocorrência confidencial registada com sucesso.'
    );
  };

  // Filtered attendance based on query
  const filteredAttendance = useMemo(() => {
    if (!searchQuery.trim()) return attendanceList;
    const q = searchQuery.toLowerCase();
    return attendanceList.filter((s) => s.name.toLowerCase().includes(q));
  }, [attendanceList, searchQuery]);

  return (
    <div
      role="region"
      aria-label="Painel do Professor"
      className="bg-[#fff8f5] text-[#211a14] w-full flex-1 flex flex-col overflow-hidden font-['Nunito_Sans'] antialiased min-h-0"
    >
      {/* ========================================================================= */}
      {/* TOPNAVBAR - NAVEGAÇÃO SUPERIOR DO PROFESSOR (RBAC DOCENTE)                */}
      {/* ========================================================================= */}
      <header
        className="bg-white border-b border-[#eee0d6] px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 z-20"
        role="banner"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-[#00a6c0] flex items-center justify-center font-bold shadow-xs shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-bold font-['Quicksand'] text-[#211a14] leading-tight">
                Espaço do Professor Titular
              </h1>
              {/* Seletor rápido de turma ativa */}
              <div className="flex items-center gap-1 bg-[#faebe1] rounded-lg p-0.5 border border-[#eee0d6]">
                {(['Berçário (Ninho)', 'Maternal I (Passinhos)', 'Maternal II (Exploradores)', 'Pré-Escolar (Descobertas)', 'Jardim de Infância (Estrelinhas)'] as string[]).map((turma) => (
                  <button
                    key={turma}
                    type="button"
                    onClick={() => {
                      setActiveClass(turma);
                      showToast(`Turma ativa alterada para ${turma}.`);
                    }}
                    className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                      activeClass === turma
                        ? 'bg-white text-[#00a6c0] shadow-2xs'
                        : 'text-[#5c3f42] hover:text-[#211a14]'
                    }`}
                  >
                    {turma}
                  </button>
                ))}
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800">
                {currentTerm}
              </span>
            </div>
            <p className="text-[11px] text-[#5c3f42] mt-0.5">
              Prof. António Silva • Sessão Autenticada • {currentDate}
            </p>
          </div>
        </div>

        {/* Action Buttons: Guardar Rascunho & Exportar Pauta PDF */}
        <div className="flex items-center justify-between md:justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={() => showToast('Rascunho de pauta e sumários salvo com sucesso.')}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#faebe1] text-[#5c3f42] hover:bg-[#f4e6db] font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar Rascunho</span>
          </button>

          <button
            type="button"
            onClick={() => setPdfExportModal(true)}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#00a6c0] text-white hover:bg-sky-700 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Exportar Pauta PDF</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-[#5c3f42] hover:text-[#211a14] hover:bg-[#faebe1] transition-colors flex items-center gap-1.5 text-xs font-bold ml-1"
              aria-label="Voltar ao Website"
              title="Voltar ao Website"
            >
              <ArrowLeft className="w-4 h-4 text-sky-600" />
              <span className="hidden sm:inline">Voltar ao Website</span>
            </button>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* BODY LAYOUT: SIDENAVBAR DOCENTE + CONTEÚDO PRINCIPAL                      */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* SideNavBar Lateral */}
        <nav
          className="w-full md:w-64 bg-white text-[#5c3f42] p-3 sm:p-4 flex md:flex-col justify-between shrink-0 overflow-x-auto md:overflow-y-auto border-r border-[#eee0d6]"
          aria-label="Fluxos de trabalho do professor"
        >
          <div className="flex md:flex-col gap-1 w-full">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#8c6b6d] px-3 py-1.5 hidden md:block">
              Gestão Pedagógica
            </span>

            <button
              type="button"
              onClick={() => setActiveSection('overview')}
              className={`min-h-[42px] w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all text-left whitespace-nowrap cursor-pointer ${
                activeSection === 'overview'
                  ? 'bg-[#00a6c0] text-white shadow-md shadow-sky-500/20'
                  : 'text-[#5c3f42] hover:bg-[#fff1e7] hover:text-[#211a14]'
              }`}
            >
              <Activity className="w-4 h-4 shrink-0" />
              <span>Visão Geral Docente</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('attendance')}
              className={`min-h-[42px] w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all text-left whitespace-nowrap cursor-pointer ${
                activeSection === 'attendance'
                  ? 'bg-[#00a6c0] text-white shadow-md shadow-sky-500/20'
                  : 'text-[#5c3f42] hover:bg-[#fff1e7] hover:text-[#211a14]'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span>Chamadas & Presenças</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('grades')}
              className={`min-h-[42px] w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all text-left whitespace-nowrap cursor-pointer ${
                activeSection === 'grades'
                  ? 'bg-[#00a6c0] text-white shadow-md shadow-sky-500/20'
                  : 'text-[#5c3f42] hover:bg-[#fff1e7] hover:text-[#211a14]'
              }`}
            >
              <Award className="w-4 h-4 shrink-0" />
              <span>Lançamento de Notas & Pautas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('lessons')}
              className={`min-h-[42px] w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all text-left whitespace-nowrap cursor-pointer ${
                activeSection === 'lessons'
                  ? 'bg-[#00a6c0] text-white shadow-md shadow-sky-500/20'
                  : 'text-[#5c3f42] hover:bg-[#fff1e7] hover:text-[#211a14]'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Planos de Aula & Conteúdos</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('incidents')}
              className={`min-h-[42px] w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all text-left whitespace-nowrap cursor-pointer ${
                activeSection === 'incidents'
                  ? 'bg-[#00a6c0] text-white shadow-md shadow-sky-500/20'
                  : 'text-[#5c3f42] hover:bg-[#fff1e7] hover:text-[#211a14]'
              }`}
            >
              <Heart className="w-4 h-4 shrink-0" />
              <span>Ocorrências Pedagógicas</span>
            </button>
          </div>

          <div className="pt-3 border-t border-[#eee0d6] hidden md:block">
            <div className="p-2.5 rounded-xl bg-[#faebe1] text-[11px] space-y-1 border border-[#eee0d6]">
              <p className="font-bold text-[#211a14]">Conselho Pedagógico</p>
              <p className="text-[#5c3f42]">
                Pauta oficial do 2º Trimestre sujeita a homologação até 20 de Outubro.
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
              <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 1. VISÃO GERAL DOCENTE & INDICADORES RÁPIDOS DA TURMA ATIVA               */}
          {/* ========================================================================= */}
          {activeSection === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Indicadores Rápidos da Turma Ativa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Taxa de Presença Hoje */}
                <div className="bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs hover:border-sky-200 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#5c3f42]">Taxa de Presença Hoje</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold font-['Quicksand'] text-[#211a14] mt-2">
                    95.8%
                  </p>
                  <p className="text-xs text-emerald-700 font-bold mt-2">
                    23 presentes • 1 ausência com atestado médico
                  </p>
                </div>

                {/* 2. Avaliações Lançadas */}
                <div className="bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs hover:border-sky-200 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#5c3f42]">Avaliações Lançadas</span>
                    <div className="w-8 h-8 rounded-xl bg-sky-100 text-[#00a6c0] flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold font-['Quicksand'] text-[#211a14] mt-2">
                    18/24
                  </p>
                  <p className="text-xs text-sky-700 font-bold mt-2">
                    Média ponderada da turma: 82%
                  </p>
                </div>

                {/* 3. Planos de Aula & Sumários */}
                <div className="bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs hover:border-sky-200 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#5c3f42]">Aulas Planeadas</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold font-['Quicksand'] text-[#211a14] mt-2">
                    8
                  </p>
                  <p className="text-xs text-purple-700 font-bold mt-2">
                    Com materiais interativos anexados
                  </p>
                </div>

                {/* 4. Ocorrências & Apoio */}
                <div className="bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs hover:border-sky-200 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#5c3f42]">Ocorrências & Apoio</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Heart className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold font-['Quicksand'] text-[#211a14] mt-2">
                    2
                  </p>
                  <p className="text-xs text-amber-800 font-bold mt-2">
                    Acompanhamento socioemocional e mérito
                  </p>
                </div>
              </div>

              {/* Ações Rápidas de Início de Aula */}
              <div className="bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs space-y-3">
                <h3 className="text-sm font-bold font-['Quicksand'] text-[#211a14]">
                  Rotinas Letivas Diárias • {activeClass}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveSection('attendance')}
                    className="p-3.5 rounded-xl bg-[#fff8f5] border border-[#eee0d6] hover:bg-sky-50 hover:border-sky-200 text-[#211a14] text-xs font-bold flex items-center justify-between transition-all"
                  >
                    <span>Fazer Chamada da Sessão</span>
                    <Users className="w-4 h-4 text-[#00a6c0]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSection('grades')}
                    className="p-3.5 rounded-xl bg-[#fff8f5] border border-[#eee0d6] hover:bg-sky-50 hover:border-sky-200 text-[#211a14] text-xs font-bold flex items-center justify-between transition-all"
                  >
                    <span>Digitar Notas e Trabalhos Maker</span>
                    <Award className="w-4 h-4 text-[#00a6c0]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewIncidentModal(true)}
                    className="p-3.5 rounded-xl bg-[#fff8f5] border border-[#eee0d6] hover:bg-amber-50 hover:border-amber-200 text-[#211a14] text-xs font-bold flex items-center justify-between transition-all"
                  >
                    <span>Registar Ocorrência / Mérito</span>
                    <Heart className="w-4 h-4 text-amber-600" />
                  </button>
                </div>
              </div>

              {/* Próximas Sessões da Turma Hoje */}
              <div className="bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold font-['Quicksand'] text-[#211a14]">
                    Cronograma de Hoje na Turma ({activeClass})
                  </h4>
                  <span className="text-xs text-[#5c3f42] font-semibold">Sala Climatizada 102</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100">
                    <span className="text-[10px] font-bold text-[#00a6c0] bg-white px-2 py-0.5 rounded shadow-2xs">
                      08:30 - 10:00
                    </span>
                    <p className="font-bold text-[#211a14] mt-2">Linguagem Oral & Roda da História</p>
                    <p className="text-[#5c3f42] text-[11px] mt-0.5">Contação dramatizada, canções em roda e expressão verbal.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded shadow-2xs">
                      10:45 - 12:15
                    </span>
                    <p className="font-bold text-[#211a14] mt-2">Estimulação Sensorial & Lógica</p>
                    <p className="text-[#5c3f42] text-[11px] mt-0.5">Manipulação de peças geométricas, formas e cores com blocos de madeira.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-pink-50/70 border border-pink-100">
                    <span className="text-[10px] font-bold text-[#ed145b] bg-white px-2 py-0.5 rounded shadow-2xs">
                      14:00 - 15:30
                    </span>
                    <p className="font-bold text-[#211a14] mt-2">Horta Pedagógica & Psicomotricidade</p>
                    <p className="text-[#5c3f42] text-[11px] mt-0.5">Contacto com a terra, rega das plantas e circuito motor com obstáculos suaves.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. PILAR 1: REGISTO DE CHAMADAS E FREQUÊNCIA DIÁRIA                       */}
          {/* ========================================================================= */}
          {activeSection === 'attendance' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold font-['Quicksand'] text-[#211a14]">
                    Registo de Chamadas & Frequência Diária • {activeClass}
                  </h3>
                  <p className="text-xs text-[#5c3f42]">
                    Sessão da Manhã • 23 Presentes, 1 Ausência Justificada, 1 Atraso Registado
                  </p>
                </div>

                {/* Botões de Ação em Lote */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleMarkAllPresent}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Marcar Todos como Presente</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAttendanceList((prev) =>
                        prev.map((s) => (s.status === 'Ausente' ? { ...s, justification: 'Falta justificada em lote pela direção pedagógica' } : s))
                      );
                      showToast('Todas as ausências foram justificadas em lote.');
                    }}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#faebe1] hover:bg-[#f4e6db] text-[#5c3f42] font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Justificar Falta em Lote</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSyncAttendanceSecretary}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#00a6c0] hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar à Secretaria</span>
                  </button>
                </div>
              </div>

              {/* Tabela Nominal de Alunos com Seletores de Estado */}
              <div className="bg-white rounded-2xl border border-[#eee0d6] overflow-hidden shadow-xs">
                <div className="p-3 bg-[#fff8f5] border-b border-[#eee0d6] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#5c3f42]">
                    Lista Nominal de Alunos ({attendanceList.length} Inscritos)
                  </span>
                  <div className="w-64">
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filtrar por nome de aluno..."
                      className="w-full text-xs px-3 py-1.5 rounded-xl border border-[#eee0d6] bg-white focus:outline-none focus:border-[#00a6c0]"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#fff8f5] border-b border-[#eee0d6] text-[#5c3f42] font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3.5 w-12 text-center">Nº</th>
                        <th className="p-3.5">Nome do Educando</th>
                        <th className="p-3.5 text-center">Estado da Assiduidade</th>
                        <th className="p-3.5">Observações / Justificação Oficial</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eee0d6]">
                      {filteredAttendance.map((student) => (
                        <tr key={student.id} className="hover:bg-[#fff1e7]/70 transition-colors">
                          <td className="p-3.5 text-center font-bold text-[#8c6b6d]">
                            {student.number}
                          </td>
                          <td className="p-3.5 font-bold text-[#211a14]">
                            {student.name}
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center justify-center gap-1.5">
                              {(['Presente', 'Ausente', 'Atrasado'] as AttendanceStatus[]).map((st) => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => {
                                    setAttendanceList((prev) =>
                                      prev.map((s) => (s.id === student.id ? { ...s, status: st } : s))
                                    );
                                  }}
                                  className={`px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                                    student.status === st
                                      ? st === 'Presente'
                                      : 'bg-[#faebe1] text-[#5c3f42] hover:bg-[#f4e6db]'
                                  } ${
                                    student.status === 'Presente' && st === 'Presente'
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : ''
                                  } ${
                                    student.status === 'Ausente' && st === 'Ausente'
                                      ? 'bg-rose-600 text-white shadow-xs'
                                      : ''
                                  } ${
                                    student.status === 'Atrasado' && st === 'Atrasado'
                                      ? 'bg-amber-500 text-white shadow-xs'
                                      : ''
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="p-3.5 text-[#5c3f42]">
                            {student.justification ? (
                              <span className="p-1.5 bg-[#fff8f5] border border-[#eee0d6] rounded-lg text-[11px] block text-[#5c3f42]">
                                📋 {student.justification}
                              </span>
                            ) : (
                              <span className="text-[11px] text-[#8c6b6d] italic">
                                Sem anotações pendentes
                              </span>
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
          {/* 3. PILAR 2: LANÇAMENTO E DIGITAÇÃO DE NOTAS & AVALIAÇÕES                  */}
          {/* ========================================================================= */}
          {activeSection === 'grades' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold font-['Quicksand'] text-[#211a14]">
                    Pauta Ponderada Oficial de Educação Infantil • {activeClass}
                  </h3>
                  <p className="text-xs text-[#5c3f42]">
                    Cálculo Automático: Observação Contínua (25%) + Projetos Sensoriais / Horta (25%) + Psicomotricidade & Cognitivo (35%) + Autonomia (15%)
                  </p>
                </div>

                {/* Seletor de Disciplinas */}
                <div className="flex items-center gap-1.5 overflow-x-auto bg-white p-1 rounded-xl border border-[#eee0d6]">
                  {(
                    [
                      'Linguagem e Expressão Oral',
                      'Estimulação Sensorial e Lógica',
                      'Psicomotricidade & Esquema Corporal',
                      'Expressão Plástica & Criatividade'
                    ] as const
                  ).map((disc) => (
                    <button
                      key={disc}
                      type="button"
                      onClick={() => setSelectedSubject(disc)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        selectedSubject === disc
                          ? 'bg-[#00a6c0] text-white shadow-xs'
                          : 'text-[#5c3f42] hover:text-[#211a14]'
                      }`}
                    >
                      {disc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabela de Pauta Ponderada */}
              <div className="bg-white rounded-2xl border border-[#eee0d6] overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#fff8f5] border-b border-[#eee0d6] text-[#5c3f42] font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3 w-10 text-center">Nº</th>
                        <th className="p-3">Nome do Aluno</th>
                        <th className="p-3 text-center">Ficha Formativa (25%)</th>
                        <th className="p-3 text-center">Trabalho Maker/Horta (25%)</th>
                        <th className="p-3 text-center">Exame Sumativo (35%)</th>
                        <th className="p-3 text-center">Participação (15%)</th>
                        <th className="p-3 text-center">Média Ponderada</th>
                        <th className="p-3 text-center">Parecer Qualitativo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eee0d6]">
                      {gradesList.map((grade) => {
                        const finalScore = calculateFinalAverage(grade);
                        const assessment = getQualitativeAssessment(finalScore);

                        return (
                          <tr key={grade.id} className="hover:bg-[#fff1e7]/70 transition-colors">
                            <td className="p-3 text-center font-bold text-[#8c6b6d]">
                              {grade.number}
                            </td>
                            <td className="p-3 font-bold text-[#211a14]">
                              {grade.name}
                            </td>
                            <td className="p-3 text-center">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={grade.formative}
                                onChange={(e) =>
                                  handleUpdateGrade(grade.id, 'formative', Number(e.target.value))
                                }
                                className="w-16 p-1.5 text-center font-bold bg-[#fff8f5] border border-[#eee0d6] rounded-lg focus:outline-none focus:border-[#00a6c0]"
                              />
                            </td>
                            <td className="p-3 text-center">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={grade.makerProject}
                                onChange={(e) =>
                                  handleUpdateGrade(grade.id, 'makerProject', Number(e.target.value))
                                }
                                className="w-16 p-1.5 text-center font-bold bg-[#fff8f5] border border-[#eee0d6] rounded-lg focus:outline-none focus:border-[#00a6c0]"
                              />
                            </td>
                            <td className="p-3 text-center">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={grade.summativeExam}
                                onChange={(e) =>
                                  handleUpdateGrade(grade.id, 'summativeExam', Number(e.target.value))
                                }
                                className="w-16 p-1.5 text-center font-bold bg-[#fff8f5] border border-[#eee0d6] rounded-lg focus:outline-none focus:border-[#00a6c0]"
                              />
                            </td>
                            <td className="p-3 text-center">
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={grade.participation}
                                onChange={(e) =>
                                  handleUpdateGrade(grade.id, 'participation', Number(e.target.value))
                                }
                                className="w-16 p-1.5 text-center font-bold bg-[#fff8f5] border border-[#eee0d6] rounded-lg focus:outline-none focus:border-[#00a6c0]"
                              />
                            </td>
                            <td className="p-3 text-center font-extrabold text-sm text-[#211a14]">
                              {finalScore}%
                            </td>
                            <td className="p-3 text-center">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${assessment.color}`}
                              >
                                {assessment.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. PILAR 3: CRONOGRAMA CURRICULAR E PLANOS DE AULA                        */}
          {/* ========================================================================= */}
          {activeSection === 'lessons' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold font-['Quicksand'] text-[#211a14]">
                    Cronograma Curricular e Planos de Aula • {activeClass}
                  </h3>
                  <p className="text-xs text-[#5c3f42]">
                    Gestão das próximas sessões letivas da semana com materiais interativos anexados
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setNewLessonModal(true)}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#00a6c0] hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Plano de Aula</span>
                </button>
              </div>

              {/* Cards organizados por data e disciplina */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {lessonsList.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs flex flex-col justify-between space-y-4 hover:border-sky-300 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-100 text-[#00a6c0]">
                          {lesson.subject}
                        </span>
                        <span className="text-xs text-[#8c6b6d] font-semibold">{lesson.time}</span>
                      </div>

                      <h4 className="font-bold text-sm text-[#211a14] leading-snug">
                        {lesson.title}
                      </h4>

                      <p className="text-xs text-[#5c3f42] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#8c6b6d]" />
                        <span>{lesson.date}</span> • <span>{lesson.room}</span>
                      </p>

                      <div className="p-3 bg-[#fff8f5] rounded-xl border border-[#eee0d6] text-xs text-[#5c3f42] leading-relaxed">
                        <span className="font-bold block text-[#5c3f42] mb-0.5">Sumário & Metodologia:</span>
                        {lesson.summary}
                      </div>
                    </div>

                    {/* Anexos */}
                    <div className="space-y-2 pt-2 border-t border-[#eee0d6]">
                      <p className="text-[11px] font-bold text-[#5c3f42] flex items-center gap-1">
                        <Paperclip className="w-3.5 h-3.5 text-[#8c6b6d]" />
                        <span>Materiais & Fichas Anexadas ({lesson.attachments.length}):</span>
                      </p>

                      <div className="space-y-1">
                        {lesson.attachments.map((att, idx) => (
                          <div
                            key={idx}
                            onClick={() => setPreviewAttachment(att)}
                            className="p-2 rounded-lg bg-sky-50/60 hover:bg-sky-100 border border-sky-100 flex items-center justify-between text-xs cursor-pointer transition-colors"
                          >
                            <span className="font-semibold text-[#00a6c0] truncate max-w-[200px]">
                              {att.name}
                            </span>
                            <span className="text-[10px] text-[#5c3f42] font-mono">{att.size}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => showToast(`Sumário de "${lesson.title}" aberto para edição.`)}
                          className="px-2.5 py-1 bg-[#faebe1] hover:bg-[#f4e6db] text-[#5c3f42] rounded-lg text-xs font-bold transition-colors"
                        >
                          Editar Sumário
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. PILAR 4: OCORRÊNCIAS PEDAGÓGICAS E APOIO SOCIOEMOCIONAL                */}
          {/* ========================================================================= */}
          {activeSection === 'incidents' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold font-['Quicksand'] text-[#211a14]">
                    Registo de Ocorrências Pedagógicas & Apoio Socioemocional
                  </h3>
                  <p className="text-xs text-[#5c3f42]">
                    Gestão confidencial em conformidade com o RGPD e proteção do menor • Méritos e Articulação SPO
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setNewIncidentModal(true)}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#00a6c0] hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Registar Nova Ocorrência</span>
                </button>
              </div>

              {/* Feed de Ocorrências */}
              <div className="space-y-3">
                {incidentsList.map((inc) => (
                  <div
                    key={inc.id}
                    className="bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs space-y-3 hover:border-sky-300 transition-all"
                  >
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
                      <span className="text-xs text-[#8c6b6d] font-semibold">{inc.date}</span>
                    </div>

                    <div className="p-3 bg-[#fff8f5] rounded-xl border border-[#eee0d6] text-xs text-[#5c3f42] leading-relaxed">
                      <p>
                        <strong className="text-[#211a14]">Educando:</strong> {inc.studentName}
                      </p>
                      <p className="mt-1">{inc.description}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#eee0d6] text-xs">
                      <div className="flex items-center gap-2">
                        {inc.spoReferral && (
                          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 font-bold text-[10px] flex items-center gap-1 border border-purple-200">
                            <Activity className="w-3 h-3 text-purple-600" />
                            <span>Encaminhado ao SPO (Dra. Sofia Ramos)</span>
                          </span>
                        )}
                        {inc.notifiedFamily && (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[10px] flex items-center gap-1 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Família Notificada na App</span>
                          </span>
                        )}
                      </div>

                      <span className="text-[#8c6b6d] text-[11px] italic">
                        {inc.teacherNote}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: REGISTO DE NOVA OCORRÊNCIA PEDAGÓGICA                            */}
      {/* ========================================================================= */}
      {newIncidentModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="incident-modal-title"
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <h3 id="incident-modal-title" className="font-bold text-sm text-[#211a14] font-['Quicksand']">
                Registar Ocorrência / Mérito Positivo
              </h3>
              <button
                type="button"
                onClick={() => setNewIncidentModal(false)}
                className="p-1 rounded-lg text-[#8c6b6d] hover:text-[#5c3f42]"
                aria-label="Fechar modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#5c3f42] block mb-1">Educando</label>
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
                  <label className="font-bold text-[#5c3f42] block mb-1">Tipo de Registo</label>
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
                <label className="font-bold text-[#5c3f42] block mb-1">Título do Registo</label>
                <input
                  type="text"
                  required
                  value={newIncTitle}
                  onChange={(e) => setNewIncTitle(e.target.value)}
                  placeholder="Ex: Cooperação exemplar ou Queixa de fadiga com choro"
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6] focus:outline-none focus:border-[#00a6c0]"
                />
              </div>

              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Descrição Detalhada do Episódio</label>
                <textarea
                  rows={3}
                  required
                  value={newIncDesc}
                  onChange={(e) => setNewIncDesc(e.target.value)}
                  placeholder="Descreva o contexto, a atitude da criança e as medidas imediatas aplicadas na sala..."
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6] focus:outline-none focus:border-[#00a6c0]"
                />
              </div>

              <div className="space-y-2 pt-1 border-t border-[#eee0d6]">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#5c3f42]">
                  <input
                    type="checkbox"
                    checked={newIncSpo}
                    onChange={(e) => setNewIncSpo(e.target.checked)}
                    className="rounded text-[#00a6c0]"
                  />
                  <span>Encaminhar cópia ao Gabinete de Psicologia (Dra. Sofia Ramos - SPO)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#5c3f42]">
                  <input
                    type="checkbox"
                    checked={newIncNotify}
                    onChange={(e) => setNewIncNotify(e.target.checked)}
                    className="rounded text-[#00a6c0]"
                  />
                  <span>Notificar encarregados de educação via aplicação escolar</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setNewIncidentModal(false)}
                  className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00a6c0] text-white rounded-xl font-bold hover:bg-sky-700 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submeter Registo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PRÉ-VISUALIZAÇÃO DE ANEXO DE AULA                                */}
      {/* ========================================================================= */}
      {previewAttachment && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="att-modal-title"
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <h3 id="att-modal-title" className="font-bold text-sm text-[#211a14] font-['Quicksand'] flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-[#00a6c0]" />
                <span>Anexo Pedagógico da Aula</span>
              </h3>
              <button
                type="button"
                onClick={() => setPreviewAttachment(null)}
                className="p-1 rounded-lg text-[#8c6b6d] hover:text-[#5c3f42]"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#fff8f5] p-4 rounded-2xl border border-[#eee0d6] text-xs space-y-2">
              <p className="font-bold text-[#211a14] text-sm">{previewAttachment.name}</p>
              <p className="text-[#5c3f42]">Tipo de Documento: {previewAttachment.type}</p>
              <p className="text-emerald-700 font-semibold">Validado para Projeção no Painel Interativo</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPreviewAttachment(null)}
                className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold text-xs"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast(`Ficheiro "${previewAttachment.name}" descarregado com sucesso.`);
                  setPreviewAttachment(null);
                }}
                className="px-4 py-2 bg-[#00a6c0] text-white rounded-xl font-bold text-xs hover:bg-sky-700 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descarregar Ficheiro</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EXPORTAÇÃO FORMAL DE DOCUMENTOS EM PDF                           */}
      {/* ========================================================================= */}
      {pdfExportModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdf-modal-title"
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <h3 id="pdf-modal-title" className="font-bold text-sm text-[#211a14] font-['Quicksand'] flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#00a6c0]" />
                <span>Exportar Pauta e Folha de Presença (PDF)</span>
              </h3>
              <button
                type="button"
                onClick={() => setPdfExportModal(false)}
                className="p-1 rounded-lg text-[#8c6b6d] hover:text-[#5c3f42]"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#5c3f42] leading-relaxed">
              O documento oficial será gerado com cabeçalho institucional do <strong>{activeClass}</strong>, discriminação ponderada das 4 rubricas de avaliação e folha de assiduidade do {currentTerm}.
            </p>

            <div className="p-3 bg-[#fff8f5] border border-[#eee0d6] rounded-xl text-xs space-y-1">
              <p className="font-bold text-[#211a14]">Pauta_Oficial_{activeClass.replace(/\s+/g, '_')}_2ºTrimestre.pdf</p>
              <p className="text-[#5c3f42] text-[11px]">Assinado digitalmente por: Prof. António Silva</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPdfExportModal(false)}
                className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Documento oficial em PDF gerado e pronto para impressão.');
                  setPdfExportModal(false);
                }}
                className="px-4 py-2 bg-[#00a6c0] text-white rounded-xl font-bold text-xs hover:bg-sky-700 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar PDF Certificado</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: NOVO PLANO DE AULA                                               */}
      {/* ========================================================================= */}
      {newLessonModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="lesson-modal-title"
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#eee0d6] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <h3 id="lesson-modal-title" className="font-bold text-sm text-[#211a14] font-['Quicksand']">
                Criar Novo Plano de Aula
              </h3>
              <button
                type="button"
                onClick={() => setNewLessonModal(false)}
                className="p-1 rounded-lg text-[#8c6b6d] hover:text-[#5c3f42]"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast('Novo plano de aula adicionado ao cronograma da turma.');
                setNewLessonModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Disciplina</label>
                <select className="w-full p-2.5 rounded-xl border border-[#eee0d6] bg-white">
                  <option>Matemática e Cálculo</option>
                  <option>Português e Literacia</option>
                  <option>Estudo do Meio / Ciências</option>
                  <option>Expressão Plástica</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Título da Sessão</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Introdução à Multiplicação e Jogos de Mesa"
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6] focus:outline-none focus:border-[#00a6c0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#5c3f42] block mb-1">Data</label>
                  <input
                    type="text"
                    defaultValue="Segunda-feira, 14 de Outubro"
                    className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#5c3f42] block mb-1">Horário</label>
                  <input
                    type="text"
                    defaultValue="09:00 - 10:30"
                    className="w-full p-2.5 rounded-xl border border-[#eee0d6]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Sumário & Metodologia</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Objetivos pedagógicos, dinâmicas e materiais necessários..."
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6] focus:outline-none focus:border-[#00a6c0]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewLessonModal(false)}
                  className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00a6c0] text-white rounded-xl font-bold hover:bg-sky-700"
                >
                  Registar Plano
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
