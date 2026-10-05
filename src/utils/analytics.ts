import { repository } from '../data/repository';

let initialUtms: { utm_source?: string; utm_medium?: string; utm_campaign?: string } | null = null;
let hasSentInitialUtms = false;

export function getInitialUtms(): { utm_source?: string; utm_medium?: string; utm_campaign?: string } {
  if (initialUtms === null) {
    initialUtms = {};
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const source = params.get('utm_source');
        const medium = params.get('utm_medium');
        const campaign = params.get('utm_campaign');
        if (source) initialUtms.utm_source = source;
        if (medium) initialUtms.utm_medium = medium;
        if (campaign) initialUtms.utm_campaign = campaign;
      } catch {
        // ignore
      }
    }
  }
  return initialUtms;
}

export function clearGaCookies(): void {
  if (typeof document === 'undefined') return;
  try {
    const cookies = document.cookie.split(';');
    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    for (const cookie of cookies) {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim();
      if (name === '_ga' || name.startsWith('_ga_')) {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
        document.cookie = `${name}=; path=/; domain=${hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
        if (parts.length > 1) {
          const rootDomain = '.' + parts.slice(-2).join('.');
          document.cookie = `${name}=; path=/; domain=${rootDomain}; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
        }
      }
    }
  } catch {
    // ignore
  }
}

export function isAnalyticsAllowed(): boolean {
  const consent = repository.getAnalyticsConsent();
  return consent?.status !== 'recusado';
}

export function initGA4(): void {
  if (typeof window === 'undefined') return;

  const config = repository.getAnalyticsConfig();
  if (!config?.ga4Id) return;

  const ga4Id = config.ga4Id;

  // Se o usuário recusou, não carrega e desativa
  if (!isAnalyticsAllowed()) {
    (window as any)[`ga-disable-${ga4Id}`] = true;
    clearGaCookies();
    return;
  }

  // Ativa envio (caso tenha sido desativado anteriormente)
  (window as any)[`ga-disable-${ga4Id}`] = false;

  // Setup dataLayer e gtag
  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  if (!w.gtag) {
    w.gtag = function () {
      w.dataLayer.push(arguments);
    };
  }

  w.gtag('js', new Date());
  w.gtag('config', ga4Id, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  // Carrega o script dinamicamente se ainda não existir
  const scriptId = 'ga4-script';
  if (!document.getElementById(scriptId)) {
    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`;
    document.head.appendChild(script);
  }
}

export function disableGA4(): void {
  if (typeof window === 'undefined') return;

  const config = repository.getAnalyticsConfig();
  if (config?.ga4Id) {
    (window as any)[`ga-disable-${config.ga4Id}`] = true;
  }

  // Remove o script do GA4 da página
  const script = document.getElementById('ga4-script');
  if (script) {
    script.remove();
  }

  // Limpa cookies do Google Analytics
  clearGaCookies();
}

function sendGtagEvent(eventName: string, params: Record<string, any> = {}): void {
  if (typeof window === 'undefined') return;
  if (!isAnalyticsAllowed()) return;

  const w = window as any;
  if (typeof w.gtag === 'function') {
    w.gtag('event', eventName, params);
  }
}

// 4. Page Views Virtuais
export function trackPageView(pageTitle: string): void {
  if (!isAnalyticsAllowed()) return;

  const params: Record<string, any> = {
    page_title: pageTitle,
    page_location: typeof window !== 'undefined' ? window.location.href : '',
  };

  // Preservar UTMs no primeiro page_view
  if (!hasSentInitialUtms) {
    const utms = getInitialUtms();
    Object.assign(params, utms);
    hasSentInitialUtms = true;
  }

  sendGtagEvent('page_view', params);
}

// 4. Eventos específicos
export function trackVerCalendario(
  turma: { regional: string; unidade: string; curso: string; turno: string },
  origem: 'link' | 'selecao'
): void {
  sendGtagEvent('ver_calendario', {
    regional: turma.regional,
    unidade: turma.unidade,
    curso: turma.curso,
    turno: turma.turno,
    origem,
  });
}

export function trackTrocarAba(aba: 'calendario' | 'curso'): void {
  sendGtagEvent('trocar_aba', {
    aba,
  });
}

export function trackBaixarAgenda(turma?: { regional: string; unidade: string; curso: string; turno: string }): void {
  sendGtagEvent('baixar_agenda', turma ? {
    regional: turma.regional,
    unidade: turma.unidade,
    curso: turma.curso,
    turno: turma.turno,
  } : {});
}

export function trackGoogleAgenda(turma?: { regional: string; unidade: string; curso: string; turno: string }): void {
  sendGtagEvent('google_agenda', turma ? {
    regional: turma.regional,
    unidade: turma.unidade,
    curso: turma.curso,
    turno: turma.turno,
  } : {});
}

export function trackWhatsappClique(turma?: { regional: string; unidade: string; curso: string; turno: string }): void {
  sendGtagEvent('whatsapp_clique', turma ? {
    regional: turma.regional,
    unidade: turma.unidade,
    curso: turma.curso,
    turno: turma.turno,
  } : {});
}

export function trackVerMapa(turma?: { regional?: string; unidade?: string }): void {
  sendGtagEvent('ver_mapa', {
    regional: turma?.regional,
    unidade: turma?.unidade,
  });
}

export function trackCompartilhar(turma?: { regional: string; unidade: string; curso: string; turno: string }): void {
  sendGtagEvent('compartilhar', turma ? {
    regional: turma.regional,
    unidade: turma.unidade,
    curso: turma.curso,
    turno: turma.turno,
  } : {});
}
