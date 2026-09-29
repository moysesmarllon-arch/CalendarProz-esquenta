import { Turma, DiaSemAula, ConfirmarComUnidade, PeriodoVisivel } from '../data/repository';

export function parseLocalDate(isoStr: string): Date {
  const parts = isoStr.split('-').map(Number);
  const year = parts[0];
  const month = parts[1] - 1;
  const day = parts[2];
  // Using 12:00:00 to avoid any DST shifts on local date
  return new Date(year, month, day, 12, 0, 0);
}

export function formatLocalDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDayMonth(isoStr: string): string {
  const parts = isoStr.split('-');
  return `${parts[2]}/${parts[1]}`;
}

export function getWeekdayNameShort(isoStr: string): string {
  const date = parseLocalDate(isoStr);
  const weekdays = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  return weekdays[date.getDay()];
}

export function getWeekdayNameCapitalized(isoStr: string): string {
  const name = getWeekdayNameShort(isoStr);
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export interface DayScheduleItem {
  dateISO: string;
  dayNumber: number;
  monthNumber: number; // 1-12
  yearNumber: number;
  dayOfWeek: number; // 0 (Sun) - 6 (Sat)
  type: 'aula' | 'aula_inaugural' | 'feriado' | 'confirmar' | 'vazio';
  title: string;
  description?: string;
  horario?: string;
  isToday: boolean;
  isPast: boolean;
}

export function calculateTurmaSchedule(
  turma: Turma,
  periodo: PeriodoVisivel,
  diasSemAula: DiaSemAula[],
  confirmarComUnidade: ConfirmarComUnidade[],
  todayISO: string = formatLocalDateISO(new Date())
): {
  aulas: string[];
  aulaInaugural: string;
  itemsByDate: Record<string, DayScheduleItem>;
  aulasPorMes: Record<string, number>; // e.g. "2026-10": 8, "2026-11": 10
  totalAulas: number;
} {
  const diasSemAulaMap = new Map<string, DiaSemAula>();
  diasSemAula.forEach((d) => diasSemAulaMap.set(d.data, d));

  const confirmarMap = new Map<string, ConfirmarComUnidade>();
  confirmarComUnidade
    .filter((c) => c.unidade.toLowerCase() === turma.unidade.toLowerCase())
    .forEach((c) => confirmarMap.set(c.data, c));

  const aulasList: string[] = [];
  const end = parseLocalDate(periodo.fim);

  if (turma.turno === 'S') {
    // Sábado: aula todo sábado a partir de primeiraAula até fim, removendo diasSemAula
    const cur = parseLocalDate(turma.primeiraAula);
    while (cur <= end) {
      if (cur.getDay() === 6) {
        const iso = formatLocalDateISO(cur);
        if (!diasSemAulaMap.has(iso)) {
          aulasList.push(iso);
        }
      }
      cur.setDate(cur.getDate() + 1);
    }
  } else {
    // M, T, N: escala alternada de segunda a sexta
    const weekdays: string[] = [];
    const cur = parseLocalDate(turma.primeiraAula);
    while (cur <= end) {
      const dow = cur.getDay();
      if (dow >= 1 && dow <= 5) {
        weekdays.push(formatLocalDateISO(cur));
      }
      cur.setDate(cur.getDate() + 1);
    }

    // Pegue posições 0, 2, 4, 6...
    const candidateDays = weekdays.filter((_, idx) => idx % 2 === 0);

    // Remova dias que estão em diasSemAula (a sequência NÃO se desloca)
    candidateDays.forEach((iso) => {
      if (!diasSemAulaMap.has(iso)) {
        aulasList.push(iso);
      }
    });
  }

  // Count per month
  const aulasPorMes: Record<string, number> = {};
  aulasList.forEach((iso) => {
    const ym = iso.slice(0, 7);
    aulasPorMes[ym] = (aulasPorMes[ym] || 0) + 1;
  });

  // Build itemsByDate
  const itemsByDate: Record<string, DayScheduleItem> = {};
  const todayDate = parseLocalDate(todayISO);

  // 1. Process all days in the period from inicio to fim
  const curPeriod = parseLocalDate(periodo.inicio);
  while (curPeriod <= end) {
    const iso = formatLocalDateISO(curPeriod);
    const dayDate = parseLocalDate(iso);
    const isToday = iso === todayISO;
    const isPast = dayDate < todayDate && !isToday;
    const dow = curPeriod.getDay();

    if (iso === turma.aulaInaugural) {
      itemsByDate[iso] = {
        dateISO: iso,
        dayNumber: curPeriod.getDate(),
        monthNumber: curPeriod.getMonth() + 1,
        yearNumber: curPeriod.getFullYear(),
        dayOfWeek: dow,
        type: 'aula_inaugural',
        title: 'Aula Inaugural',
        description: 'Primeiro encontro oficial da turma',
        isToday,
        isPast,
      };
    } else if (diasSemAulaMap.has(iso)) {
      const semAula = diasSemAulaMap.get(iso)!;
      itemsByDate[iso] = {
        dateISO: iso,
        dayNumber: curPeriod.getDate(),
        monthNumber: curPeriod.getMonth() + 1,
        yearNumber: curPeriod.getFullYear(),
        dayOfWeek: dow,
        type: 'feriado',
        title: semAula.nome,
        description: semAula.tipo === 'feriado_nacional' ? 'Feriado nacional' : 'Dia sem aula Proz',
        isToday,
        isPast,
      };
    } else if (aulasList.includes(iso)) {
      if (confirmarMap.has(iso)) {
        const conf = confirmarMap.get(iso)!;
        itemsByDate[iso] = {
          dateISO: iso,
          dayNumber: curPeriod.getDate(),
          monthNumber: curPeriod.getMonth() + 1,
          yearNumber: curPeriod.getFullYear(),
          dayOfWeek: dow,
          type: 'confirmar',
          title: 'Confirme com a sua unidade',
          description: conf.nome,
          isToday,
          isPast,
        };
      } else {
        itemsByDate[iso] = {
          dateISO: iso,
          dayNumber: curPeriod.getDate(),
          monthNumber: curPeriod.getMonth() + 1,
          yearNumber: curPeriod.getFullYear(),
          dayOfWeek: dow,
          type: 'aula',
          title: 'Aula',
          isToday,
          isPast,
        };
      }
    } else {
      itemsByDate[iso] = {
        dateISO: iso,
        dayNumber: curPeriod.getDate(),
        monthNumber: curPeriod.getMonth() + 1,
        yearNumber: curPeriod.getFullYear(),
        dayOfWeek: dow,
        type: 'vazio',
        title: dow === 0 ? 'Domingo' : 'Sem aula',
        isToday,
        isPast,
      };
    }

    curPeriod.setDate(curPeriod.getDate() + 1);
  }

  return {
    aulas: aulasList,
    aulaInaugural: turma.aulaInaugural,
    itemsByDate,
    aulasPorMes,
    totalAulas: aulasList.length,
  };
}

// Format the next upcoming event / class
export function getNextClassInfo(
  turma: Turma,
  horario: string,
  schedule: ReturnType<typeof calculateTurmaSchedule>,
  todayISO: string = formatLocalDateISO(new Date())
): {
  kind: 'countdown_inaugural' | 'inaugural_today' | 'next_class' | 'finished';
  title: string;
  details?: string;
  daysRemaining?: number;
} {
  const today = parseLocalDate(todayISO);
  const inauguralDate = parseLocalDate(turma.aulaInaugural);

  // Time diff in days
  const diffDaysInaugural = Math.round(
    (inauguralDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDaysInaugural > 0) {
    return {
      kind: 'countdown_inaugural',
      title: `Faltam ${diffDaysInaugural} ${diffDaysInaugural === 1 ? 'dia' : 'dias'} para sua aula inaugural`,
      details: `${getWeekdayNameCapitalized(turma.aulaInaugural)}, ${formatDayMonth(turma.aulaInaugural)}, às ${horario}`,
      daysRemaining: diffDaysInaugural,
    };
  }

  if (diffDaysInaugural === 0) {
    return {
      kind: 'inaugural_today',
      title: 'Hoje é sua aula inaugural!',
      details: `${getWeekdayNameCapitalized(turma.aulaInaugural)}, às ${horario}`,
    };
  }

  // After inaugural class: find next class on or after today
  const upcomingAulas = schedule.aulas.filter((iso) => {
    const d = parseLocalDate(iso);
    return d >= today;
  });

  if (upcomingAulas.length > 0) {
    const nextIso = upcomingAulas[0];
    const isToday = nextIso === todayISO;
    const formattedHorario = horario.replace(':00', 'h').replace('08h', '8h');
    const weekday = getWeekdayNameShort(nextIso);

    return {
      kind: 'next_class',
      title: isToday
        ? `Sua aula é hoje: ${weekday}, ${formatDayMonth(nextIso)}, às ${formattedHorario}`
        : `Sua próxima aula: ${weekday}, ${formatDayMonth(nextIso)}, às ${formattedHorario}`,
      details: `Horário normal do turno: ${horario}`,
    };
  }

  return {
    kind: 'finished',
    title: 'Aulas do período concluídas!',
    details: 'Acompanhe as orientações da sua unidade para o próximo período.',
  };
}
