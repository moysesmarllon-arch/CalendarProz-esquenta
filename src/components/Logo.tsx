import React from 'react';

/**
 * =============================================================================
 * LOGOTIPO OFICIAL PROZ EDUCAÇÃO
 * =============================================================================
 * Conforme anexo fornecido pelo usuário ("Adobe Express - file.png"):
 * 
 * 1. SÍMBOLO GEOMÉTRICO (à esquerda, largura 54px, altura 82px):
 *    - Linha 1, Coluna 1: Círculo em Laranja (#FF7F00) representando a cabeça/figura.
 *    - Linha 1, Coluna 2: Triângulo em Roxo Primário (#593493) com topo horizontal e diagonal.
 *    - Linha 2, Coluna 1: Triângulo em Laranja (#FF7F00) com hipotenusa para cima.
 *    - Linha 2, Coluna 2: Quadrante em Laranja (#FF7F00) com arco curvado.
 *    - Linha 3, Coluna 1: Retângulo vertical em Laranja (#FF7F00) com cantos levemente arredondados.
 *
 * 2. TIPOGRAFIA / WORDMARK "Proz" (à direita, x: 70 a 274, y: 0 a 82):
 *    - Letra 'P': Haste vertical e bojo arredondado bem proporcionado.
 *    - Letra 'r': Haste com ombro/arco curvado moderno.
 *    - Letra 'o': Círculo com espessura uniforme.
 *    - Letra 'z': Barras horizontais superior e inferior (13px de espessura)
 *                 conectadas por traço diagonal sólido, sem corte nem aparência de '7'.
 *
 * 3. VARIANTES DE COR:
 *    - 'primary': Símbolo em Laranja (#FF7F00) e Roxo (#593493) + Wordmark em Roxo (#593493)
 *                 (usado sobre fundos claros).
 *    - 'white':   Todas as formas e letras em Branco (#FFFFFF)
 *                 (usado sobre o gradiente primário).
 *
 * 4. PROPORÇÃO E ACESSIBILIDADE:
 *    - Proporção exata 274 × 82 (aspect ratio ~3.34:1).
 *    - Sem altura fixa, sem overflow:hidden, sem clip-path, com largura mínima de 80px.
 *    - Renderização híbrida vetorial direta para máxima nitidez em qualquer tela retina/mobile.
 * =============================================================================
 */

interface LogoProps {
  variant?: 'primary' | 'white';
  className?: string;
  widthClass?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'primary',
  className = '',
  widthClass = 'w-[140px] sm:w-[180px]',
}) => {
  const isWhite = variant === 'white';

  // Cores exatas da identidade visual da Proz Educação
  const orangeColor = isWhite ? '#FFFFFF' : '#FF7F00';
  const purpleColor = isWhite ? '#FFFFFF' : '#593493';

  return (
    <div
      className={`inline-block ${className}`}
      style={{ minWidth: '80px' }}
      title="Proz Educação"
    >
      {/* 
        Renderização vetorial direta (SVG inline) baseada no anexo do Adobe Express.
        Garante que o logo nunca fique em branco por falha de cache ou requisição.
      */}
      <svg
        viewBox="0 0 274 82"
        className={`${widthClass} h-auto min-w-[80px] max-w-full block`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Logo Proz Educação"
      >
        {/* =======================================================
            SÍMBOLO GEOMÉTRICO PROZ (ANEXO ADOBE EXPRESS)
            ======================================================= */}
        <g id="proz-icon">
          {/* Círculo Laranja - Cabeça */}
          <circle cx="13" cy="13" r="13" fill={orangeColor} />

          {/* Triângulo Roxo - Detalhe superior direito */}
          <path d="M 28,0 H 54 L 28,26 Z" fill={purpleColor} />

          {/* Triângulo Laranja - Detalhe médio esquerdo */}
          <path d="M 0,28 L 26,54 H 0 Z" fill={orangeColor} />

          {/* Quadrante Laranja - Detalhe médio direito com arco */}
          <path d="M 28,28 A 26 26 0 0 1 54,54 H 28 Z" fill={orangeColor} />

          {/* Barra vertical Laranja - Base inferior esquerda */}
          <rect x="0" y="56" width="26" height="26" rx="2" fill={orangeColor} />
        </g>

        {/* =======================================================
            WORDMARK "Proz" (ANEXO ADOBE EXPRESS)
            ======================================================= */}
        <g id="proz-letters" fill={purpleColor}>
          {/* Letra 'P' */}
          <path d="M 72,6 H 108 C 122,6 131,15 131,27 C 131,39 122,48 108,48 H 89 V 82 H 72 Z M 89,21 H 106 C 111,21 114,23.5 114,27 C 114,30.5 111,33 106,33 H 89 Z" />

          {/* Letra 'r' */}
          <path d="M 138,26 H 153 V 35.5 C 156.5,29.5 161.5,26 168.5,26 V 41.5 C 167,41.5 165.5,41.2 163.5,41.2 C 157.5,41.2 153,45.5 153,53 V 82 H 138 Z" />

          {/* Letra 'o' */}
          <path d="M 200,26 C 215.5,26 226,38 226,54 C 226,70 215.5,82 200,82 C 184.5,82 174,70 174,54 C 174,38 184.5,26 200,26 Z M 200,41 C 192.5,41 188.5,46.5 188.5,54 C 188.5,61.5 192.5,67 200,67 C 207.5,67 211.5,61.5 211.5,54 C 211.5,46.5 207.5,41 200,41 Z" />

          {/* Letra 'z' completa (barra superior, diagonal precisa e barra inferior) */}
          <path d="M 233,26 H 273 V 38.5 L 251.5,69.5 H 273 V 82 H 233 V 69.5 L 254.5,38.5 H 233 Z" />
        </g>
      </svg>

      {/*
        COMENTÁRIO DE CÓDIGO CONFORME SOLICITADO:
        Caso prefira utilizar tags <img src="/logo-*.svg">, os arquivos também
        estão salvos e sincronizados em public/logo-primario.svg e public/logo-mono-branco.svg:
        
        <img
          src={isWhite ? "/logo-mono-branco.svg" : "/logo-primario.svg"}
          alt="Proz Educação"
          className={`${widthClass} h-auto min-w-[80px] block`}
          width={274}
          height={82}
        />
      */}
    </div>
  );
};
