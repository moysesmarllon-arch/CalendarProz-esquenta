import React from 'react';
import { X, Star, Calendar, AlertTriangle, Coffee } from 'lucide-react';
import { DayScheduleItem, formatDayMonth, getWeekdayNameCapitalized } from '../utils/schedule';

interface DayDetailsModalProps {
  item: DayScheduleItem | null;
  horarioTurno: string;
  onClose: () => void;
}

export const DayDetailsModal: React.FC<DayDetailsModalProps> = ({ item, horarioTurno, onClose }) => {
  if (!item) return null;

  const weekday = getWeekdayNameCapitalized(item.dateISO);
  const formattedDate = formatDayMonth(item.dateISO);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-[#131313]/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#FFFFFF] rounded-[16px] sm:rounded-[20px] border border-[#EFEFEF] card-shadow p-5 sm:p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.05em] text-[#FF7F00]">
              Detalhes do dia
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-[#593493] mt-0.5">
              {weekday} • {formattedDate}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-[10px] text-[#5D5F69] hover:bg-[#EFEFEF] hover:text-[#131313] transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Badge & Content */}
        <div className="space-y-4">
          {item.type === 'aula_inaugural' && (
            <div className="p-4 rounded-[12px] bg-[#FFF3E5] border border-[#FF7F00]/20">
              <div className="flex items-center gap-2 text-[#FF7F00] font-bold text-base mb-1">
                <Star className="w-5 h-5 fill-[#FF7F00]" />
                Aula Inaugural
              </div>
              <p className="text-sm text-[#131313] leading-relaxed">
                Boas-vindas ao seu curso na Proz Educação! Este é o primeiro encontro oficial da sua turma.
              </p>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-[#FF7F00] text-[#FFFFFF] text-xs font-medium">
                Início: {horarioTurno}
              </div>
            </div>
          )}

          {item.type === 'aula' && (
            <div className="p-4 rounded-[12px] bg-[#EEE7F9] border border-[#8C52FF]/20">
              <div className="flex items-center gap-2 text-[#8C52FF] font-bold text-base mb-1">
                <Calendar className="w-5 h-5" />
                Aula
              </div>
              <p className="text-sm text-[#5D5F69] leading-relaxed">
                Aula presencial regular de acordo com a escala da sua turma.
              </p>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-[#8C52FF] text-[#FFFFFF] text-xs font-medium">
                Horário da turma: {horarioTurno}
              </div>
            </div>
          )}

          {item.type === 'confirmar' && (
            <div className="p-4 rounded-[12px] bg-[#FFF3E5] border border-[#FEC13D]">
              <div className="flex items-center gap-2 text-[#131313] font-bold text-base mb-1">
                <AlertTriangle className="w-5 h-5 text-[#FF7F00]" />
                Confirme a aula com a sua unidade
              </div>
              <p className="text-sm font-medium text-[#131313] mb-1">
                {item.description || 'Feriado regional ou municipal'}
              </p>
              <p className="text-xs text-[#5D5F69] leading-relaxed">
                Pode haver variação conforme o calendário da sua unidade. Em caso de dúvida, fale com a secretaria.
              </p>
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-[#FEC13D] text-[#131313] text-xs font-bold">
                Previsão de aula: {horarioTurno}
              </div>
            </div>
          )}

          {item.type === 'feriado' && (
            <div className="p-4 rounded-[12px] bg-[#EFEFEF] border border-[#B1B3BB]/30">
              <div className="flex items-center gap-2 text-[#5D5F69] font-bold text-base mb-1">
                <Coffee className="w-5 h-5 text-[#5D5F69]" />
                Sem Aula • {item.title}
              </div>
              <p className="text-sm text-[#5D5F69] leading-relaxed">
                {item.description || 'Dia sem atividades letivas.'}
              </p>
            </div>
          )}

          {item.type === 'vazio' && (
            <div className="p-4 rounded-[12px] bg-[#FFFFFF] border border-[#EFEFEF]">
              <div className="flex items-center gap-2 text-[#5D5F69] font-medium text-base mb-1">
                <Calendar className="w-5 h-5 text-[#B1B3BB]" />
                {item.dayOfWeek === 0 ? 'Domingo' : 'Sem aula programada'}
              </div>
              <p className="text-xs text-[#5D5F69] leading-relaxed">
                Não há aula agendada para sua turma nesta data.
              </p>
            </div>
          )}

          {item.isToday && (
            <div className="px-3 py-2 rounded-[10px] border border-[#593493] bg-[#EEE7F9] text-xs font-medium text-[#593493] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#593493]"></span>
              Hoje é esta data
            </div>
          )}

          {item.isPast && !item.isToday && (
            <p className="text-xs text-[#B1B3BB]">
              Esta data já passou.
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-[10px] bg-[#593493] text-[#FFFFFF] font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};
