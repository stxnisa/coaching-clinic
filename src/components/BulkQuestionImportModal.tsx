import React, { useState, useRef } from 'react';
import { QuizQuestion, QuestionType } from '../types';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Copy, 
  Check, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ListPlus, 
  RefreshCw,
  HelpCircle
} from 'lucide-react';

interface BulkQuestionImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (importedQuestions: QuizQuestion[], mode: 'append' | 'replace') => void;
  currentQuestionCount: number;
}

interface ParsedQuestionRow {
  rowNum: number;
  text: string;
  type: QuestionType;
  options: string[];
  correctAnswerIndex: number;
  correctAnswerIndices: number[];
  explanation: string;
  points: number;
  isValid: boolean;
  errorReason?: string;
}

export default function BulkQuestionImportModal({
  isOpen,
  onClose,
  onImport,
  currentQuestionCount,
}: BulkQuestionImportModalProps) {
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedQuestionRow[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const sampleCsvData = `pertanyaan,tipe,opsi_1,opsi_2,opsi_3,opsi_4,opsi_5,kunci_jawaban,pembahasan,poin
Apa ibukota dari negara Indonesia?,single,Surabaya,Jakarta,Nusantara,Bandung,,C,Ibu kota baru Indonesia adalah Nusantara di Kalimantan Timur.,20
Manakah yang termasuk bilangan prima?,multiple,2,4,7,9,11,"A,C,E",Bilangan prima hanya habis dibagi 1 dan dirinya sendiri (2, 7, dan 11).,20
Pilihlah planet terbesar di tata surya!,dropdown,Bumi,Mars,Jupiter,Saturnus,,C,Jupiter adalah planet terbesar dalam tata surya kita.,20
Berapakah hasil dari 15 dikalikan 4?,single,45,50,60,75,,C,15 x 4 = 60.,20
Komponen utama dari air adalah hidrogen dan ...,single,Oksigen,Nitrogen,Helium,Karbon,,A,Rumus kimia air adalah H2O (Hidrogen dan Oksigen).,20`;

  // Parse CSV line handling quotes and commas
  const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
  };

  // Convert letter or 1-based index to zero-based index
  const convertAnswerToIndices = (ansRaw: string, optsCount: number): number[] => {
    const letterMap: Record<string, number> = {
      a: 0, b: 1, c: 2, d: 3, e: 4, f: 5,
      '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5
    };

    const parts = ansRaw.split(/[,;\s]+/).map(p => p.trim().toLowerCase()).filter(Boolean);
    const indices: number[] = [];

    for (const p of parts) {
      if (letterMap[p] !== undefined && letterMap[p] < optsCount) {
        if (!indices.includes(letterMap[p])) indices.push(letterMap[p]);
      } else {
        const num = parseInt(p, 10);
        if (!isNaN(num) && num >= 1 && num <= optsCount) {
          if (!indices.includes(num - 1)) indices.push(num - 1);
        }
      }
    }

    return indices.length > 0 ? indices.sort((a, b) => a - b) : [0];
  };

  const handleParseCsv = (rawText: string) => {
    const lines = rawText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) {
      setParsedRows([]);
      return;
    }

    // Determine header
    const firstLineCols = parseCsvLine(lines[0]).map(c => c.toLowerCase());
    const hasHeader = firstLineCols.some(c => 
      c.includes('tanya') || c.includes('soal') || c.includes('tipe') || c.includes('question')
    );

    const dataLines = hasHeader ? lines.slice(1) : lines;
    const rows: ParsedQuestionRow[] = [];

    dataLines.forEach((line, idx) => {
      const rowNum = hasHeader ? idx + 2 : idx + 1;
      const cols = parseCsvLine(line);
      if (cols.length === 1 && !cols[0]) return;

      // Columns mapping:
      // 0: text, 1: type, 2: opt1, 3: opt2, 4: opt3, 5: opt4, 6: opt5, 7: answer, 8: explanation, 9: points
      const text = cols[0] || '';
      const rawType = (cols[1] || 'single').toLowerCase().trim();
      let type: QuestionType = 'single';
      if (rawType.includes('multi') || rawType.includes('majemuk')) {
        type = 'multiple';
      } else if (rawType.includes('drop')) {
        type = 'dropdown';
      } else {
        type = 'single';
      }

      // Collect options (cols 2, 3, 4, 5, 6)
      const options: string[] = [];
      for (let i = 2; i <= 6; i++) {
        if (cols[i] && cols[i].trim()) {
          options.push(cols[i].trim());
        }
      }

      const rawAnswer = cols[7] || 'A';
      const explanation = cols[8] || '';
      const rawPoints = parseInt(cols[9], 10);
      const points = !isNaN(rawPoints) && rawPoints > 0 ? rawPoints : 20;

      let isValid = true;
      let errorReason = '';

      if (!text.trim()) {
        isValid = false;
        errorReason = 'Teks pertanyaan tidak boleh kosong';
      } else if (options.length < 2) {
        isValid = false;
        errorReason = `Minimal butuh 2 pilihan jawaban (saat ini ${options.length})`;
      }

      const answerIndices = convertAnswerToIndices(rawAnswer, Math.max(options.length, 2));

      rows.push({
        rowNum,
        text: text.trim(),
        type,
        options: options.length >= 2 ? options : ['Pilihan A', 'Pilihan B'],
        correctAnswerIndex: answerIndices[0] || 0,
        correctAnswerIndices: answerIndices,
        explanation: explanation.trim(),
        points,
        isValid,
        errorReason,
      });
    });

    setParsedRows(rows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      handleParseCsv(text);
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([sampleCsvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'template_bulk_soal_kuis.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(sampleCsvData);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const validRows = parsedRows.filter(r => r.isValid);
  const invalidRows = parsedRows.filter(r => !r.isValid);

  const handleApplyImport = () => {
    if (validRows.length === 0) {
      alert('Tidak ada butir soal yang valid untuk diimpor.');
      return;
    }

    const newQuestions: QuizQuestion[] = validRows.map((r, idx) => ({
      id: `q-bulk-${Date.now()}-${idx + 1}`,
      text: r.text,
      type: r.type,
      options: r.options,
      correctAnswerIndex: r.correctAnswerIndex,
      correctAnswerIndices: r.correctAnswerIndices,
      explanation: r.explanation,
      points: r.points,
    }));

    onImport(newQuestions, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 my-6">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Bulk Tambah Soal Kuis via CSV
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Impor puluhan soal pilihan ganda, majemuk, atau dropdown sekaligus melalui format spreadsheet CSV
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Format Information & Download Tools */}
          <div className="bg-indigo-50/60 dark:bg-indigo-950/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-indigo-950 dark:text-indigo-200">
                Format Header CSV:
              </p>
              <code className="text-[11px] font-mono text-indigo-700 dark:text-indigo-300 mt-1 block">
                pertanyaan, tipe, opsi_1, opsi_2, opsi_3, opsi_4, opsi_5, kunci_jawaban, pembahasan, poin
              </code>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1">
                * <b>tipe:</b> <code>single</code>, <code>multiple</code>, atau <code>dropdown</code>. <b>kunci_jawaban:</b> huruf opsi (misal <code>A</code>, <code>C</code>, atau majemuk <code>A,C</code>).
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-lg font-semibold flex items-center gap-1.5 hover:bg-indigo-100/50 cursor-pointer shadow-2xs"
              >
                <Download className="h-3.5 w-3.5" />
                Unduh Template CSV
              </button>
              <button
                type="button"
                onClick={handleCopyTemplate}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-lg font-semibold flex items-center gap-1.5 hover:bg-indigo-100/50 cursor-pointer shadow-2xs"
              >
                {copiedTemplate ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedTemplate ? 'Disalin!' : 'Salin Contoh'}
              </button>
            </div>
          </div>

          {/* Import Mode Selection */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">Mode Penambahan:</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Saat ini terdapat {currentQuestionCount} butir pertanyaan di dalam kuis.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setImportMode('append')}
                className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  importMode === 'append'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <ListPlus className="h-3.5 w-3.5" />
                Gabungkan (Tambahkan ke yang ada)
              </button>
              <button
                type="button"
                onClick={() => setImportMode('replace')}
                className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  importMode === 'replace'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Ganti Semua Soal
              </button>
            </div>
          </div>

          {/* Upload or Paste Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* File Upload Box */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl p-5 text-center bg-slate-50 dark:bg-slate-800/40 cursor-pointer transition-colors flex flex-col items-center justify-center"
            >
              <Upload className="h-7 w-7 text-indigo-600 dark:text-indigo-400 mb-2" />
              <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                {fileName ? fileName : 'Pilih atau Tarik File CSV Soal ke sini'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Format file .csv (UTF-8)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Direct Paste Area */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Atau Tempel / Ketik Teks CSV Langsung:
                </label>
                {csvText && (
                  <button
                    type="button"
                    onClick={() => {
                      setCsvText('');
                      setParsedRows([]);
                      setFileName('');
                    }}
                    className="text-rose-500 hover:underline cursor-pointer"
                  >
                    Bersihkan
                  </button>
                )}
              </div>
              <textarea
                rows={4}
                value={csvText}
                onChange={(e) => {
                  setCsvText(e.target.value);
                  handleParseCsv(e.target.value);
                }}
                placeholder="pertanyaan,tipe,opsi_1,opsi_2,opsi_3,opsi_4,opsi_5,kunci_jawaban,pembahasan,poin&#10;Berapakah 10+5?,single,12,15,18,20,,B,10 ditambah 5 adalah 15,20"
                className="w-full p-2.5 font-mono text-[11px] border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Parsed Rows Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Pratinjau Soal Terdeteksi ({parsedRows.length} soal)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                    {validRows.length} Siap Diimpor
                  </span>
                  {invalidRows.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-bold text-[10px]">
                      {invalidRows.length} Tidak Valid
                    </span>
                  )}
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto max-h-64">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 sticky top-0 font-bold">
                    <tr>
                      <th className="p-2.5 border-b border-slate-200 dark:border-slate-700 w-12">No</th>
                      <th className="p-2.5 border-b border-slate-200 dark:border-slate-700">Teks Pertanyaan</th>
                      <th className="p-2.5 border-b border-slate-200 dark:border-slate-700">Tipe</th>
                      <th className="p-2.5 border-b border-slate-200 dark:border-slate-700">Pilihan Jawaban</th>
                      <th className="p-2.5 border-b border-slate-200 dark:border-slate-700">Kunci Jawaban</th>
                      <th className="p-2.5 border-b border-slate-200 dark:border-slate-700">Poin</th>
                      <th className="p-2.5 border-b border-slate-200 dark:border-slate-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedRows.map((r, i) => (
                      <tr 
                        key={i}
                        className={r.isValid ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50' : 'bg-rose-50/50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200'}
                      >
                        <td className="p-2.5 font-mono text-slate-400">{r.rowNum}</td>
                        <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200 max-w-xs truncate">
                          {r.text || '-'}
                        </td>
                        <td className="p-2.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {r.type}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                          {r.options.map((opt, oIdx) => `${String.fromCharCode(65 + oIdx)}. ${opt}`).join(' | ')}
                        </td>
                        <td className="p-2.5 font-bold text-indigo-600 dark:text-indigo-400">
                          {r.type === 'multiple' 
                            ? r.correctAnswerIndices.map(idx => String.fromCharCode(65 + idx)).join(', ')
                            : String.fromCharCode(65 + r.correctAnswerIndex)}
                        </td>
                        <td className="p-2.5 font-semibold">{r.points}</td>
                        <td className="p-2.5">
                          {r.isValid ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                              <CheckCircle2 className="h-3 w-3" /> Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold" title={r.errorReason}>
                              <AlertCircle className="h-3 w-3" /> {r.errorReason}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 rounded-b-2xl flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleApplyImport}
            disabled={validRows.length === 0}
            className={`px-5 py-2.5 rounded-xl font-semibold text-white text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-colors ${
              validRows.length > 0
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            <ListPlus className="h-4 w-4" />
            {importMode === 'append'
              ? `Tambahkan ${validRows.length} Soal ke Kuis`
              : `Ganti dengan ${validRows.length} Soal Baru`}
          </button>
        </div>

      </div>
    </div>
  );
}
