import React, { useState, useRef, useEffect } from 'react';
import { useBrand } from '../context/BrandContext';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  RotateCcw, 
  Check, 
  Building2, 
  GraduationCap, 
  Sparkles,
  School,
  Shield,
  ShieldCheck,
  BookOpen
} from 'lucide-react';

export default function BrandSettingsModal() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const { 
    logoUrl, 
    brandName, 
    brandSubtitle, 
    updateLogo, 
    updateBrandInfo, 
    resetBrand, 
    isBrandModalOpen, 
    setIsBrandModalOpen 
  } = useBrand();

  const [tempName, setTempName] = useState(brandName);
  const [tempSubtitle, setTempSubtitle] = useState(brandSubtitle);
  const [tempLogo, setTempLogo] = useState<string | null>(logoUrl);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [successSaved, setSuccessSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync latest values whenever modal is opened
  useEffect(() => {
    if (isBrandModalOpen) {
      setTempName(brandName);
      setTempSubtitle(brandSubtitle);
      setTempLogo(logoUrl);
      setErrorMsg(null);
    }
  }, [isBrandModalOpen, brandName, brandSubtitle, logoUrl]);

  // Strictly restrict modal rendering to authenticated admins
  if (!isBrandModalOpen || !isAdmin) return null;

  const handleFileChange = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Format file harus berupa gambar (PNG, JPG, SVG, WebP, GIF).');
      return;
    }
    // Limit to 4MB for localStorage safety
    if (file.size > 4 * 1024 * 1024) {
      setErrorMsg('Ukuran file maksimal 4 MB agar performa tetap cepat.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setTempLogo(event.target.result);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Gagal membaca file gambar.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSave = () => {
    updateLogo(tempLogo);
    updateBrandInfo(tempName, tempSubtitle);
    setSuccessSaved(true);
    setTimeout(() => {
      setSuccessSaved(false);
      setIsBrandModalOpen(false);
    }, 600);
  };

  const handleReset = () => {
    resetBrand();
    setTempLogo('/brain-academy-logo.jpg');
    setTempName('Weekly Coaching Clinic');
    setTempSubtitle('Brain Academy by Ruangguru');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">Kustomisasi Logo & Identitas</h3>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full shrink-0">
                  <ShieldCheck className="w-3 h-3" /> ADMIN
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">Ubah logo institusi, judul, dan subtitel platform</p>
            </div>
          </div>
          <button
            onClick={() => setIsBrandModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Logo Upload Section */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Unggah Logo Kustom
            </label>
            
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                isDragOver 
                  ? 'border-indigo-500 bg-indigo-50/50' 
                  : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              {tempLogo ? (
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="relative group">
                    <img
                      src={tempLogo}
                      alt="Preview Logo"
                      className="h-16 w-16 object-contain rounded-xl bg-white p-1 shadow-sm border border-slate-200"
                    />
                  </div>
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-indigo-600 hover:underline">Klik untuk mengganti gambar</span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">Mendukung format PNG, JPG, SVG, WebP (maks. 4MB)</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Tarik & lepas file gambar logo ke sini, atau <span className="text-indigo-600 underline">pilih file</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, SVG, WebP (Rekomendasi rasio 1:1 transparan)</p>
                  </div>
                </div>
              )}
            </div>

            {tempLogo && (
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setTempLogo(null)}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus Logo
                </button>
              </div>
            )}
          </div>

          {/* Live Previews */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Pratinjau Tampilan (Live Preview)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Dark Sidebar Preview */}
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Tampilan Sidebar (Gelap)
                </span>
                <div className="flex items-center gap-2.5">
                  {tempLogo ? (
                    <img 
                      src={tempLogo} 
                      alt="Brand Logo" 
                      className="w-8 h-8 rounded-lg object-contain bg-white/10 p-0.5" 
                    />
                  ) : (
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-white shadow-sm text-sm">
                      {tempName ? tempName.charAt(0).toUpperCase() : 'L'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-white truncate">{tempName || 'LMS-Pro'}</div>
                    <div className="text-[10px] text-slate-400 font-medium truncate">{tempSubtitle || 'EduTest Academy'}</div>
                  </div>
                </div>
              </div>

              {/* Light Document Preview */}
              <div className="p-3.5 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Tampilan Dokumen / Rapor (Terang)
                </span>
                <div className="flex items-center gap-2.5">
                  {tempLogo ? (
                    <img 
                      src={tempLogo} 
                      alt="Brand Logo" 
                      className="w-8 h-8 rounded-lg object-contain border border-slate-200 p-0.5" 
                    />
                  ) : (
                    <School className="w-8 h-8 text-indigo-700" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black text-slate-900 truncate uppercase">{tempName || 'LMS-Pro'}</div>
                    <div className="text-[10px] text-slate-500 truncate">{tempSubtitle || 'Laporan Hasil Evaluasi'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Institution Info Fields */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nama Platform / Institusi
              </label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Contoh: SMA Negeri 1 / Universitas Mandiri / Akademi Digital"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Keterangan / Subtitle Institusi
              </label>
              <input
                type="text"
                value={tempSubtitle}
                onChange={(e) => setTempSubtitle(e.target.value)}
                placeholder="Contoh: Pusat Pembelajaran Digital & Evaluasi Akademik"
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Default
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsBrandModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              {successSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <span>Simpan Perubahan</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
