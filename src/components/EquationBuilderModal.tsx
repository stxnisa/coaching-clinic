import React, { useState } from 'react';
import { X, Check, Calculator, Sparkles, BookOpen } from 'lucide-react';
import { MathEquation } from './MathEquation';

interface EquationBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (formulaSnippet: string) => void;
  targetContextName?: string; // e.g. "Materi" or "Soal Kuis"
}

interface TemplateCategory {
  name: string;
  items: { label: string; formula: string; previewDesc: string }[];
}

const TEMPLATES: TemplateCategory[] = [
  {
    name: 'Dasar & Pecahan',
    items: [
      { label: 'Pecahan (Fraction)', formula: '\\frac{a}{b}', previewDesc: 'a/b' },
      { label: 'Akar Kuadrat (Sqrt)', formula: '\\sqrt{x}', previewDesc: 'Akar x' },
      { label: 'Akar Pangkat n', formula: '\\sqrt[n]{x}', previewDesc: 'Akar derajat n' },
      { label: 'Eksponen (Pangkat)', formula: 'x^{2}', previewDesc: 'x kuadrat' },
      { label: 'Subskrip (Indeks)', formula: 'x_{i}', previewDesc: 'x indeks i' },
      { label: 'Pangkat & Indeks', formula: 'x_{i}^{2}', previewDesc: 'Kombinasi indeks & pangkat' },
    ],
  },
  {
    name: 'Aljabar & Rumus Populer',
    items: [
      { 
        label: 'Rumus ABC (Kuadrat)', 
        formula: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', 
        previewDesc: 'Akar persamaan kuadrat' 
      },
      { 
        label: 'Teorema Pythagoras', 
        formula: 'a^2 + b^2 = c^2', 
        previewDesc: 'Panjang sisi segitiga siku-siku' 
      },
      { 
        label: 'Persamaan Garis', 
        formula: 'y - y_1 = m(x - x_1)', 
        previewDesc: 'Bentuk gradien satu titik' 
      },
      {
        label: 'Logaritma',
        formula: '^{a}\\log(b) = c \\iff a^c = b',
        previewDesc: 'Definisi logaritma'
      }
    ],
  },
  {
    name: 'Kalkulus & Analisis',
    items: [
      { label: 'Integral Tentu', formula: '\\int_{a}^{b} f(x) \\, dx', previewDesc: 'Integral a ke b' },
      { label: 'Integral Tak Tentu', formula: '\\int f(x) \\, dx = F(x) + C', previewDesc: 'Anti-turunan' },
      { label: 'Turunan (Derivatif)', formula: '\\frac{df}{dx} = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}', previewDesc: 'Definisi limit turunan' },
      { label: 'Notasi Sigma (Deret)', formula: '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}', previewDesc: 'Deret aritmatika' },
      { label: 'Limit Aljabar', formula: '\\lim_{x \\to \\infty} \\left(1 + \\frac{1}{x}\\right)^x = e', previewDesc: 'Konstanta Euler' },
    ],
  },
  {
    name: 'Fisika, Kimia & Vektor',
    items: [
      { label: 'Energi Einstein', formula: 'E = m \\cdot c^2', previewDesc: 'Kesetaraan massa & energi' },
      { label: 'Hukum Newton II', formula: '\\sum \\vec{F} = m \\cdot \\vec{a}', previewDesc: 'Gaya gerak benda' },
      { label: 'Rumus Kimia Air', formula: '2\\text{H}_2 + \\text{O}_2 \\rightarrow 2\\text{H}_2\\text{O}', previewDesc: 'Reaksi molekul' },
      { label: 'Matriks 2x2', formula: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', previewDesc: 'Matriks dua baris dua kolom' },
    ],
  },
];

const QUICK_SYMBOLS = [
  { symbol: '\\pm', desc: 'Plus minus (±)' },
  { symbol: '\\times', desc: 'Kali (×)' },
  { symbol: '\\div', desc: 'Bagi (÷)' },
  { symbol: '\\neq', desc: 'Tidak sama (≠)' },
  { symbol: '\\leq', desc: 'Kurang sama (≤)' },
  { symbol: '\\geq', desc: 'Lebih sama (≥)' },
  { symbol: '\\approx', desc: 'Mendekati (≈)' },
  { symbol: '\\infty', desc: 'Tak hingga (∞)' },
  { symbol: '\\pi', desc: 'Pi (π)' },
  { symbol: '\\alpha', desc: 'Alpha (α)' },
  { symbol: '\\beta', desc: 'Beta (β)' },
  { symbol: '\\theta', desc: 'Theta (θ)' },
  { symbol: '\\lambda', desc: 'Lambda (λ)' },
  { symbol: '\\Delta', desc: 'Delta (Δ)' },
  { symbol: '\\rightarrow', desc: 'Panah kanan (→)' },
  { symbol: '\\degree', desc: 'Derajat (°)' },
  { symbol: '\\in', desc: 'Elemen himpunan (∈)' },
  { symbol: '\\subset', desc: 'Bagian himpunan (⊂)' },
];

export default function EquationBuilderModal({
  isOpen,
  onClose,
  onInsert,
  targetContextName = 'Materi',
}: EquationBuilderModalProps) {
  const [equationCode, setEquationCode] = useState('\\frac{a}{b}');
  const [isBlock, setIsBlock] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);

  if (!isOpen) return null;

  const handleApplyTemplate = (formula: string) => {
    setEquationCode(formula);
  };

  const handleInsertSymbol = (sym: string) => {
    setEquationCode((prev) => `${prev} ${sym}`);
  };

  const handleInsert = () => {
    if (!equationCode.trim()) return;
    const formatted = isBlock
      ? `\n$$${equationCode.trim()}$$\n`
      : `$${equationCode.trim()}$`;
    onInsert(formatted);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Sisipkan Persamaan Matematika & Sains (LaTeX)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pilih template atau ketik rumus untuk disisipkan ke dalam {targetContextName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Live Rendered Equation Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Pratinjau Hasil Persamaan (Live KaTeX Preview)
              </label>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsBlock(false)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                    !isBlock 
                      ? 'bg-indigo-600 text-white shadow-2xs' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  Segaris ($inline$)
                </button>
                <button
                  type="button"
                  onClick={() => setIsBlock(true)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                    isBlock 
                      ? 'bg-indigo-600 text-white shadow-2xs' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  Baris Baru ($$block$$)
                </button>
              </div>
            </div>

            <div className="min-h-[70px] p-4 bg-slate-50 dark:bg-slate-950/80 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-x-auto">
              {equationCode.trim() ? (
                <MathEquation math={equationCode} block={isBlock} />
              ) : (
                <span className="text-xs text-slate-400 italic">Ketik atau pilih template di bawah untuk melihat rumus...</span>
              )}
            </div>
          </div>

          {/* Code Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Kode Formula LaTeX
            </label>
            <textarea
              rows={2}
              value={equationCode}
              onChange={(e) => setEquationCode(e.target.value)}
              placeholder="Contoh: \frac{a}{b} atau x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}"
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Quick Symbol Buttons */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Koleksi Simbol Cepat (Klik untuk menyisipkan)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SYMBOLS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleInsertSymbol(s.symbol)}
                  title={s.desc}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono transition-colors cursor-pointer"
                >
                  <MathEquation math={s.symbol} />
                </button>
              ))}
            </div>
          </div>

          {/* Template Categories Tabs */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Template Rumus Siap Pakai
            </label>
            <div className="flex gap-1.5 overflow-x-auto pb-1 mb-2 border-b border-slate-200 dark:border-slate-800">
              {TEMPLATES.map((cat, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveCategory(idx)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap cursor-pointer transition-colors ${
                    activeCategory === idx
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TEMPLATES[activeCategory].items.map((tpl, tIdx) => (
                <button
                  key={tIdx}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl.formula)}
                  className="p-2.5 text-left bg-slate-50 hover:bg-indigo-50/70 dark:bg-slate-800/60 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-xl transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {tpl.label}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {tpl.previewDesc}
                    </div>
                  </div>
                  <div className="p-1.5 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800 group-hover:border-indigo-300">
                    <MathEquation math={tpl.formula} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Format: <code className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[11px]">{isBlock ? '$$rumus$$' : '$rumus$'}</code>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleInsert}
              disabled={!equationCode.trim()}
              className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Check className="h-4 w-4" />
              Sisipkan Persamaan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
