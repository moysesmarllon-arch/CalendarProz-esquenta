import React from 'react';
import { Star, AlertTriangle, Coffee, BookOpen } from 'lucide-react';
import { DayScheduleItem, parseLocalDate, formatLocalDateISO } from '../utils/schedule';
import { CalendarLegend } from './CalendarLegend';

interface CalendarMonthProps {
  year: number;
  month: number; // 1-12
  monthName: string;
  totalAulasMes: number;
  itemsByDate: Record<string, DayScheduleItem>;
  onSelectDay: (item: DayScheduleItem) => void;
}

const WEEKDAY_HEADERS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export const CalendarMonth: React.FC<CalendarMonthProps> = ({
  year,
  month,
  monthName,
  totalAulasMes,
  itemsByDate,
  onSelectDay,
}) => {
  // First day of month
  const firstDay = parseLocalDate(`${year}-${String(month).padStart(2, '0')}-01`);
  // Leading empty slots for Mon-Sun grid: (getDay() + 6) % 7
  const startOffset = (firstDay.getDay() + 6) % 7;

  // Number of days in month
  // New date with day 0 of next month gives last day of current month
  const lastDayDate = new Date(year, month, 0, 12, 0, 0);
  const totalDays = lastDayDate.getDate();

  const days: DayScheduleItem[] = [];
  for (let d = 1; d <= totalDays; d++) {
    const iso = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const item = itemsByDate[iso] || {
      dateISO: iso,
      dayNumber: d,
      monthNumber: month,
      yearNumber: year,
      dayOfWeek: parseLocalDate(iso).getDay(),
      type: 'vazio',
      title: 'Sem aula',
      isToday: iso === formatLocalDateISO(new Date()),
      isPast: parseLocalDate(iso) < parseLocalDate(formatLocalDateISO(new Date())),
    };
    days.push(item);
  }

  return (
    <div className="bg-[#FFFFFF] rounded-[16px] sm:rounded-[20px] border border-[#EFEFEF] card-shadow p-4 sm:p-6 mb-6">
      {/* Month Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#EFEFEF]">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.05em] text-[#FF7F00]">
            {year}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#593493]">
            {monthName} • {totalAulasMes} {totalAulasMes === 1 ? 'aula' : 'aulas'}
          </h2>
        </div>
        <div className="px-3 py-1.5 rounded-[10px] bg-[#EEE7F9] text-xs font-bold text-[#8C52FF]">
          {totalAulasMes} {totalAulasMes === 1 ? 'encontro' : 'encontros'}
        </div>
      </div>

      {/* Weekday Labels (Seg a Dom) */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
        {WEEKDAY_HEADERS.map((w, idx) => (
          <div
            key={w}
            className={`text-[11px] sm:text-xs font-bold py-1 ${
              idx >= 5 ? 'text-[#B1B3BB]' : 'text-[#5D5F69]'
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {/* Empty slots before first day */}
        {Array.from({ length: startOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[48px] sm:min-h-[64px] rounded-[10px]" />
        ))}

        {/* Days of the month */}
        {days.map((item) => {
          const isInteractive = item.type !== 'vazio';

          // Base cell styling depending on item type
          let bgClass = 'bg-[#FFFFFF] text-[#131313] hover:bg-[#F3EDF9]';
          let borderClass = 'border border-[#EFEFEF]';
          let icon = null;
          let labelText = '';

          if (item.type === 'aula_inaugural') {
            bgClass = 'bg-[#FF7F00] text-[#FFFFFF] font-bold shadow-xs';
            borderClass = 'border-2 border-[#FF7F00]';
            icon = <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[#FFFFFF] shrink-0" />;
            labelText = 'Inaugural';
          } else if (item.type === 'aula') {
            bgClass = 'bg-[#8C52FF] text-[#FFFFFF] font-bold shadow-xs';
            borderClass = 'border border-[#8C52FF]';
            icon = <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 opacity-90" />;
            labelText = 'Aula';
          } else if (item.type === 'confirmar') {
            bgClass = 'bg-[#FEC13D] text-[#131313] font-bold shadow-xs';
            borderClass = 'border-2 border-[#FF7F00]/40';
            icon = <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#131313] shrink-0" />;
            labelText = 'Confirme';
          } else if (item.type === 'feriado') {
            bgClass = 'bg-[#EFEFEF] text-[#5D5F69]';
            borderClass = 'border border-[#B1B3BB]/40';
            icon = <Coffee className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 opacity-75" />;
            labelText = item.title;
          }

          // Highlight today
          if (item.isToday) {
            borderClass = 'border-2 border-[#593493] ring-2 ring-[#593493]/20';
          }

          // Reduced opacity for past days
          const opacityClass = item.isPast ? 'opacity-55' : 'opacity-100';

          return (
            <button
              key={item.dateISO}
              type="button"
              onClick={() => onSelectDay(item)}
              aria-label={`${item.dayNumber} de ${monthName}, ${item.title}`}
              className={`min-h-[50px] sm:min-h-[68px] p-1 sm:p-2 rounded-[10px] sm:rounded-[12px] flex flex-col justify-between items-start transition-all duration-150 text-left cursor-pointer active:scale-95 ${bgClass} ${borderClass} ${opacityClass}`}
            >
              <div className="w-full flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold leading-tight">
                  {item.dayNumber}
                </span>
                {icon}
              </div>

              {/* Text label / badge */}
              {labelText && (
                <div className="w-full mt-0.5 sm:mt-1 truncate">
                  <span className="text-[9px] sm:text-[10px] font-medium leading-none block truncate">
                    {labelText}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legenda compacta logo abaixo da grade do mês */}
      <CalendarLegend variant="compact" />
    </div>
  );
};
