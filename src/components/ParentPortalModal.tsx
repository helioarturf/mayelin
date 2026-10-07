import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Building2,
  GraduationCap,
  Users,
  LogOut,
  School,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import {
  Student,
  PickupAuthorization,
  DailyLogItem,
  UserRole,
  SchoolAnnouncement,
  VisitAppointment
} from '../types';
import { PROFILE_OPTIONS, SCHOOL_IMAGES } from '../data/mockData';
import AdminSchoolDashboard from './AdminSchoolDashboard';
import TeacherSchoolDashboard from './TeacherSchoolDashboard';
import GuardianSchoolDashboard from './GuardianSchoolDashboard';
import PortalLoginView, { AuthUser } from './PortalLoginView';

interface ParentPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  students?: Student[];
  activeStudentId?: string;
  onSelectStudent?: (id: string) => void;
  authorizations?: PickupAuthorization[];
  onAddAuthorization?: (auth: Omit<PickupAuthorization, 'id' | 'createdAt'>) => void;
  onUpdateAuthorizationStatus?: (id: string, status: 'Aprovado' | 'Pendente') => void;
  appointments?: VisitAppointment[];
  onUpdateAppointmentStatus?: (id: string, status: string) => void;
  announcements?: SchoolAnnouncement[];
  onAddAnnouncement?: (announcement: Omit<SchoolAnnouncement, 'id'>) => void;
  onAddDailyLog?: (studentId: string, log: Omit<DailyLogItem, 'id'>) => void;
  onUpdateStudentStatus?: (studentId: string, status: Student['status']) => void;
  currentRole?: UserRole;
  onChangeRole?: (role: UserRole) => void;
}

