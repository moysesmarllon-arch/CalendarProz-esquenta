import React, { useState } from 'react';
import { Turma, repository } from '../data/repository';
import { Logo } from './Logo';
import {
  ChevronDown,
  Award,
  Clock,
  BookOpen,
  GraduationCap,
  Sparkles,
  Info,
  ExternalLink,
  Layers,
  CheckCircle2,
  ArrowRight,
  ArrowDown,
} from 'lucide-react';

interface CursoTabProps {
  turma: Turma;
}

export const CursoTab: React.FC<CursoTabProps> = ({ turma }) => {
  const details = repository.getCursoDetailsForTurma(
    turma.curso,
    turma.regional,
    turma.turno
  );

  const { curso, duracao, cargaHoraria, certificados, totalCertificados, regrasCertificados } = details;

  // Estado para controlar os acordeões dos módulos abertos
  const [openModulos, setOpenModulos] = useState<Record<string, boolean>>({});

  const toggleModulo = (key: string) => {
    setOpenModulos((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleScrollToCertificado = (certId: string) => {
    const el = document.getElementById(`cert-${certId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-[#8C52FF]', 'ring-offset-2');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-[#8C52FF]', 'ring-offset-2');
      }, 2500);
    }
  };

  // Se o curso da turma não existir no cursos.json
  if (!curso) {
    return (
      <div className="py-8 text-center">
        <div className="bg-[#FFFFFF] rounded-[20px] border border-[#EFEFEF] card-shadow p-8 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-[14px] bg-[#EEE7F9] text-[#8C52FF] mx-auto flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#593493] mb-2">
            Informações em atualização
          </h2>
          <p className="text-sm text-[#5D5F69] leading-relaxed">
            As informações deste curso estarão disponíveis em breve.
          </p>
        </div>
      </div>
    );
  }

  // Mapa de certificados para busca rápida por id
  const certificadosMap = new Map<string, (typeof certificados)[0]>();
  certificados.forEach((c) => certificadosMap.set(c.id, c));

  // Verifica se existe certificado com marcoNoCaminho (ex.: Auxiliar de Enfermagem)
  const hasMarcoNoCaminho = certificados.some((c) => c.marcoNoCaminho);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. TOPO: Título, Subtítulo (se houver), Resumo e Números em Destaque */}
      <section className="bg-[#FFFFFF] rounded-[20px] border border-[#EFEFEF] card-shadow p-6 sm:p-7">
        <span className="text-xs font-bold uppercase tracking-[0.05em] text-[#FF7F00]">
          Matriz curricular
        </span>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-[#593493] mt-1 mb-1">
          {curso.titulo}
        </h2>

        {curso.subtitulo && (
          <p className="text-sm sm:text-base font-medium text-[#8C52FF] mb-2">
            {curso.subtitulo}
          </p>
        )}

        <p className="text-sm text-[#5D5F69] leading-relaxed mb-6">
          {curso.resumo}
        </p>

        {/* Números em Destaque (Duração, Carga horária e Certificados) */}
        {(() => {
          const hasCertificados = totalCertificados > 0;
          const count = [Boolean(duracao), Boolean(cargaHoraria), hasCertificados].filter(Boolean).length;
          const gridColsClass =
            count === 3
              ? 'grid-cols-1 sm:grid-cols-3'
              : count === 2
              ? 'grid-cols-1 sm:grid-cols-2'
              : 'grid-cols-1';

          return (
            <div className={`grid ${gridColsClass} gap-3 pt-4 border-t border-[#EFEFEF]`}>
              {duracao && (
                <div className="p-4 rounded-[14px] bg-[#EEE7F9]/50 border border-[#8C52FF]/15">
                  <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#593493] flex items-center gap-1 mb-1">
                    <Clock className="w-3.5 h-3.5 text-[#8C52FF]" />
                    Duração estimada
                  </span>
                  <div className="text-2xl font-bold text-[#8C52FF]">
                    {duracao}
                  </div>
                </div>
              )}

              {cargaHoraria && (
                <div className="p-4 rounded-[14px] bg-[#EEE7F9]/50 border border-[#8C52FF]/15">
                  <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#593493] flex items-center gap-1 mb-1">
                    <Layers className="w-3.5 h-3.5 text-[#8C52FF]" />
                    Carga horária
                  </span>
                  <div className="text-2xl font-bold text-[#8C52FF]">
                    {cargaHoraria}
                  </div>
                </div>
              )}

              {hasCertificados && (
                <div className="p-4 rounded-[14px] bg-[#EEE7F9]/50 border border-[#8C52FF]/15">
                  <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#593493] flex items-center gap-1 mb-1">
                    <Award className="w-3.5 h-3.5 text-[#8C52FF]" />
                    Certificados
                  </span>
                  <div className="text-2xl font-bold text-[#8C52FF]">
                    {totalCertificados} {totalCertificados === 1 ? 'certificado' : 'certificados'}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </section>

      {/* 2. DIPLOMA - SEU OBJETIVO (Gradiente Primário posicionado logo após os números) */}
      {curso.diploma && (
        <section className="gradient-primary text-[#FFFFFF] rounded-[20px] p-6 sm:p-7 card-shadow relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-[#FFFFFF]/10 pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#FFFFFF]/20 text-xs font-bold text-[#FFFFFF] backdrop-blur-xs">
                <GraduationCap className="w-4 h-4" />
                Seu objetivo
              </div>
              <Logo variant="white" widthClass="w-[100px] sm:w-[130px]" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#FFFFFF]">
                {curso.diploma.nome}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#FFFFFF]/90 leading-relaxed max-w-xl">
                {curso.diploma.impacto}
              </p>
            </div>

            <div className="pt-1 flex items-center gap-2 text-xs text-[#FEC13D] font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Validade em todo o território nacional</span>
            </div>
          </div>
        </section>
      )}

      {/* 3. COMO FUNCIONA (Com trilha visual quando houver marco) */}
      {curso.comoFunciona && (
        <section className="bg-[#EEE7F9] rounded-[20px] border border-[#8C52FF]/20 card-shadow p-5 sm:p-6 space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-[12px] bg-[#8C52FF] text-[#FFFFFF] flex items-center justify-center shrink-0 shadow-xs">
              <Info className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h3 className="text-base sm:text-lg font-bold text-[#593493]">
                  Como funciona o curso
                </h3>
                <span className="px-2.5 py-0.5 rounded-[8px] bg-[#FFFFFF] text-[11px] font-bold text-[#8C52FF] shadow-xs">
                  Você pode começar por qualquer módulo
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#5D5F69] leading-relaxed">
                {curso.comoFunciona}
              </p>
            </div>
          </div>

          {/* Trilha visual horizontal (vertical no mobile) quando houver marco no caminho */}
          {hasMarcoNoCaminho && (
            <div className="pt-3 border-t border-[#8C52FF]/20">
              <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#593493] block mb-3">
                Trilha da sua formação
              </span>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                {/* Ponto 1: 1ª parte */}
                <div className="flex-1 p-3 rounded-[12px] bg-[#FFFFFF] border border-[#8C52FF]/20 text-center">
                  <span className="text-xs font-bold text-[#593493] block">
                    1ª parte
                  </span>
                  <span className="text-[10px] text-[#5D5F69]">
                    Fundamentos
                  </span>
                </div>

                <div className="hidden sm:flex text-[#8C52FF] shrink-0 justify-center">
                  <ArrowRight className="w-4 h-4" />
                </div>
                <div className="flex sm:hidden text-[#8C52FF] shrink-0 justify-center -my-1">
                  <ArrowDown className="w-3.5 h-3.5" />
                </div>

                {/* Ponto 2: Auxiliar (marco) - Menor, em Roxo Vibrante */}
                <div className="flex-1 p-2.5 rounded-[12px] bg-[#FFFFFF] border border-[#8C52FF] text-center">
                  <span className="text-xs font-bold text-[#8C52FF] block">
                    Auxiliar (marco)
                  </span>
                  <span className="text-[10px] text-[#5D5F69]">
                    No meio do caminho
                  </span>
                </div>

                <div className="hidden sm:flex text-[#8C52FF] shrink-0 justify-center">
                  <ArrowRight className="w-4 h-4" />
                </div>
                <div className="flex sm:hidden text-[#8C52FF] shrink-0 justify-center -my-1">
                  <ArrowDown className="w-3.5 h-3.5" />
                </div>

                {/* Ponto 3: 2ª parte */}
                <div className="flex-1 p-3 rounded-[12px] bg-[#FFFFFF] border border-[#8C52FF]/20 text-center">
                  <span className="text-xs font-bold text-[#593493] block">
                    2ª parte
                  </span>
                  <span className="text-[10px] text-[#5D5F69]">
                    Alta complexidade
                  </span>
                </div>

                <div className="hidden sm:flex text-[#8C52FF] shrink-0 justify-center">
                  <ArrowRight className="w-4 h-4" />
                </div>
                <div className="flex sm:hidden text-[#8C52FF] shrink-0 justify-center -my-1">
                  <ArrowDown className="w-3.5 h-3.5" />
                </div>

                {/* Ponto 4: Diploma de Técnico - Em destaque Laranja #FF7F00 */}
                <div className="flex-1 p-3 rounded-[12px] bg-[#FFF3E5] border-2 border-[#FF7F00] text-center shadow-xs">
                  <span className="text-xs font-bold text-[#FF7F00] block">
                    Diploma de Técnico
                  </span>
                  <span className="text-[10px] text-[#131313] font-medium">
                    Objetivo do curso
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* 4. MÓDULOS (ACORDEÕES POR BLOCO) */}
      <section className="space-y-6">
        {curso.blocos.map((bloco, bIdx) => (
          <div key={bIdx} className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <h3 className="text-lg sm:text-xl font-bold text-[#593493]">
                {bloco.titulo}
              </h3>
              <span className="text-xs font-bold text-[#8C52FF] px-2 py-0.5 rounded-[8px] bg-[#EEE7F9]">
                {bloco.modulos.length} {bloco.modulos.length === 1 ? 'item' : 'itens'}
              </span>
            </div>

            <div className="space-y-2.5">
              {bloco.modulos.map((modulo, mIdx) => {
                const uniqueKey = `${bIdx}-${mIdx}-${modulo.nome}`;
                const isOpen = Boolean(openModulos[uniqueKey]);
                const cert = modulo.certificadoId ? certificadosMap.get(modulo.certificadoId) : null;

                return (
                  <div
                    key={uniqueKey}
                    className="bg-[#FFFFFF] rounded-[16px] border border-[#EFEFEF] card-shadow overflow-hidden transition-all"
                  >
                    {/* Cabeçalho do Acordeão */}
                    <button
                      type="button"
                      onClick={() => toggleModulo(uniqueKey)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-left hover:bg-[#F3EDF9]/40 active:bg-[#F3EDF9]/80 transition-colors cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          {modulo.tipo === 'estagio' && (
                            <span className="px-2 py-0.5 rounded-[6px] bg-[#EEE7F9] text-[#8C52FF] text-[10px] font-bold uppercase tracking-wider">
                              Estágio
                            </span>
                          )}
                          {modulo.certificadoId && (
                            <span className="px-2 py-0.5 rounded-[6px] bg-[#FFF3E5] text-[#FF7F00] text-[10px] font-bold flex items-center gap-1 border border-[#FF7F00]/20">
                              <Award className="w-3 h-3" />
                              Leva a certificado
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-[#131313] leading-snug">
                          {modulo.nome}
                        </h4>
                      </div>

                      <div
                        className={`w-8 h-8 rounded-[10px] bg-[#EFEFEF] flex items-center justify-center text-[#5D5F69] shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 bg-[#EEE7F9] text-[#8C52FF]' : ''
                        }`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>

                    {/* Conteúdo Aberto */}
                    {isOpen && (
                      <div className="px-4 pb-5 sm:px-5 pt-1 border-t border-[#EFEFEF]/70 bg-[#FFFFFF] space-y-3.5 animate-in fade-in duration-150">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#FF7F00] block mb-1">
                            O que você vai aprender
                          </span>
                          <p className="text-xs sm:text-sm text-[#131313] leading-relaxed">
                            {modulo.aprende}
                          </p>
                        </div>

                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#8C52FF] block mb-1">
                            Por que isso importa no mercado
                          </span>
                          <p className="text-xs sm:text-sm text-[#5D5F69] leading-relaxed">
                            {modulo.mercado}
                          </p>
                        </div>

                        {modulo.certificadoId && cert && (
                          <div className="pt-2">
                            <button
                              type="button"
                              onClick={() => handleScrollToCertificado(modulo.certificadoId!)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF7F00] hover:text-[#593493] underline transition-colors cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>Este módulo leva ao certificado: {cert.nome}</span>
                              <ExternalLink className="w-3 h-3 ml-0.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* 5. CONQUISTAS NO CAMINHO (CERTIFICADOS) */}
      {certificados.length > 0 && (
        <section className="space-y-4 pt-2">
          <div className="flex items-center gap-2 px-1">
            <Award className="w-5 h-5 text-[#8C52FF]" />
            <h3 className="text-lg sm:text-xl font-bold text-[#593493]">
              Conquistas no caminho
            </h3>
          </div>

          {/* Explicação dos Tipos e Regra de Emissão */}
          <div className="bg-[#FFFFFF] rounded-[16px] border border-[#EFEFEF] card-shadow p-4 sm:p-5 space-y-3 text-xs leading-relaxed text-[#5D5F69]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-[12px] bg-[#EFEFEF]/60 border border-[#EFEFEF]">
                <strong className="text-[#131313] block mb-1">
                  Certificado Livre:
                </strong>
                {regrasCertificados.livre}
              </div>
              <div className="p-3 rounded-[12px] bg-[#EEE7F9]/50 border border-[#8C52FF]/20">
                <strong className="text-[#8C52FF] block mb-1">
                  Certificado Intermediário:
                </strong>
                {regrasCertificados.intermediario}
              </div>
            </div>

            <div className="p-3 rounded-[12px] bg-[#FFF3E5] border border-[#FF7F00]/30 text-[#131313] flex items-start gap-2 font-medium">
              <Sparkles className="w-4 h-4 text-[#FF7F00] shrink-0 mt-0.5" />
              <span>{regrasCertificados.emissao}</span>
            </div>
          </div>

          {/* Cards dos Certificados */}
          <div className="grid grid-cols-1 gap-3.5">
            {certificados.map((cert) => {
              const isMarco = Boolean(cert.marcoNoCaminho);
              const isIntermediario = cert.tipo === 'intermediario' && !isMarco;

              return (
                <div
                  key={cert.id}
                  id={`cert-${cert.id}`}
                  className="bg-[#FFFFFF] rounded-[16px] border border-[#EFEFEF] card-shadow p-5 transition-all duration-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    {/* Selo: Marco no caminho / Intermediário / Livre */}
                    {isMarco ? (
                      <span className="px-2.5 py-1 rounded-[8px] text-[11px] font-bold bg-[#EEE7F9] text-[#8C52FF] border border-[#8C52FF]/20">
                        Marco no caminho
                      </span>
                    ) : isIntermediario ? (
                      <span className="px-2.5 py-1 rounded-[8px] text-[11px] font-bold bg-[#8C52FF] text-[#FFFFFF]">
                        Intermediário
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-[8px] text-[11px] font-bold bg-[#EFEFEF] text-[#5D5F69]">
                        Livre
                      </span>
                    )}

                    {cert.cargaHoraria && (
                      <span className="text-xs font-bold text-[#8C52FF] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {cert.cargaHoraria}
                      </span>
                    )}
                  </div>

                  <h4 className="text-base sm:text-lg font-bold text-[#593493] mb-3">
                    {cert.nome}
                  </h4>

                  <div className="space-y-2.5 text-xs sm:text-sm">
                    {cert.requisito && (
                      <div className="p-3 rounded-[10px] bg-[#EFEFEF]/40 border border-[#EFEFEF]">
                        <span className="font-bold text-[#131313] block mb-0.5">
                          Como conquistar:
                        </span>
                        <p className="text-[#5D5F69] leading-relaxed">
                          {cert.requisito}
                        </p>
                      </div>
                    )}

                    <div className="p-3 rounded-[10px] bg-[#FFF3E5]/60 border border-[#FF7F00]/20">
                      <span className="font-bold text-[#FF7F00] block mb-0.5">
                        O que ele abre para você:
                      </span>
                      <p className="text-[#131313] leading-relaxed">
                        {cert.impacto}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Nota do curso (se houver) */}
          {curso.nota && (
            <div className="p-3.5 rounded-[12px] bg-[#EFEFEF]/70 border border-[#B1B3BB]/30 text-xs text-[#5D5F69] leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-[#8C52FF] shrink-0 mt-0.5" />
              <span>{curso.nota}</span>
            </div>
          )}
        </section>
      )}

      {/* 6. AVISO DE RODAPÉ DA ABA */}
      <div className="p-4 rounded-[14px] bg-[#FFFFFF] border border-[#EFEFEF] card-shadow text-center text-xs text-[#5D5F69] leading-relaxed">
        Conteúdo de referência. Regras de certificação e estágio seguem o Regimento Escolar; em caso de dúvida, fale com a secretaria da sua unidade.
      </div>
    </div>
  );
};
