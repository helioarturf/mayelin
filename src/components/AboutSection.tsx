import { Heart, Sparkles, Shield, Users, CheckCircle2 } from 'lucide-react';

export default function AboutSection() {
  return (
    <section
      id="sobre-nos"
      className="py-16 md:py-24 bg-[#fff1e7] border-y border-[#eee0d6]/60 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        {/* Header Block */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-[#ed145b] text-xs md:text-sm font-['Nunito_Sans'] font-bold shadow-sm">
            <Heart className="w-4 h-4 fill-[#ed145b]" />
            <span>Nossa Essência Pedagógica</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-['Quicksand'] text-[#211a14] font-bold">
            Acreditamos que educar é acolher com ternura e escuta atenta
          </h2>

          <p className="text-base sm:text-lg font-['Nunito_Sans'] text-[#5c3f42] leading-relaxed">
            No Jardim Escola da Mayelin, cada sorriso, cada passo incerto e cada nova pergunta são celebrados.
            Criamos um ecossistema seguro onde as crianças constroem autonomia, desenvolvem a inteligência
            emocional e descobrem o mundo no seu próprio tempo.
          </p>
        </div>

        {/* 3 Pilares Bento Grid Niños Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Pilar 1 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 playful-border ninos-shadow-sm flex flex-col justify-between hover:-translate-y-2 hover:border-[#ed145b] transition-all duration-300 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-pink-50 rounded-bl-full -z-0" />
            <div className="relative z-10">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-pink-400 to-[#ed145b] flex items-center justify-center text-white mb-6 shadow-md group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7" />
              </div>

              <h3 className="text-xl sm:text-2xl font-['Quicksand'] text-[#211a14] mb-3 font-bold">
                1. Pedagogia Lúdica & Ativa
              </h3>

              <p className="text-sm sm:text-base font-['Nunito_Sans'] text-[#5c3f42] leading-relaxed mb-6">
                O brincar espontâneo e direcionado é a ferramenta mais poderosa da infância. Através de estímulos
                multissensoriais, contação de histórias, música e projetos em grupo, estimulamos a curiosidade inata da criança.
              </p>
            </div>

            <div className="pt-4 border-t border-pink-100 flex items-center gap-2 text-xs sm:text-sm font-['Nunito_Sans'] text-[#ed145b] font-bold relative z-10">
              <CheckCircle2 className="w-4 h-4" />
              <span>Respeito ao ritmo e autonomia</span>
            </div>
          </div>

          {/* Pilar 2 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 playful-border ninos-shadow-sm flex flex-col justify-between hover:-translate-y-2 hover:border-[#fd9924] transition-all duration-300 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -z-0" />
            <div className="relative z-10">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#FFD13B] to-[#fd9924] flex items-center justify-center text-white mb-6 shadow-md group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7" />
              </div>

              <h3 className="text-xl sm:text-2xl font-['Quicksand'] text-[#211a14] mb-3 font-bold">
                2. Segurança & Afeto Integral
              </h3>

              <p className="text-sm sm:text-base font-['Nunito_Sans'] text-[#5c3f42] leading-relaxed mb-6">
                Pisos emborrachados amortecedores, quinas seladas, monitoramento interno contínuo e equipe certificada
                em primeiros socorros pediátricos. Ambientes desenhados para que a exploração seja livre de riscos.
              </p>
            </div>

            <div className="pt-4 border-t border-amber-100 flex items-center gap-2 text-xs sm:text-sm font-['Nunito_Sans'] text-[#8c4f00] font-bold relative z-10">
              <CheckCircle2 className="w-4 h-4 text-[#fd9924]" />
              <span>Proteção e cuidado 360°</span>
            </div>
          </div>

          {/* Pilar 3 */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 playful-border ninos-shadow-sm flex flex-col justify-between hover:-translate-y-2 hover:border-[#00a6c0] transition-all duration-300 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-50 rounded-bl-full -z-0" />
            <div className="relative z-10">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#48BFE3] to-[#00a6c0] flex items-center justify-center text-white mb-6 shadow-md group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7" />
              </div>

              <h3 className="text-xl sm:text-2xl font-['Quicksand'] text-[#211a14] mb-3 font-bold">
                3. Parceria Escola-Família
              </h3>

              <p className="text-sm sm:text-base font-['Nunito_Sans'] text-[#5c3f42] leading-relaxed mb-6">
                A extensão do seu lar na escola. Pais acompanham registros diários de sono, aceitação das refeições,
                trocas e fotos dos momentos marcantes através do nosso aplicativo integrado, com canal direto com a coordenação.
              </p>
            </div>

            <div className="pt-4 border-t border-sky-100 flex items-center gap-2 text-xs sm:text-sm font-['Nunito_Sans'] text-[#00a6c0] font-bold relative z-10">
              <CheckCircle2 className="w-4 h-4" />
              <span>Comunicação transparente em tempo real</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