export default function ParentPortalModal({
  isOpen,
  onClose,
  currentRole = 'pais',
  onChangeRole
}: ParentPortalModalProps) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('mayelin_auth_logged_in') === 'true';
  });

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('mayelin_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Active Profile State synchronized with currentRole prop or authenticated user
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    if (currentUser?.role) return currentUser.role;
    return currentRole;
  });

  useEffect(() => {
    if (currentRole && !currentUser) {
      setActiveRole(currentRole);
    }
  }, [currentRole, currentUser]);

  const handleLoginSuccess = (user: AuthUser) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    setActiveRole(user.role);
    localStorage.setItem('mayelin_auth_logged_in', 'true');
    localStorage.setItem('mayelin_auth_user', JSON.stringify(user));
    if (onChangeRole) onChangeRole(user.role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('mayelin_auth_logged_in');
    localStorage.removeItem('mayelin_auth_user');
  };

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    if (onChangeRole) onChangeRole(role);
    // Update local profile title if changed
    if (currentUser) {
      const updatedUser: AuthUser = {
        ...currentUser,
        role
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('mayelin_auth_user', JSON.stringify(updatedUser));
    }
  };

  if (!isOpen) return null;

  // 1. Se o utilizador não estiver autenticado, apresenta o Ecrã de Login em Página Inteira
  if (!isAuthenticated) {
    return (
      <PortalLoginView
        initialRole={currentRole}
        onLoginSuccess={handleLoginSuccess}
        onBackToWebsite={onClose}
      />
    );
  }

  // 2. Se autenticado, apresenta o Portal Completo com a respetiva sessão ativa
  return (
    <div
      id="school-portal-fullpage-root"
      className="min-h-screen w-full flex flex-col bg-[#fff8f5] text-[#211a14] font-['Nunito_Sans'] antialiased overflow-x-hidden selection:bg-pink-200 selection:text-[#ed145b]"
    >
      {/* Barra Superior Institucional do Portal Autenticado (Padrão do Website) */}
      <header
        role="banner"
        className="bg-white border-b border-[#eee0d6] px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 z-30 shadow-2xs"
      >
        {/* Esquerda: Identificação da Escola & Botão de Retorno ao Site */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-[#faebe1] hover:bg-[#f4e6db] text-[#5c3f42] hover:text-[#211a14] font-bold text-xs flex items-center gap-2 transition-all shrink-0 border border-[#eee0d6] shadow-2xs active:scale-95 cursor-pointer"
            title="Voltar ao Website Principal da Escola"
          >
            <ArrowLeft className="w-4 h-4 text-[#ed145b]" />
            <span>Voltar ao Website</span>
          </button>

          <div className="h-6 w-px bg-[#eee0d6] hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-xs shrink-0 relative bg-pink-100">
              <img
                src={SCHOOL_IMAGES.mayelinRealProfile}
                alt="Logo do Jardim Escola da Mayelin"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-white rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Quicksand'] font-extrabold text-sm sm:text-base text-[#211a14] tracking-tight">
                  Jardim Escola da Mayelin
                </span>
                <span className="hidden lg:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Sessão Autenticada
                </span>
              </div>
              <p className="text-[11px] text-[#5c3f42] hidden sm:block">
                Portal Integrado de Educação Infantil & Creche • Luanda, Angola
              </p>
            </div>
          </div>
        </div>

        {/* Centro: Alternador dos 3 Perfis Oficiais com Cores do Website */}
        <div
          role="tablist"
          aria-label="Seleção de Perfis do Portal"
          className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 scrollbar-none bg-[#faebe1]/60 p-1 rounded-2xl border border-[#eee0d6]"
        >
          {/* Perfil 1: Administração e Gestão Escolar */}
          <button
            type="button"
            role="tab"
            aria-selected={activeRole === 'admin'}
            onClick={() => handleRoleChange('admin')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeRole === 'admin'
                ? 'bg-[#ed145b] text-white shadow-md shadow-pink-500/20'
                : 'text-[#5c3f42] hover:text-[#211a14] hover:bg-white/80'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span>Administração & Gestão</span>
          </button>

          {/* Perfil 2: Professor */}
          <button
            type="button"
            role="tab"
            aria-selected={activeRole === 'professor'}
            onClick={() => handleRoleChange('professor')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeRole === 'professor'
                ? 'bg-[#00a6c0] text-white shadow-md shadow-sky-500/20'
                : 'text-[#5c3f42] hover:text-[#211a14] hover:bg-white/80'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 shrink-0" />
            <span>Professor</span>
          </button>

          {/* Perfil 3: Pais / Encarregados */}
          <button
            type="button"
            role="tab"
            aria-selected={activeRole === 'pais'}
            onClick={() => handleRoleChange('pais')}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeRole === 'pais'
                ? 'bg-[#fd9924] text-white shadow-md shadow-amber-500/20'
                : 'text-[#5c3f42] hover:text-[#211a14] hover:bg-white/80'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span>Pais / Encarregados</span>
          </button>
        </div>

        {/* Direita: Identificação do Utilizador Autenticado & Terminar Sessão */}
        <div className="flex items-center justify-end gap-2.5 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-[#8c6b6d] block font-extrabold leading-none">
              Autenticado como:
            </span>
            <span className="text-xs font-extrabold text-[#211a14] leading-tight">
              {currentUser?.name || PROFILE_OPTIONS.find((p) => p.role === activeRole)?.name || 'Utilizador'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#fff1e7] hover:bg-rose-50 text-[#5c3f42] hover:text-rose-600 border border-[#eee0d6] text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            title="Terminar Sessão e Ir para o Ecrã de Login"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">Terminar Sessão</span>
            <span className="sm:hidden">Sair</span>
          </button>
        </div>
      </header>

      {/* Área Central da Página Inteira (Dashboard Completo Selecionado) */}
      <main className="flex-1 w-full flex flex-col overflow-hidden bg-[#fff8f5]">
        {/* PERFIL 1: ADMINISTRAÇÃO E GESTÃO ESCOLAR */}
        {activeRole === 'admin' && (
          <AdminSchoolDashboard />
        )}

        {/* PERFIL 2: PROFESSOR */}
        {activeRole === 'professor' && (
          <TeacherSchoolDashboard />
        )}

        {/* PERFIL 3: PAIS / ENCARREGADOS DE EDUCAÇÃO */}
        {activeRole === 'pais' && (
          <GuardianSchoolDashboard />
        )}
      </main>
    </div>
  );
}
