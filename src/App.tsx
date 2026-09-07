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

import { INITIAL_STUDENTS, INITIAL_PICKUP_AUTHORIZATIONS, SCHOOL_CONTACT } from './data/mockData';
import { AgeGroup, Student, PickupAuthorization, VisitAppointment } from './types';
import { MessageCircle, Smartphone, Calendar, ArrowUp } from 'lucide-react';

export default function App() {
  // Modal states
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Selected age group for classroom & visit scheduler
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup>('bercario');

  // Students state with localStorage
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('mayelin_students');
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [activeStudentId, setActiveStudentId] = useState<string>('lucas-mayelin');

  // Authorizations state with localStorage
  const [authorizations, setAuthorizations] = useState<PickupAuthorization[]>(() => {
    try {
      const saved = localStorage.getItem('mayelin_authorizations');
      return saved ? JSON.parse(saved) : INITIAL_PICKUP_AUTHORIZATIONS;
    } catch {
      return INITIAL_PICKUP_AUTHORIZATIONS;
    }
  });

  // Appointments state with localStorage
  const [appointments, setAppointments] = useState<VisitAppointment[]>(() => {
    try {
      const saved = localStorage.getItem('mayelin_appointments');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Show back to top button
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem('mayelin_authorizations', JSON.stringify(authorizations));
  }, [authorizations]);

  useEffect(() => {
    localStorage.setItem('mayelin_appointments', JSON.stringify(appointments));
  }, [appointments]);

  const handleAddAuthorization = (newAuth: Omit<PickupAuthorization, 'id' | 'createdAt'>) => {
    const created: PickupAuthorization = {
      ...newAuth,
      id: `auth-${Date.now()}`,
      createdAt: 'Agora'
    };
    setAuthorizations((prev) => [created, ...prev]);
  };

  const handleBookAppointment = (apt: VisitAppointment) => {
    setAppointments((prev) => [apt, ...prev]);
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

  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];

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
        {/* 3. Hero Section with Arch Imagery and Micro Live Activity */}
        <Hero onOpenPortal={() => setIsPortalOpen(true)} />

        {/* 4. Sobre Nós & Essência Pedagógica (3 Pilares) */}
        <AboutSection />

        {/* 5. Nossas Turmas (Berçário, Maternal, Pré-Escola & Jardim) */}
        <ClassesSection onSelectClassroom={handleSelectClassroom} />

        {/* 6. Estrutura Viva & Oficinas Inclusas */}
        <FacilitiesSection onOpenMenu={() => setIsMenuOpen(true)} />

        {/* 6.5. Galeria de Fotos Reais & Facebook Oficial */}
        <RealPhotosGallery />

        {/* 7. Gestão Integrada & Portal da Família (Smartphone Showcase) */}
        <ParentPortalSection
          onOpenPortal={() => setIsPortalOpen(true)}
          activeStudent={activeStudent}
        />

        {/* 8. Agendamento Interativo de Visita & Pré-Matrícula */}
        <VisitScheduler
          selectedAgeGroup={selectedAgeGroup}
          onChangeAgeGroup={setSelectedAgeGroup}
          onAppointmentBooked={handleBookAppointment}
        />

        {/* 9. Perguntas Frequentes (FAQ) & Depoimentos Reais */}
        <FaqAndTestimonials />

        {/* 10. Localização, Contato & Mapa */}
        <ContactAndMap />
      </main>

      {/* 11. Footer Institucional */}
      <Footer
        onOpenPortal={() => setIsPortalOpen(true)}
        onOpenMenu={() => setIsMenuOpen(true)}
      />

      {/* Interactive Parent Portal Modal */}
      <ParentPortalModal
        isOpen={isPortalOpen}
        onClose={() => setIsPortalOpen(false)}
        students={students}
        activeStudentId={activeStudentId}
        onSelectStudent={setActiveStudentId}
        authorizations={authorizations}
        onAddAuthorization={handleAddAuthorization}
      />

      {/* Nutritional Weekly Menu Modal */}
      <MealMenuModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      {/* Floating Quick Action Buttons */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5">
        {showBackToTop && (
          <button
            type="button"
            onClick={scrollToTop}
            className="w-11 h-11 rounded-full bg-white/95 backdrop-blur-md text-[#5c3f42] border border-[#eee0d6] shadow-md flex items-center justify-center hover:bg-[#ed145b] hover:text-white transition-all duration-200"
            aria-label="Voltar ao topo"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsPortalOpen(true)}
          className="px-4 py-2.5 rounded-full bg-[#ed145b] text-white text-xs sm:text-sm font-bold shadow-lg hover:bg-pink-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <Smartphone className="w-4 h-4" />
          <span className="hidden sm:inline">Diário do Aluno</span>
        </button>

        <a
          href={`https://wa.me/${SCHOOL_CONTACT.phoneClean}?text=Olá!%20Gostaria%20de%20tirar%20dúvidas%20sobre%20as%20matrículas%20do%20Jardim%20Escola%20da%20Mayelin.`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-full bg-[#2ca568] text-white text-xs sm:text-sm font-bold shadow-lg hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Fale Conosco</span>
        </a>
      </div>
    </div>
  );
}
