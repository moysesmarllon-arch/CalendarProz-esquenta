import React from 'react';
import { repository } from '../data/repository';
import { initGA4, disableGA4 } from '../utils/analytics';
import { ExternalLink, ShieldCheck } from 'lucide-react';

interface CookieBannerProps {
  isOpen: boolean;
  hasBottomCta?: boolean;
  onClose: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({
  isOpen,
  hasBottomCta = false,
  onClose,
}) => {
  if (!isOpen) return null;

  const config = repository.getAnalyticsConfig();
  const politicaUrl = config?.politicaPrivacidadeUrl || 'https://prozeducacao.com.br/politica-de-privacidade/';

  const handleAccept = () => {
    repository.setAnalyticsConsent('ok');
    initGA4();
    onClose();
  };

  const handleReject = () => {
    repository.setAnalyticsConsent('recusado');
    disableGA4();
    onClose();
  };

  const bottomClass = hasBottomCta
    ? 'bottom-[58px] sm:bottom-[66px]'
    : 'bottom-0';

  return (
    <div
      className={`fixed ${bottomClass} left-0 right-0 z-50 p-3.5 sm:p-4 bg-[#FFFFFF] border-t border-[#EFEFEF] card-shadow animate-in slide-in-from-bottom duration-200`}
      role="region"
      aria-label="Aviso de cookies e privacidade"
    >
      <div className="max-w-2xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-[#5D5F69] leading-relaxed flex-1">
          <div className="flex items-center gap-1.5 font-bold text-[#593493] mb-1 sm:hidden">
            <ShieldCheck className="w-4 h-4 text-[#8C52FF]" />
            <span>Privacidade e cookies</span>
          </div>
          <span>
            Usamos cookies de análise para entender, de forma agregada, como o calendário é usado e melhorá-lo. Não coletamos seu nome nem seus dados de contato.{' '}
          </span>
          <a
            href={politicaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8C52FF] font-bold hover:text-[#593493] underline inline-flex items-center gap-0.5"
          >
            Política de Privacidade
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={handleReject}
            className="px-3 py-2 rounded-[10px] text-xs font-medium text-[#5D5F69] hover:text-[#131313] hover:bg-[#EFEFEF] active:bg-[#EFEFEF]/80 transition-colors cursor-pointer"
          >
            Não quero ser medido
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="px-4 py-2 rounded-[10px] bg-[#593493] hover:opacity-90 active:scale-[0.99] text-[#FFFFFF] text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};
