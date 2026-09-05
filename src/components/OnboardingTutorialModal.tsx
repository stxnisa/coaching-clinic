import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Sparkles, 
  BookOpen, 
  FileQuestion, 
  UserPlus, 
  BarChart3, 
  Calculator, 
  ShieldCheck, 
  Layers,
  GraduationCap
} from 'lucide-react';

interface OnboardingTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

interface Step {
  title: string;
  badge: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  description: string;
  highlights: { title: string; desc: string }[];
  tip?: string;
}

export default function OnboardingTutorialModal({
  isOpen,
  onClose,
  isAdmin = true,
}: OnboardingTutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const adminSteps: Step[] = [
    {
      title: 'Selamat Datang di EduTest LMS!',
      badge: 'Langkah 1 dari 5 • Pengenalan',
      icon: GraduationCap,
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/60',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      description: 'Platform Computer-Based Test (CBT) dan Learning Management System modern yang dirancang untuk mengelola materi, ujian terstandar, dan pelaporan nilai siswa secara otomatis.',
      highlights: [
        {
          title: 'Keamanan Autentikasi JWT',
          desc: 'Setiap sesi diamankan dengan JSON Web Token terenkripsi untuk integritas data nilai dan kuis.',
        },
        {
          title: 'Tampilan Responsif & Layar Penuh',
          desc: 'Mendukung mode layar penuh (fullscreen) di seluruh editor dan mode gelap/terang ramah mata.',
        },
        {
          title: 'Identitas Lembaga Kustom',
          desc: 'Ubah logo dan nama institusi Anda kapan saja melalui tombol Kustomisasi Logo di header.',
        },
      ],
      tip: 'Gunakan tombol Layar Penuh di pojok kanan atas untuk pengalaman belajar tanpa distraksi.',
    },
    {
      title: 'Manajemen Materi & Persamaan Matematika',
      badge: 'Langkah 2 dari 5 • Modul Pembelajaran',
      icon: BookOpen,
      iconBg: 'bg-teal-50 dark:bg-teal-950/60',
      iconColor: 'text-teal-600 dark:text-teal-400',
      description: 'Susun materi ajar yang kaya dengan teks berformat lengkap, tabel interaktif, gambar, dan rumus matematika sains.',
      highlights: [
        {
          title: 'Rich Text Editor Lengkap',
          desc: 'Dukungan Header 1-3, Title, Bold, Italic, Underline, Coret, Bullet List, dan Numbering.',
        },
        {
          title: 'Persamaan Matematika & Sains (KaTeX)',
          desc: 'Klik tombol Persamaan (∑) untuk menyisipkan rumus pecahan, akar, eksponen, integral, hingga kimia dengan live preview.',
        },
        {
          title: 'Tabel Dinamis & Media',
          desc: 'Tambahkan tabel dengan fleksibilitas menghapus baris/kolom tertentu, serta unggah gambar dan dokumen PDF.',
        },
        {
          title: 'Status Draf & Publikasi',
          desc: 'Simpan materi sebagai Draf selama penyusunan, atau Publikasikan agar langsung dapat diakses siswa.',
        },
      ],
      tip: 'Anda dapat memperbesar editor materi ke layar penuh dengan tombol Maximize di sudut modal editor.',
    },
    {
      title: 'Pembuatan Kuis & Bank Soal CBT',
      badge: 'Langkah 3 dari 5 • Ujian & Evaluasi',
      icon: FileQuestion,
      iconBg: 'bg-violet-50 dark:bg-violet-950/60',
      iconColor: 'text-violet-600 dark:text-violet-400',
      description: 'Rancang kuis interaktif dengan berbagai tipe soal ujian dan fleksibilitas input soal massal.',
      highlights: [
        {
          title: 'Dukungan Formula Matematika di Soal',
          desc: 'Sisipkan rumus LaTeX seperti $E = mc^2$ atau pecahan pada teks soal dan kunci pembahasan.',
        },
        {
          title: 'Impor Soal Massal (Bulk CSV)',
          desc: 'Unggah puluhan soal ujian sekaligus hanya dengan satu file CSV berformat sederhana.',
        },
        {
          title: 'Multi-Tipe Soal Ujian',
          desc: 'Pilihan ganda biasa, pilihan ganda majemuk (multiple choice), hingga menu pilihan dropdown.',
        },
        {
          title: 'Kontrol Timer & Passing Score',
          desc: 'Atur durasi pengerjaan per menit dan batas kelulusan (KKM) untuk klasifikasi otomatis.',
        },
      ],
      tip: 'Gunakan fitur Pratinjau Kuis untuk memeriksa tampilan soal dan kunci jawaban sebelum dipublikasikan.',
    },
    {
      title: 'Pendaftaran Peserta & Manajemen Siswa',
      badge: 'Langkah 4 dari 5 • Peserta Didik',
      icon: UserPlus,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      description: 'Daftarkan peserta didik secara fleksibel dengan pengisian cabang manual atau impor ratusan siswa sekaligus.',
      highlights: [
        {
          title: 'Input Cabang Fleksibel',
          desc: 'Isi nama cabang secara bebas tanpa batasan dropdown kaku, cocok untuk berbagai unit belajar.',
        },
        {
          title: 'Pendaftaran Massal (Bulk Register CSV)',
          desc: 'Daftarkan seluruh kelas atau angkatan dalam hitungan detik menggunakan impor data CSV.',
        },
        {
          title: 'Kredensial Login Otomatis',
          desc: 'Setiap akun siswa langsung dapat masuk menggunakan email dan kata sandi yang ditentukan.',
        },
      ],
      tip: 'Unduh template CSV yang disediakan di modal impor untuk format kolom yang presisi.',
    },
    {
      title: 'Monitoring Nilai & Transkrip Otomatis',
      badge: 'Langkah 5 dari 5 • Analitik & Pelaporan',
      icon: BarChart3,
      iconBg: 'bg-amber-50 dark:bg-amber-950/60',
      iconColor: 'text-amber-600 dark:text-amber-400',
      description: 'Pantau hasil belajar, skor rata-rata, tingkat kelulusan KKM, dan ekspor laporan nilai siap cetak.',
      highlights: [
        {
          title: 'Dashboard Analisis Terpadu',
          desc: 'Visualisasi rata-rata nilai, distribusi predikat A/B/C/D/E, dan siswa yang memerlukan remedial.',
        },
        {
          title: 'Ekspor Data CSV / Excel',
          desc: 'Unduh rekapitulasi nilai kuis untuk keperluan arsip rapor akademik sekolah.',
        },
        {
          title: 'Cetak Lembar Nilai Resmi',
          desc: 'Format cetak ramah printer dengan kop institusi dan tanda tangan evaluasi.',
        },
      ],
      tip: 'Siswa juga dapat melihat pembahasan lengkap dan analisis butir soal segera setelah menyelesaikan kuis.',
    },
  ];

  const studentSteps: Step[] = [
    {
      title: 'Selamat Datang di Portal Siswa!',
      badge: 'Panduan Belajar Siswa',
      icon: GraduationCap,
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/60',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      description: 'Pelajari materi terstruktur dan uji kemampuan akademik Anda melalui sistem ujian CBT interaktif.',
      highlights: [
        {
          title: 'Modul Pelajaran Lengkap',
          desc: 'Akses materi ajar berformat kaya dengan gambar, tabel interaktif, dan persamaan rumus matematika.',
        },
        {
          title: 'Ujian Berbatas Waktu',
          desc: 'Kerjakan kuis dengan timer waktu riil dan status progres soal yang jelas.',
        },
        {
          title: 'Pembahasan & Rapor Nilai',
          desc: 'Dapatkan skor instan, status kelulusan KKM, dan review jawaban benar/salah secara mendalam.',
        },
      ],
      tip: 'Pastikan koneksi internet stabil sebelum menekan tombol Mulai Kuis.',
    },
  ];

  const steps = isAdmin ? adminSteps : studentSteps;
  const current = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem('edutest_onboarding_completed', 'true');
    onClose();
  };

  const IconComponent = current.icon;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header with Step Dots */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${current.iconBg} ${current.iconColor}`}>
              <IconComponent className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md">
                {current.badge}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
                {current.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6 overflow-y-auto max-h-[70vh]">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {current.description}
          </p>

          {/* Highlights List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Fitur & Kemampuan Utama:
            </h4>
            <div className="grid grid-cols-1 gap-2.5">
              {current.highlights.map((h, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 flex items-start gap-3"
                >
                  <div className="p-1 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 rounded-md shrink-0 mt-0.5">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      {h.title}
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-normal">
                      {h.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Tip Box */}
          {current.tip && (
            <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
              <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
              <span><strong>Tips Penggunaan:</strong> {current.tip}</span>
            </div>
          )}

          {/* Progress Indicators */}
          {steps.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-2">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentStep === idx 
                      ? 'w-7 bg-indigo-600' 
                      : 'w-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'
                  }`}
                  aria-label={`Langkah ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 flex items-center justify-between">
          <button
            type="button"
            onClick={handleFinish}
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-3 py-2 rounded-lg cursor-pointer"
          >
            Lewati Panduan
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                Sebelumnya
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>{currentStep === steps.length - 1 ? 'Mulai Gunakan LMS' : 'Selanjutnya'}</span>
              {currentStep === steps.length - 1 ? (
                <Check className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
