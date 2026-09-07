import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Star, Smile, Quote } from 'lucide-react';
import { FAQ_ITEMS, TESTIMONIALS } from '../data/mockData';

export default function FaqAndTestimonials() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="duvidas" className="py-16 md:py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* FAQ Accordion Column */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-[#ed145b] font-bold text-xs md:text-sm font-['Nunito_Sans'] mb-2">
              <HelpCircle className="w-4 h-4" />
              <span>Perguntas Frequentes</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-['Quicksand'] text-[#211a14] font-bold">
              Respostas claras para a tranquilidade da sua família
            </h2>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-5 playful-border shadow-sm transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between text-left font-['Quicksand'] text-base sm:text-lg text-[#211a14] font-bold gap-3"
                  >
                    <span>{item.question}</span>
                    <span className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-[#ed145b] shrink-0 transition-transform">
                      {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </span>
                  </button>

                  {isOpen && (
                    <p className="mt-4 text-xs sm:text-sm font-['Nunito_Sans'] text-[#5c3f42] leading-relaxed border-t border-pink-100 pt-3 animate-in fade-in duration-200">
                      {item.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Depoimentos de Pais Column */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-[#8c4f00] font-bold text-xs md:text-sm font-['Nunito_Sans'] mb-2">
              <Smile className="w-4 h-4 text-[#fd9924]" />
              <span>Vozes de Quem Confia</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-['Quicksand'] text-[#211a14] font-bold">
              Histórias reais de afeto e desenvolvimento
            </h3>
          </div>

          <div className="space-y-4">
            {TESTIMONIALS.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-3xl p-5 sm:p-6 playful-border ninos-shadow-sm space-y-3 relative overflow-hidden"
              >
                <Quote className="absolute top-3 right-4 w-12 h-12 text-pink-100 select-none pointer-events-none" />

                <div className="flex items-center gap-1 text-[#FFD13B]">
                  {Array.from({ length: test.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#FFD13B] text-[#FFD13B]" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm font-['Nunito_Sans'] text-[#211a14] italic relative z-10 leading-relaxed">
                  "{test.quote}"
                </p>

                <div className="pt-2 border-t border-pink-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-['Nunito_Sans'] text-[#ed145b] font-bold">
                      {test.parentName}
                    </p>
                    <p className="text-[11px] font-['Nunito_Sans'] text-[#5c3f42]">
                      {test.childInfo}
                    </p>
                  </div>
                  <span className={`text-[10px] font-['Nunito_Sans'] ${test.badgeColor} px-2.5 py-0.5 rounded-full font-bold`}>
                    {test.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
