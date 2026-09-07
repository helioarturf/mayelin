import { useState } from 'react';
import { Sparkles, MessageCircle, Smartphone, Menu, X, Utensils, Camera } from 'lucide-react';
import { SCHOOL_IMAGES, SCHOOL_CONTACT } from '../data/mockData';

interface HeaderProps {
  onOpenPortal: () => void;
  onOpenMenu: () => void;
  onNavigateToSchedule: (ageGroup?: 'bercario' | 'maternal' | 'jardim') => void;
}

export default function Header({ onOpenPortal, onOpenMenu, onNavigateToSchedule }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      id="main-school-header"
      className="bg-[#fff8f5]/95 backdrop-blur-md sticky top-0 z-50 border-b border-[#eee0d6]/70 shadow-sm"
    >
      <div className="flex justify-between items-center w-full px-4 md:px-8 lg:px-12 max-w-7xl mx-auto h-20 py-2">
        {/* Brand Logo with Real School Profile Image */}
        <a
          href="#"
          id="brand-logo-link"
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="relative w-11 h-11 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-[#ed145b] shadow-md group-hover:scale-105 transition-transform duration-300 bg-amber-50 shrink-0">
            <img
              src={SCHOOL_IMAGES.mayelinRealProfile}
              alt="Logo do Jardim Escola da Mayelin"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border border-white rounded-full" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-['Quicksand'] font-bold text-[#ed145b] tracking-tight leading-tight flex items-center gap-1.5">
              Jardim Escola da Mayelin
              <Sparkles className="w-4 h-4 text-[#FFD13B] fill-[#FFD13B]" />
            </span>
            <span className="text-xs font-['Nunito_Sans'] text-[#5c3f42] font-semibold tracking-wide flex items-center gap-1">
              <span>Educação Infantil & Creche • Luanda</span>
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav id="desktop-nav" className="hidden lg:flex items-center space-x-6 text-sm font-bold">
          <a
            href="#sobre-nos"
            className="text-[#5c3f42] hover:text-[#ed145b] transition-colors py-1 hover:border-b-2 hover:border-[#ed145b]"
          >
            Sobre Nós
          </a>
          <a
            href="#nossas-turmas"
            className="text-[#5c3f42] hover:text-[#ed145b] transition-colors py-1 hover:border-b-2 hover:border-[#ed145b]"
          >
            Nossas Turmas
          </a>
          <a
            href="#estrutura-rotina"
            className="text-[#5c3f42] hover:text-[#ed145b] transition-colors py-1 hover:border-b-2 hover:border-[#ed145b]"
          >
            Estrutura & Rotina
          </a>
          <a
            href="#galeria-real"
            className="text-[#ed145b] hover:text-pink-700 transition-colors py-1 flex items-center gap-1 font-extrabold"
          >
            <Camera className="w-4 h-4 text-[#ed145b]" />
            <span>Fotos Reais</span>
          </a>
          <button
            type="button"
            onClick={onOpenMenu}
            className="text-[#5c3f42] hover:text-[#fd9924] transition-colors flex items-center gap-1.5 py-1"
          >
            <Utensils className="w-4 h-4 text-[#fd9924]" />
            <span>Cardápio</span>
          </button>
          <a
            href="#agendar-visita"
            className="text-[#5c3f42] hover:text-[#ed145b] transition-colors py-1 hover:border-b-2 hover:border-[#ed145b]"
          >
            Agendar Visita
          </a>
          <a
            href="#contato"
            className="text-[#5c3f42] hover:text-[#ed145b] transition-colors py-1 hover:border-b-2 hover:border-[#ed145b]"
          >
            Contato
          </a>
        </nav>

        {/* Trailing Action Buttons */}
        <div className="flex items-center gap-2 md:gap-3">
          <a
            id="whatsapp-header-btn"
            href={`https://wa.me/${SCHOOL_CONTACT.phoneClean}?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20as%20matrículas%20do%20Jardim%20Escola%20da%20Mayelin.`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 md:px-4 md:py-2.5 rounded-full border-2 border-[#fd9924]/60 text-[#8c4f00] font-bold bg-[#FFF7ED] hover:bg-[#fd9924] hover:text-white text-xs md:text-sm transition-all duration-200 shadow-sm"
          >
            <MessageCircle className="w-4 h-4 text-[#fd9924] group-hover:text-white" />
            <span>{SCHOOL_CONTACT.phoneDisplay}</span>
          </a>

          <button
            id="open-parent-portal-header-btn"
            type="button"
            onClick={onOpenPortal}
            className="inline-flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full bg-[#ed145b] text-white font-['Nunito_Sans'] font-bold text-xs md:text-sm shadow-md hover:bg-pink-600 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-150"
          >
            <Smartphone className="w-4 h-4" />
            <span>Portal da Família</span>
          </button>

          {/* Mobile menu toggle */}
          <button
            id="mobile-menu-toggle-btn"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-[#5c3f42] hover:bg-[#faebe1] transition-colors"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-nav-drawer" className="lg:hidden bg-white border-b border-[#eee0d6] px-6 py-5 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-3 font-semibold text-[#5c3f42]">
            <a
              href="#sobre-nos"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#faebe1] hover:text-[#ed145b]"
            >
              Sobre Nós
            </a>
            <a
              href="#nossas-turmas"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#faebe1] hover:text-[#ed145b]"
            >
              Nossas Turmas (Berçário, Maternal, Jardim)
            </a>
            <a
              href="#estrutura-rotina"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#faebe1] hover:text-[#ed145b]"
            >
              Estrutura Viva & Oficinas
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenMenu();
              }}
              className="py-2 text-left flex items-center gap-2 border-b border-[#faebe1] hover:text-[#fd9924]"
            >
              <Utensils className="w-4 h-4 text-[#fd9924]" />
              <span>Cardápio Semanal Nutricional</span>
            </button>
            <a
              href="#agendar-visita"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#faebe1] hover:text-[#ed145b]"
            >
              Agendar Visita Guiada
            </a>
            <a
              href="#duvidas"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 border-b border-[#faebe1] hover:text-[#ed145b]"
            >
              Perguntas Frequentes (FAQ)
            </a>
            <a
              href="#galeria-real"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 text-[#ed145b] font-bold flex items-center gap-1.5"
            >
              <Camera className="w-4 h-4" />
              <span>Fotos Reais da Escola (Facebook)</span>
            </a>
            <a
              href="#contato"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-[#ed145b]"
            >
              Localização & Contato
            </a>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPortal();
              }}
              className="w-full py-3 rounded-full bg-[#ed145b] text-white font-bold text-sm flex items-center justify-center gap-2 shadow"
            >
              <Smartphone className="w-4 h-4" />
              <span>Acessar Diário & Portal da Família</span>
            </button>
            <a
              href={`https://wa.me/${SCHOOL_CONTACT.phoneClean}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-full bg-[#FFF7ED] border border-[#fd9924] text-[#8c4f00] font-bold text-sm flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-[#fd9924]" />
              <span>Falar no WhatsApp {SCHOOL_CONTACT.phoneDisplay}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
