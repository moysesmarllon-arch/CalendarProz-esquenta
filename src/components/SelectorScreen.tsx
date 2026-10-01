import React, { useState, useEffect } from 'react';
import { Logo } from './Logo';
import { repository } from '../data/repository';
import { ChevronRight, MapPin, Building2, GraduationCap, Clock, AlertCircle } from 'lucide-react';

interface SelectorScreenProps {
  initialRegional?: string;
  initialUnidade?: string;
  initialCurso?: string;
  initialTurno?: string;
  onSelectTurma: (regional: string, unidade: string, curso: string, turno: string) => void;
}

export const SelectorScreen: React.FC<SelectorScreenProps> = ({
  initialRegional = '',
  initialUnidade = '',
  initialCurso = '',
  initialTurno = '',
  onSelectTurma,
}) => {
  const [regional, setRegional] = useState<string>(initialRegional);
  const [unidade, setUnidade] = useState<string>(initialUnidade);
  const [curso, setCurso] = useState<string>(initialCurso);
  const [turno, setTurno] = useState<string>(initialTurno);
  const [formError, setFormError] = useState<string | null>(null);

  const regionais = repository.getRegionais();
  const unidades = regional ? repository.getUnidades(regional) : [];
  const cursos = regional && unidade ? repository.getCursos(regional, unidade) : [];
  const turnos = regional && unidade && curso ? repository.getTurnos(regional, unidade, curso) : [];

  // Reset downstream fields when an upstream field changes
  const handleRegionalChange = (val: string) => {
    setRegional(val);
    setUnidade('');
    setCurso('');
    setTurno('');
    setFormError(null);
  };

  const handleUnidadeChange = (val: string) => {
    setUnidade(val);
    setCurso('');
    setTurno('');
    setFormError(null);
  };

  const handleCursoChange = (val: string) => {
    setCurso(val);
    setTurno('');
    setFormError(null);
  };

  const handleTurnoChange = (val: string) => {
    setTurno(val);
    setFormError(null);
  };

  const isComplete = Boolean(regional && unidade && curso && turno);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) {
      setFormError('Selecione todas as opções para ver o calendário da sua turma.');
      return;
    }

    const turma = repository.findTurma(regional, unidade, curso, turno);
    if (!turma) {
      setFormError('Turma não encontrada para esta combinação de opções.');
      return;
    }

    onSelectTurma(regional, unidade, curso, turno);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Banner with Primary Gradient and White Logo */}
      <header className="gradient-primary text-[#FFFFFF] pt-10 pb-16 px-4 sm:px-6 relative overflow-hidden">
        {/* Subtle decorative geometry in Proz style */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#FFFFFF]/10 pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-24 h-24 rounded-tl-[40px] bg-[#FFFFFF]/5 pointer-events-none" />

        <div className="max-w-md mx-auto relative z-10 flex flex-col items-center text-center">
          <Logo variant="white" className="mb-6" widthClass="w-[140px] sm:w-[180px]" />
          <span className="text-xs font-bold uppercase tracking-[0.05em] text-[#FEC13D] mb-1">
            Proz Educação
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#FFFFFF]">
            Seu calendário de aulas
          </h1>
          <p className="mt-2 text-sm text-[#FFFFFF]/90 max-w-xs leading-relaxed">
            Acesse as datas das aulas, encontros inaugurais e feriados da sua turma.
          </p>
        </div>
      </header>

      {/* Main Selection Form Card */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 -mt-8 relative z-20 pb-12">
        <div className="bg-[#FFFFFF] rounded-[20px] border border-[#EFEFEF] card-shadow p-6 sm:p-7">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-[0.05em] text-[#FF7F00]">
              Passo a passo
            </span>
            <h2 className="text-xl font-bold text-[#593493] mt-0.5">
              Encontre sua turma
            </h2>
            <p className="text-xs text-[#5D5F69] mt-1">
              Escolha os dados abaixo para gerar o seu cronograma personalizado.
            </p>
          </div>

          {formError && (
            <div className="mb-5 p-3.5 rounded-[12px] bg-[#FFF3E5] border border-[#FF7F00] flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-[#FF7F00] shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-[#131313] leading-relaxed">
                {formError}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Regional */}
            <div>
              <label
                htmlFor="select-regional"
                className="block text-xs font-medium text-[#5D5F69] mb-1.5 flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-[#8C52FF]" />
                1. Estado / Regional
              </label>
              <select
                id="select-regional"
                value={regional}
                onChange={(e) => handleRegionalChange(e.target.value)}
                className="w-full px-3.5 py-3 rounded-[10px] bg-[#FFFFFF] border border-[#EFEFEF] text-sm text-[#131313] font-medium focus:outline-none focus:border-[#8C52FF] focus:ring-2 focus:ring-[#8C52FF]/20 transition-all cursor-pointer"
              >
                <option value="">Selecione a regional</option>
                {regionais.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Unidade */}
            <div>
              <label
                htmlFor="select-unidade"
                className="block text-xs font-medium text-[#5D5F69] mb-1.5 flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5 text-[#8C52FF]" />
                2. Unidade
              </label>
              <select
                id="select-unidade"
                value={unidade}
                disabled={!regional}
                onChange={(e) => handleUnidadeChange(e.target.value)}
                className="w-full px-3.5 py-3 rounded-[10px] bg-[#FFFFFF] border border-[#EFEFEF] text-sm text-[#131313] font-medium focus:outline-none focus:border-[#8C52FF] focus:ring-2 focus:ring-[#8C52FF]/20 transition-all cursor-pointer disabled:bg-[#EFEFEF]/50 disabled:text-[#B1B3BB] disabled:cursor-not-allowed"
              >
                <option value="">
                  {regional ? 'Selecione a sua unidade' : 'Escolha a regional primeiro'}
                </option>
                {unidades.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Curso */}
            <div>
              <label
                htmlFor="select-curso"
                className="block text-xs font-medium text-[#5D5F69] mb-1.5 flex items-center gap-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5 text-[#8C52FF]" />
                3. Curso
              </label>
              <select
                id="select-curso"
                value={curso}
                disabled={!unidade}
                onChange={(e) => handleCursoChange(e.target.value)}
                className="w-full px-3.5 py-3 rounded-[10px] bg-[#FFFFFF] border border-[#EFEFEF] text-sm text-[#131313] font-medium focus:outline-none focus:border-[#8C52FF] focus:ring-2 focus:ring-[#8C52FF]/20 transition-all cursor-pointer disabled:bg-[#EFEFEF]/50 disabled:text-[#B1B3BB] disabled:cursor-not-allowed"
              >
                <option value="">
                  {unidade ? 'Selecione o seu curso' : 'Escolha a unidade primeiro'}
                </option>
                {cursos.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Turno */}
            <div>
              <label
                htmlFor="select-turno"
                className="block text-xs font-medium text-[#5D5F69] mb-1.5 flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-[#8C52FF]" />
                4. Turno
              </label>
              <select
                id="select-turno"
                value={turno}
                disabled={!curso}
                onChange={(e) => handleTurnoChange(e.target.value)}
                className="w-full px-3.5 py-3 rounded-[10px] bg-[#FFFFFF] border border-[#EFEFEF] text-sm text-[#131313] font-medium focus:outline-none focus:border-[#8C52FF] focus:ring-2 focus:ring-[#8C52FF]/20 transition-all cursor-pointer disabled:bg-[#EFEFEF]/50 disabled:text-[#B1B3BB] disabled:cursor-not-allowed"
              >
                <option value="">
                  {curso ? 'Selecione o turno da aula' : 'Escolha o curso primeiro'}
                </option>
                {turnos.map((t) => (
                  <option key={t} value={t}>
                    {repository.getTurnoLabel(t)}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={!isComplete}
                className="w-full py-3.5 px-4 rounded-[10px] bg-[#FF7F00] text-[#FFFFFF] font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              >
                Ver meu calendário
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Safe notice on privacy & LGPD */}
        <div className="mt-6 text-center">
          <p className="text-[11px] text-[#5D5F69] leading-relaxed">
            Acesso público e anônimo • Nenhum dado pessoal é solicitado ou armazenado.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 border-t border-[#EFEFEF]/60 text-xs text-[#5D5F69]">
        Proz Educação • Calendário de Aulas 2026
      </footer>
    </div>
  );
};
