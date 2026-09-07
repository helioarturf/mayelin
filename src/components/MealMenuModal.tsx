import { useState } from 'react';
import { X, Utensils, Coffee, Apple, Soup, CheckCircle, ShieldCheck } from 'lucide-react';
import { WEEKLY_MENU } from '../data/mockData';

interface MealMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MealMenuModal({ isOpen, onClose }: MealMenuModalProps) {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  if (!isOpen) return null;

  const currentDay = WEEKLY_MENU[selectedDayIdx];

  return (
    <div
      id="meal-menu-modal-overlay"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in"
    >
      <div
        id="meal-menu-modal-container"
        className="bg-[#fff8f5] w-full max-w-2xl rounded-3xl border-2 border-[#eee0d6] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="bg-white border-b border-[#eee0d6] px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-100 text-[#fd9924] flex items-center justify-center shadow-sm shrink-0">
              <Utensils className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-['Quicksand'] font-bold text-[#211a14] truncate">
                Cardápio Nutricional da Semana
              </h3>
              <p className="text-[11px] sm:text-xs font-['Nunito_Sans'] text-[#5c3f42] truncate">
                Nutrição infantil especializada • Alimentos frescos
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] rounded-full bg-[#faebe1] text-[#5c3f42] hover:bg-[#ed145b] hover:text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Days Tabs */}
        <div className="bg-[#faebe1]/60 px-4 sm:px-6 py-2.5 sm:py-3 border-b border-[#eee0d6] flex space-x-2 overflow-x-auto scrollbar-none">
          {WEEKLY_MENU.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedDayIdx(idx)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-['Nunito_Sans'] font-bold transition-all whitespace-nowrap ${
                selectedDayIdx === idx
                  ? 'bg-[#fd9924] text-white shadow-sm'
                  : 'bg-white text-[#5c3f42] hover:text-[#fd9924]'
              }`}
            >
              {item.day.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Day Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl playful-border shadow-sm space-y-3 sm:space-y-4">
            <div className="border-b border-amber-100 pb-2.5 sm:pb-3">
              <h4 className="text-sm sm:text-base font-['Quicksand'] font-bold text-[#8c4f00]">
                {currentDay.day}
              </h4>
            </div>

            {/* Meals breakdown */}
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#fff8f5]">
                <div className="w-7 h-7 rounded-lg bg-pink-100 text-[#ed145b] flex items-center justify-center shrink-0 mt-0.5">
                  <Coffee className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-[#211a14] block">Café da Manhã (08h00):</span>
                  <span className="text-[#5c3f42]">{currentDay.breakfast}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#fff8f5]">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-[#fd9924] flex items-center justify-center shrink-0 mt-0.5">
                  <Apple className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-[#211a14] block">Lanchinho Matinal (09h30):</span>
                  <span className="text-[#5c3f42]">{currentDay.snackMorning}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200">
                <div className="w-7 h-7 rounded-lg bg-[#fd9924] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-[#8c4f00] block">Almoço Completo (11h30):</span>
                  <span className="text-[#211a14] font-medium">{currentDay.lunch}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#fff8f5]">
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-[#00a6c0] flex items-center justify-center shrink-0 mt-0.5">
                  <Apple className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-[#211a14] block">Lanche da Tarde (15h00):</span>
                  <span className="text-[#5c3f42]">{currentDay.snackAfternoon}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#fff8f5]">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#2ca568] flex items-center justify-center shrink-0 mt-0.5">
                  <Soup className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-[#211a14] block">Jantar Leve (17h30 - Integral):</span>
                  <span className="text-[#5c3f42]">{currentDay.dinner}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Nutritional Guarantee Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#5c3f42]">
            <div className="p-3 rounded-xl bg-white border border-[#eee0d6] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Zero açúcar refinado</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#eee0d6] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#ed145b] shrink-0" />
              <span>APLV & Celíacos Adaptado</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#eee0d6] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#fd9924] shrink-0" />
              <span>Ervas da horta orgânica</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
