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

type TeacherSection = 'overview' | 'attendance' | 'observations' | 'lessons' | 'incidents' | 'settings';

type AttendanceStatus = 'Presente' | 'Ausente' | 'Atrasado';

interface StudentAttendance {
  id: string;
  name: string;
  number: number;
  status: AttendanceStatus;
  justification?: string;
  note?: string;
}

interface ChildObservation {
  id: string;
  studentNumber: number;
  studentName: string;
  classroom: string;
  date: string;
  category: 'Adaptação & Emoções' | 'Alimentação & Apetite' | 'Soninho & Repouso' | 'Desenvolvimento Motor' | 'Linguagem & Interação' | 'Saúde & Cuidados';
  priority: 'Rotina' | 'Importante' | 'Conquista / Marco';
  text: string;
  recordedBy: string;
  notifiedParents: boolean;
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

  // 2. Pilar de Observações & Diário de Desenvolvimento da Criança (Sem notas numéricas)
  const [observationsList, setObservationsList] = useState<ChildObservation[]>([
    {
      id: 'obs-1',
      studentNumber: 7,
      studentName: 'Lucas Oliveira Mayelin',
      classroom: 'Jardim de Infância (Estrelinhas)',
      date: 'Hoje, às 10:30',
      category: 'Alimentação & Apetite',
      priority: 'Conquista / Marco',
      text: 'O Lucas almoçou toda a sopinha de legumes e o peixinho sem necessidade de incentivo. Demonstrou autonomia exemplar ao segurar a colher e bebeu todo o sumo natural.',
      recordedBy: 'Tia Clara Marques',
      notifiedParents: true
    },
    {
      id: 'obs-2',
      studentNumber: 8,
      studentName: 'Sofia Rocha Ramos',
      classroom: 'Jardim de Infância (Estrelinhas)',
      date: 'Hoje, às 09:45',
      category: 'Desenvolvimento Motor',
      priority: 'Conquista / Marco',
      text: 'Na oficina de psicomotricidade, completou o percurso dos blocos de equilíbrio com muita confiança e ajudou os coleguinhas a guardar os brinquedos na cesta.',
      recordedBy: 'Tia Clara Marques',
      notifiedParents: true
    },
    {
      id: 'obs-3',
      studentNumber: 2,
      studentName: 'Beatriz Alcantara',
      classroom: 'Jardim de Infância (Estrelinhas)',
      date: 'Hoje, às 08:30',
      category: 'Adaptação & Emoções',
      priority: 'Rotina',
      text: 'Chegada muito alegre e comunicativa! Abraçou as Tias e foi diretamente para a roda de canções infantis.',
      recordedBy: 'Tia Clara Marques',
      notifiedParents: false
    },
    {
      id: 'obs-4',
      studentNumber: 1,
      studentName: 'Afonso Magalhães',
      classroom: 'Jardim de Infância (Estrelinhas)',
      date: 'Ontem, às 13:15',
      category: 'Soninho & Repouso',
      priority: 'Importante',
      text: 'Dormiu um sono tranquilo de 1 hora e meia na soneca da tarde ao som de música ambiente de ninar. Acordou bem disposto e sem febre.',
      recordedBy: 'Tia Clara Marques',
      notifiedParents: true
    },
    {
      id: 'obs-5',
      studentNumber: 3,
      studentName: 'Carolina Neves',
      classroom: 'Jardim de Infância (Estrelinhas)',
      date: 'Ontem, às 11:00',
      category: 'Linguagem & Interação',
      priority: 'Conquista / Marco',
      text: 'Contou uma historinha com fantoches aos coleguinhas, gesticulando e sorrindo. Excelente progresso de expressão oral.',
      recordedBy: 'Tia Clara Marques',
      notifiedParents: true
    }
  ]);

  const [newObsModal, setNewObsModal] = useState(false);
  const [obsStudentName, setObsStudentName] = useState('Lucas Oliveira Mayelin');
  const [obsCategory, setObsCategory] = useState<ChildObservation['category']>('Adaptação & Emoções');
  const [obsPriority, setObsPriority] = useState<ChildObservation['priority']>('Rotina');
  const [obsText, setObsText] = useState('');
  const [obsNotifyParents, setObsNotifyParents] = useState(true);
  const [filterStudent, setFilterStudent] = useState<string>('todos');
  const [filterCategory, setFilterCategory] = useState<string>('todas');

