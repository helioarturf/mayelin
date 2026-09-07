export default function TopBanner() {
  return (
    <div
      id="top-notification-banner"
      className="bg-gradient-to-r from-[#ed145b] via-[#fd9924] to-[#FFD13B] text-white py-2 px-4 md:px-6 text-center text-xs md:text-sm font-['Quicksand'] font-semibold tracking-wide shadow-sm flex items-center justify-center gap-2"
    >
      <span>🎈 Bem-vindos ao Jardim Escola da Mayelin — Matrículas Abertas com Condições Especiais!</span>
      <span className="hidden sm:inline bg-white/25 px-2.5 py-0.5 rounded-full text-xs font-bold">
        Visitas & Matrículas para 2026
      </span>
    </div>
  );
}
