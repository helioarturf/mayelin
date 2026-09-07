import { useState, FormEvent } from 'react';
import {
  X,
  Smartphone,
  Calendar,
  Utensils,
  Moon,
  Camera,
  ShieldCheck,
  HeartPulse,
  MessageCircle,
  Plus,
  QrCode,
  Send,
  UserCheck,
  Sparkles,
  AlertCircle,
  Smile,
  CheckCircle2
} from 'lucide-react';
import { Student, PickupAuthorization, DailyLogItem } from '../types';

interface ParentPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  activeStudentId: string;
  onSelectStudent: (id: string) => void;
  authorizations: PickupAuthorization[];
  onAddAuthorization: (auth: Omit<PickupAuthorization, 'id' | 'createdAt'>) => void;
}

type TabType = 'diario' | 'fotos' | 'retirada' | 'saude' | 'chat';

export default function ParentPortalModal({
  isOpen,
  onClose,
  students,
  activeStudentId,
  onSelectStudent,
  authorizations,
  onAddAuthorization
}: ParentPortalModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('diario');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [lightboxPhoto, setLightboxPhoto] = useState<{ url: string; caption: string } | null>(null);

  // Authorization Form state
  const [authName, setAuthName] = useState('');
  const [authRelation, setAuthRelation] = useState('');
  const [authDoc, setAuthDoc] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authTime, setAuthTime] = useState('Até às 18:30');
  const [authSuccessMsg, setAuthSuccessMsg] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState<
    { id: string; sender: 'parent' | 'teacher'; text: string; time: string }[]
  >([
    {
      id: '1',
      sender: 'teacher',
      text: 'Olá família! O Lucas está super participativo hoje na nossa oficina de artes e comeu todo o pratinho de almoço. Qualquer dúvida estamos por aqui!',
      time: '12:15'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  if (!isOpen) return null;

  const currentStudent = students.find((s) => s.id === activeStudentId) || students[0];

  const filteredLogs = currentStudent.dailyLogs.filter((log) => {
    if (filterCategory === 'all') return true;
    return log.category === filterCategory;
  });

  const handleCreateAuthorization = (e: FormEvent) => {
    e.preventDefault();
    if (!authName.trim()) return;

    onAddAuthorization({
      personName: authName,
      relationship: authRelation || 'Familiar Autorizado',
      documentId: authDoc || 'Documento a apresentar',
      phone: authPhone || '(11) 90000-0000',
      date: 'Hoje',
      timeLimit: authTime,
      status: 'Aprovado'
    });

    setAuthName('');
    setAuthRelation('');
    setAuthDoc('');
    setAuthPhone('');
    setAuthSuccessMsg(true);
    setTimeout(() => setAuthSuccessMsg(false), 4000);
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = {
      id: String(Date.now()),
      sender: 'parent' as const,
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputMessage('');

    // Teacher auto-reply simulation
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'teacher',
          text: 'Recebido com carinho! Já anotamos na prancheta da sala e avisamos a coordenação.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1200);
  };

  return (
    <div
      id="parent-portal-modal-overlay"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="parent-portal-modal-container"
        className="bg-[#fff8f5] w-full max-w-4xl rounded-3xl border-2 border-[#eee0d6] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* Top Header */}
        <div className="bg-white border-b border-[#eee0d6] px-4 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#ed145b] to-[#fd9924] flex items-center justify-center text-white shadow-sm shrink-0">
              <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-['Quicksand'] text-[#211a14] font-bold">
                  Mayelin Kids • Portal da Família
                </h3>
                <span className="text-[10px] sm:text-[11px] font-['Nunito_Sans'] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Tempo Real
                </span>
              </div>
              <p className="text-[11px] sm:text-xs font-['Nunito_Sans'] text-[#5c3f42]">
                Diário digital, registros pedagógicos e segurança
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4 w-full sm:w-auto">
            {/* Student Switcher */}
            <div className="flex items-center gap-1 bg-[#faebe1] p-1 rounded-2xl overflow-x-auto">
              {students.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSelectStudent(s.id)}
                  className={`min-h-[36px] px-2.5 sm:px-3 py-1 rounded-xl text-xs font-['Nunito_Sans'] font-bold transition-all whitespace-nowrap ${
                    s.id === currentStudent.id
                      ? 'bg-white text-[#ed145b] shadow-sm'
                      : 'text-[#5c3f42] hover:text-[#ed145b]'
                  }`}
                >
                  {s.name.split(' ')[0]} ({s.classroom.split(' ')[0]})
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="min-w-[40px] min-h-[40px] rounded-full bg-[#faebe1] text-[#5c3f42] hover:bg-[#ed145b] hover:text-white flex items-center justify-center transition-colors shrink-0"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Student Mini Profile Strip */}
        <div className="bg-[#faebe1]/70 px-4 sm:px-5 py-2.5 sm:py-3 border-b border-[#eee0d6] flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#ed145b] text-white flex items-center justify-center font-bold text-sm sm:text-base shadow-sm shrink-0">
              {currentStudent.avatarLetter}
            </div>
            <div>
              <p className="text-xs sm:text-sm font-['Quicksand'] font-bold text-[#211a14]">
                {currentStudent.name} <span className="text-[11px] sm:text-xs text-[#5c3f42] font-normal">({currentStudent.age})</span>
              </p>
              <p className="text-[11px] sm:text-xs text-[#5c3f42]">
                Turma: <span className="font-semibold text-[#ed145b]">{currentStudent.classroom}</span> • Educadoras: {currentStudent.teacherName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] sm:text-xs font-['Nunito_Sans'] font-bold px-2.5 sm:px-3 py-1 rounded-full bg-emerald-500 text-white shadow-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{currentStudent.status}</span>
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white px-3 sm:px-5 pt-1 sm:pt-2 border-b border-[#eee0d6] flex space-x-2 sm:space-x-4 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('diario')}
            className={`min-h-[44px] pb-2 sm:pb-3 text-xs sm:text-sm font-['Nunito_Sans'] font-bold flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
              activeTab === 'diario'
                ? 'border-[#ed145b] text-[#ed145b]'
                : 'border-transparent text-[#5c3f42] hover:text-[#ed145b]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Diário</span>
            <span className="text-[10px] bg-pink-100 text-[#ed145b] px-1.5 py-0.2 rounded-full">
              {currentStudent.dailyLogs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fotos')}
            className={`min-h-[44px] pb-2 sm:pb-3 text-xs sm:text-sm font-['Nunito_Sans'] font-bold flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
              activeTab === 'fotos'
                ? 'border-[#ed145b] text-[#ed145b]'
                : 'border-transparent text-[#5c3f42] hover:text-[#ed145b]'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Fotos</span>
            <span className="text-[10px] bg-sky-100 text-[#00a6c0] px-1.5 py-0.2 rounded-full">
              {currentStudent.photos.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('retirada')}
            className={`min-h-[44px] pb-2 sm:pb-3 text-xs sm:text-sm font-['Nunito_Sans'] font-bold flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
              activeTab === 'retirada'
                ? 'border-[#ed145b] text-[#ed145b]'
                : 'border-transparent text-[#5c3f42] hover:text-[#ed145b]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Retirada</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('saude')}
            className={`min-h-[44px] pb-2 sm:pb-3 text-xs sm:text-sm font-['Nunito_Sans'] font-bold flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
              activeTab === 'saude'
                ? 'border-[#ed145b] text-[#ed145b]'
                : 'border-transparent text-[#5c3f42] hover:text-[#ed145b]'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>Saúde</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`min-h-[44px] pb-2 sm:pb-3 text-xs sm:text-sm font-['Nunito_Sans'] font-bold flex items-center gap-1.5 border-b-2 transition-all shrink-0 ${
              activeTab === 'chat'
                ? 'border-[#ed145b] text-[#ed145b]'
                : 'border-transparent text-[#5c3f42] hover:text-[#ed145b]'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat Educadoras</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-3.5 sm:p-5 overflow-y-auto flex-1 space-y-4 sm:space-y-6">
          {/* TAB 1: DIÁRIO DE BORDO */}
          {activeTab === 'diario' && (
            <div className="space-y-4">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 pb-2">
                <span className="text-xs font-['Nunito_Sans'] text-[#5c3f42] font-semibold">Filtrar por:</span>
                <button
                  type="button"
                  onClick={() => setFilterCategory('all')}
                  className={`px-3 py-1 rounded-full text-xs font-['Nunito_Sans'] font-bold transition-colors ${
                    filterCategory === 'all'
                      ? 'bg-[#ed145b] text-white'
                      : 'bg-white border border-[#eee0d6] text-[#5c3f42]'
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategory('meal')}
                  className={`px-3 py-1 rounded-full text-xs font-['Nunito_Sans'] font-bold transition-colors ${
                    filterCategory === 'meal'
                      ? 'bg-[#fd9924] text-white'
                      : 'bg-white border border-[#eee0d6] text-[#5c3f42]'
                  }`}
                >
                  Refeições
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategory('nap')}
                  className={`px-3 py-1 rounded-full text-xs font-['Nunito_Sans'] font-bold transition-colors ${
                    filterCategory === 'nap'
                      ? 'bg-[#00a6c0] text-white'
                      : 'bg-white border border-[#eee0d6] text-[#5c3f42]'
                  }`}
                >
                  Soninho
                </button>
                <button
                  type="button"
                  onClick={() => setFilterCategory('activity')}
                  className={`px-3 py-1 rounded-full text-xs font-['Nunito_Sans'] font-bold transition-colors ${
                    filterCategory === 'activity'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-[#eee0d6] text-[#5c3f42]'
                  }`}
                >
                  Atividades
                </button>
              </div>

              {/* Timeline Items */}
              <div className="space-y-3">
                {filteredLogs.map((log) => {
                  const Icon =
                    log.category === 'meal'
                      ? Utensils
                      : log.category === 'nap'
                      ? Moon
                      : log.category === 'activity'
                      ? Sparkles
                      : Smile;

                  return (
                    <div
                      key={log.id}
                      className="bg-white rounded-2xl p-4 playful-border shadow-sm flex items-start gap-3 sm:gap-4 hover:border-[#ed145b] transition-all"
                    >
                      <div className={`w-10 h-10 rounded-2xl ${log.bgClass} ${log.colorClass} flex items-center justify-center shrink-0 shadow-sm`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-['Quicksand'] font-bold text-[#211a14]">
                            {log.title}
                          </h4>
                          <span className="text-xs font-['Nunito_Sans'] font-bold text-[#5c3f42] bg-[#faebe1] px-2.5 py-0.5 rounded-full">
                            {log.time}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm font-['Nunito_Sans'] text-[#5c3f42] leading-relaxed">
                          {log.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: FOTOS DO DIA */}
          {activeTab === 'fotos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs sm:text-sm text-[#5c3f42]">
                  Registros fotográficos exclusivos dos momentos de descobertas e oficinas de hoje:
                </p>
                <span className="text-xs font-bold text-[#ed145b] bg-pink-100 px-3 py-1 rounded-full">
                  Privacidade Total
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentStudent.photos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => setLightboxPhoto({ url: photo.url, caption: photo.caption })}
                    className="bg-white rounded-2xl overflow-hidden playful-border shadow-sm cursor-pointer group hover:-translate-y-1 transition-all"
                  >
                    <div className="h-52 overflow-hidden bg-[#faebe1] relative">
                      <img
                        src={photo.url}
                        alt={photo.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        {photo.time}
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-['Nunito_Sans'] text-[#211a14] font-medium leading-relaxed">
                        {photo.caption}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: AUTORIZAR RETIRADA DE TERCEIRO */}
          {activeTab === 'retirada' && (
            <div className="space-y-6">
              {authSuccessMsg && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center gap-3 text-emerald-800 text-xs sm:text-sm font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Autorização cadastrada com sucesso e transmitida à portaria!</span>
                </div>
              )}

              {/* Existing Authorizations */}
              <div>
                <h4 className="text-sm font-['Quicksand'] font-bold text-[#211a14] mb-3 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#ed145b]" />
                  <span>Pessoas Autorizadas para Retirada Hoje</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {authorizations.map((auth) => (
                    <div
                      key={auth.id}
                      className="p-4 rounded-2xl bg-white playful-border shadow-sm flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-['Nunito_Sans'] font-bold text-[#211a14]">
                            {auth.personName}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {auth.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#5c3f42]">
                          Parentesco: <span className="font-semibold">{auth.relationship}</span>
                        </p>
                        <p className="text-xs text-[#5c3f42]">Doc: {auth.documentId}</p>
                        <p className="text-[11px] text-[#ed145b] font-semibold">{auth.timeLimit}</p>
                      </div>

                      <div className="w-12 h-12 bg-pink-50 rounded-xl border border-pink-100 flex flex-col items-center justify-center text-[#ed145b] shrink-0">
                        <QrCode className="w-6 h-6" />
                        <span className="text-[8px] font-bold">QR PASS</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Form to Authorize Someone Else */}
              <div className="bg-white rounded-2xl p-5 playful-border shadow-sm">
                <h4 className="text-sm font-['Quicksand'] font-bold text-[#211a14] mb-2 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#fd9924]" />
                  <span>Nova Autorização de Retirada (Avós, Tios ou Responsável Excepcional)</span>
                </h4>
                <p className="text-xs text-[#5c3f42] mb-4">
                  Por medidas de segurança, a portaria só libera o aluno mediante conferência de documento oficial com foto.
                </p>

                <form onSubmit={handleCreateAuthorization} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#211a14] mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      required
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="Ex: Maria de Lourdes Silva"
                      className="w-full px-3 py-2 rounded-xl bg-[#fff8f5] border border-[#eee0d6] text-xs text-[#211a14] focus:border-[#ed145b] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#211a14] mb-1">Parentesco / Relação *</label>
                    <input
                      type="text"
                      required
                      value={authRelation}
                      onChange={(e) => setAuthRelation(e.target.value)}
                      placeholder="Ex: Avó Materna, Tia, Motorista"
                      className="w-full px-3 py-2 rounded-xl bg-[#fff8f5] border border-[#eee0d6] text-xs text-[#211a14] focus:border-[#ed145b] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#211a14] mb-1">RG ou CPF da Pessoa *</label>
                    <input
                      type="text"
                      required
                      value={authDoc}
                      onChange={(e) => setAuthDoc(e.target.value)}
                      placeholder="Ex: RG 35.123.456-7"
                      className="w-full px-3 py-2 rounded-xl bg-[#fff8f5] border border-[#eee0d6] text-xs text-[#211a14] focus:border-[#ed145b] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#211a14] mb-1">Telefone / WhatsApp</label>
                    <input
                      type="tel"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="w-full px-3 py-2 rounded-xl bg-[#fff8f5] border border-[#eee0d6] text-xs text-[#211a14] focus:border-[#ed145b] outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-full bg-[#ed145b] text-white text-xs font-bold shadow-md hover:bg-pink-600 transition-all flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Emitir Autorização de Retirada</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: FICHA DE SAÚDE */}
          {activeTab === 'saude' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-4 playful-border shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-[#ba1a1a] font-bold text-xs sm:text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Alergias & Restrições Alimentares</span>
                  </div>
                  <ul className="space-y-1 text-xs text-[#5c3f42]">
                    {currentStudent.allergies.map((allergy, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
                        <span>{allergy}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-4 playful-border shadow-sm space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs sm:text-sm">
                    <HeartPulse className="w-4 h-4" />
                    <span>Medicamentos Prescritos</span>
                  </div>
                  <ul className="space-y-1 text-xs text-[#5c3f42]">
                    {currentStudent.medications.map((med, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        <span>{med}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-[#8c4f00] flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#fd9924] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Protocolo de Enfermagem Escolar</p>
                  <p className="mt-0.5">
                    Qualquer administração de medicamento deve ser acompanhada de receita médica válida assinada pelo pediatra e orientações por escrito no frasco.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MENSAGENS COM A PROFESSORA */}
          {activeTab === 'chat' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-4 playful-border shadow-sm h-64 overflow-y-auto flex flex-col space-y-3">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] ${
                      msg.sender === 'parent'
                        ? 'self-end items-end'
                        : 'self-start items-start'
                    }`}
                  >
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'parent'
                          ? 'bg-[#ed145b] text-white rounded-br-none'
                          : 'bg-[#faebe1] text-[#211a14] rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-[#5c3f42] mt-0.5 px-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Escreva uma mensagem para a coordenação ou professora..."
                  className="flex-1 px-4 py-2.5 rounded-full bg-white border border-[#eee0d6] text-xs text-[#211a14] focus:border-[#ed145b] outline-none shadow-sm"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#ed145b] text-white text-xs font-bold hover:bg-pink-600 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>Enviar</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox for Photos */}
      {lightboxPhoto && (
        <div
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl p-3"
          >
            <div className="relative">
              <img
                src={lightboxPhoto.url}
                alt={lightboxPhoto.caption}
                className="w-full max-h-[75vh] object-cover rounded-2xl"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => setLightboxPhoto(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="p-3 text-xs sm:text-sm font-['Nunito_Sans'] text-[#211a14] font-medium text-center">
              {lightboxPhoto.caption}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
