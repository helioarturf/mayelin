import { MapPin, Clock, PhoneCall, School, MessageCircle, Navigation, ExternalLink } from 'lucide-react';
import { SCHOOL_IMAGES, SCHOOL_CONTACT } from '../data/mockData';

export default function ContactAndMap() {
  return (
    <section id="contato" className="py-16 md:py-24 bg-[#fff1e7] border-t border-[#eee0d6]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Information Column */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-[#ed145b] font-bold text-xs md:text-sm font-['Nunito_Sans'] mb-2">
                <MapPin className="w-4 h-4" />
                <span>Localização & Atendimento em Luanda</span>
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-['Quicksand'] text-[#211a14] font-bold">
                Venha nos conhecer pessoalmente
              </h2>

              <p className="text-xs sm:text-sm font-['Nunito_Sans'] text-[#5c3f42] mt-2">
                Ambiente seguro, higienizado e acolhedor para o desenvolvimento e bem-estar do seu filho na Província de Luanda.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-3xl bg-white playful-border shadow-sm">
                <div className="w-11 h-11 rounded-full bg-pink-100 flex items-center justify-center text-[#ed145b] shrink-0 shadow-sm">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-['Nunito_Sans'] text-[#211a14] font-bold">
                    Endereço Oficial
                  </h5>
                  <p className="text-xs text-[#5c3f42] mt-0.5">
                    Centralidade do Kilamba, Município de Belas
                  </p>
                  <p className="text-xs font-['Nunito_Sans'] text-[#ed145b] font-bold mt-1">
                    Província de Luanda • Angola
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-3xl bg-white playful-border shadow-sm">
                <div className="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center text-[#fd9924] shrink-0 shadow-sm">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-['Nunito_Sans'] text-[#211a14] font-bold">
                    Horário de Atendimento & Aulas
                  </h5>
                  <p className="text-xs text-[#5c3f42] mt-0.5">
                    Segunda a Sexta-feira: 07h00 às 17h30 / 18h00
                  </p>
                  <p className="text-xs text-[#5c3f42]">
                    Regimes: Meio-Período ou Período Integral
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-3xl bg-white playful-border shadow-sm">
                <div className="w-11 h-11 rounded-full bg-sky-100 flex items-center justify-center text-[#00a6c0] shrink-0 shadow-sm">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-['Nunito_Sans'] text-[#211a14] font-bold">
                    Canais Diretos de Comunicação
                  </h5>
                  <p className="text-xs text-[#5c3f42] mt-0.5">
                    WhatsApp Matrículas: {SCHOOL_CONTACT.phoneDisplay}
                  </p>
                  <p className="text-xs text-[#5c3f42]">
                    Facebook: Jardim Escola da Mayelin (Oficial)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Simulation Container */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-4 playful-border ninos-shadow-sm h-full flex flex-col justify-between">
              {/* Simulated Map Canvas */}
              <div className="relative w-full h-72 sm:h-80 md:h-96 rounded-2xl overflow-hidden bg-[#faebe1] flex items-center justify-center border-2 border-pink-100">
                <img
                  src={SCHOOL_IMAGES.mapNeighborhood}
                  alt="Mapa da Centralidade do Kilamba indicando o Jardim Escola da Mayelin em Luanda"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />

                {/* Floating Location Card */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-pink-100 shadow-md flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-[#ed145b] shadow-sm shrink-0">
                      <img
                        src={SCHOOL_IMAGES.mayelinRealProfile}
                        alt="Foto do Jardim Escola da Mayelin"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-['Nunito_Sans'] text-[#211a14] font-bold leading-tight">
                        Jardim Escola da Mayelin
                      </p>
                      <p className="text-[11px] font-['Nunito_Sans'] text-[#5c3f42]">
                        Centralidade do Kilamba, Belas • Luanda, Angola
                      </p>
                    </div>
                  </div>

                  <a
                    href={SCHOOL_CONTACT.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-full bg-[#1877F2] hover:bg-blue-700 text-white text-xs font-['Nunito_Sans'] font-bold transition-colors shadow-sm flex items-center gap-1.5 shrink-0"
                  >
                    <span>Facebook</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Fast WhatsApp Banner */}
              <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#2ca568] text-white flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="text-xs sm:text-sm font-['Nunito_Sans'] text-emerald-900 font-bold text-center sm:text-left">
                    Prefere falar agora com a equipe do Jardim Escola da Mayelin?
                  </span>
                </div>

                <a
                  href={`https://wa.me/${SCHOOL_CONTACT.phoneClean}?text=Olá!%20Gostaria%20de%20conversar%20sobre%20as%20vagas%20no%20Jardim%20Escola%20da%20Mayelin.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 px-6 py-2.5 rounded-full bg-[#2ca568] text-white text-xs font-['Nunito_Sans'] font-bold shadow-md hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all"
                >
                  Conversar no WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
