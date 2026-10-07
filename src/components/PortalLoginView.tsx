import React, { useState } from 'react';
import {
  Building2,
  GraduationCap,
  Users,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  School,
  KeyRound,
  HelpCircle,
  X,
  Sparkles,
  Phone,
  HeartHandshake
} from 'lucide-react';
import { UserRole } from '../types';
import { SCHOOL_CONTACT, SCHOOL_IMAGES } from '../data/mockData';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  avatarLetter: string;
  nif?: string;
}

interface PortalLoginViewProps {
  initialRole?: UserRole;
  onLoginSuccess: (user: AuthUser) => void;
  onBackToWebsite: () => void;
}

const DEFAULT_CREDENTIALS: Record<UserRole, { email: string; pass: string; user: AuthUser }> = {
  admin: {
    email: 'manuela.castro@mayelinkids.com',
    pass: 'MayelinAdmin2025!',
    user: {
      id: 'usr-admin-1',
      name: 'Dra. Manuela Castro',
      email: 'manuela.castro@mayelinkids.com',
      role: 'admin',
      title: 'Diretora da Secretaria Geral',
      avatarLetter: 'M',
      nif: '5418192031'
    }
  },
  professor: {
    email: 'antonio.silva@mayelinkids.com',
    pass: 'Docente2025!',
    user: {
      id: 'usr-prof-1',
      name: 'Prof. António Silva',
      email: 'antonio.silva@mayelinkids.com',
      role: 'professor',
      title: 'Educador Titular - Jardim de Infância',
      avatarLetter: 'A'
    }
  },
  pais: {
    email: 'antonio.ferreira@encarregados.ao',
    pass: 'FamiliaSilva2025!',
    user: {
      id: 'usr-parent-1',
      name: 'Dr. António Ferreira Silva',
      email: 'antonio.ferreira@encarregados.ao',
      role: 'pais',
      title: 'Encarregado de Educação (Rodrigo e Sofia)',
      avatarLetter: 'A',
      nif: '218409382'
    }
  }
};

