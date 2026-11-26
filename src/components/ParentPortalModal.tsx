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

  const activeRoleLabel =
    activeRole === 'admin'
      ? 'Administração & Gestão'
      : activeRole === 'educador'
      ? 'Espaço da Educadora (Tia)'
      : 'Portal dos Encarregados';

  return (
    <div
      id="school-portal-fullpage-root"
      className="min-h-screen lg:h-screen lg:overflow-hidden w-full flex flex-col bg-[#fff8f5] text-[#211a14] font-['Nunito_Sans'] antialiased overflow-x-hidden selection:bg-pink-200 selection:text-[#ed145b]"
    >
      {/* Cabeçalho Único Unificado do Portal Autenticado */}
      <header
        role="banner"
        className="bg-white border-b border-[#eee0d6] shrink-0 z-30"
      >
        <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-[#faebe1] hover:bg-[#f4e6db] text-[#5c3f42] hover:text-[#211a14] font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 border border-[#eee0d6] whitespace-nowrap cursor-pointer"
              title="Voltar ao Website Principal da Escola"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#ed145b]" />
              <span>Website</span>
            </button>

            <div className="h-5 w-px bg-[#eee0d6] hidden sm:block shrink-0" />

            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-[#eee0d6] shrink-0 bg-pink-100">
                <img
                  src={SCHOOL_IMAGES.mayelinRealProfile}
                  alt="Logo do Jardim Escola da Mayelin"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-['Quicksand'] font-extrabold text-sm sm:text-base text-[#211a14] tracking-tight whitespace-nowrap truncate">
                  Jardim Escola da Mayelin
                </span>
                <span className="hidden md:inline text-xs text-[#8c6b6d] shrink-0" aria-hidden="true">·</span>
                <span className="hidden md:inline text-xs font-semibold text-[#5c3f42] whitespace-nowrap truncate">
                  {activeRoleLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Direita: Identificação do Utilizador Autenticado & Terminar Sessão */}
          <div className="flex items-center justify-end gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-[#211a14] block leading-tight">
                {displayName}
              </span>
              <span className="text-[11px] text-[#8c6b6d] block leading-tight">
                {currentUser.title}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#fff8f5] hover:bg-rose-50 text-[#5c3f42] hover:text-rose-700 border border-[#eee0d6] text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
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
          className="w-full px-4 sm:px-6 py-2 bg-[#fffcf9] border-t border-[#eee0d6]/80 flex flex-col md:flex-row md:items-center justify-between gap-2.5 empty:hidden"
        />
      </header>

      {/* Área Central da Página Inteira */}
      <main className="flex-1 min-h-0 w-full flex flex-col overflow-hidden bg-[#fff8f5]">
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
