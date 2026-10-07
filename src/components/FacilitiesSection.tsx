import { Music, Activity, Palette, Globe, Utensils } from 'lucide-react';
import { FACILITIES, WORKSHOPS } from '../data/mockData';

interface FacilitiesSectionProps {
  onOpenMenu: () => void;
}

export default function FacilitiesSection({ onOpenMenu }: FacilitiesSectionProps) {
  return (
    <section
      id="estrutura-rotina"
      className="py-12 sm:py-16 md:py-24 bg-[#fff1e7] border-y border-[#eee0d6]/60"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        {/* Header Block */}
        <div className="max-w-3xl mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-[#ed145b] font-bold text-xs md:text-sm font-['Nunito_Sans'] mb-2">
            <span>Espaços Projetados para Encantar</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-['Quicksand'] text-[#211a14] font-bold">
            Nossa Estrutura Viva & Oficinas Inclusas
          </h2>

          <p className="text-sm sm:text-base md:text-lg font-['Nunito_Sans'] text-[#5c3f42] mt-2">
            Um refúgio verdejante e seguro no coração da cidade, onde tudo foi concebido na altura dos olhos e das mãozinhas das crianças.
          </p>
        </div>

        {/* Cards dos 4 Ambientes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 mb-10 sm:mb-16">
          {FACILITIES.map((facility) => (
            <div
              key={facility.id}
              id={`ambiente-${facility.id}`}
              className="bg-white rounded-3xl overflow-hidden playful-border ninos-shadow-sm flex flex-col group hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className="h-44 sm:h-48 overflow-hidden bg-[#faebe1] relative">
                <img
                  src={facility.image}
                  alt={facility.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className={`absolute top-3 left-3 ${facility.tagColor} px-3 py-1 rounded-full text-[11px] font-['Nunito_Sans'] font-bold shadow-sm`}>
                  {facility.tag}
                </div>
              </div>

              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-base sm:text-lg font-['Quicksand'] text-[#211a14] mb-1.5 font-bold leading-snug">
                    {facility.title}
                  </h4>
                  <p className="text-xs sm:text-sm font-['Nunito_Sans'] text-[#5c3f42] leading-relaxed">
                    {facility.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Oficinas Extracurriculares Inclusas */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 md:p-8 playful-border ninos-shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 sm:mb-8 pb-5 sm:pb-6 border-b border-[#eee0d6]/70 gap-4">
            <div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-['Quicksand'] text-[#211a14] font-bold">
                Oficinas Pedagógicas Inclusas na Mensalidade
              </h3>
              <p className="text-xs sm:text-sm font-['Nunito_Sans'] text-[#5c3f42] mt-1">
                Sem custos adicionais para que seu filho experimente múltiplas linguagens e talentos.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={onOpenMenu}
                className="min-h-[40px] inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFF7ED] border border-[#fd9924] text-[#8c4f00] text-xs font-['Nunito_Sans'] font-bold hover:bg-[#fd9924] hover:text-white transition-colors"
              >
                <Utensils className="w-3.5 h-3.5 text-[#fd9924]" />
                <span>Ver Cardápio Nutricional</span>
              </button>

              <div className="min-h-[40px] inline-flex items-center gap-1.5 text-xs font-['Nunito_Sans'] text-[#8c4f00] font-bold bg-amber-50 px-4 py-2 rounded-full border border-amber-200">
                <span>100% Integradas à Grade</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WORKSHOPS.map((workshop) => {
              const IconComponent =
                workshop.id === 'musica'
                  ? Music
                  : workshop.id === 'psicomotricidade'
                  ? Activity
                  : workshop.id === 'artes'
                  ? Palette
                  : Globe;

              return (
                <div
                  key={workshop.id}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-[#fff8f5] border border-[#faebe1] hover:scale-105 transition-transform"
                >
                  <div className={`w-12 h-12 rounded-full ${workshop.textClass} flex items-center justify-center shrink-0 shadow-sm`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-sm sm:text-base font-['Nunito_Sans'] text-[#211a14] font-bold">
                      {workshop.title}
                    </h5>
                    <p className="text-xs font-['Nunito_Sans'] text-[#5c3f42] mt-1 leading-relaxed">
                      {workshop.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
