import turmasData from './turmas.json';

export interface Turma {
  regional: string;
  unidade: string;
  curso: string;
  turno: 'M' | 'T' | 'N' | 'S';
  aulaInaugural: string; // AAAA-MM-DD
  primeiraAula: string;  // AAAA-MM-DD
}

export interface DiaSemAula {
  data: string;
  nome: string;
  tipo: string;
}

export interface ConfirmarComUnidade {
  unidade: string;
  data: string;
  nome: string;
}

export interface PeriodoVisivel {
  inicio: string;
  fim: string;
  mesesEmBreve: string[];
}

export interface TurmasConfig {
  versao: string;
  periodoVisivel: PeriodoVisivel;
  horarios: Record<string, string>;
  whatsapp: string;
  diasSemAula: DiaSemAula[];
  confirmarComUnidade: ConfirmarComUnidade[];
  turmas: Turma[];
}

const config: TurmasConfig = turmasData as TurmasConfig;

export const repository = {
  getConfig(): TurmasConfig {
    return config;
  },

  getRegionais(): string[] {
    const set = new Set<string>();
    config.turmas.forEach((t) => set.add(t.regional));
    return Array.from(set).sort();
  },

  getUnidades(regional: string): string[] {
    const set = new Set<string>();
    config.turmas
      .filter((t) => t.regional === regional)
      .forEach((t) => set.add(t.unidade));
    return Array.from(set).sort();
  },

  getCursos(regional: string, unidade: string): string[] {
    const set = new Set<string>();
    config.turmas
      .filter((t) => t.regional === regional && t.unidade === unidade)
      .forEach((t) => set.add(t.curso));
    return Array.from(set).sort();
  },

  getTurnos(regional: string, unidade: string, curso: string): Array<'M' | 'T' | 'N' | 'S'> {
    const set = new Set<'M' | 'T' | 'N' | 'S'>();
    config.turmas
      .filter((t) => t.regional === regional && t.unidade === unidade && t.curso === curso)
      .forEach((t) => set.add(t.turno));
    
    // Sort logically M, T, N, S
    const order: Record<string, number> = { M: 1, T: 2, N: 3, S: 4 };
    return Array.from(set).sort((a, b) => order[a] - order[b]);
  },

  findTurma(regional: string, unidade: string, curso: string, turno: string): Turma | undefined {
    return config.turmas.find(
      (t) =>
        t.regional.toLowerCase() === regional.toLowerCase() &&
        t.unidade.toLowerCase() === unidade.toLowerCase() &&
        t.curso.toLowerCase() === curso.toLowerCase() &&
        t.turno.toUpperCase() === turno.toUpperCase()
    );
  },

  getHorario(turno: string): string {
    return config.horarios[turno] || '08:00';
  },

  getTurnoLabel(turno: string): string {
    switch (turno) {
      case 'M':
        return 'Manhã';
      case 'T':
        return 'Tarde';
      case 'N':
        return 'Noite';
      case 'S':
        return 'Sábado';
      default:
        return turno;
    }
  },

  getDiasSemAula(): DiaSemAula[] {
    return config.diasSemAula;
  },

  getConfirmarComUnidade(unidade: string): ConfirmarComUnidade[] {
    return config.confirmarComUnidade.filter(
      (c) => c.unidade.toLowerCase() === unidade.toLowerCase()
    );
  },

  getPeriodoVisivel(): PeriodoVisivel {
    return config.periodoVisivel;
  },

  getWhatsApp(): string {
    return config.whatsapp;
  },
};
