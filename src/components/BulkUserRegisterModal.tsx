import React, { useState, useRef } from 'react';
import { api } from '../api';
import { User } from '../types';
import { 
  Upload, 
  FileSpreadsheet, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Copy, 
  Check, 
  Users, 
  AlertCircle,
  FileText
} from 'lucide-react';

interface BulkUserRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingUsers: User[];
}

interface ParsedUserRow {
  rowNum: number;
  name: string;
  email: string;
  password: string;
  branch: string;
  phone: string;
  isValid: boolean;
  errorReason?: string;
}

export default function BulkUserRegisterModal({
  isOpen,
  onClose,
  onSuccess,
  existingUsers,
}: BulkUserRegisterModalProps) {
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedUserRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [resultSummary, setResultSummary] = useState<{
    successCount: number;
    errors: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const sampleCsvData = `nama,email,password,cabang,telepon
Budi Santoso,budi.santoso@edutest.com,123456,Brain Academy Tebet,081234567890
Siti Rahmawati,siti.rahmawati@edutest.com,123456,Brain Academy Bandung,081298765432
Ahmad Fauzi,ahmad.fauzi@edutest.com,123456,Brain Academy Surabaya,081345678901
Dewi Sartika,dewi.sartika@edutest.com,123456,Brain Academy Yogyakarta,081567890123
Rian Pratama,rian.pratama@edutest.com,123456,Brain Academy Medan,081678901234`;

  // Parse CSV line handling quotes
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

  const handleParseCsv = (rawText: string) => {
    setResultSummary(null);
    const lines = rawText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) {
      setParsedRows([]);
      return;
    }

    // Determine if first row is header
    const firstLineCols = parseCsvLine(lines[0]).map(c => c.toLowerCase());
    const hasHeader = firstLineCols.some(c => 
      c.includes('nama') || c.includes('name') || c.includes('email') || c.includes('surel')
    );

    const dataLines = hasHeader ? lines.slice(1) : lines;
    const existingEmails = new Set(existingUsers.map(u => u.email.toLowerCase()));
    const emailsInBatch = new Set<string>();

    const rows: ParsedUserRow[] = [];

    dataLines.forEach((line, idx) => {
      const rowNum = hasHeader ? idx + 2 : idx + 1;
      const cols = parseCsvLine(line);
      if (cols.length === 1 && !cols[0]) return; // empty line

      const name = cols[0] || '';
      const email = cols[1] || '';
      const password = cols[2] || '123456';
      const branch = cols[3] || 'Brain Academy Pusat';
      const phone = cols[4] || '';

      let isValid = true;
      let errorReason = '';

      if (!name.trim()) {
        isValid = false;
        errorReason = 'Nama tidak boleh kosong';
      } else if (!email.trim()) {
        isValid = false;
        errorReason = 'Email tidak boleh kosong';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        isValid = false;
        errorReason = 'Format email tidak valid';
      } else if (existingEmails.has(email.trim().toLowerCase())) {
        isValid = false;
        errorReason = 'Email sudah terdaftar di sistem';
      } else if (emailsInBatch.has(email.trim().toLowerCase())) {
        isValid = false;
        errorReason = 'Email duplikat di dalam file CSV ini';
      }

      if (isValid) {
        emailsInBatch.add(email.trim().toLowerCase());
      }

      rows.push({
        rowNum,
        name: name.trim(),
        email: email.trim(),
        password: password.trim() || '123456',
        branch: branch.trim() || 'Brain Academy Pusat',
        phone: phone.trim(),
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
    link.setAttribute('download', 'template_bulk_peserta_brain_academy.csv');
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

  const handleSubmitBulk = async () => {
    if (validRows.length === 0) {
      alert('Tidak ada baris data peserta yang valid untuk didaftarkan.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = validRows.map(r => ({
        name: r.name,
        email: r.email,
        password: r.password,
        branch: r.branch,
        phone: r.phone,
      }));

      const res = await api.bulkRegisterUsers(payload);
      setResultSummary({
        successCount: res.addedCount,
        errors: res.errors || [],
      });
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Gagal melakukan registrasi massal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 my-6">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Bulk Registrasi Peserta via CSV
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Impor puluhan hingga ratusan akun siswa baru sekaligus dengan file atau teks CSV
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Instructions and Template Tools */}
          <div className="bg-indigo-50/60 dark:bg-indigo-950/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-indigo-950 dark:text-indigo-200">
                Format Kolom CSV:
              </p>
              <code className="text-[11px] font-mono text-indigo-700 dark:text-indigo-300 mt-1 block">
                nama, email, password, cabang, telepon
              </code>
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1">
                * Kolom password opsional (default: <code>123456</code>). Nama cabang diisi sesuai lokasi siswa.
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

          {/* Upload or Paste Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* File Upload Box */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-xl p-5 text-center bg-slate-50 dark:bg-slate-800/40 cursor-pointer transition-colors flex flex-col items-center justify-center"
            >
              <Upload className="h-7 w-7 text-emerald-600 dark:text-emerald-400 mb-2" />
              <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                {fileName ? fileName : 'Pilih atau Tarik File CSV ke sini'}
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
                placeholder="nama,email,password,cabang,telepon&#10;Budi Santoso,budi@edutest.com,123456,Jakarta Selatan,081234567890"
                className="w-full p-2.5 font-mono text-[11px] border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Success result feedback banner */}
          {resultSummary && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>Registrasi Massal Berhasil! {resultSummary.successCount} siswa baru telah ditambahkan.</span>
              </div>
              {resultSummary.errors.length > 0 && (
                <div className="mt-2 text-[11px] text-amber-800 dark:text-amber-300">
                  <p className="font-semibold">Beberapa baris dilewati karena duplikat:</p>
                  <ul className="list-disc list-inside mt-1 space-y-0.5">
                    {resultSummary.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Parsed Rows Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Pratinjau Data Peserta ({parsedRows.length} baris terdeteksi)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                    {validRows.length} Siap Didaftarkan
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
                      <th className="p-2.5 border-b border-slate-200 dark:border-slate-700">Nama Siswa</th>
                      <th className="p-2.5 border-b border-slate-200 dark:border-slate-700">Email Akun</th>
                      <th className="p-2.5 border-b border-slate-200 dark:border-slate-700">Password</th>
                      <th className="p-2.5 border-b border-slate-200 dark:border-slate-700">Cabang</th>
                      <th className="p-2.5 border-b border-slate-200 dark:border-slate-700">Telepon</th>
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
                        <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">{r.name || '-'}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-400">{r.email || '-'}</td>
                        <td className="p-2.5 font-mono text-slate-500">{r.password}</td>
                        <td className="p-2.5 text-slate-700 dark:text-slate-300">{r.branch}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-400">{r.phone || '-'}</td>
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
            Tutup
          </button>

          <button
            type="button"
            onClick={handleSubmitBulk}
            disabled={isSubmitting || validRows.length === 0}
            className={`px-5 py-2.5 rounded-xl font-semibold text-white text-xs flex items-center gap-2 cursor-pointer shadow-xs transition-colors ${
              validRows.length > 0 && !isSubmitting
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            <Users className="h-4 w-4" />
            {isSubmitting
              ? 'Mendaftarkan Peserta...'
              : `Daftarkan ${validRows.length} Siswa Sekarang`}
          </button>
        </div>

      </div>
    </div>
  );
}
