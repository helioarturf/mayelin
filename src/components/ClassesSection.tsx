import { ArrowRight, CheckCircle2, Baby } from 'lucide-react';
import { CLASSROOMS } from '../data/mockData';
import { AgeGroup } from '../types';

interface ClassesSectionProps {
  onSelectClassroom: (ageGroup: AgeGroup) => void;
}

export default function ClassesSection({ onSelectClassroom }: ClassesSectionProps) {
  return (
    <section id="nossas-turmas" className="py-16 md:py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-[#8c4f00] font-bold text-xs md:text-sm font-['Nunito_Sans'] mb-2">
            <Baby className="w-4 h-4 text-[#fd9924]" />
            <span>Ciclos de Desenvolvimento</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-['Quicksand'] text-[#211a14] font-bold">
            Espaços planejados para cada idade e necessidade
          </h2>
        </div>

        <p className="text-sm sm:text-base font-['Nunito_Sans'] text-[#5c3f42] max-w-md">
          Ambientes separados acusticamente e pedagogicamente, respeitando a sensibilidade e o ritmo de cada fase da primeira infância.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {CLASSROOMS.map((cls) => {
          return (
            <div
              key={cls.id}
              id={`turma-card-${cls.id}`}
              className={`bg-white rounded-3xl p-6 sm:p-8 playful-border ninos-shadow-sm flex flex-col justify-between border-t-8 ${cls.borderColor} hover:-translate-y-1.5 transition-all duration-300`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs sm:text-sm font-['Nunito_Sans'] font-bold ${cls.badgeColor}`}>
                    {cls.ageRange}
                  </span>
                  <span className="text-xs font-['Nunito_Sans'] font-bold text-[#5c3f42] bg-[#fff1e7] px-2.5 py-1 rounded-full">
                    {cls.badge}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-['Quicksand'] text-[#211a14] mb-2 font-bold">
                  {cls.title}
                </h3>

                <p className="text-xs sm:text-sm font-['Nunito_Sans'] text-[#5c3f42] mb-6 leading-relaxed">
                  {cls.description}
                </p>

                <div className="space-y-3 mb-6">
                  {cls.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm font-['Nunito_Sans'] text-[#211a14]">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: `${cls.accentColor}18`, color: cls.accentColor }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="border-t border-[#eee0d6] pt-4">
                  <p className="text-[11px] font-['Nunito_Sans'] text-[#5c3f42] mb-2 uppercase tracking-wider font-bold">
                    Turnos Disponíveis:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {cls.shifts.map((s, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1 rounded-full text-xs font-['Nunito_Sans'] font-semibold ${
                          s.includes('Integral') ? 'bg-pink-100 text-[#ed145b] font-bold' : 'bg-[#faebe1] text-[#211a14]'
                        }`}
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectClassroom(cls.id)}
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#fff1e7] hover:bg-[#ed145b] hover:text-white text-[#ed145b] text-xs sm:text-sm font-['Nunito_Sans'] font-bold transition-all shadow-sm group"
                >
                  <span>Solicitar Vaga no {cls.title.split(' ')[0]}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
