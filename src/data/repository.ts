import turmasData from './turmas.json';
import cursosData from './cursos.json';

export interface Turma {
  id?: string;
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

export interface UnidadeInfo {
  unidade: string;
  endereco: string;
}

export interface TurmasConfig {
  versao: string;
  periodoVisivel: PeriodoVisivel;
  horarios: Record<string, string>;
  duracaoMinutos?: Record<string, number>;
  whatsapp: string;
  unidades?: UnidadeInfo[];
  diasSemAula: DiaSemAula[];
  confirmarComUnidade: ConfirmarComUnidade[];
  turmas: Turma[];
}

// Interfaces de Cursos
export interface Modulo {
  nome: string;
  tipo: 'modulo' | 'estagio';
  aprende: string;
  mercado: string;
  certificadoId?: string;
}

export interface Bloco {
  titulo: string;
  modulos: Modulo[];
}

export interface CertificadoRaw {
  id: string;
  nome: string;
  tipo: 'livre' | 'intermediario';
  regionais?: string[];
  cargaHoraria?: string | Record<string, string>;
  requisito?: string | Record<string, string>;
  impacto: string;
  marcoNoCaminho?: boolean;
}

export interface CertificadoResolved {
  id: string;
  nome: string;
  tipo: 'livre' | 'intermediario';
  cargaHoraria?: string;
  requisito?: string;
  impacto: string;
  marcoNoCaminho?: boolean;
}

export interface Diploma {
  nome: string;
  impacto: string;
}

export interface CursoPorRegional {
  cargaHoraria?: string;
  duracao?: {
    semana?: string;
    sabado?: string;
  };
}

export interface CursoData {
  id: string;
  nomesNaBase: string[];
  titulo: string;
  subtitulo?: string;
  resumo: string;
  porRegional: Record<string, CursoPorRegional>;
  comoFunciona: string;
  blocos: Bloco[];
  certificados: CertificadoRaw[];
  diploma: Diploma;
  nota?: string;
  seletor?: {
    descricao?: string;
  };
}

export interface CursosConfig {
  versao: string;
  regrasCertificados: {
    livre: string;
    intermediario: string;
    emissao: string;
  };
  cursos: CursoData[];
}

const turmasConfig: TurmasConfig = turmasData as TurmasConfig;
const cursosConfigData: CursosConfig = cursosData as CursosConfig;

export const repository = {
  getConfig(): TurmasConfig {
    return turmasConfig;
  },

  getCursosConfig(): CursosConfig {
    return cursosConfigData;
  },

  getRegionais(): string[] {
    const set = new Set<string>();
    turmasConfig.turmas.forEach((t) => set.add(t.regional));
    return Array.from(set).sort();
  },

  getUnidades(regional: string): string[] {
    const set = new Set<string>();
    turmasConfig.turmas
      .filter((t) => t.regional === regional)
      .forEach((t) => set.add(t.unidade));
    return Array.from(set).sort();
  },

  getCursos(regional: string, unidade: string): string[] {
    const set = new Set<string>();
    turmasConfig.turmas
      .filter((t) => t.regional === regional && t.unidade === unidade)
      .forEach((t) => set.add(t.curso));
    return Array.from(set).sort();
  },

  getTurnos(regional: string, unidade: string, curso: string): Array<'M' | 'T' | 'N' | 'S'> {
    const set = new Set<'M' | 'T' | 'N' | 'S'>();
    turmasConfig.turmas
      .filter((t) => t.regional === regional && t.unidade === unidade && t.curso === curso)
      .forEach((t) => set.add(t.turno));
    
    // Sort logically M, T, N, S
    const order: Record<string, number> = { M: 1, T: 2, N: 3, S: 4 };
    return Array.from(set).sort((a, b) => order[a] - order[b]);
  },

  findTurma(regional: string, unidade: string, curso: string, turno: string): Turma | undefined {
    return turmasConfig.turmas.find(
      (t) =>
        t.regional.toLowerCase() === regional.toLowerCase() &&
        t.unidade.toLowerCase() === unidade.toLowerCase() &&
        t.curso.toLowerCase() === curso.toLowerCase() &&
        t.turno.toUpperCase() === turno.toUpperCase()
    );
  },

  getHorario(turno: string): string {
    return turmasConfig.horarios[turno] || '08:00';
  },

  getDuracaoMinutos(turno: string): number {
    if (turmasConfig.duracaoMinutos && turmasConfig.duracaoMinutos[turno]) {
      return turmasConfig.duracaoMinutos[turno];
    }
    return 240;
  },

  getEnderecoUnidade(unidadeNome: string): string {
    if (!turmasConfig.unidades) return '';
    const item = turmasConfig.unidades.find(
      (u) => u.unidade.trim().toLowerCase() === unidadeNome.trim().toLowerCase()
    );
    return item ? (item.endereco || '').trim() : '';
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
    return turmasConfig.diasSemAula;
  },

  getConfirmarComUnidade(unidade: string): ConfirmarComUnidade[] {
    return turmasConfig.confirmarComUnidade.filter(
      (c) => c.unidade.toLowerCase() === unidade.toLowerCase()
    );
  },

  getPeriodoVisivel(): PeriodoVisivel {
    return turmasConfig.periodoVisivel;
  },

  getWhatsApp(): string {
    return turmasConfig.whatsapp;
  },

  // Operações de Cursos
  findCursoByNomeNaBase(cursoNome: string): CursoData | undefined {
    const clean = cursoNome.trim().toLowerCase();
    return cursosConfigData.cursos.find((c) =>
      c.nomesNaBase.some((nome) => nome.trim().toLowerCase() === clean)
    );
  },

  getCursoDetailsForTurma(cursoNome: string, regional: string, turno: string): {
    curso: CursoData | null;
    duracao: string | null;
    cargaHoraria: string | null;
    certificados: CertificadoResolved[];
    totalCertificados: number;
    regrasCertificados: CursosConfig['regrasCertificados'];
  } {
    const curso = this.findCursoByNomeNaBase(cursoNome) || null;
    if (!curso) {
      return {
        curso: null,
        duracao: null,
        cargaHoraria: null,
        certificados: [],
        totalCertificados: 0,
        regrasCertificados: cursosConfigData.regrasCertificados,
      };
    }

    const regData = curso.porRegional[regional] || curso.porRegional['São Paulo'] || null;

    let duracao: string | null = null;
    if (regData?.duracao) {
      if (turno === 'S' && regData.duracao.sabado) {
        duracao = regData.duracao.sabado;
      } else if (regData.duracao.semana) {
        duracao = regData.duracao.semana;
      } else if (regData.duracao.sabado) {
        duracao = regData.duracao.sabado;
      }
    }

    const cargaHoraria = regData?.cargaHoraria || null;

    // Filtrar e resolver certificados para a regional
    const certificados: CertificadoResolved[] = [];
    curso.certificados.forEach((c) => {
      // Se tiver lista de regionais e a regional da turma não estiver incluída, pula
      if (c.regionais && c.regionais.length > 0) {
        const allowed = c.regionais.some((r) => r.trim().toLowerCase() === regional.trim().toLowerCase());
        if (!allowed) return;
      }

      // Resolver carga horária
      let resolvedCh: string | undefined;
      if (typeof c.cargaHoraria === 'string') {
        resolvedCh = c.cargaHoraria;
      } else if (c.cargaHoraria && typeof c.cargaHoraria === 'object') {
        resolvedCh = c.cargaHoraria[regional] || Object.values(c.cargaHoraria)[0];
      }

      // Resolver requisito
      let resolvedReq: string | undefined;
      if (typeof c.requisito === 'string') {
        resolvedReq = c.requisito;
      } else if (c.requisito && typeof c.requisito === 'object') {
        resolvedReq = c.requisito[regional] || Object.values(c.requisito)[0];
      }

      certificados.push({
        id: c.id,
        nome: c.nome,
        tipo: c.tipo,
        cargaHoraria: resolvedCh,
        requisito: resolvedReq,
        impacto: c.impacto,
        marcoNoCaminho: c.marcoNoCaminho,
      });
    });

    return {
      curso,
      duracao,
      cargaHoraria,
      certificados,
      totalCertificados: certificados.length,
      regrasCertificados: cursosConfigData.regrasCertificados,
    };
  },

  getCursoOptionLabel(cursoNome: string): string {
    const curso = this.findCursoByNomeNaBase(cursoNome);
    if (curso?.seletor?.descricao) {
      return `${cursoNome} — ${curso.seletor.descricao}`;
    }
    return cursoNome;
  },

  hasBothEnfermagemCourses(cursosList: string[]): boolean {
    const hasEnf = cursosList.some((c) => c.trim().toLowerCase() === 'enfermagem');
    const hasComp = cursosList.some((c) => c.trim().toLowerCase() === 'enfermagem complementação');
    return hasEnf && hasComp;
  },
};
