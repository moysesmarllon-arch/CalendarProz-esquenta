import React, { useState, useEffect, useCallback } from 'react';
import { Turma, repository } from './data/repository';
import { SelectorScreen } from './components/SelectorScreen';
import { CalendarScreen } from './components/CalendarScreen';
import { CookieBanner } from './components/CookieBanner';
import { initGA4 } from './utils/analytics';

export default function App() {
  const [selectedTurma, setSelectedTurma] = useState<Turma | null>(null);
  const [origem, setOrigem] = useState<'link' | 'selecao'>('link');
  const [showCookieBanner, setShowCookieBanner] = useState<boolean>(() => {
    const consent = repository.getAnalyticsConsent();
    return consent === null;
  });

  const [initialFormState, setInitialFormState] = useState<{
    regional: string;
    unidade: string;
    curso: string;
    turno: string;
  }>({
    regional: '',
    unidade: '',
    curso: '',
    turno: '',
  });

  // Inicializar GA4 (respeita recusa salva se houver)
  useEffect(() => {
    initGA4();
  }, []);

  // Parse URL query params
  const checkUrlParams = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const regional = params.get('regional');
    const unidade = params.get('unidade');
    const curso = params.get('curso');
    const turno = params.get('turno');

    if (regional && unidade && curso && turno) {
      const found = repository.findTurma(regional, unidade, curso, turno);
      if (found) {
        setOrigem('link');
        setSelectedTurma(found);
        setInitialFormState({
          regional: found.regional,
          unidade: found.unidade,
          curso: found.curso,
          turno: found.turno,
        });
        return;
      }
    }

    // If params missing or invalid, stay on selector
    setSelectedTurma(null);
  }, []);

  useEffect(() => {
    checkUrlParams();

    const handlePopState = () => {
      checkUrlParams();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [checkUrlParams]);

  const handleSelectTurma = (
    regional: string,
    unidade: string,
    curso: string,
    turno: string
  ) => {
    const turma = repository.findTurma(regional, unidade, curso, turno);
    if (turma) {
      setOrigem('selecao');
      setSelectedTurma(turma);
      setInitialFormState({
        regional: turma.regional,
        unidade: turma.unidade,
        curso: turma.curso,
        turno: turma.turno,
      });

      // Update URL search params
      const params = new URLSearchParams(window.location.search);
      params.set('regional', turma.regional);
      params.set('unidade', turma.unidade);
      params.set('curso', turma.curso);
      params.set('turno', turma.turno);
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState({ turma }, '', newUrl);
    }
  };

  const handleBackToSelector = () => {
    setSelectedTurma(null);
    window.history.pushState({}, '', window.location.pathname);
  };

  return (
    <div className="min-h-screen text-[#131313] selection:bg-[#8C52FF] selection:text-[#FFFFFF]">
      {selectedTurma ? (
        <CalendarScreen
          turma={selectedTurma}
          origem={origem}
          onBackToSelector={handleBackToSelector}
          onOpenCookiePreferences={() => setShowCookieBanner(true)}
        />
      ) : (
        <SelectorScreen
          initialRegional={initialFormState.regional}
          initialUnidade={initialFormState.unidade}
          initialCurso={initialFormState.curso}
          initialTurno={initialFormState.turno}
          onSelectTurma={handleSelectTurma}
          onOpenCookiePreferences={() => setShowCookieBanner(true)}
        />
      )}

      {/* Faixa de consentimento de cookies */}
      <CookieBanner
        isOpen={showCookieBanner}
        hasBottomCta={Boolean(selectedTurma)}
        onClose={() => setShowCookieBanner(false)}
      />
    </div>
  );
}