  const handleAddObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obsText.trim()) return;

    const targetStudent = attendanceList.find((s) => s.name === obsStudentName);
    const newObs: ChildObservation = {
      id: `obs-${Date.now()}`,
      studentNumber: targetStudent?.number || 1,
      studentName: obsStudentName,
      classroom: activeClass,
      date: 'Hoje, há momentos',
      category: obsCategory,
      priority: obsPriority,
      text: obsText.trim(),
      recordedBy: 'Tia Clara Marques',
      notifiedParents: obsNotifyParents
    };

    setObservationsList([newObs, ...observationsList]);
    setObsText('');
    setNewObsModal(false);
    showToast(
      obsNotifyParents
        ? `Observação registada por Tia Clara e notificada aos pais de ${obsStudentName}!`
        : `Observação interna registada com sucesso para ${obsStudentName}.`
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
      aria-label="Painel da Educadora (Tia)"
      className="bg-[#fff8f5] text-[#211a14] w-full flex-1 flex flex-col overflow-hidden font-['Nunito_Sans'] antialiased min-h-0"
    >
      {/* ========================================================================= */}
      {/* TOPNAVBAR - NAVEGAÇÃO SUPERIOR DA EDUCADORA (RBAC INFANTIL)                */}
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
                Espaço da Educadora Titular (Tia)
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
              Tia Clara Marques • Educadora de Infância • Sessão Autenticada • {currentDate}
            </p>
          </div>
        </div>

        {/* Action Buttons: Guardar Rascunho & Exportar Relatório PDF */}
        <div className="flex items-center justify-between md:justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={() => showToast('Rascunho de observações diárias e sumários salvo com sucesso.')}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#faebe1] text-[#5c3f42] hover:bg-[#f4e6db] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar Rascunho</span>
          </button>

          <button
            type="button"
            onClick={() => setPdfExportModal(true)}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#00a6c0] text-white hover:bg-sky-700 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Exportar Relatório PDF</span>
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
          aria-label="Fluxos de trabalho da educadora"
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
              <span>Visão Geral da Educadora</span>
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
              onClick={() => setActiveSection('observations')}
              className={`min-h-[42px] w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 transition-all text-left whitespace-nowrap cursor-pointer ${
                activeSection === 'observations'
                  ? 'bg-[#00a6c0] text-white shadow-md shadow-sky-500/20'
                  : 'text-[#5c3f42] hover:bg-[#fff1e7] hover:text-[#211a14]'
              }`}
            >
              <Heart className="w-4 h-4 shrink-0" />
              <span>Observações & Desenvolvimento</span>
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
              <p className="font-bold text-[#211a14]">Diário de Desenvolvimento</p>
              <p className="text-[#5c3f42]">
                Acompanhamento contínuo e afetuoso sem notas nem exames numéricos. Observações diárias pelas Tias.
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
          {/* 1. VISÃO GERAL DA EDUCADORA & INDICADORES RÁPIDOS DA TURMA ATIVA          */}
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

                {/* 2. Observações Registadas */}
                <div className="bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs hover:border-sky-200 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#5c3f42]">Observações da Turma</span>
                    <div className="w-8 h-8 rounded-xl bg-pink-100 text-[#ed145b] flex items-center justify-center">
                      <Heart className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-3xl font-extrabold font-['Quicksand'] text-[#211a14] mt-2">
                    {observationsList.length} registos
                  </p>
                  <p className="text-xs text-emerald-700 font-bold mt-2">
                    100% das crianças com registos afetivos atualizados
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
                    onClick={() => {
                      setActiveSection('observations');
                      setNewObsModal(true);
                    }}
                    className="p-3.5 rounded-xl bg-[#fff8f5] border border-[#eee0d6] hover:bg-sky-50 hover:border-sky-200 text-[#211a14] text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
                  >
                    <span>Escrever Observação sobre Criança</span>
                    <Heart className="w-4 h-4 text-[#ed145b]" />
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
          {/* 3. PILAR 2: OBSERVAÇÕES PEDAGÓGICAS & DESENVOLVIMENTO DA CRIANÇA           */}
          {/* ========================================================================= */}
          {activeSection === 'observations' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Header com Contexto da Creche & Botão de Nova Observação */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-[#eee0d6] shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ed145b]" />
                    <h3 className="text-base font-bold font-['Quicksand'] text-[#211a14]">
                      Observações Pedagógicas & Diário de Desenvolvimento • {activeClass}
                    </h3>
                  </div>
                  <p className="text-xs text-[#5c3f42] mt-1 max-w-2xl">
                    Na creche e no jardim de infância <strong>não existem notas nem exames numéricos</strong>. O acompanhamento é contínuo e qualitativo, baseado nas observações atentas das Tias sobre a alimentação, soninho, autonomia, linguagem e afeto de cada criança.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setNewObsModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ed145b] to-[#fd9924] hover:from-pink-600 hover:to-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all shrink-0 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Escrever Observação</span>
                </button>
              </div>

              {/* Seletor Rápido de Crianças da Turma Ativa */}
              <div className="bg-white p-4 rounded-2xl border border-[#eee0d6] shadow-xs space-y-2.5">
                <span className="text-[11px] font-bold text-[#8c6b6d] uppercase tracking-wider block">
                  Filtrar por Criança da Turma ({attendanceList.length} matriculados):
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
                    const count = observationsList.filter((o) => o.studentName === st.name).length;
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
                        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-extrabold">
                          {st.name.charAt(0)}
                        </span>
                        <span>{st.name.split(' ')[0]}</span>
                        {count > 0 && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filterStudent === st.name ? 'bg-white text-[#ed145b]' : 'bg-pink-100 text-[#ed145b]'}`}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filtro por Categoria / Âmbito de Desenvolvimento */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                {[
                  { id: 'todas', label: 'Todas as Áreas' },
                  { id: 'Adaptação & Emoções', label: 'Adaptação & Emoções' },
                  { id: 'Alimentação & Apetite', label: 'Alimentação & Apetite' },
                  { id: 'Soninho & Repouso', label: 'Soninho & Repouso' },
                  { id: 'Desenvolvimento Motor', label: 'Desenvolvimento Motor' },
                  { id: 'Linguagem & Interação', label: 'Linguagem & Interação' },
                  { id: 'Saúde & Cuidados', label: 'Saúde & Cuidados' }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFilterCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                      filterCategory === cat.id
                        ? 'bg-[#211a14] text-white shadow-2xs'
                        : 'bg-white text-[#5c3f42] hover:bg-[#fff1e7] border border-[#eee0d6]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Feed de Cartões de Observações */}
              <div className="space-y-3.5">
                {observationsList
                  .filter((obs) => filterStudent === 'todos' || obs.studentName === filterStudent)
                  .filter((obs) => filterCategory === 'todas' || obs.category === filterCategory)
                  .map((obs) => (
                    <div
                      key={obs.id}
                      className="bg-white rounded-2xl p-4 sm:p-5 border border-[#eee0d6] shadow-xs hover:border-[#00a6c0]/40 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#eee0d6]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#fd9924] to-[#ed145b] text-white flex items-center justify-center font-extrabold text-sm shadow-2xs shrink-0">
                            {obs.studentName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-sm text-[#211a14] font-['Quicksand']">
                                {obs.studentName}
                              </h4>
                              <span className="text-[10px] bg-[#faebe1] text-[#5c3f42] px-2 py-0.5 rounded-md font-bold">
                                Nº {obs.studentNumber}
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
                            <span className="text-[11px] text-[#8c6b6d]">{obs.date}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#fff8f5] text-[#00a6c0] border border-[#eee0d6]">
                            {obs.category}
                          </span>
                          {obs.notifiedParents ? (
                            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Enviado à Família</span>
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
                          <span>Registado com carinho por <strong>{obs.recordedBy}</strong></span>
                        </span>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setObsStudentName(obs.studentName);
                              setNewObsModal(true);
                            }}
                            className="text-[#00a6c0] hover:text-sky-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Nova observação para esta criança</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setObservationsList((prev) => prev.filter((o) => o.id !== obs.id));
                              showToast(`Observação de ${obs.studentName} removida.`);
                            }}
                            className="text-rose-400 hover:text-rose-600 font-semibold hover:underline cursor-pointer text-[10px]"
                            title="Remover registo"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                {observationsList
                  .filter((obs) => filterStudent === 'todos' || obs.studentName === filterStudent)
                  .filter((obs) => filterCategory === 'todas' || obs.category === filterCategory).length === 0 && (
                  <div className="p-8 text-center bg-white rounded-2xl border border-[#eee0d6] space-y-2">
                    <p className="text-sm font-bold text-[#211a14]">Nenhuma observação encontrada para este filtro.</p>
                    <p className="text-xs text-[#5c3f42]">Clique no botão abaixo para adicionar a primeira observação para esta criança.</p>
                    <button
                      type="button"
                      onClick={() => setNewObsModal(true)}
                      className="px-4 py-2 bg-[#00a6c0] text-white rounded-xl text-xs font-bold hover:bg-sky-700 transition-colors"
                    >
                      Escrever Observação
                    </button>
                  </div>
                )}
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
      {/* MODAL 3: EXPORTAÇÃO DE RELATÓRIO DE OBSERVAÇÕES E PRESENÇAS EM PDF       */}
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
                <span>Exportar Relatório de Observações e Presenças (PDF)</span>
              </h3>
              <button
                type="button"
                onClick={() => setPdfExportModal(false)}
                className="p-1 rounded-lg text-[#8c6b6d] hover:text-[#5c3f42] cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#5c3f42] leading-relaxed">
              O documento oficial será gerado com cabeçalho institucional do <strong>{activeClass}</strong>, compilação de todas as observações qualitativas das Tias, diário de desenvolvimento e folha de assiduidade do {currentTerm}.
            </p>

            <div className="p-3 bg-[#fff8f5] border border-[#eee0d6] rounded-xl text-xs space-y-1">
              <p className="font-bold text-[#211a14]">Relatorio_Observacoes_{activeClass.replace(/\s+/g, '_')}_2ºTrimestre.pdf</p>
              <p className="text-[#5c3f42] text-[11px]">Assinado digitalmente por: Tia Clara Marques (Educadora Titular)</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPdfExportModal(false)}
                className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold text-xs cursor-pointer hover:bg-[#eee0d6]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Relatório de observações e presenças em PDF gerado com sucesso.');
                  setPdfExportModal(false);
                }}
                className="px-4 py-2 bg-[#00a6c0] text-white rounded-xl font-bold text-xs hover:bg-sky-700 flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
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
                  className="px-4 py-2 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold cursor-pointer hover:bg-[#eee0d6]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00a6c0] text-white rounded-xl font-bold hover:bg-sky-700 cursor-pointer"
                >
                  Registar Plano
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: NOVA OBSERVAÇÃO IMPORTANTE DA CRIANÇA (CRECHE / EDUCADORA TIA)   */}
      {/* ========================================================================= */}
      {newObsModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="obs-modal-title"
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-[#eee0d6] animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-pink-100 text-[#ed145b] flex items-center justify-center shrink-0">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 id="obs-modal-title" className="font-bold text-sm text-[#211a14] font-['Quicksand']">
                    Nova Observação Importante sobre a Criança
                  </h3>
                  <p className="text-[11px] text-[#5c3f42]">
                    Diário qualitativo da Creche • Acompanhamento afetivo e individual pelas Tias
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNewObsModal(false)}
                className="p-1.5 rounded-xl text-[#8c6b6d] hover:text-[#5c3f42] hover:bg-[#fff1e7] cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddObservation} className="space-y-4 text-xs">
              {/* Seleção da Criança */}
              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Criança / Aluno(a)</label>
                <select
                  value={obsStudentName}
                  onChange={(e) => setObsStudentName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#eee0d6] bg-white text-[#211a14] font-semibold focus:outline-none focus:border-[#ed145b]"
                >
                  {attendanceList.map((st) => (
                    <option key={st.id} value={st.name}>
                      Nº {st.number} - {st.name} ({activeClass.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>

              {/* Categoria da Observação */}
              <div>
                <label className="font-bold text-[#5c3f42] block mb-1.5">Dimensão do Desenvolvimento / Categoria</label>
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
                      onClick={() => setObsCategory(cat.label as any)}
                      className={`p-2.5 rounded-xl text-left font-semibold border flex items-center gap-2 cursor-pointer transition-all ${
                        obsCategory === cat.label
                          ? 'bg-[#faebe1] border-[#ed145b] text-[#ed145b] shadow-2xs'
                          : 'bg-[#fff8f5] border-[#eee0d6] text-[#5c3f42] hover:bg-[#fff1e7]'
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Destaque / Prioridade */}
              <div>
                <label className="font-bold text-[#5c3f42] block mb-1">Tipo de Registo / Destaque</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Rotina', desc: 'Diário e rotina' },
                    { label: 'Conquista / Marco', desc: 'Progresso especial' },
                    { label: 'Importante', desc: 'Atenção especial' }
                  ].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setObsPriority(p.label as any)}
                      className={`p-2 rounded-xl text-center border cursor-pointer transition-all ${
                        obsPriority === p.label
                          ? 'bg-[#211a14] border-[#211a14] text-white shadow-xs'
                          : 'bg-[#fff8f5] border-[#eee0d6] text-[#5c3f42] hover:bg-[#faebe1]'
                      }`}
                    >
                      <p className="font-bold text-xs">{p.label}</p>
                      <p className="text-[10px] opacity-80">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sugestões Rápidas (Chips de inspiração) */}
              <div>
                <span className="text-[11px] font-bold text-[#8c6b6d] block mb-1">Sugestões rápidas da Tia (clique para inserir):</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Comeu toda a sopinha com prazer e boa autonomia.',
                    'Dormiu uma soneca tranquila de 1h30 com música instrumental suave.',
                    'Completou o circuito psicomotor com muita confiança e alegria.',
                    'Expressão oral muito participativa na roda de canções e histórias.',
                    'Muito afetuoso(a) com os amiguinhos e ajudou a arrumar os brinquedos.',
                    'Lembrar os pais de enviar muda de roupa extra para amanhã.'
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setObsText((prev) => (prev ? `${prev} ${chip}` : chip))}
                      className="px-2.5 py-1 rounded-lg bg-[#fff8f5] hover:bg-[#faebe1] border border-[#eee0d6] text-[11px] text-[#5c3f42] text-left cursor-pointer transition-colors"
                    >
                      + {chip.slice(0, 32)}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Texto da Observação */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-[#5c3f42] block">Texto da Observação da Tia</label>
                  <span className="text-[10px] text-[#8c6b6d]">{obsText.length} caracteres</span>
                </div>
                <textarea
                  rows={4}
                  required
                  value={obsText}
                  onChange={(e) => setObsText(e.target.value)}
                  placeholder="Descreva aqui o comportamento, apetite, soninho, conquistas ou cuidados da criança de forma afetuosa e detalhada..."
                  className="w-full p-3 rounded-xl border border-[#eee0d6] focus:outline-none focus:border-[#ed145b] bg-[#fff8f5] text-[#211a14] placeholder:text-[#8c6b6d] text-xs leading-relaxed"
                />
              </div>

              {/* Autoria da Educadora & Notificação */}
              <div className="p-3.5 bg-pink-50/70 border border-pink-200/80 rounded-2xl space-y-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#5c3f42] font-semibold">Educadora Responsável:</span>
                  <span className="font-bold text-[#ed145b]">Tia Clara Marques (Educadora Titular)</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#211a14] pt-1.5 border-t border-pink-100">
                  <input
                    type="checkbox"
                    checked={obsNotifyParents}
                    onChange={(e) => setObsNotifyParents(e.target.checked)}
                    className="accent-[#ed145b] w-4 h-4 rounded cursor-pointer"
                  />
                  <span>Notificar encarregados de educação via App e Diário Digital em tempo real</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setNewObsModal(false)}
                  className="px-4 py-2.5 bg-[#faebe1] text-[#5c3f42] rounded-xl font-bold cursor-pointer hover:bg-[#eee0d6]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-gradient-to-r from-[#ed145b] to-[#fd9924] hover:from-pink-600 hover:to-amber-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Guardar Observação da Tia</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
