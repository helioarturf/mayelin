import React, { useState, useEffect, useCallback } from 'react';
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
  AlertCircle,
  KeyRound,
  HelpCircle,
  X,
  Sparkles,
  Phone,
  Database,
  RefreshCw,
  UserPlus
} from 'lucide-react';
import { UserRole } from '../types';
import { SCHOOL_CONTACT, SCHOOL_IMAGES } from '../data/mockData';
import { AuthUser, AuthStatusResponse, portalApi } from '../lib/api';
import { getCurrentAcademicYear } from '../utils/formatters';

export type { AuthUser };

interface PortalLoginViewProps {
  initialRole?: UserRole;
  onLoginSuccess: (user: AuthUser, token: string) => void;
  onBackToWebsite: () => void;
}

export default function PortalLoginView({
  onLoginSuccess,
  onBackToWebsite
}: PortalLoginViewProps) {
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Initial Admin Setup State (when portal_users table is empty)
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminNif, setAdminNif] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Server & Database Readiness Status
  const [authStatus, setAuthStatus] = useState<AuthStatusResponse | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);

  const checkDatabaseStatus = useCallback(async () => {
    setCheckingStatus(true);
    setStatusError(null);
    try {
      const status = await portalApi.getAuthStatus();
      setAuthStatus(status);
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Erro ao verificar ligação à base de dados.');
    } finally {
      setCheckingStatus(false);
    }
  }, []);

  useEffect(() => {
    checkDatabaseStatus();
  }, [checkDatabaseStatus]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!emailInput.trim() || !passwordInput) {
      setErrorMessage('Por favor, preencha o e-mail/NIF e a palavra-passe.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await portalApi.login({
        identifier: emailInput.trim(),
        password: passwordInput
      });
      onLoginSuccess(res.user, res.token);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Falha na autenticação.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitialSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!adminName.trim() || !adminEmail.includes('@') || adminPassword.length < 8) {
      setErrorMessage('Informe o nome completo, um e-mail válido e uma palavra-passe com pelo menos 8 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await portalApi.setupInitialAdmin({
        name: adminName.trim(),
        email: adminEmail.trim(),
        password: adminPassword,
        nif: adminNif.trim() || undefined
      });
      onLoginSuccess(res.user, res.token);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao criar conta de administrador.');
    } finally {
      setIsLoading(false);
    }
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
            Base de Dados Supabase
          </span>
          <span className="text-xs text-[#5c3f42] font-bold bg-[#faebe1] px-2.5 py-0.5 rounded-full border border-[#eee0d6] hidden lg:inline">
            Ano Letivo {getCurrentAcademicYear()}
          </span>
        </div>
      </header>

      {/* Main Login Screen Layout em Tons Quentes e Amigáveis */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden bg-clouds">
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
                Acompanhe o desenvolvimento afetuoso das crianças, as chamadas de presença, observações diárias das Tias e a gestão financeira em moeda nacional (Kz).
              </p>
            </div>

            <div className="space-y-3 pt-1 text-left max-w-md mx-auto lg:mx-0">
              <div className="p-3.5 rounded-2xl bg-white border border-[#eee0d6] shadow-2xs flex items-start gap-3 hover:border-pink-300 transition-all">
                <div className="w-9 h-9 rounded-xl bg-pink-100 text-[#ed145b] flex items-center justify-center shrink-0 mt-0.5">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#211a14]">Administração e Gestão Escolar</h2>
                  <p className="text-[11px] text-[#5c3f42]">Lotação das salas, matrículas, equipas e faturação em Kwanza (Kz).</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#eee0d6] shadow-2xs flex items-start gap-3 hover:border-sky-300 transition-all">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-[#00a6c0] flex items-center justify-center shrink-0 mt-0.5">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#211a14]">Espaço da Educadora (Tia)</h2>
                  <p className="text-[11px] text-[#5c3f42]">Rotina de cuidados, observações qualitativas e chamadas da manhã.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#eee0d6] shadow-2xs flex items-start gap-3 hover:border-amber-300 transition-all">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#fd9924] flex items-center justify-center shrink-0 mt-0.5">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-[#211a14]">Portal dos Pais & Encarregados</h2>
                  <p className="text-[11px] text-[#5c3f42]">Diário da criança, observações das Tias, pagamentos e consentimentos.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-3 text-[#5c3f42] text-[11px] pt-1 font-bold">
              <span className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                RGPD & WCAG 2.1 AA
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#5c3f42]">
                <Lock className="w-3.5 h-3.5 text-[#ed145b]" />
                Autenticação Segura
              </span>
            </div>
          </div>

          {/* Right Column: Login Card or Initial Setup / Configuration Notice */}
          <div className="lg:col-span-7">
            <div className="bg-white border-2 border-[#eee0d6] rounded-3xl p-6 sm:p-8 shadow-xl relative space-y-6">
              {checkingStatus ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
                  <div className="w-8 h-8 border-3 border-pink-200 border-t-[#ed145b] rounded-full animate-spin" />
                  <p className="text-xs font-bold text-[#5c3f42]">A verificar ligação com a base de dados Supabase...</p>
                </div>
              ) : statusError ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                    <div>
                      <p className="font-bold">Ligação indisponível</p>
                      <p className="mt-1">{statusError}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={checkDatabaseStatus}
                    className="px-4 py-2.5 rounded-xl bg-[#ed145b] text-white text-xs font-bold flex items-center gap-2 hover:bg-pink-600 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Tentar Novamente</span>
                  </button>
                </div>
              ) : authStatus && !authStatus.supabaseConfigured ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-100 text-[#fd9924] flex items-center justify-center shrink-0">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold font-['Quicksand'] text-[#211a14]">
                        Configurar Ligação ao Supabase
                      </h2>
                      <p className="text-xs text-[#5c3f42]">
                        Para tratar dados reais de crianças, educadoras e encarregados.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#fff8f5] border border-[#eee0d6] text-xs text-[#5c3f42] space-y-2.5 leading-relaxed">
                    <p>
                      As credenciais do Supabase ainda não estão definidas no ambiente do servidor:
                    </p>
                    <ol className="list-decimal list-inside space-y-1.5 font-semibold text-[#211a14]">
                      <li>
                        Abra as definições de ambiente (<strong>Settings → Secrets</strong>) e adicione{' '}
                        <code className="bg-[#faebe1] px-1.5 py-0.5 rounded text-[#ed145b]">SUPABASE_URL</code> e{' '}
                        <code className="bg-[#faebe1] px-1.5 py-0.5 rounded text-[#ed145b]">SUPABASE_SERVICE_ROLE_KEY</code>.
                      </li>
                      <li>
                        No painel do seu projeto Supabase, abra o <strong>SQL Editor</strong> e execute o ficheiro{' '}
                        <code className="bg-[#faebe1] px-1.5 py-0.5 rounded text-[#ed145b]">supabase/schema.sql</code>.
                      </li>
                      <li>
                        Clique em <strong>Verificar Ligação</strong> abaixo para criar o primeiro administrador da creche.
                      </li>
                    </ol>
                  </div>

                  <button
                    type="button"
                    onClick={checkDatabaseStatus}
                    className="w-full min-h-[44px] py-3 px-5 rounded-2xl bg-[#ed145b] hover:bg-pink-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Verificar Ligação ao Supabase</span>
                  </button>
                </div>
              ) : authStatus && !authStatus.schemaReady ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-sky-100 text-[#00a6c0] flex items-center justify-center shrink-0">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold font-['Quicksand'] text-[#211a14]">
                        Criar Tabelas no Supabase
                      </h2>
                      <p className="text-xs text-[#5c3f42]">
                        A ligação ao Supabase está ativa, mas a estrutura da base de dados ainda não foi criada.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#fff8f5] border border-[#eee0d6] text-xs text-[#5c3f42] space-y-2 leading-relaxed">
                    <p>
                      Aceda ao <strong>SQL Editor</strong> do seu projeto no Supabase e execute integralmente o conteúdo do ficheiro{' '}
                      <code className="bg-[#faebe1] px-1.5 py-0.5 rounded text-[#ed145b]">supabase/schema.sql</code>.
                    </p>
                    <p>
                      Depois de executar o script com sucesso, clique abaixo para iniciar o cadastro da Direção.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={checkDatabaseStatus}
                    className="w-full min-h-[44px] py-3 px-5 rounded-2xl bg-[#00a6c0] hover:bg-sky-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Verificar Tabelas Novamente</span>
                  </button>
                </div>
              ) : authStatus?.needsInitialSetup ? (
                /* FIRST-RUN ADMIN SETUP */
                <div className="space-y-5">
                  <div className="flex items-start gap-3 pb-3 border-b border-[#eee0d6]">
                    <div className="w-11 h-11 rounded-2xl bg-pink-100 text-[#ed145b] flex items-center justify-center shrink-0">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#ed145b]">
                        Primeiro Acesso • Configuração Inicial
                      </span>
                      <h2 className="text-base sm:text-lg font-extrabold font-['Quicksand'] text-[#211a14]">
                        Criar Administrador da Direção
                      </h2>
                      <p className="text-xs text-[#5c3f42]">
                        A base de dados está pronta. Registe a primeira conta administrativa para depois cadastrar as Educadoras (Tias), famílias e crianças.
                      </p>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleInitialSetupSubmit} className="space-y-3.5 text-xs">
                    <div>
                      <label htmlFor="setup-admin-name" className="block font-bold text-[#211a14] mb-1">
                        Nome Completo da Diretora / Responsável *
                      </label>
                      <input
                        id="setup-admin-name"
                        type="text"
                        required
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        placeholder="Ex: Dra. Manuela Castro"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#fff8f5] border border-[#eee0d6] text-[#211a14] focus:bg-white focus:border-[#ed145b] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="setup-admin-email" className="block font-bold text-[#211a14] mb-1">
                          E-mail Institucional *
                        </label>
                        <input
                          id="setup-admin-email"
                          type="email"
                          required
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          placeholder="direcao@mayelinkids.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#fff8f5] border border-[#eee0d6] text-[#211a14] focus:bg-white focus:border-[#ed145b] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="setup-admin-nif" className="block font-bold text-[#211a14] mb-1">
                          NIF (Opcional)
                        </label>
                        <input
                          id="setup-admin-nif"
                          type="text"
                          value={adminNif}
                          onChange={(e) => setAdminNif(e.target.value)}
                          placeholder="Ex: 5418192031"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#fff8f5] border border-[#eee0d6] text-[#211a14] focus:bg-white focus:border-[#ed145b] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="setup-admin-password" className="block font-bold text-[#211a14] mb-1">
                        Palavra-passe Segura (mínimo 8 caracteres) *
                      </label>
                      <div className="relative">
                        <input
                          id="setup-admin-password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={8}
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#fff8f5] border border-[#eee0d6] text-[#211a14] focus:bg-white focus:border-[#ed145b] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8c6b6d] hover:text-[#211a14]"
                          aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full min-h-[46px] py-3 px-5 rounded-2xl bg-gradient-to-r from-[#ed145b] to-[#fd9924] hover:from-pink-600 hover:to-amber-500 text-white font-['Quicksand'] font-extrabold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>A criar administrador no Supabase...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Concluir Configuração e Aceder</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                /* REAL CREDENTIAL LOGIN */
                <>
                  <div className="space-y-1 pb-3 border-b border-[#eee0d6]">
                    <h2 className="text-lg sm:text-xl font-extrabold font-['Quicksand'] text-[#211a14]">
                      Iniciar Sessão no Portal
                    </h2>
                    <p className="text-xs text-[#5c3f42]">
                      Introduza o seu e-mail ou NIF e palavra-passe para aceder automaticamente ao seu espaço.
                    </p>
                  </div>

                  {/* Error Message Alert */}
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Login Form */}
                  <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
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
                          autoComplete="username"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="utilizador@mayelin.ao"
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
                          className="text-[#ed145b] hover:text-pink-700 font-bold hover:underline text-[11px] cursor-pointer"
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
                          autoComplete="current-password"
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
                            <span>Entrar no Portal Escolar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
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
                Por motivos de segurança e cumprimento das políticas de proteção de dados (RGPD) para instituições de infância, a criação ou redefinição de credenciais é gerida pela Secretaria Geral da escola.
              </p>
              <div className="p-3.5 bg-[#fff8f5] rounded-2xl border border-[#eee0d6] space-y-1.5 text-[11px]">
                <p className="font-bold text-[#211a14]">Contactos da Secretaria Geral:</p>
                <p className="flex items-center gap-2 text-[#5c3f42]">
                  <Phone className="w-3.5 h-3.5 text-[#ed145b]" />
                  <span>{SCHOOL_CONTACT.phoneDisplay}</span>
                </p>
                <p className="flex items-center gap-2 text-[#5c3f42]">
                  <Mail className="w-3.5 h-3.5 text-[#fd9924]" />
                  <span>{SCHOOL_CONTACT.email}</span>
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
