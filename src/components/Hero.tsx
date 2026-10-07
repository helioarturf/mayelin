import { Calendar, Smartphone, ShieldCheck, GraduationCap, Lock, UtensilsCrossed, Bell, Sprout, Sparkles } from 'lucide-react';
import { SCHOOL_IMAGES } from '../data/mockData';

interface HeroProps {
  onOpenPortal: () => void;
}

export default function Hero({ onOpenPortal }: HeroProps) {
  return (
    <section
      id="hero-section"
      className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto"
    >
      {/* Playful Ambient Blobs */}
      <div className="absolute -top-16 -left-16 w-80 h-80 bg-pink-200/40 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-40 right-0 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        {/* Text & Action Column */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-6">
          {/* Notification Pill */}
          <div
            id="hero-badge"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-pink-100 shadow-sm text-xs md:text-sm font-['Nunito_Sans'] text-[#ed145b] font-bold"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#ed145b] animate-ping" />
            <span>Matrículas Abertas para 2026 • Vagas Limitadas</span>
          </div>

          {/* Headline */}
          <h1
            id="hero-headline"
            className="text-2xl sm:text-4xl lg:text-5xl font-['Quicksand'] font-bold text-[#211a14] tracking-tight leading-tight"
          >
            Onde o amor e o aprendizado florescem em{' '}
            <span className="text-[#ed145b] underline decoration-[#FFD13B] decoration-wavy underline-offset-4 sm:underline-offset-8">
              cada descoberta
            </span>
          </h1>

          {/* Empathic Subtitle */}
          <p className="text-sm sm:text-base md:text-lg font-['Nunito_Sans'] text-[#5c3f42] max-w-2xl leading-relaxed">
            Cuidamos dos primeiros passos do seu filho com infraestrutura segura, pedagogia afetiva,
            alimentação supervisionada por nutricionista e acompanhamento em tempo real para toda a família.
          </p>

          {/* CTAs Cluster */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-4 pt-2 w-full">
            <a
              id="hero-cta-schedule"
              href="#agendar-visita"
              className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 sm:py-4 rounded-full bg-[#ed145b] text-white font-['Nunito_Sans'] font-bold text-sm sm:text-base ninos-shadow-lg hover:bg-pink-600 hover:scale-105 active:scale-95 transition-all text-center"
            >
              <Calendar className="w-5 h-5 shrink-0" />
              <span>Agendar Visita Guiada</span>
            </a>

            <a
              id="hero-cta-turmas"
              href="#nossas-turmas"
              className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-full bg-white border-2 border-[#fd9924]/40 text-[#211a14] font-['Nunito_Sans'] font-bold text-sm sm:text-base hover:border-[#fd9924] hover:bg-amber-50/50 shadow-sm transition-all text-center"
            >
              <span>Conhecer Nossas Turmas</span>
            </a>

            <button
              id="hero-cta-portal"
              type="button"
              onClick={onOpenPortal}
              className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 rounded-full bg-[#00a6c0] text-white font-['Nunito_Sans'] font-bold text-sm sm:text-base shadow-md hover:bg-teal-600 active:scale-95 transition-all text-center"
            >
              <Smartphone className="w-5 h-5 shrink-0" />
              <span>Área dos Pais & Diário</span>
            </button>
          </div>

          {/* Trust Badges & Indicators */}
          <div className="pt-6 w-full border-t border-[#eee0d6]/70 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-pink-100 flex items-center justify-center text-[#ed145b] shrink-0 shadow-sm">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[11px] sm:text-xs font-['Nunito_Sans'] text-[#5c3f42] font-bold leading-snug">
                +12 Anos de Dedicação
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-amber-100 flex items-center justify-center text-[#fd9924] shrink-0 shadow-sm">
                <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[11px] sm:text-xs font-['Nunito_Sans'] text-[#5c3f42] font-bold leading-snug">
                100% Educadores
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-sky-100 flex items-center justify-center text-[#00a6c0] shrink-0 shadow-sm">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[11px] sm:text-xs font-['Nunito_Sans'] text-[#5c3f42] font-bold leading-snug">
                Monitoramento Seguro
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-100 flex items-center justify-center text-[#2ca568] shrink-0 shadow-sm">
                <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[11px] sm:text-xs font-['Nunito_Sans'] text-[#5c3f42] font-bold leading-snug">
                Nutrição Infantil
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5 col-span-2 sm:col-span-1">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0 shadow-sm">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[11px] sm:text-xs font-['Nunito_Sans'] text-[#5c3f42] font-bold leading-snug">
                Diário em Tempo Real
              </span>
            </div>
          </div>
        </div>

        {/* Visual Hero Card Showcase in Niños Rounded Arch Frame */}
        <div className="lg:col-span-5 relative">
          <div className="relative bg-white rounded-3xl p-4 sm:p-5 ninos-shadow-lg playful-border overflow-hidden">
            {/* Corner Playful Badge */}
            <div className="absolute -top-3 -right-3 w-16 h-16 bg-[#FFD13B]/30 rounded-full blur-sm -z-10" />

            {/* Hero School Imagery */}
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#faebe1] border-4 border-amber-100/70 shadow-inner group">
              <img
                id="hero-main-image"
                src={SCHOOL_IMAGES.heroClassroom}
                alt="Sala de aula pré-escolar acolhedora e iluminada onde educadoras e crianças constroem com blocos de madeira"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />

              {/* Floating Live Activity Pill */}
              <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 bg-white/95 backdrop-blur-md p-2 sm:p-3 rounded-2xl border border-pink-100 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[#2ca568] shrink-0">
                    <Sprout className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] sm:text-xs font-['Nunito_Sans'] text-[#211a14] font-bold leading-tight flex items-center gap-1 truncate">
                      <span className="truncate">Momento Horta</span>
                      <Sparkles className="w-3 h-3 text-[#fd9924] shrink-0" />
                    </p>
                    <p className="text-[10px] sm:text-[11px] font-['Nunito_Sans'] text-[#5c3f42] truncate">
                      Maternal II • Há 12m
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-['Nunito_Sans'] bg-emerald-500 text-white font-bold animate-pulse shrink-0">
                  Ao Vivo
                </span>
              </div>

              {/* Floating Real Facebook Profile Badge */}
              <a
                href="#galeria-real"
                className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 bg-white/95 backdrop-blur-md p-1.5 pr-2.5 sm:pr-3 rounded-full border border-blue-200 shadow-md flex items-center gap-1.5 sm:gap-2 hover:scale-105 transition-transform"
              >
                <img
                  src={SCHOOL_IMAGES.mayelinRealProfile}
                  alt="Perfil Real Jardim Escola da Mayelin"
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-blue-400 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="flex flex-col text-left">
                  <span className="text-[9px] sm:text-[10px] font-bold text-[#1877F2] leading-none">
                    Facebook Oficial
                  </span>
                  <span className="text-[8px] sm:text-[9px] text-[#5c3f42] font-semibold leading-tight">
                    Luanda • 215 curtidas
                  </span>
                </div>
              </a>
            </div>

            {/* Mini Indicators Under Hero Image */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-3 sm:mt-4 text-center">
              <div className="bg-pink-50/90 p-2 sm:p-3 rounded-2xl border border-pink-100">
                <span className="text-base sm:text-xl font-['Quicksand'] text-[#ed145b] block font-bold">
                  1:3
                </span>
                <span className="text-[10px] sm:text-xs font-['Nunito_Sans'] text-[#5c3f42] font-semibold block truncate">
                  Educador/Bebê
                </span>
              </div>

              <div className="bg-amber-50/90 p-2 sm:p-3 rounded-2xl border border-amber-100">
                <span className="text-base sm:text-xl font-['Quicksand'] text-[#fd9924] block font-bold">
                  1.200m²
                </span>
                <span className="text-[10px] sm:text-xs font-['Nunito_Sans'] text-[#5c3f42] font-semibold block truncate">
                  Área Verde
                </span>
              </div>

              <div className="bg-sky-50/90 p-2 sm:p-3 rounded-2xl border border-sky-100">
                <span className="text-base sm:text-xl font-['Quicksand'] text-[#00a6c0] block font-bold">
                  5 Refeições
                </span>
                <span className="text-[10px] sm:text-xs font-['Nunito_Sans'] text-[#5c3f42] font-semibold block truncate">
                  Cardápio Fresco
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
