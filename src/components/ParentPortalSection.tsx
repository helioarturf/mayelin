import { Smartphone, Bell, Shield, Image as ImageIcon, HeartPulse, ArrowRight, Lock, Utensils, Moon, Camera, Check } from 'lucide-react';
import { Student } from '../types';

interface ParentPortalSectionProps {
  onOpenPortal: () => void;
  activeStudent: Student;
}

export default function ParentPortalSection({ onOpenPortal, activeStudent }: ParentPortalSectionProps) {
  return (
    <section id="portal-familia" className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Smartphone Mockup UI Frame */}
        <div className="lg:col-span-5 order-2 lg:order-1 flex justify-center">
          <div
            id="smartphone-interactive-mockup"
            onClick={onOpenPortal}
            className="w-full max-w-[320px] sm:max-w-sm rounded-[36px] sm:rounded-[44px] p-3 sm:p-3.5 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-950 shadow-2xl border-4 border-pink-200 cursor-pointer group hover:scale-[1.02] transition-transform"
            title="Clique para abrir a demonstração interativa do Portal da Família"
          >
            <div className="bg-[#fff8f5] rounded-[28px] sm:rounded-[36px] overflow-hidden border border-[#eee0d6] p-3.5 sm:p-4 space-y-3.5 sm:space-y-4">
              {/* Header App */}
              <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-[#eee0d6]">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#ed145b] flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-sm">
                    {activeStudent.avatarLetter}
                  </div>
                  <div>
                    <h5 className="text-xs sm:text-sm font-['Nunito_Sans'] text-[#211a14] font-bold">
                      Mayelin Kids App
                    </h5>
                    <p className="text-[10px] sm:text-[11px] font-['Nunito_Sans'] text-emerald-600 font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Conectado à Turma</span>
                    </p>
                  </div>
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#ed145b] bg-pink-100 px-2 py-0.5 rounded-full">
                  Demo
                </span>
              </div>

              {/* Student Banner */}
              <div className="bg-pink-50/90 p-3 sm:p-3.5 rounded-2xl flex items-center justify-between border border-pink-100">
                <div>
                  <p className="text-[10px] sm:text-[11px] font-['Nunito_Sans'] text-[#5c3f42]">Aluno(a):</p>
                  <p className="text-xs sm:text-sm font-['Nunito_Sans'] font-bold text-[#ed145b]">
                    {activeStudent.name} • {activeStudent.classroom}
                  </p>
                </div>
                <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-['Nunito_Sans'] bg-emerald-500 text-white font-bold">
                  {activeStudent.status}
                </span>
              </div>

              {/* Real-time Activity Timeline Preview */}
              <div className="space-y-2 sm:space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] sm:text-[11px] font-['Nunito_Sans'] text-[#5c3f42] uppercase tracking-wider font-bold">
                    Diário de Bordo de Hoje
                  </p>
                  <span className="text-[10px] text-[#ed145b] font-bold hover:underline">
                    Ver todos ({activeStudent.dailyLogs.length})
                  </span>
                </div>

                {/* Timeline item 1 */}
                <div className="p-2 sm:p-2.5 rounded-2xl bg-white border border-amber-100 flex items-center gap-2.5 sm:gap-3 shadow-sm">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-100 flex items-center justify-center text-[#fd9924] shrink-0">
                    <Utensils className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-['Nunito_Sans'] text-[#211a14] font-bold truncate">
                        Almoço Completo
                      </span>
                      <span className="text-[10px] font-['Nunito_Sans'] text-[#5c3f42] font-bold">
                        11:45
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] font-['Nunito_Sans'] text-[#5c3f42] truncate">
                      Comeu toda a porção de legumes e purê.
                    </p>
                  </div>
                </div>

                {/* Timeline item 2 */}
                <div className="p-2 sm:p-2.5 rounded-2xl bg-white border border-sky-100 flex items-center gap-2.5 sm:gap-3 shadow-sm">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-sky-100 flex items-center justify-center text-[#00a6c0] shrink-0">
                    <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-['Nunito_Sans'] text-[#211a14] font-bold truncate">
                        Soninho da Tarde
                      </span>
                      <span className="text-[10px] font-['Nunito_Sans'] text-[#5c3f42] font-bold">
                        13:10
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] font-['Nunito_Sans'] text-[#5c3f42] truncate">
                      Dormiu tranquilamente por 1h40.
                    </p>
                  </div>
                </div>

                {/* Timeline item 3 */}
                <div className="p-2 sm:p-2.5 rounded-2xl bg-white border border-pink-100 flex items-center gap-2.5 sm:gap-3 shadow-sm">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-pink-100 flex items-center justify-center text-[#ed145b] shrink-0">
                    <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-['Nunito_Sans'] text-[#211a14] font-bold truncate">
                        4 Novas Fotos no Álbum
                      </span>
                      <span className="text-[10px] font-['Nunito_Sans'] text-[#5c3f42] font-bold">
                        15:20
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] font-['Nunito_Sans'] text-[#5c3f42] truncate">
                      Atividade sensorial com massinha caseira.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Action Inside Mockup */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenPortal();
                  }}
                  className="w-full min-h-[44px] py-2.5 rounded-2xl bg-[#ed145b] text-white text-xs font-['Nunito_Sans'] font-bold flex items-center justify-center gap-2 shadow-md hover:bg-pink-600 transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Autorizar Retirada de Terceiro</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Description Column */}
        <div className="lg:col-span-7 order-1 lg:order-2 space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-100 text-[#00a6c0] font-bold text-xs md:text-sm font-['Nunito_Sans']">
            <Smartphone className="w-4 h-4" />
            <span>Tecnologia & Tranquilidade</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-['Quicksand'] text-[#211a14] font-bold leading-snug">
            Coração leve enquanto você trabalha: acompanhe tudo na palma da mão
          </h2>

          <p className="text-sm sm:text-base md:text-lg font-['Nunito_Sans'] text-[#5c3f42] leading-relaxed">
            Esqueça as velhas agendas de papel que se perdem na mochila. Nosso sistema de gestão escolar integrado
            mantém você conectado em tempo real à rotina, segurança e desenvolvimento do seu pequeno com total privacidade.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5 pt-2">
            <div className="p-4 sm:p-5 rounded-3xl bg-white playful-border shadow-sm hover:border-[#ed145b] transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-pink-100 flex items-center justify-center text-[#ed145b] shrink-0">
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h4 className="text-sm sm:text-base font-['Quicksand'] text-[#211a14] font-bold">
                  Notificações Instantâneas
                </h4>
              </div>
              <p className="text-xs sm:text-sm font-['Nunito_Sans'] text-[#5c3f42]">
                Saiba a hora exata da chegada, da mamadeira ou almoço e do despertar da soneca.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-white playful-border shadow-sm hover:border-[#fd9924] transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-100 flex items-center justify-center text-[#fd9924] shrink-0">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h4 className="text-sm sm:text-base font-['Quicksand'] text-[#211a14] font-bold">
                  Segurança na Portaria
                </h4>
              </div>
              <p className="text-xs sm:text-sm font-['Nunito_Sans'] text-[#5c3f42]">
                Autorize avós ou tios para retirar a criança no dia com QR Code e documento pré-aprovados.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-white playful-border shadow-sm hover:border-[#00a6c0] transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-sky-100 flex items-center justify-center text-[#00a6c0] shrink-0">
                  <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h4 className="text-sm sm:text-base font-['Quicksand'] text-[#211a14] font-bold">
                  Galeria Privativa HD
                </h4>
              </div>
              <p className="text-xs sm:text-sm font-['Nunito_Sans'] text-[#5c3f42]">
                Fotos diárias das oficinas e brincadeiras visíveis exclusivamente para os responsáveis.
              </p>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-white playful-border shadow-sm hover:border-red-400 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center text-[#ba1a1a] shrink-0">
                  <HeartPulse className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h4 className="text-sm sm:text-base font-['Quicksand'] text-[#211a14] font-bold">
                  Ficha de Saúde Online
                </h4>
              </div>
              <p className="text-xs sm:text-sm font-['Nunito_Sans'] text-[#5c3f42]">
                Controle rígido de dosagens de medicamentos prescritos e alergias registrado pela enfermagem.
              </p>
            </div>
          </div>

          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <button
              id="open-portal-interactive-cta"
              type="button"
              onClick={onOpenPortal}
              className="min-h-[48px] inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-full bg-[#fd9924] text-white font-['Nunito_Sans'] font-bold text-sm sm:text-base ninos-shadow-lg hover:bg-amber-600 hover:scale-105 active:scale-95 transition-all"
            >
              <span>Demonstração do Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <span className="text-xs text-[#5c3f42] font-semibold flex items-center justify-center sm:justify-start gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Sem necessidade de cadastro prévio</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
