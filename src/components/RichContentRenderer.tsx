import React, { useState } from 'react';
import { Image as ImageIcon, Trash2, Maximize2, X } from 'lucide-react';
import { MathEquation, renderWithEquations } from './MathEquation';

interface RichContentRendererProps {
  content: string;
  subtitle?: string;
  images?: string[];
  onDeleteImage?: (index: number) => void;
  canDeleteImage?: boolean;
}

export default function RichContentRenderer({
  content,
  subtitle,
  images,
  onDeleteImage,
  canDeleteImage = false,
}: RichContentRendererProps) {
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);

  // Helper to parse line-level formatting (inline bold, italic, underline, strikethrough, images, math)
  const renderFormattedText = (text: string) => {
    // Check if line is image ![alt](url)
    const imgMatch = text.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      const alt = imgMatch[1];
      const src = imgMatch[2];
      return (
        <figure className="my-4 group relative inline-block max-w-full">
          <img
            src={src}
            alt={alt || 'Gambar materi'}
            className="max-h-96 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer object-contain bg-slate-50 dark:bg-slate-800"
            onClick={() => setZoomImageUrl(src)}
          />
          {alt && <figcaption className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 italic text-center">{alt}</figcaption>}
        </figure>
      );
    }

    // Replace HTML/Markdown tokens safely
    const tokens = parseInlineTokens(text);
    return (
      <span>
        {tokens.map((token, i) => {
          if (token.type === 'bold') {
            return <strong key={i} className="font-bold text-slate-950 dark:text-white">{renderWithEquations(token.value)}</strong>;
          }
          if (token.type === 'italic') {
            return <em key={i} className="italic text-slate-800 dark:text-slate-200">{renderWithEquations(token.value)}</em>;
          }
          if (token.type === 'underline') {
            return <u key={i} className="underline decoration-indigo-500 underline-offset-2">{renderWithEquations(token.value)}</u>;
          }
          if (token.type === 'strike') {
            return <del key={i} className="line-through text-slate-500 dark:text-slate-400 decoration-rose-500">{renderWithEquations(token.value)}</del>;
          }
          return <React.Fragment key={i}>{renderWithEquations(token.value)}</React.Fragment>;
        })}
      </span>
    );
  };

  // Process blocks (Headers, Tables, Lists, Paragraphs)
  const renderBlocks = () => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed) {
        elements.push(<div key={`blank-${i}`} className="h-3" />);
        i++;
        continue;
      }

      // 1. Headers
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={`h3-${i}`} className="text-base sm:text-lg font-bold text-indigo-700 dark:text-indigo-400 mt-5 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-indigo-500 rounded-full inline-block"></span>
            {renderFormattedText(trimmed.slice(4))}
          </h3>
        );
        i++;
        continue;
      }

      if (trimmed.startsWith('## ')) {
        elements.push(
          <h2 key={`h2-${i}`} className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-6 mb-2.5 pb-1 border-b border-slate-200 dark:border-slate-800">
            {renderFormattedText(trimmed.slice(3))}
          </h2>
        );
        i++;
        continue;
      }

      if (trimmed.startsWith('# ')) {
        elements.push(
          <h1 key={`h1-${i}`} className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white mt-7 mb-3 pb-2 border-b-2 border-indigo-500/40 tracking-tight">
            {renderFormattedText(trimmed.slice(2))}
          </h1>
        );
        i++;
        continue;
      }

      // Block Equation ($$...$$ or [eq-block]...[/eq-block])
      if ((trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 2) ||
          (trimmed.startsWith('[eq-block]') && trimmed.endsWith('[/eq-block]'))) {
        const math = trimmed.startsWith('$$') ? trimmed.slice(2, -2).trim() : trimmed.slice(10, -11).trim();
        elements.push(<MathEquation key={`eq-${i}`} math={math} block={true} />);
        i++;
        continue;
      }

      // 2. Table Block (lines starting with '|')
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          tableLines.push(lines[i].trim());
          i++;
        }

        elements.push(
          <div key={`table-${i}`} className="my-5 overflow-x-auto rounded-xl border border-slate-300 dark:border-slate-700 shadow-2xs">
            <table className="w-full text-left text-xs sm:text-sm border-collapse bg-white dark:bg-slate-900">
              {tableLines.map((rowText, rowIdx) => {
                // Check if row is delimiter e.g. |---|---|
                const isDelimiter = /^\|(\s*[-:]+\s*\|)+$/.test(rowText);
                if (isDelimiter) return null;

                const cells = rowText
                  .slice(1, -1)
                  .split('|')
                  .map(c => c.trim());

                if (rowIdx === 0) {
                  return (
                    <thead key={rowIdx} className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold border-b border-slate-300 dark:border-slate-700">
                      <tr>
                        {cells.map((cell, cellIdx) => (
                          <th key={cellIdx} className="px-3.5 py-2.5 border-r border-slate-300 dark:border-slate-700 last:border-r-0">
                            {renderFormattedText(cell)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  );
                }

                return (
                  <tbody key={rowIdx} className="divide-y divide-slate-200 dark:divide-slate-800">
                    <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors odd:bg-slate-50/30 dark:odd:bg-slate-850/30">
                      {cells.map((cell, cellIdx) => (
                        <td key={cellIdx} className="px-3.5 py-2 border-r border-slate-200 dark:border-slate-800 last:border-r-0 text-slate-800 dark:text-slate-300">
                          {renderFormattedText(cell)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                );
              })}
            </table>
          </div>
        );
        continue;
      }

      // 3. Bullet List (- item or * item)
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const listItems: string[] = [];
        while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
          listItems.push(lines[i].trim().slice(2));
          i++;
        }

        elements.push(
          <ul key={`ul-${i}`} className="my-3 space-y-1.5 pl-5 list-disc text-slate-800 dark:text-slate-200">
            {listItems.map((item, itemIdx) => (
              <li key={itemIdx} className="leading-relaxed">
                {renderFormattedText(item)}
              </li>
            ))}
          </ul>
        );
        continue;
      }

      // 4. Numbered List (1. item)
      if (/^\d+\.\s/.test(trimmed)) {
        const listItems: string[] = [];
        while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
          const matched = lines[i].trim().replace(/^\d+\.\s/, '');
          listItems.push(matched);
          i++;
        }

        elements.push(
          <ol key={`ol-${i}`} className="my-3 space-y-1.5 pl-5 list-decimal text-slate-800 dark:text-slate-200">
            {listItems.map((item, itemIdx) => (
              <li key={itemIdx} className="leading-relaxed">
                {renderFormattedText(item)}
              </li>
            ))}
          </ol>
        );
        continue;
      }

      // 5. Normal paragraph / line
      elements.push(
        <p key={`p-${i}`} className="leading-relaxed text-slate-800 dark:text-slate-200 my-1.5">
          {renderFormattedText(trimmed)}
        </p>
      );
      i++;
    }

    return elements;
  };

  return (
    <div className="rich-content space-y-2">
      {/* Subtitle if present */}
      {subtitle && (
        <div className="p-3 bg-indigo-50/80 dark:bg-indigo-950/40 border-l-4 border-indigo-600 rounded-r-xl text-xs sm:text-sm font-medium text-indigo-950 dark:text-indigo-200">
          <span className="font-bold block text-[11px] uppercase tracking-wider text-indigo-700 dark:text-indigo-400">Subjudul</span>
          {subtitle}
        </div>
      )}

      {/* Main Blocks */}
      <div className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
        {renderBlocks()}
      </div>

      {/* Attached Images Gallery (can be viewed and deleted) */}
      {images && images.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-indigo-500" />
            Lampiran Gambar ({images.length})
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((imgUrl, idx) => (
              <div
                key={idx}
                className="relative group rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800 aspect-video flex items-center justify-center shadow-2xs"
              >
                <img
                  src={imgUrl}
                  alt={`Lampiran ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => setZoomImageUrl(imgUrl)}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setZoomImageUrl(imgUrl)}
                    className="p-1.5 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 rounded-lg hover:scale-110 transition-transform"
                    title="Perbesar gambar"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                  {canDeleteImage && onDeleteImage && (
                    <button
                      type="button"
                      onClick={() => onDeleteImage(idx)}
                      className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 hover:scale-110 transition-transform"
                      title="Hapus gambar ini"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox for zooming images */}
      {zoomImageUrl && (
        <div
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setZoomImageUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setZoomImageUrl(null)}
              className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={zoomImageUrl}
              alt="Gambar diperbesar"
              className="max-h-[85vh] w-auto max-w-full rounded-xl object-contain mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Tokenizer for inline formatting
interface InlineToken {
  type: 'text' | 'bold' | 'italic' | 'underline' | 'strike';
  value: string;
}

function parseInlineTokens(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let remaining = text;

  // Pattern matches:
  // <u>...</u>
  // ~~...~~
  // **...**
  // *...*
  const pattern = /(<u>.*?<\/u>|~~.*?~~|\*\*.*?\*\*|\*.*?\*)/;

  while (remaining.length > 0) {
    const match = remaining.match(pattern);
    if (!match || match.index === undefined) {
      tokens.push({ type: 'text', value: remaining });
      break;
    }

    // Text before match
    if (match.index > 0) {
      tokens.push({ type: 'text', value: remaining.slice(0, match.index) });
    }

    const matchedStr = match[0];
    if (matchedStr.startsWith('<u>') && matchedStr.endsWith('</u>')) {
      tokens.push({ type: 'underline', value: matchedStr.slice(3, -4) });
    } else if (matchedStr.startsWith('~~') && matchedStr.endsWith('~~')) {
      tokens.push({ type: 'strike', value: matchedStr.slice(2, -2) });
    } else if (matchedStr.startsWith('**') && matchedStr.endsWith('**')) {
      tokens.push({ type: 'bold', value: matchedStr.slice(2, -2) });
    } else if (matchedStr.startsWith('*') && matchedStr.endsWith('*')) {
      tokens.push({ type: 'italic', value: matchedStr.slice(1, -1) });
    } else {
      tokens.push({ type: 'text', value: matchedStr });
    }

    remaining = remaining.slice(match.index + matchedStr.length);
  }

  return tokens;
}
