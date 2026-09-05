import { useState, useEffect } from 'react';
import { api } from '../api';
import { QuizSubmission, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { useBrand } from '../context/BrandContext';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Search, 
  Award, 
  User as UserIcon, 
  School, 
  CheckCircle2, 
  XCircle,
  FileText
} from 'lucide-react';

export default function GradeReportingView() {
  const { user } = useAuth();
  const { logoUrl, brandName, brandSubtitle } = useBrand();
  const isAdmin = user?.role === 'admin';

  const [students, setStudents] = useState<User[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(user?.role === 'siswa' ? user.id : '');
  const [reportData, setReportData] = useState<any>(null);
  const [allSubmissions, setAllSubmissions] = useState<QuizSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, [user]);

  useEffect(() => {
    if (selectedStudentId) {
      loadStudentReport(selectedStudentId);
    }
  }, [selectedStudentId]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      if (isAdmin) {
        const [usersData, subsData] = await Promise.all([
          api.getUsers(),
          api.getSubmissions()
        ]);
        const studentUsers = usersData.filter(u => u.role === 'siswa');
        setStudents(studentUsers);
        setAllSubmissions(subsData);
        if (studentUsers.length > 0 && !selectedStudentId) {
          setSelectedStudentId(studentUsers[0].id);
        }
      } else if (user) {
        setSelectedStudentId(user.id);
        await loadStudentReport(user.id);
      }
    } catch (err) {
      console.error('Failed to load reporting data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudentReport = async (studentId: string) => {
    try {
      const data = await api.getStudentReport(studentId);
      setReportData(data);
    } catch (err) {
      console.error('Failed to load student report', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!allSubmissions || allSubmissions.length === 0) {
      alert('Tidak ada data nilai untuk diekspor.');
      return;
    }

    const headers = ['Nama Siswa', 'Kelas', 'NIS', 'Mata Pelajaran', 'Judul Kuis', 'Nilai', 'Predikat', 'Status Kelulusan', 'Tanggal Pengerjaan'];
    const rows = allSubmissions.map(sub => [
      `"${sub.studentName}"`,
      `"${sub.studentClass || '-'}"`,
      `"${sub.studentNis || '-'}"`,
      `"${sub.subject}"`,
      `"${sub.quizTitle}"`,
      sub.percentage,
      sub.gradeLetter,
      sub.isPassed ? 'LULUS' : 'REMEDIAL',
      `"${new Date(sub.submittedAt).toLocaleDateString('id-ID')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Nilai_LMS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm text-slate-600 font-medium">Menyiapkan sistem pelaporan nilai otomatis...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Export Controls - Hidden on print */}
      <div className="print:hidden border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <FileSpreadsheet className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
              Sistem Pelaporan Nilai & Rapor Digital
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Format lembar penilaian resmi yang terhitung otomatis. Siap dicetak langsung atau diekspor ke format spreadsheet.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-print-report"
              onClick={handlePrint}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Rapor Resmi (Print)</span>
            </button>

            {isAdmin && (
              <button
                id="btn-export-csv"
                onClick={handleExportCSV}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Ekspor CSV / Excel</span>
              </button>
            )}
          </div>
        </div>

        {/* Student Selector for Admin */}
        {isAdmin && (
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
              <UserIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Pilih Siswa untuk Ditampilkan:
            </div>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="flex-1 px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-200"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} — {st.branch || st.studentClass || 'Siswa'}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Grade Conversion Matrix Card - Hidden on print */}
      <div className="print:hidden bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
          Standar Konversi Skala Predikat Nilai Otomatis
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-lg">
            <strong className="block text-emerald-900 dark:text-emerald-300 font-extrabold">A (85 - 100)</strong>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400">Sangat Baik / Mahir</span>
          </div>
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-lg">
            <strong className="block text-indigo-900 dark:text-indigo-300 font-extrabold">B (75 - 84)</strong>
            <span className="text-[11px] text-indigo-700 dark:text-indigo-400">Baik / Kompeten</span>
          </div>
          <div className="p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg">
            <strong className="block text-amber-900 dark:text-amber-300 font-extrabold">C (60 - 74)</strong>
            <span className="text-[11px] text-amber-700 dark:text-amber-400">Cukup</span>
          </div>
          <div className="p-2 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 rounded-lg">
            <strong className="block text-orange-900 dark:text-orange-300 font-extrabold">D (50 - 59)</strong>
            <span className="text-[11px] text-orange-700 dark:text-orange-400">Kurang / Remedial</span>
          </div>
          <div className="p-2 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-lg">
            <strong className="block text-rose-900 dark:text-rose-300 font-extrabold">E (&lt; 50)</strong>
            <span className="text-[11px] text-rose-700 dark:text-rose-400">Sangat Kurang</span>
          </div>
        </div>
      </div>

      {/* Printable Report Card Sheet */}
      {reportData && (
        <div 
          id="printable-report-card"
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-sm max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:bg-transparent"
        >
          {/* Official Letterhead (KOP SURAT) */}
          <div className="border-b-2 border-slate-900 dark:border-slate-700 print:border-slate-900 pb-4 text-center">
            <div className="flex items-center justify-center gap-3.5 mb-1">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={brandName} 
                  className="h-12 w-auto max-w-[160px] object-contain rounded-md" 
                />
              ) : (
                <School className="h-8 w-8 text-indigo-700 dark:text-indigo-400 print:text-black" />
              )}
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white print:text-black tracking-tight uppercase">
                {brandName || 'WEEKLY COACHING CLINIC'}
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 print:text-slate-600 font-medium uppercase tracking-wide">
              {brandSubtitle ? `LEMBAR EVALUASI RESMI • ${brandSubtitle}` : 'LEMBAR LAPORAN HASIL EVALUASI PEMBELAJARAN SISWA (RAPOR DIGITAL)'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 print:text-slate-500 mt-0.5">
              Tahun Ajaran 2024/2025 • Berbasis Computer-Based Testing (CBT)
            </p>
          </div>

          {/* Student Biodata Box */}
          <div className="my-6 p-4 bg-slate-50 dark:bg-slate-850 print:bg-transparent rounded-2xl border border-slate-200 dark:border-slate-750 print:border print:border-slate-400">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-medium block">Nama Siswa:</span>
                <span className="font-bold text-slate-900 dark:text-white print:text-black text-sm">{reportData.student.name}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-medium block">Cabang / Wilayah:</span>
                <span className="font-bold text-slate-900 dark:text-white print:text-black text-sm">{reportData.student.branch || reportData.student.studentClass || 'Brain Academy'}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-medium block">Email Akun:</span>
                <span className="font-bold text-slate-900 dark:text-white print:text-black text-xs truncate block">{reportData.student.email}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 font-medium block">Status Verifikasi:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 print:text-emerald-700 text-sm">Terdaftar Sah (Aktif)</span>
              </div>
            </div>
          </div>

          {/* Academic Evaluation Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 print:text-black uppercase tracking-wider">
              A. Rekapitulasi Nilai Kuis & Ujian Terjadwal
            </h3>

            {reportData.submissions.length === 0 ? (
              <div className="py-8 text-center text-slate-500 dark:text-slate-400 print:text-slate-600 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                Belum ada evaluasi nilai yang diselesaikan oleh siswa ini.
              </div>
            ) : (
              <div className="overflow-x-auto w-full rounded-xl border border-slate-300 dark:border-slate-700 print:border-slate-300">
                <table className="w-full text-left text-xs border-collapse min-w-[540px]">
                  <thead className="bg-slate-100 dark:bg-slate-800 print:bg-slate-200 font-bold text-slate-800 dark:text-slate-200 print:text-black border-b border-slate-300 dark:border-slate-700">
                    <tr>
                      <th className="p-2.5 border-r border-slate-300 dark:border-slate-700 print:border-slate-300 text-center w-10">No</th>
                      <th className="p-2.5 border-r border-slate-300 dark:border-slate-700 print:border-slate-300">Mata Pelajaran & Judul Ujian</th>
                      <th className="p-2.5 border-r border-slate-300 dark:border-slate-700 print:border-slate-300 text-center w-20">Nilai</th>
                      <th className="p-2.5 border-r border-slate-300 dark:border-slate-700 print:border-slate-300 text-center w-16">Predikat</th>
                      <th className="p-2.5 border-r border-slate-300 dark:border-slate-700 print:border-slate-300 text-center w-24">Status</th>
                      <th className="p-2.5 text-center w-24">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300 dark:divide-slate-700 print:divide-slate-300">
                    {reportData.submissions.map((sub: QuizSubmission, idx: number) => (
                      <tr key={sub.id} className="dark:bg-slate-900 print:bg-transparent">
                        <td className="p-2.5 border-r border-slate-300 dark:border-slate-700 print:border-slate-300 text-center font-medium dark:text-slate-300 print:text-black">{idx + 1}</td>
                        <td className="p-2.5 border-r border-slate-300 dark:border-slate-700 print:border-slate-300">
                          <div className="font-bold text-slate-900 dark:text-white print:text-black">{sub.quizTitle}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 print:text-slate-600">{sub.subject}</div>
                        </td>
                        <td className="p-2.5 border-r border-slate-300 dark:border-slate-700 print:border-slate-300 text-center font-black text-sm dark:text-white print:text-black">
                          {sub.percentage}
                        </td>
                        <td className="p-2.5 border-r border-slate-300 dark:border-slate-700 print:border-slate-300 text-center font-bold dark:text-slate-200 print:text-black">
                          {sub.gradeLetter}
                        </td>
                        <td className="p-2.5 border-r border-slate-300 dark:border-slate-700 print:border-slate-300 text-center font-bold">
                          <span className={sub.isPassed ? 'text-emerald-700 dark:text-emerald-400 print:text-emerald-700' : 'text-rose-700 dark:text-rose-400 print:text-rose-700'}>
                            {sub.isPassed ? 'TUNTAS' : 'REMEDIAL'}
                          </span>
                        </td>
                        <td className="p-2.5 text-center text-slate-500 dark:text-slate-400 print:text-slate-600 text-[11px]">
                          {new Date(sub.submittedAt).toLocaleDateString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Academic Summary Statistics */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-850 print:bg-slate-100 rounded-xl border border-slate-200 dark:border-slate-750 print:border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 print:text-slate-600 block text-[11px]">Rata-rata Nilai:</span>
              <span className="text-lg font-black text-slate-900 dark:text-white print:text-black">{reportData.stats.averageScore}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 print:text-slate-600 block text-[11px]">Predikat Kumulatif:</span>
              <span className="text-lg font-black text-indigo-700 dark:text-indigo-400 print:text-indigo-700">{reportData.stats.overallPredicate}</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 print:text-slate-600 block text-[11px]">Kelulusan Ujian:</span>
              <span className="text-lg font-black text-emerald-700 dark:text-emerald-400 print:text-emerald-700">
                {reportData.stats.quizzesPassed} / {reportData.stats.quizzesTaken} Lulus
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 print:text-slate-600 block text-[11px]">Penyelesaian Modul:</span>
              <span className="text-lg font-black text-slate-900 dark:text-white print:text-black">
                {reportData.stats.materialCompletionRate}%
              </span>
            </div>
          </div>

          {/* Signature Block for Print */}
          <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 print:border-slate-200 flex justify-between text-xs text-slate-800 dark:text-slate-200 print:text-black">
            <div>
              <p className="font-semibold text-slate-600 dark:text-slate-400 print:text-slate-600">Mengetahui,</p>
              <p className="mt-1">Orang Tua / Wali Siswa</p>
              <div className="h-16" />
              <p className="font-bold underline">( ............................................ )</p>
            </div>

            <div className="text-right">
              <p className="text-slate-600 dark:text-slate-400 print:text-slate-600">
                Jakarta, {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}
              </p>
              <p className="mt-1 font-semibold">Guru Penguji / Koordinator CBT</p>
              <div className="h-16" />
              <p className="font-bold underline">Dr. Hendra Gunawan, M.Kom</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 print:text-slate-600">NIP. 19850312 201001 1 008</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