export default function PortalLoginView({
  initialRole = 'pais',
  onLoginSuccess,
  onBackToWebsite
}: PortalLoginViewProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [emailInput, setEmailInput] = useState(DEFAULT_CREDENTIALS[initialRole].email);
  const [passwordInput, setPasswordInput] = useState(DEFAULT_CREDENTIALS[initialRole].pass);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);

  // When changing profile tabs, auto-populate the sample inputs for smooth testing
  const handleRoleTabChange = (role: UserRole) => {
    setSelectedRole(role);
    setEmailInput(DEFAULT_CREDENTIALS[role].email);
    setPasswordInput(DEFAULT_CREDENTIALS[role].pass);
    setErrorMessage(null);
  };

  const handleQuickLogin = (role: UserRole) => {
    setSelectedRole(role);
    setIsLoading(true);
    setErrorMessage(null);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(DEFAULT_CREDENTIALS[role].user);
    }, 450);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!emailInput.trim() || !passwordInput.trim()) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsLoading(true);

    // Realistic authentication validation simulation
    setTimeout(() => {
      setIsLoading(false);
      const targetUser = DEFAULT_CREDENTIALS[selectedRole].user;
      const authenticated: AuthUser = {
        ...targetUser,
        email: emailInput.trim(),
        name: emailInput.includes('@') ? targetUser.name : 'Utilizador Autenticado'
      };
      onLoginSuccess(authenticated);
    }, 550);
  };

  return (
    <div
      id="portal-login-fullpage-root"
      className="min-h-screen w-full flex flex-col bg-[#fff8f5] text-[#211a14] font-['Nunito_Sans'] antialiased selection:bg-pink-200 selection:text-[#ed145b]"
    >
      {/* Top Header Bar Seguindo o Padrão do Website */}
      <header className="bg-white/95 backdrop-blur-md border-b border-[#eee0d6] px-4 sm:px-8 py-3.5 flex items-center justify-between shrink-0 z-20 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToWebsite}
            className="px-3.5 py-1.5 rounded-xl bg-[#faebe1] hover:bg-[#f4e6db] text-[#5c3f42] hover:text-[#211a14] text-xs font-bold flex items-center gap-2 transition-all border border-[#eee0d6] shadow-2xs active:scale-95 cursor-pointer"
            title="Voltar ao Website Principal da Escola"
          >
            <ArrowLeft className="w-4 h-4 text-[#ed145b]" />
            <span>Voltar ao Website</span>
          </button>

          <div className="h-5 w-px bg-[#eee0d6] hidden sm:block" />

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
              <span className="font-['Quicksand'] font-extrabold text-sm sm:text-base text-[#211a14] tracking-tight leading-tight block">
                Jardim Escola da Mayelin
              </span>
              <span className="text-[11px] text-[#5c3f42] hidden sm:block">
                Educação Infantil & Creche • Luanda, Angola
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Portal Seguro SSL/TLS
          </span>
          <span className="text-xs text-[#5c3f42] font-bold bg-[#faebe1] px-2.5 py-0.5 rounded-full border border-[#eee0d6] hidden lg:inline">
            Ano Letivo 2024/2025
          </span>
        </div>
      </header>

      {/* Main Login Screen Layout em Tons Quentes e Amigáveis */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden bg-clouds">
        {/* Soft Decorative Ambient Circles */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-pink-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-100/60 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10">
          {/* Left Column: Brand, Institutional Value & Trust */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-pink-50 text-[#ed145b] border border-pink-200">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Portal Escolar Integrado</span>
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-['Quicksand'] text-[#211a14] tracking-tight leading-tight">
                Aceder ao Espaço Escolar
              </h1>
              <p className="text-xs sm:text-sm text-[#5c3f42] leading-relaxed max-w-md mx-auto lg:mx-0">
                Acompanhe o desenvolvimento lúdico dos educandos, as chamadas de presença, avaliações dos 3 ciclos e a gestão financeira em moeda nacional (Kz).
              </p>
            </div>

            {/* 3 Value Badges com as cores oficiais das turmas */}
            <div className="space-y-3 pt-1 text-left max-w-md mx-auto lg:mx-0">
              <div className="p-3.5 rounded-2xl bg-white border border-[#eee0d6] shadow-2xs flex items-start gap-3 hover:border-pink-300 transition-all">
                <div className="w-9 h-9 rounded-xl bg-pink-100 text-[#ed145b] flex items-center justify-center shrink-0 mt-0.5">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#211a14]">Administração e Gestão Escolar</h2>
                  <p className="text-[11px] text-[#5c3f42]">Lotação das salas, faturação em Kwanza (Kz) e conformidade AGT/RGPD.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#eee0d6] shadow-2xs flex items-start gap-3 hover:border-sky-300 transition-all">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-[#00a6c0] flex items-center justify-center shrink-0 mt-0.5">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#211a14]">Espaço do Professor Titular</h2>
                  <p className="text-[11px] text-[#5c3f42]">Chamada diária da manhã, pauta qualitativa e planos curriculares.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#eee0d6] shadow-2xs flex items-start gap-3 hover:border-amber-300 transition-all">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#fd9924] flex items-center justify-center shrink-0 mt-0.5">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#211a14]">Portal dos Pais & Encarregados</h2>
                  <p className="text-[11px] text-[#5c3f42]">Presenças biométricas, pagamentos Multicaixa e consentimentos digitais.</p>
                </div>
              </div>
            </div>

            {/* Security Assurance */}
            <div className="flex items-center justify-center lg:justify-start gap-3 text-[#5c3f42] text-[11px] pt-1 font-bold">
              <span className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                RGPD & WCAG 2.1 AA
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#5c3f42]">
                <Lock className="w-3.5 h-3.5 text-[#ed145b]" />
                Encriptação Segura
              </span>
            </div>
          </div>

          {/* Right Column: Warm & Friendly Login Card */}
          <div className="lg:col-span-7">
            <div className="bg-white border-2 border-[#eee0d6] rounded-3xl p-6 sm:p-8 shadow-xl relative space-y-6">
              {/* Profile Selector Tabs */}
              <div>
                <label className="text-xs font-bold text-[#211a14] block mb-2">
                  Selecione o Perfil Institucional de Acesso:
                </label>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 p-1.5 bg-[#faebe1]/70 rounded-2xl border border-[#eee0d6]">
                  {/* Admin Tab */}
                  <button
                    type="button"
                    onClick={() => handleRoleTabChange('admin')}
                    className={`py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                      selectedRole === 'admin'
                        ? 'bg-[#ed145b] text-white shadow-md shadow-pink-500/20'
                        : 'text-[#5c3f42] hover:text-[#211a14] hover:bg-white/80'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Administração</span>
                  </button>

                  {/* Teacher Tab */}
                  <button
                    type="button"
                    onClick={() => handleRoleTabChange('professor')}
                    className={`py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                      selectedRole === 'professor'
                        ? 'bg-[#00a6c0] text-white shadow-md shadow-sky-500/20'
                        : 'text-[#5c3f42] hover:text-[#211a14] hover:bg-white/80'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                    <span>Professor</span>
                  </button>

                  {/* Parents Tab */}
                  <button
                    type="button"
                    onClick={() => handleRoleTabChange('pais')}
                    className={`py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                      selectedRole === 'pais'
                        ? 'bg-[#fd9924] text-white shadow-md shadow-amber-500/20'
                        : 'text-[#5c3f42] hover:text-[#211a14] hover:bg-white/80'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    <span>Encarregados</span>
                  </button>
                </div>
              </div>

              {/* Informative Banner for current Profile */}
              <div className="p-3.5 rounded-2xl bg-[#fff8f5] border border-[#eee0d6] flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[#8c6b6d] text-[10px] uppercase font-extrabold tracking-wider block">
                    Utilizador Credenciado
                  </span>
                  <span className="font-extrabold text-[#211a14] text-xs sm:text-sm">
                    {DEFAULT_CREDENTIALS[selectedRole].user.name}
                  </span>
                  <span className="text-[11px] text-[#5c3f42] block">
                    {DEFAULT_CREDENTIALS[selectedRole].user.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickLogin(selectedRole)}
                  className="px-3 py-1.5 rounded-xl bg-pink-100 hover:bg-pink-200 text-[#ed145b] text-[11px] font-bold border border-pink-200 transition-all shrink-0 active:scale-95 cursor-pointer"
                >
                  Entrada Rápida (1 Clique)
                </button>
              </div>

              {/* Error Message Alert */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label htmlFor="portal-email-input" className="block font-bold text-[#211a14] mb-1.5">
                    E-mail Institucional ou NIF
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8c6b6d]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="portal-email-input"
                      type="text"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="exemplo@mayelinkids.com ou 5418192031"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#fff8f5] border border-[#eee0d6] text-[#211a14] placeholder:text-[#8c6b6d] focus:bg-white focus:border-[#ed145b] focus:ring-2 focus:ring-pink-100 text-xs sm:text-sm transition-all focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="portal-password-input" className="font-bold text-[#211a14]">
                      Palavra-passe de Acesso
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotPasswordModal(true)}
                      className="text-[#ed145b] hover:text-pink-700 font-bold hover:underline text-[11px]"
                    >
                      Esqueceu a palavra-passe?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8c6b6d]">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      id="portal-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#fff8f5] border border-[#eee0d6] text-[#211a14] placeholder:text-[#8c6b6d] focus:bg-white focus:border-[#ed145b] focus:ring-2 focus:ring-pink-100 text-xs sm:text-sm transition-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8c6b6d] hover:text-[#211a14]"
                      aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-[#5c3f42] hover:text-[#211a14] text-xs">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-[#ed145b] border-[#eee0d6] focus:ring-[#ed145b]"
                    />
                    <span>Manter sessão iniciada neste dispositivo</span>
                  </label>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full min-h-[48px] py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#ed145b] to-[#fd9924] hover:from-pink-600 hover:to-amber-500 text-white font-['Quicksand'] font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-60 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Autenticando sessão segura...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Entrar no Portal ({DEFAULT_CREDENTIALS[selectedRole].user.title.split(' ')[0]})</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Direct Profile Demo Launchers */}
              <div className="pt-3 border-t border-[#eee0d6]">
                <span className="text-[11px] font-bold text-[#8c6b6d] block mb-2 text-center">
                  Atalhos de Acesso Rápido para Avaliação:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin')}
                    className="p-2.5 rounded-xl bg-[#fff8f5] hover:bg-[#faebe1] border border-[#eee0d6] text-left transition-colors flex items-center gap-2 group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-pink-100 text-[#ed145b] flex items-center justify-center text-[10px] font-extrabold">
                      ADM
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-[#211a14] block truncate group-hover:text-[#ed145b]">
                        Dra. Manuela
                      </span>
                      <span className="text-[10px] text-[#5c3f42] block truncate">Secretaria Geral</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('professor')}
                    className="p-2.5 rounded-xl bg-[#fff8f5] hover:bg-[#faebe1] border border-[#eee0d6] text-left transition-colors flex items-center gap-2 group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-sky-100 text-[#00a6c0] flex items-center justify-center text-[10px] font-extrabold">
                      PROF
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-[#211a14] block truncate group-hover:text-[#00a6c0]">
                        Prof. António
                      </span>
                      <span className="text-[10px] text-[#5c3f42] block truncate">Jardim de Infância</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('pais')}
                    className="p-2.5 rounded-xl bg-[#fff8f5] hover:bg-[#faebe1] border border-[#eee0d6] text-left transition-colors flex items-center gap-2 group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-[#fd9924] flex items-center justify-center text-[10px] font-extrabold">
                      PAIS
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-[#211a14] block truncate group-hover:text-[#fd9924]">
                        Dr. António
                      </span>
                      <span className="text-[10px] text-[#5c3f42] block truncate">Encarregado</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL: RECUPERAÇÃO DE PALAVRA-PASSE EM TONS DO SITE */}
      {forgotPasswordModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-white border-2 border-[#eee0d6] rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-[#211a14]">
            <div className="flex items-center justify-between pb-3 border-b border-[#eee0d6]">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#ed145b]" />
                <h3 className="font-['Quicksand'] font-bold text-sm text-[#211a14]">
                  Recuperação de Credenciais de Acesso
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setForgotPasswordModal(false)}
                className="p-1 rounded-lg text-[#8c6b6d] hover:text-[#211a14]"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#5c3f42]">
              <p>
                Por motivos de segurança e cumprimento das políticas de proteção de dados (RGPD) para instituições de infância, a redefinição de palavra-passe é gerida diretamente pela Secretaria Geral da escola.
              </p>
              <div className="p-3.5 bg-[#fff8f5] rounded-2xl border border-[#eee0d6] space-y-1.5 text-[11px]">
                <p className="font-bold text-[#211a14]">Contactos da Secretaria Geral:</p>
                <p className="flex items-center gap-2 text-[#5c3f42]">
                  <Phone className="w-3.5 h-3.5 text-[#ed145b]" />
                  <span>{SCHOOL_CONTACT.phoneDisplay}</span>
                </p>
                <p className="flex items-center gap-2 text-[#5c3f42]">
                  <Mail className="w-3.5 h-3.5 text-[#fd9924]" />
                  <span>secretaria@mayelinkids.com</span>
                </p>
                <p className="text-[#8c6b6d] mt-1">Horário de Atendimento: Segunda a Sexta, das 07:30 às 18:00</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setForgotPasswordModal(false)}
                className="px-4 py-2 bg-[#ed145b] hover:bg-pink-600 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Compreendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
