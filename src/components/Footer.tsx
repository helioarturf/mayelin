import { Heart, Instagram, Facebook, Camera } from 'lucide-react';
import { SCHOOL_IMAGES, SCHOOL_CONTACT } from '../data/mockData';

interface FooterProps {
  onOpenPortal: () => void;
  onOpenMenu: () => void;
}

export default function Footer({ onOpenPortal, onOpenMenu }: FooterProps) {
  return (
    <footer className="bg-[#f4e6db] relative border-t border-[#eee0d6]/70">
      <div className="w-full px-4 sm:px-6 md:px-12 max-w-7xl mx-auto py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 mb-12">
          {/* Brand Description */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#ed145b] shadow-md bg-white shrink-0">
                <img
                  src={SCHOOL_IMAGES.mayelinRealProfile}
                  alt="Jardim Escola da Mayelin"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-xl font-['Quicksand'] font-bold text-[#ed145b]">
                Jardim Escola da Mayelin
              </span>
            </div>

            <p className="text-xs sm:text-sm font-['Nunito_Sans'] text-[#5c3f42] max-w-sm leading-relaxed">
              Educação Infantil e Pré-Escola de excelência na Centralidade do Kilamba, Província de Luanda, Angola. Cuidado integral, segurança e desenvolvimento pedagógico amoroso.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={SCHOOL_CONTACT.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Página Oficial do Facebook"
                title="Página Oficial do Facebook"
                className="w-10 h-10 rounded-full bg-[#1877F2] shadow-sm flex items-center justify-center text-white hover:bg-blue-700 transition-all duration-200"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#galeria-real"
                aria-label="Ver Galeria de Fotos Reais"
                title="Ver Galeria de Fotos Reais"
                className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[#ed145b] hover:bg-[#ed145b] hover:text-white transition-all duration-200"
              >
                <Camera className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links Institucionais */}
          <div>
            <h5 className="text-base font-['Quicksand'] text-[#ed145b] mb-4 font-bold">
              Navegação
            </h5>
            <ul className="space-y-2.5 text-xs sm:text-sm font-['Nunito_Sans'] font-semibold">
              <li>
                <a href="#sobre-nos" className="text-[#5c3f42] hover:text-[#ed145b] transition-colors">
                  Sobre Nós
                </a>
              </li>
              <li>
                <a href="#nossas-turmas" className="text-[#5c3f42] hover:text-[#ed145b] transition-colors">
                  Nossas Turmas
                </a>
              </li>
              <li>
                <a href="#galeria-real" className="text-[#5c3f42] hover:text-[#ed145b] transition-colors">
                  Fotos Reais (Facebook)
                </a>
              </li>
              <li>
                <a href="#estrutura-rotina" className="text-[#5c3f42] hover:text-[#ed145b] transition-colors">
                  Estrutura & Rotina
                </a>
              </li>
              <li>
                <a href="#agendar-visita" className="text-[#5c3f42] hover:text-[#ed145b] transition-colors">
                  Agendar Visita
                </a>
              </li>
            </ul>
          </div>

          {/* Links Pedagógicos & Saúde */}
          <div>
            <h5 className="text-base font-['Quicksand'] text-[#fd9924] mb-4 font-bold">
              Pilares & Cuidado
            </h5>
            <ul className="space-y-2.5 text-xs sm:text-sm font-['Nunito_Sans'] font-semibold">
              <li>
                <button
                  type="button"
                  onClick={onOpenMenu}
                  className="text-[#5c3f42] hover:text-[#fd9924] transition-colors text-left"
                >
                  Cardápio & Nutrição
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenPortal}
                  className="text-[#5c3f42] hover:text-[#fd9924] transition-colors text-left"
                >
                  Portal da Família
                </button>
              </li>
              <li>
                <a href="#duvidas" className="text-[#5c3f42] hover:text-[#fd9924] transition-colors">
                  Adaptação Escolar
                </a>
              </li>
              <li>
                <a href="#contato" className="text-[#5c3f42] hover:text-[#fd9924] transition-colors">
                  Fale Conosco
                </a>
              </li>
            </ul>
          </div>

          {/* Normas & Portal de Gestão */}
          <div>
            <h5 className="text-base font-['Quicksand'] text-[#00a6c0] mb-4 font-bold">
              Transparência
            </h5>
            <ul className="space-y-2.5 text-xs sm:text-sm font-['Nunito_Sans'] font-semibold">
              <li>
                <span className="text-[#5c3f42]">Política de Privacidade (LGPD)</span>
              </li>
              <li>
                <span className="text-[#5c3f42]">Termos de Matrícula</span>
              </li>
              <li>
                <span className="text-[#5c3f42]">Ministério da Educação (MED - Angola)</span>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenPortal}
                  className="text-[#ed145b] font-bold hover:underline"
                >
                  Acesso aos Diários
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright & Bottom Line */}
        <div className="pt-8 border-t border-[#eee0d6] flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-xs font-['Nunito_Sans'] text-[#5c3f42] font-semibold">
            © {new Date().getFullYear()} Jardim Escola da Mayelin. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-2 text-xs font-['Nunito_Sans'] text-[#ed145b] font-bold">
            <Heart className="w-3.5 h-3.5 fill-[#ed145b]" />
            <span>Feito com carinho para o futuro do seu maior tesouro.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
