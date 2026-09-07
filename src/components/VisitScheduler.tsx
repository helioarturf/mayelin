import { useState, useEffect, FormEvent } from 'react';
import { DoorOpen, CheckCircle2, Sun, CloudSun, Clock, Lock, Check, Calendar, User, Phone, Mail, Sparkles } from 'lucide-react';
import { AgeGroup, ShiftType, VisitAppointment } from '../types';
import { SCHOOL_CONTACT } from '../data/mockData';

interface VisitSchedulerProps {
  selectedAgeGroup: AgeGroup;
  onChangeAgeGroup: (ageGroup: AgeGroup) => void;
  onAppointmentBooked: (apt: VisitAppointment) => void;
}

export default function VisitScheduler({
  selectedAgeGroup,
  onChangeAgeGroup,
  onAppointmentBooked
}: VisitSchedulerProps) {
  const [shift, setShift] = useState<ShiftType>('integral');
  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('10:30');

  const [confirmedBooking, setConfirmedBooking] = useState<VisitAppointment | null>(null);

  // Set minimum date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateString = tomorrow.toISOString().split('T')[0];

  useEffect(() => {
    if (!visitDate) {
      setVisitDate(minDateString);
    }
  }, [minDateString, visitDate]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!parentName.trim() || !childName.trim() || !whatsapp.trim()) return;

    const newAppointment: VisitAppointment = {
      id: `apt-${Date.now()}`,
      ageGroup: selectedAgeGroup,
      shift,
      parentName,
      childName,
      whatsapp,
      email,
      date: visitDate,
      time: visitTime,
      createdAt: new Date().toLocaleDateString('pt-BR')
    };

    setConfirmedBooking(newAppointment);
    onAppointmentBooked(newAppointment);
  };

  const handleResetForm = () => {
    setConfirmedBooking(null);
    setParentName('');
    setChildName('');
    setWhatsapp('');
    setEmail('');
  };

  return (
    <section
      id="agendar-visita"
      className="py-16 md:py-24 bg-[#fff1e7] border-y border-[#eee0d6]/60"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        {/* Header Block */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-[#ed145b] font-bold text-xs md:text-sm font-['Nunito_Sans'] mb-2">
            <DoorOpen className="w-4 h-4" />
            <span>Portas Abertas Para Você</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-['Quicksand'] text-[#211a14] font-bold">
            Venha Sentir o Clima Aconchegante do Nosso Jardim
          </h2>

          <p className="text-sm sm:text-base font-['Nunito_Sans'] text-[#5c3f42] mt-2">
            Agende uma visita guiada com nossa coordenação pedagógica. Teremos um café fresco esperando por você e sua família.
          </p>
        </div>

        {/* Main Scheduler Form Container */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 playful-border ninos-shadow-lg">
          {!confirmedBooking ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Passo 1: Faixa Etária */}
              <div>
                <label className="block text-sm sm:text-base font-['Nunito_Sans'] text-[#211a14] mb-3 font-bold">
                  1. Qual a faixa etária do seu filho?
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <label
                    onClick={() => onChangeAgeGroup('bercario')}
                    className={`relative flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedAgeGroup === 'bercario'
                        ? 'border-[#ed145b] bg-pink-50/80 shadow-sm'
                        : 'border-[#eee0d6] hover:border-[#ed145b]'
                    }`}
                  >
                    <div>
                      <p className="text-sm sm:text-base font-['Nunito_Sans'] text-[#211a14] font-bold">
                        Berçário
                      </p>
                      <p className="text-xs font-['Nunito_Sans'] text-[#5c3f42]">4 meses a 1 ano</p>
                    </div>
                    {selectedAgeGroup === 'bercario' && (
                      <CheckCircle2 className="w-5 h-5 text-[#ed145b]" />
                    )}
                  </label>

                  <label
                    onClick={() => onChangeAgeGroup('maternal')}
                    className={`relative flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedAgeGroup === 'maternal'
                        ? 'border-[#fd9924] bg-amber-50/80 shadow-sm'
                        : 'border-[#eee0d6] hover:border-[#fd9924]'
                    }`}
                  >
                    <div>
                      <p className="text-sm sm:text-base font-['Nunito_Sans'] text-[#211a14] font-bold">
                        Maternal I & II
                      </p>
                      <p className="text-xs font-['Nunito_Sans'] text-[#5c3f42]">1 a 3 anos</p>
                    </div>
                    {selectedAgeGroup === 'maternal' && (
                      <CheckCircle2 className="w-5 h-5 text-[#fd9924]" />
                    )}
                  </label>

                  <label
                    onClick={() => onChangeAgeGroup('jardim')}
                    className={`relative flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedAgeGroup === 'jardim'
                        ? 'border-[#00a6c0] bg-sky-50/80 shadow-sm'
                        : 'border-[#eee0d6] hover:border-[#00a6c0]'
                    }`}
                  >
                    <div>
                      <p className="text-sm sm:text-base font-['Nunito_Sans'] text-[#211a14] font-bold">
                        Pré-Escola & Jardim
                      </p>
                      <p className="text-xs font-['Nunito_Sans'] text-[#5c3f42]">4 a 5 anos</p>
                    </div>
                    {selectedAgeGroup === 'jardim' && (
                      <CheckCircle2 className="w-5 h-5 text-[#00a6c0]" />
                    )}
                  </label>
                </div>
              </div>

              {/* Passo 2: Turno de Preferência */}
              <div>
                <label className="block text-sm sm:text-base font-['Nunito_Sans'] text-[#211a14] mb-3 font-bold">
                  2. Qual turno melhor atende à rotina da sua casa?
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <label
                    onClick={() => setShift('matutino')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      shift === 'matutino'
                        ? 'border-[#fd9924] bg-amber-50/80 shadow-sm'
                        : 'border-[#eee0d6] hover:border-[#fd9924]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-bold text-[#211a14]">
                        Meio Período Manhã
                      </span>
                      <Sun className="w-5 h-5 text-[#FFD13B]" />
                    </div>
                    <p className="text-xs font-['Nunito_Sans'] text-[#5c3f42]">07h30 às 12h00</p>
                  </label>

                  <label
                    onClick={() => setShift('vespertino')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      shift === 'vespertino'
                        ? 'border-[#00a6c0] bg-sky-50/80 shadow-sm'
                        : 'border-[#eee0d6] hover:border-[#00a6c0]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-bold text-[#211a14]">
                        Meio Período Tarde
                      </span>
                      <CloudSun className="w-5 h-5 text-[#00a6c0]" />
                    </div>
                    <p className="text-xs font-['Nunito_Sans'] text-[#5c3f42]">13h00 às 17h30</p>
                  </label>

                  <label
                    onClick={() => setShift('integral')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      shift === 'integral'
                        ? 'border-[#ed145b] bg-pink-50/80 shadow-sm'
                        : 'border-[#eee0d6] hover:border-[#ed145b]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-bold text-[#211a14]">
                        Período Integral Completo
                      </span>
                      <Clock className="w-5 h-5 text-[#ed145b]" />
                    </div>
                    <p className="text-xs font-['Nunito_Sans'] text-[#5c3f42]">07h00 às 18h30 (Flexível)</p>
                  </label>
                </div>
              </div>

              {/* Passo 3: Dados de Contato e Agendamento */}
              <div>
                <label className="block text-sm sm:text-base font-['Nunito_Sans'] text-[#211a14] mb-3 font-bold">
                  3. Seus dados e preferência de data:
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs sm:text-sm font-['Nunito_Sans'] text-[#211a14] mb-1.5 font-bold" htmlFor="resp-name">
                      Nome do Responsável *
                    </label>
                    <input
                      id="resp-name"
                      type="text"
                      required
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="Ex: Mariana Castro Silva"
                      className="w-full px-4 py-3 rounded-2xl bg-[#fff8f5] border border-[#eee0d6] focus:border-[#ed145b] focus:ring-4 focus:ring-pink-200 text-xs sm:text-sm text-[#211a14] outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-['Nunito_Sans'] text-[#211a14] mb-1.5 font-bold" htmlFor="child-name">
                      Nome da Criança & Idade Atual *
                    </label>
                    <input
                      id="child-name"
                      type="text"
                      required
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="Ex: Gabriel (1 ano e 4 meses)"
                      className="w-full px-4 py-3 rounded-2xl bg-[#fff8f5] border border-[#eee0d6] focus:border-[#ed145b] focus:ring-4 focus:ring-pink-200 text-xs sm:text-sm text-[#211a14] outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-['Nunito_Sans'] text-[#211a14] mb-1.5 font-bold" htmlFor="whatsapp-input">
                      WhatsApp para Confirmação *
                    </label>
                    <input
                      id="whatsapp-input"
                      type="tel"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="(11) 98765-4321"
                      className="w-full px-4 py-3 rounded-2xl bg-[#fff8f5] border border-[#eee0d6] focus:border-[#ed145b] focus:ring-4 focus:ring-pink-200 text-xs sm:text-sm text-[#211a14] outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-['Nunito_Sans'] text-[#211a14] mb-1.5 font-bold" htmlFor="email-input">
                      E-mail Principal *
                    </label>
                    <input
                      id="email-input"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seuemail@exemplo.com.br"
                      className="w-full px-4 py-3 rounded-2xl bg-[#fff8f5] border border-[#eee0d6] focus:border-[#ed145b] focus:ring-4 focus:ring-pink-200 text-xs sm:text-sm text-[#211a14] outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-['Nunito_Sans'] text-[#211a14] mb-1.5 font-bold" htmlFor="visit-date-input">
                      Data Pretendida para a Visita *
                    </label>
                    <input
                      id="visit-date-input"
                      type="date"
                      required
                      min={minDateString}
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#fff8f5] border border-[#eee0d6] focus:border-[#ed145b] focus:ring-4 focus:ring-pink-200 text-xs sm:text-sm text-[#211a14] outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-['Nunito_Sans'] text-[#211a14] mb-1.5 font-bold" htmlFor="visit-time-input">
                      Horário Preferido *
                    </label>
                    <select
                      id="visit-time-input"
                      value={visitTime}
                      onChange={(e) => setVisitTime(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-2xl bg-[#fff8f5] border border-[#eee0d6] focus:border-[#ed145b] focus:ring-4 focus:ring-pink-200 text-xs sm:text-sm text-[#211a14] outline-none transition-all"
                    >
                      <option value="09:00">09:00 (Período da manhã)</option>
                      <option value="10:30">10:30 (Período da manhã)</option>
                      <option value="14:00">14:00 (Período da tarde)</option>
                      <option value="16:00">16:00 (Período da tarde)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Botão de Confirmação & Garantia */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#eee0d6]">
                <div className="flex items-center gap-2 text-xs font-['Nunito_Sans'] text-[#5c3f42]">
                  <Lock className="w-4 h-4 text-[#2ca568]" />
                  <span>Dados protegidos pela LGPD • Sem compromisso</span>
                </div>

                <button
                  type="submit"
                  id="confirm-appointment-submit-btn"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-[#ed145b] text-white font-['Nunito_Sans'] font-bold text-sm sm:text-base ninos-shadow-lg hover:bg-pink-600 hover:scale-105 active:scale-95 transition-all"
                >
                  <Check className="w-5 h-5" />
                  <span>Confirmar Agendamento de Visita</span>
                </button>
              </div>
            </form>
          ) : (
            /* Confirmation Pass / Voucher */
            <div id="visit-confirmed-card" className="p-6 sm:p-8 rounded-3xl bg-emerald-50 border-2 border-emerald-300 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#2ca568] text-white flex items-center justify-center mx-auto shadow-md">
                <Sparkles className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-xl sm:text-2xl font-['Quicksand'] text-emerald-900 font-bold">
                  Solicitação Recebida com Carinho!
                </h4>
                <p className="text-xs sm:text-sm font-['Nunito_Sans'] text-[#5c3f42] max-w-lg mx-auto mt-1">
                  Nossa equipe de coordenação entrará em contato pelo seu WhatsApp em até 2 horas úteis para confirmar o café e envio da localização exata.
                </p>
              </div>

              {/* Appointment Ticket Details */}
              <div className="bg-white rounded-2xl p-5 border border-emerald-200 text-left max-w-md mx-auto space-y-2.5 shadow-sm text-xs sm:text-sm">
                <div className="flex justify-between border-b border-[#eee0d6] pb-2">
                  <span className="text-[#5c3f42]">Responsável:</span>
                  <span className="font-bold text-[#211a14]">{confirmedBooking.parentName}</span>
                </div>
                <div className="flex justify-between border-b border-[#eee0d6] pb-2">
                  <span className="text-[#5c3f42]">Criança:</span>
                  <span className="font-bold text-[#ed145b]">{confirmedBooking.childName}</span>
                </div>
                <div className="flex justify-between border-b border-[#eee0d6] pb-2">
                  <span className="text-[#5c3f42]">Ciclo Pretendido:</span>
                  <span className="font-bold text-[#211a14] capitalize">{confirmedBooking.ageGroup}</span>
                </div>
                <div className="flex justify-between border-b border-[#eee0d6] pb-2">
                  <span className="text-[#5c3f42]">Data & Horário:</span>
                  <span className="font-bold text-emerald-800">
                    {confirmedBooking.date.split('-').reverse().join('/')} às {confirmedBooking.time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5c3f42]">Turno Preferido:</span>
                  <span className="font-bold text-[#211a14] capitalize">{confirmedBooking.shift}</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <a
                  href={`https://wa.me/${SCHOOL_CONTACT.phoneClean}?text=Olá!%20Acabei%20de%20agendar%20uma%20visita%20para%20o(a)%20${encodeURIComponent(confirmedBooking.childName)}%20no%20dia%20${confirmedBooking.date}%20às%20${confirmedBooking.time}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 rounded-full bg-[#2ca568] text-white text-xs sm:text-sm font-bold hover:bg-emerald-700 transition-colors shadow-md"
                >
                  Confirmar Instantaneamente no WhatsApp
                </a>

                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-6 py-2.5 rounded-full bg-white border border-emerald-300 text-emerald-800 text-xs sm:text-sm font-bold hover:bg-emerald-100 transition-colors"
                >
                  Agendar para Outro Filho
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
