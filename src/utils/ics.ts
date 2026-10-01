import { Turma, repository } from '../data/repository';
import { calculateTurmaSchedule } from './schedule';

export function normalizeTextForUid(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function escapeIcsText(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

export function foldIcsLine(line: string): string {
  const maxLength = 75;
  if (line.length <= maxLength) return line;

  let result = '';
  let remaining = line;

  while (remaining.length > maxLength) {
    result += remaining.slice(0, maxLength) + '\r\n ';
    remaining = remaining.slice(maxLength);
  }
  result += remaining;
  return result;
}

export function getAllDayDates(dateISO: string): { startDate: string; endDate: string } {
  const [y, m, d] = dateISO.split('-').map(Number);
  const nextDate = new Date(Date.UTC(y, m - 1, d + 1));
  const startStr = dateISO.replace(/-/g, '');
  const endYr = nextDate.getUTCFullYear();
  const endMo = String(nextDate.getUTCMonth() + 1).padStart(2, '0');
  const endDy = String(nextDate.getUTCDate()).padStart(2, '0');
  const endStr = `${endYr}${endMo}${endDy}`;
  return {
    startDate: startStr,
    endDate: endStr,
  };
}

export function generateTurmaIcsContent(turma: Turma): string {
  const config = repository.getConfig();
  const schedule = calculateTurmaSchedule(
    turma,
    config.periodoVisivel,
    config.diasSemAula,
    config.confirmarComUnidade
  );

  const endereco = repository.getEnderecoUnidade(turma.unidade);
  const turnoLabel = repository.getTurnoLabel(turma.turno);

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Proz Educacao//Calendario de Aulas//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Aulas Proz - ${turma.curso}`,
  ];

  const cleanUnidade = normalizeTextForUid(turma.unidade);
  const cleanCurso = normalizeTextForUid(turma.curso);
  const cleanTurno = normalizeTextForUid(turma.turno);

  const description = `${turma.curso} – ${turnoLabel} – ${turma.unidade}. Calendário sujeito a ajustes; em caso de dúvida, a sua unidade é a fonte oficial.`;

  // 1. Evento Aula Inaugural
  if (schedule.aulaInaugural) {
    const rawDate = schedule.aulaInaugural;
    const aaaammdd = rawDate.replace(/-/g, '');
    const { startDate, endDate } = getAllDayDates(rawDate);
    const uid = `${cleanUnidade}-${cleanCurso}-${cleanTurno}-${aaaammdd}@calendario.proz`;
    const summary = `Aula inaugural – ${turma.curso} (${turnoLabel}) | Proz`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${startDate}T000000Z`);
    lines.push(`DTSTART;VALUE=DATE:${startDate}`);
    lines.push(`DTEND;VALUE=DATE:${endDate}`);
    lines.push(`SUMMARY:${escapeIcsText(summary)}`);
    lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
    if (endereco) {
      lines.push(`LOCATION:${escapeIcsText(endereco)}`);
    }
    lines.push('STATUS:CONFIRMED');
    lines.push('BEGIN:VALARM');
    lines.push('ACTION:DISPLAY');
    lines.push('DESCRIPTION:Lembrete de aula');
    lines.push('TRIGGER:-PT6H');
    lines.push('END:VALARM');
    lines.push('END:VEVENT');
  }

  // 2. Eventos de Aulas
  schedule.aulas.forEach((dateISO) => {
    // Se a data da aula coincidir com a aula inaugural, não duplica o evento
    if (dateISO === schedule.aulaInaugural) {
      return;
    }

    const item = schedule.itemsByDate[dateISO];
    const isConfirmar = item && item.type === 'confirmar';
    const rawDate = dateISO;
    const aaaammdd = rawDate.replace(/-/g, '');
    const { startDate, endDate } = getAllDayDates(rawDate);
    const uid = `${cleanUnidade}-${cleanCurso}-${cleanTurno}-${aaaammdd}@calendario.proz`;

    let summary = `Aula – ${turma.curso} (${turnoLabel}) | Proz`;
    if (isConfirmar) {
      summary += ' (confirme com a unidade)';
    }

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${startDate}T000000Z`);
    lines.push(`DTSTART;VALUE=DATE:${startDate}`);
    lines.push(`DTEND;VALUE=DATE:${endDate}`);
    lines.push(`SUMMARY:${escapeIcsText(summary)}`);
    lines.push(`DESCRIPTION:${escapeIcsText(description)}`);
    if (endereco) {
      lines.push(`LOCATION:${escapeIcsText(endereco)}`);
    }
    lines.push('STATUS:CONFIRMED');
    lines.push('BEGIN:VALARM');
    lines.push('ACTION:DISPLAY');
    lines.push('DESCRIPTION:Lembrete de aula');
    lines.push('TRIGGER:-PT6H');
    lines.push('END:VALARM');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');

  // Apply RFC 5545 line folding and CRLF
  return lines.map(foldIcsLine).join('\r\n') + '\r\n';
}

export function downloadTurmaIcs(turma: Turma): void {
  const content = generateTurmaIcsContent(turma);
  const cleanCurso = normalizeTextForUid(turma.curso);
  const cleanTurno = normalizeTextForUid(turma.turno);
  const fileName = `calendario-proz-${cleanCurso}-${cleanTurno}.ics`;

  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getGoogleCalendarLinkForNextClass(
  turma: Turma,
  nextClassDateISO: string,
  isAulaInaugural: boolean
): string {
  const endereco = repository.getEnderecoUnidade(turma.unidade);
  const turnoLabel = repository.getTurnoLabel(turma.turno);

  const { startDate, endDate } = getAllDayDates(nextClassDateISO);

  const title = isAulaInaugural
    ? `Aula inaugural – ${turma.curso} (${turnoLabel}) | Proz`
    : `Aula – ${turma.curso} (${turnoLabel}) | Proz`;

  const description = `${turma.curso} – ${turnoLabel} – ${turma.unidade}. Calendário sujeito a ajustes; em caso de dúvida, a sua unidade é a fonte oficial.`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startDate}/${endDate}`,
    details: description,
  });

  if (endereco) {
    params.set('location', endereco);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`.replace(
    `${startDate}%2F${endDate}`,
    `${startDate}/${endDate}`
  );
}
