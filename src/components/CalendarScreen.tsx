import React, { useState, useEffect, useRef } from 'react';
import { Turma, repository } from '../data/repository';
import { calculateTurmaSchedule, getNextClassInfo, DayScheduleItem, formatLocalDateISO } from '../utils/schedule';
import { Logo } from './Logo';
import { CalendarMonth } from './CalendarMonth';
import { CalendarLegend } from './CalendarLegend';
import { DayDetailsModal } from './DayDetailsModal';
import { ArrowLeft, Clock, MessageCircle, Lock, Sparkles, Share2, Check, AlertCircle } from 'lucide-react';

interface CalendarScreenProps {
  turma: Turma;
  onBackToSelector: () => void;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ turma, onBackToSelector }) => {
  const [selectedDay, setSelectedDay] = useState<DayScheduleItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const octoberRef = useRef<HTMLDivElement>(null);

  const config = repository.getConfig();
  const horario = repository.getHorario(turma.turno);
  const turnoLabel = repository.getTurnoLabel(turma.turno);
  const whatsapp = repository.getWhatsApp();

  // Schedule computation
  const todayISO = formatLocalDateISO(new Date());
  const schedule = calculateTurmaSchedule(
    turma,
    config.periodoVisivel,
    config.diasSemAula,
    config.confirmarComUnidade,
    todayISO
  );

  const nextClassInfo = getNextClassInfo(turma, horario, schedule, todayISO);

  // Oct and Nov counts
  const totalOutubro = schedule.aulasPorMes['2026-10'] || 0;
  const totalNovembro = schedule.aulasPorMes['2026-11'] || 0;

  // Format short horario string for header (e.g. "19h" or "8h")
  const shortHorario = horario.replace(':00', 'h').replace(/^0/, '');

  // Scroll to active month or current month on load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // WhatsApp message URL
  const waMessage = `Olá! Tenho uma dúvida sobre o calendário de aulas: ${turma.curso} – ${turnoLabel} – ${turma.unidade}.`;
  const waUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="min-h-screen flex flex-col justify-between pb-28">
      {/* Top Bar with Primary Logo and Change Turma action */}
      <header className="sticky top-0 z-30 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#EFEFEF] py-3 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToSelector}
              className="p-2 -ml-1 rounded-[10px] text-[#5D5F69] hover:bg-[#EFEFEF] hover:text-[#131313] transition-colors flex items-center gap-1 text-xs font-medium"
              aria-label="Voltar para seleção de turma"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Trocar turma</span>
            </button>
            <Logo variant="primary" className="h-7" />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              title="Copiar link desta turma"
              className="px-3 py-1.5 rounded-[10px] bg-[#EEE7F9] text-[#8C52FF] text-xs font-bold flex items-center gap-1.5 hover:bg-[#8C52FF] hover:text-[#FFFFFF] transition-colors"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#D3F95C]" />
                  <span>Link copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Compartilhar</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onBackToSelector}
              className="sm:hidden px-2.5 py-1.5 rounded-[10px] border border-[#EFEFEF] text-xs font-medium text-[#593493] hover:bg-[#EFEFEF]"
            >
              Trocar
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-2xl w-full mx-auto px-4 pt-5 pb-6">
        {/* Turma Summary Card */}
        <div className="bg-[#FFFFFF] rounded-[20px] border border-[#EFEFEF] card-shadow p-5 sm:p-6 mb-5">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.05em] text-[#FF7F00]">
              <span className="w-2 h-2 rounded-full bg-[#FF7F00]" />
              {turma.regional} • {turma.unidade}
            </span>
            <span className="text-xs font-medium text-[#5D5F69]">
              Total de aulas: <strong className="text-[#593493]">{schedule.totalAulas}</strong>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#593493] tracking-tight">
            {turma.curso}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#EEE7F9] text-[#8C52FF] font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>{turnoLabel} • {shortHorario}</span>
            </div>
            <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[10px] bg-[#EFEFEF] text-[#5D5F69] font-medium">
              <span>Unidade {turma.unidade}</span>
            </div>
          </div>
        </div>

        {/* Highlight Card: Countdown to Inaugural or Next Class Banner */}
        <div className="rounded-[16px] p-5 sm:p-6 mb-6 card-shadow border border-[#FF7F00]/20 bg-gradient-to-br from-[#FFF3E5] to-[#FFFFFF] relative overflow-hidden">
          <div className="flex items-start gap-3 sm:gap-4 relative z-10">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[12px] bg-[#FF7F00] text-[#FFFFFF] flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-5 h-5 fill-[#FFFFFF]" />
            </div>
            <div className="flex-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#FF7F00] block mb-0.5">
                {nextClassInfo.kind === 'countdown_inaugural'
                  ? 'Contagem regressiva'
                  : nextClassInfo.kind === 'inaugural_today'
                  ? 'Grande dia!'
                  : 'Próximo compromisso'}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#593493] leading-snug">
                {nextClassInfo.title}
              </h2>
              {nextClassInfo.details && (
                <p className="text-xs sm:text-sm text-[#5D5F69] mt-1 leading-relaxed">
                  {nextClassInfo.details}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <CalendarLegend />

        {/* October 2026 Grid */}
        <div ref={octoberRef}>
          <CalendarMonth
            year={2026}
            month={10}
            monthName="Outubro"
            totalAulasMes={totalOutubro}
            itemsByDate={schedule.itemsByDate}
            onSelectDay={(item) => setSelectedDay(item)}
          />
        </div>

        {/* November 2026 Grid */}
        <CalendarMonth
          year={2026}
          month={11}
          monthName="Novembro"
          totalAulasMes={totalNovembro}
          itemsByDate={schedule.itemsByDate}
          onSelectDay={(item) => setSelectedDay(item)}
        />

        {/* December 2026 - Coming Soon Card */}
        <div className="bg-[#EFEFEF]/60 rounded-[16px] sm:rounded-[20px] border border-[#EFEFEF] p-6 mb-6 text-center select-none">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-[14px] bg-[#FFFFFF] text-[#B1B3BB] mb-3 shadow-xs">
            <Lock className="w-5 h-5 text-[#5D5F69]" />
          </div>
          <h3 className="text-lg font-bold text-[#5D5F69]">
            Dezembro de 2026 • Em breve
          </h3>
          <p className="text-xs text-[#5D5F69] mt-1 max-w-sm mx-auto leading-relaxed">
            As datas para o mês de dezembro serão disponibilizadas em breve pela coordenação da Proz Educação.
          </p>
        </div>

        {/* Discreto aviso de rodapé */}
        <div className="flex items-start justify-center gap-2 text-center text-xs text-[#5D5F69] px-4 py-3">
          <AlertCircle className="w-4 h-4 text-[#FF7F00] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Calendário sujeito a ajustes. Em caso de dúvida, a sua unidade é a fonte oficial.
          </p>
        </div>
      </main>

      {/* Touch-Friendly Day Details Modal */}
      <DayDetailsModal
        item={selectedDay}
        horarioTurno={horario}
        onClose={() => setSelectedDay(null)}
      />

      {/* Fixed Footer CTA for WhatsApp */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#EFEFEF] p-3 sm:p-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="hidden xs:block">
            <p className="text-xs font-bold text-[#593493]">
              Precisa de ajuda com a sua turma?
            </p>
            <p className="text-[11px] text-[#5D5F69]">
              Nossa equipe atende pelo WhatsApp
            </p>
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full xs:w-auto flex-1 xs:flex-initial py-3 px-5 rounded-[10px] bg-[#FF7F00] text-[#FFFFFF] font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition-all shadow-xs"
          >
            <MessageCircle className="w-4 h-4 fill-[#FFFFFF]" />
            <span>Dúvidas? Fale com a gente</span>
          </a>
        </div>
      </div>
    </div>
  );
};
