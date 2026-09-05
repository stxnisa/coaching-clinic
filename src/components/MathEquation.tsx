import React, { useMemo } from 'react';
import katex from 'katex';

interface MathEquationProps {
  key?: React.Key;
  math: string;
  block?: boolean;
  className?: string;
}

export function MathEquation({ math, block = false, className = '' }: MathEquationProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode: block,
        throwOnError: false,
        strict: false,
      });
    } catch (err) {
      return `<span class="text-rose-500 font-mono text-xs">Error Equation: ${math}</span>`;
    }
  }, [math, block]);

  if (block) {
    return (
      <div 
        className={`my-3 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl overflow-x-auto text-center border border-slate-200 dark:border-slate-700 shadow-2xs ${className}`}
        dangerouslySetInnerHTML={{ __html: html }} 
      />
    );
  }

  return (
    <span 
      className={`inline-block px-1 align-middle ${className}`}
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
}

/**
 * Splits text into text segments and MathEquation components
 * Supports:
 * 1. Block equations: $$...$$ or [eq-block]...[/eq-block]
 * 2. Inline equations: $...$ or [eq]...[/eq]
 */
export function renderWithEquations(text: string): React.ReactNode {
  if (!text) return null;

  // First handle block equations $$...$$ or [eq-block]...[/eq-block]
  const blockRegex = /(\$\$[\s\S]*?\$\$|\[eq-block\][\s\S]*?\[\/eq-block\])/g;
  const parts = text.split(blockRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith('$$') && part.endsWith('$$')) {
      const math = part.slice(2, -2);
      return <MathEquation key={`block-${index}`} math={math} block={true} />;
    }
    if (part.startsWith('[eq-block]') && part.endsWith('[/eq-block]')) {
      const math = part.slice(10, -11);
      return <MathEquation key={`block-${index}`} math={math} block={true} />;
    }

    // Now handle inline equations $...$ or [eq]...[/eq]
    // Note: avoid matching single dollar signs that are currency (e.g. $10) by checking standard regex
    const inlineRegex = /(\$(?!\s)[^$\n]+(?<!\s)\$|\[eq\][\s\S]*?\[\/eq\])/g;
    const inlineParts = part.split(inlineRegex);

    if (inlineParts.length === 1) {
      return <React.Fragment key={`text-${index}`}>{part}</React.Fragment>;
    }

    return (
      <React.Fragment key={`inline-container-${index}`}>
        {inlineParts.map((subPart, subIndex) => {
          if (!subPart) return null;

          if (subPart.startsWith('$') && subPart.endsWith('$') && subPart.length > 2) {
            const math = subPart.slice(1, -1);
            return <MathEquation key={`inline-${index}-${subIndex}`} math={math} block={false} />;
          }
          if (subPart.startsWith('[eq]') && subPart.endsWith('[/eq]')) {
            const math = subPart.slice(4, -5);
            return <MathEquation key={`inline-${index}-${subIndex}`} math={math} block={false} />;
          }

          return <React.Fragment key={`subtext-${index}-${subIndex}`}>{subPart}</React.Fragment>;
        })}
      </React.Fragment>
    );
  });
}
