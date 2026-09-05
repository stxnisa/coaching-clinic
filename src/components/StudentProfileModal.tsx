import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { 
  X, 
  Camera, 
  Trash2, 
  Lock, 
  Building, 
  User as UserIcon, 
  Mail, 
  KeyRound, 
  Check, 
  AlertCircle, 
  Eye, 
  EyeOff,
  Loader2
} from 'lucide-react';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StudentProfileModal({ isOpen, onClose }: StudentProfileModalProps) {
  const { user, updateCurrentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatar, setAvatar] = useState<string>(user?.avatar || '');
  const [branch, setBranch] = useState<string>(user?.branch || user?.studentClass || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Quick branch suggestions for fast picking
  const popularBranches = [
    'Brain Academy Jakarta Selatan (Tebet)',
    'Brain Academy Jakarta Barat',
    'Brain Academy Bandung',
    'Brain Academy Surabaya',
    'Brain Academy Yogyakarta',
    'Brain Academy Medan'
  ];

  if (!isOpen || !user) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'Hanya file gambar (JPG, PNG, WebP) yang didukung.' });
      return;
    }

    // Limit original file size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'Ukuran file terlalu besar. Maksimal 5 MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress / resize to max 256x256 for smooth performance
        const canvas = document.createElement('canvas');
        const MAX_DIM = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatar(compressedDataUrl);
          setFeedback(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatar('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (newPassword) {
      if (newPassword.length < 6) {
        setFeedback({ type: 'error', message: 'Kata sandi baru minimal harus 6 karakter.' });
        return;
      }
      if (newPassword !== confirmPassword) {
        setFeedback({ type: 'error', message: 'Konfirmasi kata sandi tidak cocok.' });
        return;
      }
    }

    setIsLoading(true);
    try {
      const payload: {
        avatar?: string;
        branch?: string;
        password?: string;
        currentPassword?: string;
      } = {
        avatar,
        branch: branch.trim(),
      };

      if (newPassword) {
        payload.password = newPassword;
        if (currentPassword) {
          payload.currentPassword = currentPassword;
        }
      }

      const res = await api.updateProfile(payload);
      updateCurrentUser(res.user);
      setFeedback({ type: 'success', message: 'Profil Anda berhasil diperbarui!' });

      // Clear password fields on success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Gagal memperbarui profil.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (nameStr: string) => {
    return nameStr
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Pengaturan Profil Saya
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Ubah foto profil, cabang belajar, dan kata sandi Anda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {feedback && (
            <div
              className={`p-3 sm:p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {feedback.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span className="font-medium">{feedback.message}</span>
            </div>
          )}

          {/* 1. Foto Profil (Avatar) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden border-2 border-indigo-500/40 bg-slate-200 dark:bg-slate-700 flex items-center justify-center shadow-inner">
                {avatar ? (
                  <img src={avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl sm:text-2xl font-black text-indigo-700 dark:text-indigo-300">
                    {getInitials(user.name)}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white cursor-pointer"
                title="Ganti Foto"
              >
                <Camera className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 space-y-2">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Foto Profil Siswa
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Format gambar JPG, PNG, atau WebP (otomatis dioptimasi).
                </p>
              </div>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Unggah Foto</span>
                </button>
                {avatar && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-rose-100 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Read-only Profile Info (Nama & Email Dikelola Admin) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 text-xs">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                <UserIcon className="w-3 h-3" /> Nama Lengkap
              </span>
              <div className="font-semibold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
                <span className="truncate">{user.name}</span>
                <Lock className="w-3 h-3 text-slate-400 shrink-0" title="Nama dikelola sistem" />
              </div>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                <Mail className="w-3 h-3" /> Email Akun
              </span>
              <div className="font-semibold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
                <span className="truncate">{user.email}</span>
                <Lock className="w-3 h-3 text-slate-400 shrink-0" title="Email dikelola sistem" />
              </div>
            </div>
          </div>

          {/* 2. Cabang (Editable Text Input) */}
          <div className="space-y-2">
            <label htmlFor="student-branch-input" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Cabang / Wilayah Belajar *
            </label>
            <div className="relative">
              <Building className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                id="student-branch-input"
                type="text"
                required
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="Ketik nama cabang (misal: Brain Academy Bandung)..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 self-center">Pilihan Cepat:</span>
              {popularBranches.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setBranch(item)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                    branch === item
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300'
                  }`}
                >
                  {item.replace('Brain Academy ', '')}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Password (Ganti Kata Sandi) */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Ganti Kata Sandi (Opsional)
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Biarkan kosong jika Anda tidak ingin mengganti kata sandi.
              </p>
            </div>

            {/* Kata Sandi Lama */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kata Sandi Lama
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-400" />
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Masukkan kata sandi lama Anda..."
                  className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Kata Sandi Baru */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kata Sandi Baru (Min. 6 Karakter)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Konfirmasi Kata Sandi Baru
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
