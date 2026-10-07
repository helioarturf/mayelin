import { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Building2,
  GraduationCap,
  Users
} from 'lucide-react';
import {
  Student,
  PickupAuthorization,
  DailyLogItem,
  UserRole,
  SchoolAnnouncement,
  VisitAppointment
} from '../types';
import { PROFILE_OPTIONS } from '../data/mockData';
import AdminSchoolDashboard from './AdminSchoolDashboard';
import TeacherSchoolDashboard from './TeacherSchoolDashboard';
import GuardianSchoolDashboard from './GuardianSchoolDashboard';

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
  // Active Profile State synchronized with currentRole prop
  const [activeRole, setActiveRole] = useState<UserRole>(currentRole);

  useEffect(() => {
    setActiveRole(currentRole);
  }, [currentRole]);

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    if (onChangeRole) onChangeRole(role);
  };

  if (!isOpen) return null;

  return (
    <div
      id="school-portal-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="portal-modal-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="school-portal-modal-container"
        className="bg-[#fff8f5] w-full max-w-7xl rounded-3xl border-2 border-[#eee0d6] shadow-2xl flex flex-col max-h-[96vh] overflow-hidden transition-all duration-200"
      >
        {/* Top Header Bar */}
        <div className="bg-white border-b border-[#eee0d6] px-4 sm:px-6 py-3 sm:py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#ed145b] to-[#fd9924] flex items-center justify-center text-white shadow-sm shrink-0">
              <Smartphone className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="portal-modal-title" className="text-base sm:text-lg font-['Quicksand'] text-[#211a14] font-bold">
                  Mayelin Kids • Portal Integrado da Escola
                </h2>
                <span className="text-[10px] sm:text-[11px] font-['Nunito_Sans'] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
                <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 hidden sm:inline-block">
                  RGPD • WCAG 2.1 AA
                </span>
              </div>
              <p className="text-[11px] sm:text-xs font-['Nunito_Sans'] text-[#5c3f42]">
                Gestão Executiva, Práticas Pedagógicas e Acompanhamento Familiar
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-3">
            {/* Active profile badge */}
            <div className="text-right hidden sm:block">
              <span className="text-[11px] text-[#5c3f42] block font-semibold">Perfil Ativo:</span>
              <span className="text-xs font-bold text-[#ed145b]">
                {PROFILE_OPTIONS.find((p) => p.role === activeRole)?.label || 'Painel Escolar'}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="min-w-[40px] min-h-[40px] rounded-full bg-[#faebe1] text-[#5c3f42] hover:bg-[#ed145b] hover:text-white flex items-center justify-center transition-colors shrink-0"
              aria-label="Fechar portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3 Interactive Profiles Switcher Strip */}
        <div className="bg-[#faebe1] border-b border-[#eee0d6] px-3 sm:px-6 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-xs font-bold text-[#5c3f42] shrink-0 mr-1 hidden sm:inline">
            Alternar Perfil:
          </span>

          {/* Profile 1: Administração e Gestão Escolar */}
          <button
            type="button"
            onClick={() => handleRoleChange('admin')}
            className={`min-h-[40px] px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-['Nunito_Sans'] font-bold flex items-center gap-2 transition-all whitespace-nowrap shadow-xs ${
              activeRole === 'admin'
                ? 'bg-[#ed145b] text-white shadow-md ring-2 ring-pink-300'
                : 'bg-white text-[#5c3f42] hover:bg-pink-50 hover:text-[#ed145b]'
            }`}
          >
            <Building2 className="w-4 h-4 shrink-0" />
            <span>Administração e Gestão Escolar</span>
          </button>

          {/* Profile 2: Professor */}
          <button
            type="button"
            onClick={() => handleRoleChange('professor')}
            className={`min-h-[40px] px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-['Nunito_Sans'] font-bold flex items-center gap-2 transition-all whitespace-nowrap shadow-xs ${
              activeRole === 'professor'
                ? 'bg-[#00a6c0] text-white shadow-md ring-2 ring-sky-300'
                : 'bg-white text-[#5c3f42] hover:bg-sky-50 hover:text-[#00a6c0]'
            }`}
          >
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span>Professor</span>
          </button>

          {/* Profile 3: Pais/Encarregados */}
          <button
            type="button"
            onClick={() => handleRoleChange('pais')}
            className={`min-h-[40px] px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-['Nunito_Sans'] font-bold flex items-center gap-2 transition-all whitespace-nowrap shadow-xs ${
              activeRole === 'pais'
                ? 'bg-[#fd9924] text-white shadow-md ring-2 ring-amber-300'
                : 'bg-white text-[#5c3f42] hover:bg-amber-50 hover:text-[#8c4f00]'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Pais/Encarregados</span>
          </button>
        </div>

        {/* Scrollable Main Body Content for the 3 Dashboards */}
        <div className="flex-1 overflow-y-auto p-0">
          {/* PROFILE 1: ADMINISTRAÇÃO E GESTÃO ESCOLAR */}
          {activeRole === 'admin' && (
            <AdminSchoolDashboard onClose={onClose} />
          )}

          {/* PROFILE 2: PROFESSOR */}
          {activeRole === 'professor' && (
            <TeacherSchoolDashboard onClose={onClose} />
          )}

          {/* PROFILE 3: PAIS / ENCARREGADOS */}
          {activeRole === 'pais' && (
            <GuardianSchoolDashboard onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}
