import { useState, useEffect, useRef } from 'react';
import { Sparkles, MessageCircle, Smartphone, Menu, X, Utensils, Camera, ChevronDown, GraduationCap, School, ChevronRight } from 'lucide-react';
import { SCHOOL_IMAGES, SCHOOL_CONTACT } from '../data/mockData';

interface HeaderProps {
  onOpenPortal: () => void;
  onOpenMenu: () => void;
  onNavigateToSchedule: (ageGroup?: 'bercario' | 'maternal' | 'jardim') => void;
}

export default function Header({ onOpenPortal, onOpenMenu, onNavigateToSchedule }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header
      id="main-school-header"
      className="bg-[#fff8f5]/95 backdrop-blur-md sticky top-0 z-50 border-b border-[#eee0d6]/70 shadow-sm"
    >
      <div className="flex justify-between items-center w-full px-3.5 sm:px-6 md:px-8 lg:px-12 max-w-7xl mx-auto h-16 sm:h-20 py-2">
        {/* Brand Logo with Real School Profile Image */}
        <a
          href="#"
          id="brand-logo-link"
          className="flex items-center gap-2 sm:gap-3 group focus:outline-none min-w-0"
        >
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-[#ed145b] shadow-md group-hover:scale-105 transition-transform duration-300 bg-amber-50 shrink-0">
            <img
              src={SCHOOL_IMAGES.mayelinRealProfile}
              alt="Logo do Jardim Escola da Mayelin"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 border border-white rounded-full" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-base sm:text-lg md:text-2xl font-['Quicksand'] font-bold text-[#ed145b] tracking-tight leading-tight flex items-center gap-1 sm:gap-1.5 truncate">
              <span>Jardim Escola da Mayelin</span>
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFD13B] fill-[#FFD13B] shrink-0" />
            </span>
            <span className="text-[11px] sm:text-xs font-['Nunito_Sans'] text-[#5c3f42] font-semibold tracking-wide truncate">
              Educação Infantil & Creche • Luanda
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav id="desktop-nav" className="hidden lg:flex items-center space-x-5 xl:space-x-6 text-sm font-bold">
          <a
            href="#sobre-nos"
            className="text-[#5c3f42] hover:text-[#ed145b] transition-colors py-1 hover:border-b-2 hover:border-[#ed145b]"
          >
            Sobre Nós
          </a>

          {/* Dropdown: Nossas Turmas, Estrutura e Rotina, Cardápio */}
          <div
            className="relative"
            ref={dropdownRef}
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button
              id="dropdown-turmas-estrutura-trigger"
              type="button"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className={`py-1.5 px-3 rounded-full flex items-center gap-1.5 transition-all text-sm font-bold ${
                dropdownOpen
                  ? 'text-[#ed145b] bg-pink-50 shadow-xs ring-1 ring-pink-200'
                  : 'text-[#5c3f42] hover:text-[#ed145b] hover:bg-pink-50/50'
              }`}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <span>Turmas & Rotina</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180 text-[#ed145b]' : 'text-[#5c3f42]'
                }`}
              />
            </button>

            {/* Dropdown Menu Panel */}
            {dropdownOpen && (
              <div
                id="dropdown-turmas-estrutura-menu"
                className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-80 md:w-[350px] bg-white/98 backdrop-blur-md rounded-2xl p-2.5 shadow-xl border border-pink-100 z-50 animate-in fade-in zoom-in-95 duration-150"
              >
                {/* 1. Nossas Turmas */}
                <div className="space-y-1">
                  <a
                    href="#nossas-turmas"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-pink-50/80 transition-colors group text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center text-[#ed145b] shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-['Quicksand'] font-bold text-[#211a14] group-hover:text-[#ed145b] transition-colors">
                          Nossas Turmas
                        </span>
                        <span className="text-[10px] font-bold text-[#ed145b] bg-pink-100 px-2 py-0.5 rounded-full">
                          0 a 5 anos
                        </span>
                      </div>
                      <p className="text-xs text-[#5c3f42] mt-0.5 leading-snug">
                        Berçário, Maternal I e II e Pré-Escola / Jardim
                      </p>
                    </div>
                  </a>

                  {/* Sub-links quick filter */}
                  <div className="flex items-center gap-1.5 pl-12 pb-1 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setDropdownOpen(false);
                        onNavigateToSchedule('bercario');
                      }}
                      className="px-2.5 py-0.5 rounded-md bg-amber-50 text-[#8c4f00] hover:bg-amber-100 transition-colors"
                    >
                      Berçário
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setDropdownOpen(false);
                        onNavigateToSchedule('maternal');
                      }}
                      className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
                    >
                      Maternal
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setDropdownOpen(false);
                        onNavigateToSchedule('jardim');
                      }}
                      className="px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-800 hover:bg-sky-100 transition-colors"
                    >
                      Jardim
                    </button>
                  </div>
                </div>

                <div className="border-t border-[#eee0d6]/70 my-1" />

                {/* 2. Estrutura & Rotina */}
                <a
                  href="#estrutura-rotina"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-sky-50/80 transition-colors group text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center text-[#00a6c0] shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    <School className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-['Quicksand'] font-bold text-[#211a14] group-hover:text-[#00a6c0] transition-colors">
                        Estrutura & Rotina
                      </span>
                      <span className="text-[10px] font-bold text-[#00a6c0] bg-sky-50 px-2 py-0.5 rounded-full">
                        Espaços
                      </span>
                    </div>
                    <p className="text-xs text-[#5c3f42] mt-0.5 leading-snug">
                      Salas climatizadas, playground, horta e oficinas
                    </p>
                  </div>
                </a>

                <div className="border-t border-[#eee0d6]/70 my-1" />

                {/* 3. Cardápio Nutricional */}
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenMenu();
                  }}
                  className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-amber-50/80 transition-colors group text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-[#fd9924] shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                    <Utensils className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-['Quicksand'] font-bold text-[#211a14] group-hover:text-[#fd9924] transition-colors">
                        Cardápio Nutricional
                      </span>
                      <span className="text-[10px] font-bold text-[#8c4f00] bg-amber-100 px-2 py-0.5 rounded-full">
                        Semanal
                      </span>
                    </div>
                    <p className="text-xs text-[#5c3f42] mt-0.5 leading-snug">
                      Refeições equilibradas e frescas preparadas na escola
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>

          <a
            href="#galeria-real"
            className="text-[#ed145b] hover:text-pink-700 transition-colors py-1 flex items-center gap-1 font-extrabold"
          >
            <Camera className="w-4 h-4 text-[#ed145b]" />
            <span>Fotos Reais</span>
          </a>
          <a
            href="#agendar-visita"
            className="text-[#5c3f42] hover:text-[#ed145b] transition-colors py-1 hover:border-b-2 hover:border-[#ed145b]"
          >
            Agendar Visita
          </a>
        </nav>

        {/* Trailing Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
          <button
            id="open-parent-portal-header-btn"
            type="button"
            onClick={onOpenPortal}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2 md:px-5 md:py-2.5 rounded-full bg-[#ed145b] text-white font-['Nunito_Sans'] font-bold text-xs sm:text-sm shadow-md hover:bg-pink-600 hover:shadow-lg active:scale-95 transition-all duration-150"
          >
            <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span className="hidden sm:inline">Portal da Família</span>
            <span className="sm:hidden">Portal</span>
          </button>

          {/* Mobile menu toggle with min 44px touch target */}
          <button
            id="mobile-menu-toggle-btn"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-11 h-11 rounded-2xl text-[#5c3f42] hover:bg-[#faebe1] active:bg-pink-100 flex items-center justify-center transition-colors touch-manipulation"
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="lg:hidden bg-white/98 backdrop-blur-md border-b border-[#eee0d6] px-4 sm:px-6 py-5 shadow-xl max-h-[calc(100vh-5rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-200"
        >
          <div className="flex flex-col space-y-1 font-semibold text-[#5c3f42]">
            <a
              href="#sobre-nos"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-[44px] flex items-center px-3 rounded-xl hover:bg-pink-50 hover:text-[#ed145b] transition-colors"
            >
              Sobre Nós
            </a>

            {/* Collapsible section for Turmas, Estrutura & Cardápio */}
            <div className="rounded-2xl border border-pink-100 bg-pink-50/40 p-1.5 my-1">
              <button
                type="button"
                onClick={() => setMobileDropdownOpen((prev) => !prev)}
                className="w-full min-h-[44px] flex items-center justify-between px-3 py-2 rounded-xl text-[#211a14] font-bold text-sm"
              >
                <span className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#ed145b]" />
                  <span>Turmas, Estrutura & Cardápio</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-[#ed145b] transition-transform duration-200 ${
                    mobileDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {mobileDropdownOpen && (
                <div className="pt-1 pb-1 px-1 space-y-1 text-xs">
                  <a
                    href="#nossas-turmas"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] flex items-center justify-between px-3 py-2 rounded-xl bg-white text-[#5c3f42] hover:text-[#ed145b] font-semibold shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <GraduationCap className="w-4 h-4 text-[#ed145b]" />
                      <span>Nossas Turmas (0 a 5 anos)</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </a>

                  <a
                    href="#estrutura-rotina"
                    onClick={() => setMobileMenuOpen(false)}
                    className="min-h-[44px] flex items-center justify-between px-3 py-2 rounded-xl bg-white text-[#5c3f42] hover:text-[#00a6c0] font-semibold shadow-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <School className="w-4 h-4 text-[#00a6c0]" />
                      <span>Estrutura Viva & Ambientes</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenMenu();
                    }}
                    className="w-full min-h-[44px] flex items-center justify-between px-3 py-2 rounded-xl bg-white text-[#5c3f42] hover:text-[#fd9924] font-semibold shadow-xs text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Utensils className="w-4 h-4 text-[#fd9924]" />
                      <span>Cardápio Semanal Nutricional</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              )}
            </div>

            <a
              href="#galeria-real"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-[44px] flex items-center gap-2 px-3 rounded-xl text-[#ed145b] font-bold hover:bg-pink-50 transition-colors"
            >
              <Camera className="w-4 h-4 text-[#ed145b]" />
              <span>Fotos Reais da Escola (Facebook)</span>
            </a>
            <a
              href="#agendar-visita"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-[44px] flex items-center px-3 rounded-xl hover:bg-pink-50 hover:text-[#ed145b] transition-colors"
            >
              Agendar Visita Guiada
            </a>
            <a
              href="#duvidas"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-[44px] flex items-center px-3 rounded-xl hover:bg-pink-50 hover:text-[#ed145b] transition-colors"
            >
              Perguntas Frequentes (FAQ)
            </a>
            <a
              href="#contato"
              onClick={() => setMobileMenuOpen(false)}
              className="min-h-[44px] flex items-center px-3 rounded-xl hover:bg-pink-50 hover:text-[#ed145b] transition-colors"
            >
              Localização & Contato
            </a>
          </div>

          <div className="pt-4 border-t border-[#eee0d6] flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPortal();
              }}
              className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-[#ed145b] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-pink-600 active:scale-98 transition-all"
            >
              <Smartphone className="w-4 h-4" />
              <span>Acessar Diário & Portal da Família</span>
            </button>
            <a
              href={`https://wa.me/${SCHOOL_CONTACT.phoneClean}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[48px] py-3 px-4 rounded-2xl bg-[#FFF7ED] border border-[#fd9924] text-[#8c4f00] font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-100 transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#fd9924]" />
              <span>Falar no WhatsApp ({SCHOOL_CONTACT.phoneDisplay})</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
