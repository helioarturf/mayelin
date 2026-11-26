import { useState, useEffect } from 'react';
import TopBanner from './components/TopBanner';
import Header from './components/Header';
import Hero from './components/Hero';
import AboutSection from './components/AboutSection';
import ClassesSection from './components/ClassesSection';
import FacilitiesSection from './components/FacilitiesSection';
import ParentPortalSection from './components/ParentPortalSection';
import ParentPortalModal from './components/ParentPortalModal';
import VisitScheduler from './components/VisitScheduler';
import FaqAndTestimonials from './components/FaqAndTestimonials';
import ContactAndMap from './components/ContactAndMap';
import MealMenuModal from './components/MealMenuModal';
import Footer from './components/Footer';
import RealPhotosGallery from './components/RealPhotosGallery';

import { SCHOOL_CONTACT } from './data/mockData';
import { AgeGroup, UserRole } from './types';
import { MessageCircle, Smartphone, ArrowUp } from 'lucide-react';

export default function App() {
  const [isPortalOpen, setIsPortalOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.location.pathname === '/portal' || new URLSearchParams(window.location.search).get('portal') === '1';
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [portalRole, setPortalRole] = useState<UserRole>('pais');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup>('bercario');
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenPortalWithRole = (role?: UserRole) => {
    if (role) setPortalRole(role);
    setIsPortalOpen(true);
  };

  const handleSelectClassroom = (ageGroup: AgeGroup) => {
    setSelectedAgeGroup(ageGroup);
    const visitSection = document.getElementById('agendar-visita');
    if (visitSection) {
      visitSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isPortalOpen) {
    return (
      <ParentPortalModal
        isOpen={true}
        onClose={() => {
          setIsPortalOpen(false);
          if (typeof window !== 'undefined' && window.location.pathname === '/portal') {
            window.history.replaceState({}, '', '/');
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentRole={portalRole}
        onChangeRole={setPortalRole}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fff8f5] text-[#211a14] font-['Nunito_Sans'] antialiased selection:bg-pink-200 selection:text-[#ed145b]">
      {/* 1. Top Utility Notification Strip */}
      <TopBanner />

      {/* 2. Main Header / Navigation */}
      <Header
        onOpenPortal={() => setIsPortalOpen(true)}
        onOpenMenu={() => setIsMenuOpen(true)}
        onNavigateToSchedule={handleSelectClassroom}
      />

      <main className="flex-1">
        {/* 3. Hero Section */}
        <Hero onOpenPortal={() => setIsPortalOpen(true)} />

        {/* 4. Sobre Nós & Essência Pedagógica */}
        <AboutSection />

        {/* 5. Nossas Turmas */}
        <ClassesSection onSelectClassroom={handleSelectClassroom} />

        {/* 6. Estrutura Viva & Oficinas Inclusas */}
        <FacilitiesSection onOpenMenu={() => setIsMenuOpen(true)} />

        {/* 6.5. Galeria de Fotos Reais */}
        <RealPhotosGallery />

        {/* 7. Gestão Integrada & Portal Escolar */}
        <ParentPortalSection onOpenPortal={handleOpenPortalWithRole} />

        {/* 8. Agendamento Interativo de Visita (Gravado no Supabase) */}
        <VisitScheduler
          selectedAgeGroup={selectedAgeGroup}
          onChangeAgeGroup={setSelectedAgeGroup}
        />

        {/* 9. Perguntas Frequentes (FAQ) & Depoimentos */}
        <FaqAndTestimonials />

        {/* 10. Localização, Contato & Mapa */}
        <ContactAndMap />
      </main>

      {/* 11. Footer Institucional */}
      <Footer
        onOpenPortal={() => handleOpenPortalWithRole()}
        onOpenMenu={() => setIsMenuOpen(true)}
      />

      {/* Nutritional Weekly Menu Modal */}
      <MealMenuModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      {/* Floating Quick Action Buttons */}
      <div className="fixed bottom-4 sm:bottom-5 right-4 sm:right-5 z-40 flex flex-col items-end gap-2.5">
        {showBackToTop && (
          <button
            type="button"
            onClick={scrollToTop}
            className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-white/95 backdrop-blur-md text-[#5c3f42] border border-[#eee0d6] shadow-md flex items-center justify-center hover:bg-[#ed145b] hover:text-white transition-all duration-200"
            aria-label="Voltar ao topo"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}

        <button
          type="button"
          onClick={() => handleOpenPortalWithRole()}
          aria-label="Aceder ao Portal"
          className="min-h-[44px] min-w-[44px] px-3 sm:px-4 py-2.5 rounded-full bg-[#ed145b] text-white text-xs sm:text-sm font-bold shadow-lg hover:bg-pink-600 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Smartphone className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Aceder Portal</span>
        </button>

        <a
          href={`https://wa.me/${SCHOOL_CONTACT.phoneClean}?text=Olá!%20Gostaria%20de%20tirar%20dúvidas%20sobre%20as%20matrículas%20do%20Jardim%20Escola%20da%20Mayelin.`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Conversar no WhatsApp"
          className="min-h-[44px] min-w-[44px] px-3 sm:px-4 py-2.5 rounded-full bg-[#2ca568] text-white text-xs sm:text-sm font-bold shadow-lg hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
