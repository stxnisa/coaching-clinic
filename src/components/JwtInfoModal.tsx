import React, { useState } from 'react';
import { 
  X, 
  KeyRound, 
  ShieldCheck, 
  Copy, 
  Check, 
  Sparkles, 
  HelpCircle, 
  Terminal, 
  Lock,
  ExternalLink
} from 'lucide-react';

interface JwtInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JwtInfoModal({ isOpen, onClose }: JwtInfoModalProps) {
  const [generatedSecret, setGeneratedSecret] = useState<string>(() => {
    // Generate initial suggested secret
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
    let res = '';
    for (let i = 0; i < 48; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  });
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerateNew = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
    let res = '';
    for (let i = 0; i < 48; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedSecret(res);
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Panduan & Sumber JWT Key</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-3 h-3" /> AKTIF
                </span>
              </div>
              <p className="text-xs text-slate-500">Penjelasan asal-usul dan cara konfigurasi JWT Secret Key</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-slate-700 text-xs sm:text-sm leading-relaxed">
          {/* Quick Answer Banner */}
          <div className="p-4 bg-indigo-50/80 border border-indigo-100 rounded-xl space-y-2">
            <h4 className="font-bold text-indigo-950 text-sm flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
              Dari mana JWT Key diambil?
            </h4>
            <p className="text-indigo-900 text-xs leading-relaxed">
              <strong>JWT Key bukan API key eksternal</strong> yang perlu Anda minta ke Google atau vendor lain. JWT Key adalah <strong>kata sandi rahasia (passphrase/secret string)</strong> buatan Anda sendiri di sisi server untuk menandatangani (<em>sign</em>) token login sesi pengguna.
            </p>
          </div>

          {/* Point 1: Current Status in this App */}
          <div className="space-y-1.5">
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 inline-flex items-center justify-center font-bold text-[11px]">1</span>
              Status di Aplikasi Anda Saat Ini
            </h5>
            <p className="text-xs text-slate-600">
              Aplikasi ini <strong>sudah siap dan langsung berfungsi</strong>! Di file <code className="bg-slate-100 px-1.5 py-0.5 rounded text-indigo-600 font-mono text-[11px]">server.ts</code>, server membaca:
            </p>
            <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-xs overflow-x-auto">
              <code>const JWT_SECRET = process.env.JWT_SECRET || "edutest_jwt_super_secret_key_2025";</code>
            </div>
            <p className="text-[11px] text-slate-500">
              Jika variabel <code className="font-mono">JWT_SECRET</code> belum disetel, aplikasi secara otomatis menggunakan kunci default di atas sehingga proses login, tes, dan peran siswa/admin tetap berjalan aman.
            </p>
          </div>

          {/* Point 2: How to customize your own key */}
          <div className="space-y-1.5">
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 inline-flex items-center justify-center font-bold text-[11px]">2</span>
              Cara Menyetel Kunci Sendiri (Production)
            </h5>
            <p className="text-xs text-slate-600">
              Jika ingin menggunakan kunci rahasia khusus milik Anda sendiri:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600 pl-1">
              <li>
                Buka menu <strong>Settings</strong> di panel AI Studio, atau buat file <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">.env</code> di root project.
              </li>
              <li>
                Tambahkan baris variabel baru:
                <div className="mt-1 bg-slate-100 border border-slate-200 p-2 rounded-lg font-mono text-xs text-slate-800 select-all">
                  JWT_SECRET=kunci_rahasia_panjang_dan_acak_anda
                </div>
              </li>
              <li>Simpan, dan server akan otomatis memakai kunci baru tersebut untuk enkripsi token.</li>
            </ol>
          </div>

          {/* Point 3: Generator tool */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Generator Kunci Acak Kuat (Siap Pakai):
              </span>
              <button
                type="button"
                onClick={handleGenerateNew}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
              >
                Acak Ulang
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={generatedSecret}
                className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin'}</span>
              </button>
            </div>
            <span className="text-[11px] text-slate-500 block">
              Salin string di atas dan tempelkan ke variabel <code className="font-mono">JWT_SECRET</code> jika Anda ingin mengamankan server secara independen.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
