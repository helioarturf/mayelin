import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  LogOut
} from 'lucide-react';
import { UserRole } from '../types';
import { SCHOOL_IMAGES } from '../data/mockData';
import { formatEducatorName } from '../utils/formatters';
import AdminSchoolDashboard from './AdminSchoolDashboard';
import TeacherSchoolDashboard from './TeacherSchoolDashboard';
import GuardianSchoolDashboard from './GuardianSchoolDashboard';
import PortalLoginView from './PortalLoginView';
import { AuthUser, normalizePortalRole, ServerRole } from '../lib/api';

interface ParentPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole?: UserRole;
  onChangeRole?: (role: UserRole) => void;
}

export default function ParentPortalModal({
  isOpen,
  onClose,
  currentRole = 'pais',
  onChangeRole
}: ParentPortalModalProps) {
  // In-memory authenticated session (token is never persisted in localStorage)
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [activeRole, setActiveRole] = useState<ServerRole>(() => normalizePortalRole(currentRole));
  const [headerExtrasEl, setHeaderExtrasEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (currentRole && !currentUser) {
      setActiveRole(normalizePortalRole(currentRole));
    }
  }, [currentRole, currentUser]);

  const handleLoginSuccess = (user: AuthUser, token: string) => {
    setAuthToken(token);
    setCurrentUser(user);
    setActiveRole(user.role);
    if (onChangeRole) onChangeRole(user.role);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
  };

  if (!isOpen) return null;

  if (!authToken || !currentUser) {
    return (
      <PortalLoginView
        initialRole={currentRole}
        onLoginSuccess={handleLoginSuccess}
        onBackToWebsite={onClose}
      />
    );
  }

  const isAdmin = currentUser.role === 'admin';
  const displayName =
    currentUser.role === 'educador'
      ? formatEducatorName(currentUser.name)
      : currentUser.name;

  const activeSubtitle =
    activeRole === 'admin'
      ? 'Administração & Gestão Escolar • Luanda, Angola'
      : activeRole === 'educador'
      ? 'Espaço da Educadora Titular (Tia) • Acompanhamento Infantil'
      : 'Portal dos Encarregados de Educação & Famílias';

  return (
    <div
      id="school-portal-fullpage-root"
      className="min-h-screen w-full flex flex-col bg-[#fff8f5] text-[#211a14] font-['Nunito_Sans'] antialiased overflow-x-hidden selection:bg-pink-200 selection:text-[#ed145b]"
    >
      {/* Cabeçalho Único Unificado do Portal Autenticado */}
      <header
        role="banner"
        className="bg-white border-b border-[#eee0d6] px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col gap-2.5 shrink-0 z-30 shadow-2xs"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
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
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-['Quicksand'] font-extrabold text-sm sm:text-base text-[#211a14] tracking-tight">
                    Jardim Escola da Mayelin
                  </span>
                  <span className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Sessão Autenticada
                  </span>
                </div>
                <p className="text-[11px] text-[#5c3f42]">
                  {activeSubtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Direita: Identificação do Utilizador Autenticado & Terminar Sessão */}
          <div className="flex items-center justify-end gap-2.5 shrink-0">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-[#8c6b6d] block font-extrabold leading-none">
                {currentUser.title}
              </span>
              <span className="text-xs font-extrabold text-[#211a14] leading-tight">
                {displayName}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="min-h-[36px] px-3 py-1.5 rounded-xl bg-[#fff1e7] hover:bg-rose-50 text-[#5c3f42] hover:text-rose-600 border border-[#eee0d6] text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              title="Terminar Sessão e Ir para o Ecrã de Login"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline">Terminar Sessão</span>
              <span className="sm:hidden">Sair</span>
            </button>
          </div>
        </div>

        {/* Barra Contextual Fundida do Perfil Ativo (Admin / Educadora / Encarregados) */}
        <div
          ref={setHeaderExtrasEl}
          className="w-full pt-2.5 border-t border-[#eee0d6]/80 flex flex-col md:flex-row md:items-center justify-between gap-2.5 empty:hidden"
        />
      </header>

      {/* Área Central da Página Inteira */}
      <main className="flex-1 w-full flex flex-col overflow-hidden bg-[#fff8f5]">
        {activeRole === 'admin' && isAdmin && (
          <AdminSchoolDashboard
            authToken={authToken}
            currentUser={currentUser}
            headerPortalTarget={headerExtrasEl}
          />
        )}

        {activeRole === 'educador' && (isAdmin || currentUser.role === 'educador') && (
          <TeacherSchoolDashboard
            authToken={authToken}
            currentUser={currentUser}
            headerPortalTarget={headerExtrasEl}
          />
        )}

        {activeRole === 'pais' && (isAdmin || currentUser.role === 'pais') && (
          <GuardianSchoolDashboard
            authToken={authToken}
            currentUser={currentUser}
            headerPortalTarget={headerExtrasEl}
          />
        )}
      </main>
    </div>
  );
}
