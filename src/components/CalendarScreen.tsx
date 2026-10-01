import React, { useState, useEffect, useRef } from 'react';
import { Turma, repository } from '../data/repository';
import { calculateTurmaSchedule, getNextClassInfo, DayScheduleItem, formatLocalDateISO } from '../utils/schedule';
import { downloadTurmaIcs, getGoogleCalendarLinkForNextClass } from '../utils/ics';
import { Logo } from './Logo';
import { CalendarMonth } from './CalendarMonth';
import { CalendarLegend } from './CalendarLegend';
import { DayDetailsModal } from './DayDetailsModal';
import { CursoTab } from './CursoTab';
import {
  ArrowLeft,
  Clock,
  MessageCircle,
  Lock,
  Sparkles,
  Share2,
  Check,
  AlertCircle,
  Calendar as CalendarIcon,
  MapPin,
  ExternalLink,
  Smartphone,
  X,
  BookOpen,
} from 'lucide-react';

interface CalendarScreenProps {
  turma: Turma;
  onBackToSelector: () => void;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ turma, onBackToSelector }) => {
  const [selectedDay, setSelectedDay] = useState<DayScheduleItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showIcsInstructions, setShowIcsInstructions] = useState(false);

  // Inicializar aba ativa a partir da URL (&aba=curso)
  const [activeTab, setActiveTab] = useState<'calendario' | 'curso'>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('aba') === 'curso' ? 'curso' : 'calendario';
  });

  const octoberRef = useRef<HTMLDivElement>(null);
  const novemberRef = useRef<HTMLDivElement>(null);

  const config = repository.getConfig();
  const horario = repository.getHorario(turma.turno);
  const turnoLabel = repository.getTurnoLabel(turma.turno);
  const whatsapp = repository.getWhatsApp();
  const endereco = repository.getEnderecoUnidade(turma.unidade);

  // Sincronizar popstate do navegador para troca de abas
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setActiveTab(params.get('aba') === 'curso' ? 'curso' : 'calendario');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTabChange = (tab: 'calendario' | 'curso') => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    if (tab === 'curso') {
      url.searchParams.set('aba', 'curso');
    } else {
      url.searchParams.delete('aba');
    }
    window.history.pushState({}, '', url.toString());
  };

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

  // Identify next class date for Google Calendar direct link
  let nextClassDateISO: string | null = null;
  let isNextInaugural = false;
  if (nextClassInfo.kind === 'countdown_inaugural' || nextClassInfo.kind === 'inaugural_today') {
    nextClassDateISO = turma.aulaInaugural;
    isNextInaugural = true;
  } else if (nextClassInfo.kind === 'next_class') {
    const upcoming = schedule.aulas
      .filter((iso) => iso !== turma.aulaInaugural)
      .find((iso) => iso >= todayISO);
    if (upcoming) {
      nextClassDateISO = upcoming;
    }
  }

  const googleCalUrl = nextClassDateISO
    ? getGoogleCalendarLinkForNextClass(turma, nextClassDateISO, isNextInaugural)
    : null;

  // Total de aulas por mês
  const totalOutubro = schedule.aulasPorMes['2026-10'] || 0;
  const totalNovembro = schedule.aulasPorMes['2026-11'] || 0;

  // Rolagem inicial: ao abrir a Tela 2 na aba calendário, role até o mês atual quando for outubro ou novembro
  useEffect(() => {
    if (activeTab === 'calendario') {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      if (currentYear === 2026 && currentMonth === 10 && octoberRef.current) {
        octoberRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (currentYear === 2026 && currentMonth === 11 && novemberRef.current) {
        novemberRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [activeTab]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleDownloadIcs = () => {
    downloadTurmaIcs(turma);
    setShowIcsInstructions(true);
  };

  // WhatsApp message URL
  const waMessage = `Olá! Tenho uma dúvida sobre o calendário de aulas: ${turma.curso} – ${turnoLabel} – ${turma.unidade}.`;
  const waUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="min-h-screen flex flex-col justify-between pb-28">
      {/* Top Bar with Primary Logo and Change Turma action */}
      <header className="sticky top-0 z-30 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#EFEFEF] py-2.5 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onBackToSelector}
              className="p-2 -ml-1 rounded-[10px] text-[#5D5F69] hover:bg-[#EFEFEF] hover:text-[#131313] transition-colors flex items-center gap-1 text-xs font-medium"
              aria-label="Voltar para seleção de turma"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Trocar turma</span>
            </button>
            <Logo variant="primary" widthClass="w-[110px] sm:w-[140px]" />
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
        <div className="bg-[#FFFFFF] rounded-[20px] border border-[#EFEFEF] card-shadow p-5 sm:p-6 mb-4">
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
              <span>{turnoLabel}</span>
            </div>
            <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[10px] bg-[#EFEFEF] text-[#5D5F69] font-medium">
              <span>Unidade {turma.unidade}</span>
            </div>
          </div>

          {/* Endereço da unidade (exibido apenas se cadastrado e não-vazio) */}
          {endereco && (
            <div className="mt-4 pt-3.5 border-t border-[#EFEFEF] flex flex-wrap items-center justify-between gap-2 text-xs text-[#5D5F69]">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#8C52FF] shrink-0" />
                <span>📍 Unidade {turma.unidade} · {endereco}</span>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#8C52FF] font-bold hover:text-[#593493] underline"
              >
                Ver no mapa
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Abas: Calendário | Meu curso */}
        <div className="flex items-center gap-2 mb-5 p-1 rounded-[14px] bg-[#EEE7F9] border border-[#8C52FF]/15">
          <button
            type="button"
            onClick={() => handleTabChange('calendario')}
            className={`flex-1 py-2.5 px-4 rounded-[10px] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'calendario'
                ? 'bg-[#593493] text-[#FFFFFF] shadow-xs'
                : 'text-[#593493] hover:text-[#131313]'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Calendário</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('curso')}
            className={`flex-1 py-2.5 px-4 rounded-[10px] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'curso'
                ? 'bg-[#593493] text-[#FFFFFF] shadow-xs'
                : 'text-[#593493] hover:text-[#131313]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Meu curso</span>
          </button>
        </div>

        {/* CONTEÚDO DA ABA SELECIONADA */}
        {activeTab === 'curso' ? (
          /* ABA MEU CURSO */
          <CursoTab turma={turma} />
        ) : (
          /* ABA CALENDÁRIO */
          <>
            {/* Botão Adicionar à Minha Agenda */}
            <div className="mb-5">
              <button
                type="button"
                onClick={handleDownloadIcs}
                className="w-full py-3.5 px-4 rounded-[10px] bg-[#FF7F00] text-[#FFFFFF] font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition-all card-shadow shadow-xs cursor-pointer"
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Adicionar à minha agenda</span>
              </button>
            </div>

            {/* Card com instruções do arquivo .ics baixado */}
            {showIcsInstructions && (
              <div className="mb-5 p-4 rounded-[16px] bg-[#FFFFFF] border border-[#FF7F00]/30 card-shadow relative animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.05em] text-[#FF7F00]">
                    <Smartphone className="w-4 h-4 text-[#FF7F00]" />
                    Como adicionar ao seu calendário
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowIcsInstructions(false)}
                    className="p-1 rounded-[8px] text-[#5D5F69] hover:bg-[#EFEFEF] transition-colors"
                    aria-label="Fechar instruções"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-xs text-[#131313] leading-relaxed">
                  <div className="p-2.5 rounded-[10px] bg-[#FFF3E5] border border-[#FF7F00]/20">
                    <strong>iPhone (iOS):</strong> Toque no arquivo e em <em>Adicionar todos</em>.
                  </div>
                  <div className="p-2.5 rounded-[10px] bg-[#EEE7F9] border border-[#8C52FF]/20">
                    <strong>Android:</strong> Abra o arquivo baixado e escolha seu app de agenda. Se usar o Google Agenda e o arquivo não abrir, importe pelo computador em <code>agenda.google.com</code> › Configurações › Importar.
                  </div>
                </div>
              </div>
            )}

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

                  {/* Link Adicionar ao Google Agenda para a próxima aula */}
                  {googleCalUrl && (
                    <div className="mt-3 pt-2.5 border-t border-[#FF7F00]/20">
                      <a
                        href={googleCalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8C52FF] hover:text-[#593493] underline transition-colors"
                      >
                        <CalendarIcon className="w-3.5 h-3.5 text-[#8C52FF]" />
                        <span>Adicionar ao Google Agenda</span>
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Legenda principal do topo */}
            <CalendarLegend variant="full" />

            {/* Grade de Outubro de 2026 */}
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

            {/* Grade de Novembro de 2026 */}
            <div ref={novemberRef}>
              <CalendarMonth
                year={2026}
                month={11}
                monthName="Novembro"
                totalAulasMes={totalNovembro}
                itemsByDate={schedule.itemsByDate}
                onSelectDay={(item) => setSelectedDay(item)}
              />
            </div>

            {/* Dezembro de 2026 - Card Em breve (sem legenda) */}
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
          </>
        )}

        {/* Endereço da unidade repetido no rodapé (se cadastrado) */}
        {endereco && (
          <div className="text-center text-xs text-[#5D5F69] pb-1.5 flex items-center justify-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#8C52FF] shrink-0" />
            <span>Unidade {turma.unidade} · {endereco}</span>
          </div>
        )}

        {/* Discreto aviso de rodapé */}
        <div className="flex items-start justify-center gap-2 text-center text-xs text-[#5D5F69] px-4 py-2">
          <AlertCircle className="w-4 h-4 text-[#FF7F00] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Calendário sujeito a ajustes. Em caso de dúvida, a sua unidade é a fonte oficial.
          </p>
        </div>
      </main>

      {/* Touch-Friendly Day Details Modal */}
      <DayDetailsModal
        item={selectedDay}
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
