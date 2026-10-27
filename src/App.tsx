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
import OfflineIndicator from './components/OfflineIndicator';
import { seedDatabase } from './services/seedData';
import { syncManager } from './services/syncManager';

import { INITIAL_STUDENTS, INITIAL_PICKUP_AUTHORIZATIONS, INITIAL_ANNOUNCEMENTS, SCHOOL_CONTACT } from './data/mockData';
import { AgeGroup, Student, PickupAuthorization, VisitAppointment, UserRole, SchoolAnnouncement, DailyLogItem } from './types';
import { MessageCircle, Smartphone, Calendar, ArrowUp } from 'lucide-react';

export default function App() {
  useEffect(() => {
    seedDatabase();
    syncManager.sync();
  }, []);
  // Modal states
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Active portal role state (admin, educador/professor, pais)
  const [portalRole, setPortalRole] = useState<UserRole>('pais');

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

  // School Announcements state with localStorage
  const [announcements, setAnnouncements] = useState<SchoolAnnouncement[]>(() => {
    try {
      const saved = localStorage.getItem('mayelin_announcements');
      return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
    } catch {
      return INITIAL_ANNOUNCEMENTS;
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
    localStorage.setItem('mayelin_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('mayelin_authorizations', JSON.stringify(authorizations));
  }, [authorizations]);

  useEffect(() => {
    localStorage.setItem('mayelin_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('mayelin_announcements', JSON.stringify(announcements));
  }, [announcements]);

  const handleAddAuthorization = (newAuth: Omit<PickupAuthorization, 'id' | 'createdAt'>) => {
    const created: PickupAuthorization = {
      ...newAuth,
      id: `auth-${Date.now()}`,
      createdAt: 'Agora'
    };
    setAuthorizations((prev) => [created, ...prev]);
  };

  const handleUpdateAuthorizationStatus = (id: string, status: 'Aprovado' | 'Pendente') => {
    setAuthorizations((prev) =>
      prev.map((auth) => (auth.id === id ? { ...auth, status } : auth))
    );
  };

  const handleBookAppointment = (apt: VisitAppointment) => {
    setAppointments((prev) => [apt, ...prev]);
  };

  const handleUpdateAppointmentStatus = (id: string, status: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, notes: status } : apt))
    );
  };

  const handleAddAnnouncement = (anc: Omit<SchoolAnnouncement, 'id'>) => {
    const created: SchoolAnnouncement = {
      ...anc,
      id: `anc-${Date.now()}`
    };
    setAnnouncements((prev) => [created, ...prev]);
  };

  const handleAddDailyLog = (studentId: string, log: Omit<DailyLogItem, 'id'>) => {
    const newLog: DailyLogItem = {
      ...log,
      id: `log-${Date.now()}`
    };
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            dailyLogs: [newLog, ...s.dailyLogs]
          };
        }
        return s;
      })
    );
  };

  const handleUpdateStudentStatus = (studentId: string, status: Student['status']) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status } : s))
    );
  };

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

  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];

  // Render Portal as a Full Dedicated Page instead of a modal
  if (isPortalOpen) {
    return (
      <ParentPortalModal
        isOpen={true}
        onClose={() => {
          setIsPortalOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        students={students}
        activeStudentId={activeStudentId}
        onSelectStudent={setActiveStudentId}
        authorizations={authorizations}
        onAddAuthorization={handleAddAuthorization}
        onUpdateAuthorizationStatus={handleUpdateAuthorizationStatus}
        appointments={appointments}
        onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
        announcements={announcements}
        onAddAnnouncement={handleAddAnnouncement}
        onAddDailyLog={handleAddDailyLog}
        onUpdateStudentStatus={handleUpdateStudentStatus}
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

        {/* 7. Gestão Integrada & Portal Escolar (3 Perfis: Gestão, Educadora (Tia), Pais) */}
        <ParentPortalSection
          onOpenPortal={handleOpenPortalWithRole}
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
      <OfflineIndicator />
    </div>
  );
}
