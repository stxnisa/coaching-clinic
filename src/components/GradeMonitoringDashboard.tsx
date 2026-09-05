import React, { useState, useEffect, FormEvent } from 'react';
import { api } from '../api';
import { GradeReportOverview, QuizSubmission, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { useBrand } from '../context/BrandContext';
import { 
  BarChart3, 
  Users, 
  FileQuestion, 
  Award, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Search, 
  Eye, 
  X, 
  BookOpen,
  ArrowUpRight,
  GraduationCap,
  UserPlus,
  Paintbrush
} from 'lucide-react';

interface GradeMonitoringDashboardProps {
  onNavigateToQuiz?: (quizId?: string) => void;
  onNavigateToReports?: () => void;
  onNavigateToStudents?: () => void;
}

export default function GradeMonitoringDashboard({ 
  onNavigateToQuiz,
  onNavigateToReports,
  onNavigateToStudents 
}: GradeMonitoringDashboardProps) {
  const { user } = useAuth();
  const { logoUrl, brandName, brandSubtitle, setIsBrandModalOpen } = useBrand();
  const isAdmin = user?.role === 'admin';

  const [overview, setOverview] = useState<GradeReportOverview | null>(null);
  const [allSubmissions, setAllSubmissions] = useState<QuizSubmission[]>([]);
  const [studentReport, setStudentReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Student Register State in Dashboard
  const [quickName, setQuickName] = useState('');
  const [quickEmail, setQuickEmail] = useState('');
  const [quickBranch, setQuickBranch] = useState('');
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickFeedback, setQuickFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Filters for Admin Table
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuizFilter, setSelectedQuizFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

  // Detail Modal
  const [inspectSubmission, setInspectSubmission] = useState<QuizSubmission | null>(null);

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const handleQuickRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName || !quickEmail) {
      setQuickFeedback({ type: 'error', msg: 'Nama dan email wajib diisi.' });
      return;
    }
    setQuickLoading(true);
    setQuickFeedback(null);
    try {
      await api.registerUser({
        name: quickName,
        email: quickEmail,
        password: 'password123',
        role: 'siswa',
        branch: quickBranch.trim() || 'Brain Academy Pusat',
      });
      setQuickFeedback({ type: 'success', msg: `Siswa "${quickName}" berhasil ditambahkan ke direktori!` });
      setQuickName('');
      setQuickEmail('');
      setQuickBranch('');
      loadDashboardData();
    } catch (err: any) {
      setQuickFeedback({ type: 'error', msg: err.message || 'Gagal mendaftarkan siswa.' });
    } finally {
      setQuickLoading(false);
    }
  };

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      if (isAdmin) {
        const [ovData, subsData] = await Promise.all([
          api.getReportsOverview(),
          api.getSubmissions()
        ]);
        setOverview(ovData);
        setAllSubmissions(subsData);
      } else {
        const [repData, subsData] = await Promise.all([
          api.getStudentReport(user.id),
          api.getSubmissions()
        ]);
        setStudentReport(repData);
        setAllSubmissions(subsData);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInspect = async (subId: string) => {
    try {
      const fullSub = await api.getSubmissionById(subId);
      setInspectSubmission(fullSub);
    } catch (err: any) {
      alert(err.message || 'Gagal memuat detail hasil ujian.');
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm text-slate-600 font-medium">Memuat data pemantauan nilai siswa...</p>
      </div>
    );
  }

  // ==========================================
  // STUDENT PERSONAL DASHBOARD
  // ==========================================
  if (!isAdmin) {
    if (!studentReport) {
      return (
        <div className="py-24 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm text-slate-600 font-medium">Memuat data rapor dan progres belajar Anda...</p>
        </div>
      );
    }

    const { stats, student } = studentReport;
    const studentSubmissions = allSubmissions.filter(s => s.studentId === user?.id);

    return (
      <div className="space-y-6 pb-12">
        {/* Student Welcome Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-violet-800 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">
              {student.studentClass || 'Siswa EduTest'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">
              Halo, {student.name}!
            </h1>
            <p className="text-indigo-100 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              Berikut adalah pemantauan progres evaluasi ujian dan penyelesaian materi pelajaran Anda.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onNavigateToReports && (
              <button
                onClick={onNavigateToReports}
                className="px-4 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                <Award className="h-4 w-4 text-indigo-600" />
                Buka Rapor Saya
              </button>
            )}
            {onNavigateToQuiz && (
              <button
                onClick={() => onNavigateToQuiz()}
                className="px-4 py-2.5 bg-indigo-500/50 hover:bg-indigo-500/70 text-white font-bold text-xs rounded-xl border border-indigo-300/40 transition-colors"
              >
                Ikuti Ujian Baru
              </button>
            )}
          </div>
        </div>

        {/* Student Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Rata-rata Nilai
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{stats.averageScore}</span>
              <span className="text-xs font-bold text-indigo-600">/ 100</span>
            </div>
            <span className="text-[11px] text-slate-700 mt-1 block">
              Predikat: <strong>{stats.overallPredicate}</strong>
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Kelulusan Kuis
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-600">{stats.quizzesPassed}</span>
              <span className="text-xs font-semibold text-slate-700">dari {stats.quizzesTaken} Ujian</span>
            </div>
            <span className="text-[11px] text-slate-700 mt-1 block">
              Tingkat Lulus: {stats.quizzesTaken > 0 ? Math.round((stats.quizzesPassed / stats.quizzesTaken) * 100) : 0}%
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Materi Selesai
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black text-indigo-600">{stats.materialsCompleted}</span>
              <span className="text-xs font-semibold text-slate-700">dari {stats.totalMaterials} Modul</span>
            </div>
            <span className="text-[11px] text-slate-700 mt-1 block">
              Progress: {stats.materialCompletionRate}%
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              Status Akademik
            </span>
            <div className="mt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" /> Aktif / Terdaftar
              </span>
            </div>
            <span className="text-[11px] text-slate-700 mt-1.5 block">
              NIS: {student.nis}
            </span>
          </div>
        </div>

        {/* Student Test History Table */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-indigo-600" />
            Riwayat Percobaan Kuis Anda
          </h3>

          {studentSubmissions.length === 0 ? (
            <div className="py-12 text-center text-slate-700 text-sm">
              Anda belum memiliki riwayat ujian. Silakan klik "Ikuti Ujian Baru" untuk mulai belajar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-700 uppercase tracking-wider border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Kuis & Topik</th>
                    <th className="py-3 px-3">Waktu Pengerjaan</th>
                    <th className="py-3 px-3">Nilai</th>
                    <th className="py-3 px-3">Predikat</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{sub.quizTitle}</div>
                        <div className="text-xs text-indigo-600 font-medium">{sub.subject}</div>
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-600">
                        {formatDateTime(sub.submittedAt)}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {sub.percentage} <span className="text-xs font-normal text-slate-700">({sub.score}/{sub.maxScore})</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                          {sub.gradeLetter}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          sub.isPassed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {sub.isPassed ? 'Lulus' : 'Remedial'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleInspect(sub.id)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" /> Pembahasan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Student Submission Inspect Modal */}
        {inspectSubmission && inspectSubmission.studentId === user?.id && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="p-6 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {inspectSubmission.subject}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    Detail Pembahasan: {inspectSubmission.quizTitle}
                  </h3>
                  <p className="text-xs text-slate-700">
                    Nilai: <strong>{inspectSubmission.percentage}</strong> ({inspectSubmission.score}/{inspectSubmission.maxScore}) • Waktu: {formatDateTime(inspectSubmission.submittedAt)}
                  </p>
                </div>
                <button
                  onClick={() => setInspectSubmission(null)}
                  className="text-slate-700 hover:text-slate-900 p-1 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4">
                <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <div>
                    <span className="text-[10px] text-slate-700 uppercase font-bold">Nilai Akhir</span>
                    <div className="text-2xl font-black text-indigo-600">{inspectSubmission.percentage}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-700 uppercase font-bold">Predikat</span>
                    <div className="text-2xl font-black text-slate-800">{inspectSubmission.gradeLetter}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-700 uppercase font-bold">Status KKM</span>
                    <div className={`text-base font-bold mt-1 ${inspectSubmission.isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {inspectSubmission.isPassed ? 'LULUS' : 'REMEDIAL'}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Analisis Soal & Jawaban
                  </h4>
                  {inspectSubmission.detailedResults?.map((item, idx) => (
                    <div
                      key={item.questionId}
                      className={`p-4 rounded-xl border text-xs space-y-2 ${
                        item.isCorrect ? 'border-emerald-200 bg-emerald-50/20' : 'border-rose-200 bg-rose-50/20'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>Soal {idx + 1}. {item.questionText}</span>
                        <span className={item.isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                          {item.pointsEarned} / {item.maxPoints} Poin
                        </span>
                      </div>

                      <div className="space-y-1">
                        {item.options.map((opt, oIdx) => {
                          const isChosen = item.selectedOption === oIdx;
                          const isCorrectKey = item.correctAnswerIndex === oIdx;
                          return (
                            <div
                              key={oIdx}
                              className={`p-1.5 rounded-lg border ${
                                isCorrectKey
                                  ? 'bg-emerald-50 border-emerald-300 font-semibold text-emerald-900'
                                  : isChosen
                                  ? 'bg-rose-50 border-rose-300 font-semibold text-rose-900'
                                  : 'bg-white border-slate-200 text-slate-600'
                              }`}
                            >
                              {opt} {isChosen && '(Jawaban Anda)'} {isCorrectKey && '✓ Kunci Benar'}
                            </div>
                          );
                        })}
                      </div>

                      {item.explanation && (
                        <div className="p-2 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px]">
                          <strong>Pembahasan:</strong> {item.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl text-right">
                <button
                  onClick={() => setInspectSubmission(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Tutup Pembahasan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // ADMIN DASHBOARD OVERVIEW
  // ==========================================
  if (!overview) return null;

  // Filter submissions
  const filteredSubmissions = allSubmissions.filter((sub) => {
    const matchesSearch = 
      sub.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.quizTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.studentNis && sub.studentNis.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sub.studentClass && sub.studentClass.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesQuiz = selectedQuizFilter === 'all' || sub.quizId === selectedQuizFilter;
    const matchesStatus = 
      selectedStatusFilter === 'all' || 
      (selectedStatusFilter === 'passed' && sub.isPassed) ||
      (selectedStatusFilter === 'failed' && !sub.isPassed);

    return matchesSearch && matchesQuiz && matchesStatus;
  });

  const allQuizzesInSubmissions = Array.from(new Set(allSubmissions.map(s => ({ id: s.quizId, title: s.quizTitle }))));

  return (
    <div className="space-y-5 sm:space-y-6 pb-12">
      {/* Top compact institution brand bar & customization trigger (Admin only, small & neat) */}
      {isAdmin && (
        <div className="bg-white rounded-xl border border-slate-200 p-2.5 sm:p-3 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-slate-200 p-0.5 shrink-0 flex items-center justify-center">
              {logoUrl ? (
                <img src={logoUrl} alt={brandName} className="w-full h-full object-contain" />
              ) : (
                <span className="text-xs font-bold text-slate-800">{brandName ? brandName.charAt(0) : 'B'}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {brandName}
                </span>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-1.5 py-0.5 rounded shrink-0">
                  Institusi
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {brandSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsBrandModalOpen(true)}
            className="shrink-0 text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer border border-indigo-100"
            title="Kustomisasi Logo, Judul & Subtitel Institusi"
          >
            <Paintbrush className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kustomisasi Logo & Judul</span>
            <span className="sm:hidden">Logo & Judul</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="h-7 w-7 text-indigo-600" />
            Dashboard Pemantauan Progres Nilai Siswa
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Pantau statistik kelulusan siswa, distribusi nilai evaluasi, dan rekapitulasi ujian secara otomatis dan terintegrasi.
          </p>
        </div>

        {onNavigateToReports && (
          <button
            onClick={onNavigateToReports}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-xs transition-colors"
          >
            <Award className="h-4 w-4" />
            <span>Lihat Laporan / Cetak Rapor</span>
          </button>
        )}
      </div>

      {/* Sleek KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-slate-500 text-sm font-medium">Active Students</p>
          <h3 className="text-3xl font-bold mt-1 text-slate-900">{overview.totalStudents}</h3>
          <p className="text-emerald-600 text-xs mt-2 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +100% aktif terdaftar
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-slate-500 text-sm font-medium">Avg. Score</p>
          <h3 className="text-3xl font-bold mt-1 text-slate-900">{overview.averageClassScore}%</h3>
          <div className="w-full bg-slate-100 h-1.5 mt-3 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-500" 
              style={{ width: `${Math.min(overview.averageClassScore, 100)}%` }} 
            />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-slate-500 text-sm font-medium">Quizzes Conducted</p>
          <h3 className="text-3xl font-bold mt-1 text-slate-900">{overview.totalQuizzes}</h3>
          <p className="text-slate-400 text-xs mt-2 font-medium">All-time ({overview.totalSubmissions} submissions)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-slate-500 text-sm font-medium">Passing Rate (KKM)</p>
          <h3 className="text-3xl font-bold mt-1 text-slate-900">{overview.passRatePercentage}%</h3>
          <div className="w-full bg-slate-100 h-1.5 mt-3 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500" 
              style={{ width: `${Math.min(overview.passRatePercentage, 100)}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Sleek Interface 2-Column Section: Register New Student + Real-time Grade Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 items-start">
        {/* Left Column: Register New Student Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h4 className="text-lg font-bold text-slate-900">Register New Student</h4>
              <p className="text-xs text-slate-500">Add student directly into system directory</p>
            </div>
            {onNavigateToStudents && (
              <button
                type="button"
                onClick={onNavigateToStudents}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                Directory →
              </button>
            )}
          </div>

          {quickFeedback && (
            <div className={`p-3 rounded-xl text-xs font-medium ${
              quickFeedback.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {quickFeedback.msg}
            </div>
          )}

          <form onSubmit={handleQuickRegister} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="Budi Santoso"
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                Email Address *
              </label>
              <input
                type="email"
                placeholder="siswa@edutest.com"
                value={quickEmail}
                onChange={(e) => setQuickEmail(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                  Cabang Brain Academy
                </label>
                <input
                  type="text"
                  placeholder="Isi nama cabang manual..."
                  value={quickBranch}
                  onChange={(e) => setQuickBranch(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                  Default Password
                </label>
                <input
                  type="text"
                  value="password123"
                  readOnly
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-100 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={quickLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl mt-2 transition-colors cursor-pointer disabled:opacity-50 text-sm"
            >
              {quickLoading ? 'Menyimpan Pengguna...' : 'Add User to Directory'}
            </button>
          </form>
        </div>

        {/* Right Column: Real-time Grade Monitor Card */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h4 className="text-lg font-bold text-slate-900">Real-time Grade Monitor</h4>
              <p className="text-xs text-slate-500">Live evaluation feed & scoring audit</p>
            </div>
            {onNavigateToReports && (
              <button
                type="button"
                onClick={onNavigateToReports}
                className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
              >
                Download PDF Report
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-3">
                  <th className="pb-3 font-semibold">Student Name</th>
                  <th className="pb-3 font-semibold">Subject</th>
                  <th className="pb-3 font-semibold">Progress</th>
                  <th className="pb-3 font-semibold">Grade</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {allSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                      Belum ada ujian yang dikerjakan.
                    </td>
                  </tr>
                ) : (
                  allSubmissions.slice(0, 5).map((sub) => {
                    const percent = Math.min(Math.round(sub.percentage), 100);
                    return (
                      <tr key={sub.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 font-semibold text-sm text-slate-800">
                          <div>{sub.studentName}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{sub.studentBranch || sub.studentClass || 'Brain Academy'}</div>
                        </td>
                        <td className="py-3.5 text-xs text-slate-500">
                          <div className="font-medium text-slate-700">{sub.subject}</div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[130px]">{sub.quizTitle}</div>
                        </td>
                        <td className="py-3.5">
                          <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${sub.isPassed ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 block">{percent}%</span>
                        </td>
                        <td className="py-3.5 font-mono text-sm font-bold">
                          <span className={sub.isPassed ? 'text-emerald-600' : 'text-rose-600'}>
                            {sub.gradeLetter}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleInspect(sub.id)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Visual Analytics: Grade Distribution & Top Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Grade Distribution Bar Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Distribusi Predikat Nilai (A-E)</h3>
              <p className="text-xs text-slate-700">Sebaran nilai berdasarkan {overview.totalSubmissions} lembar ujian</p>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
              Sistem Pelaporan Otomatis
            </span>
          </div>

          <div className="grid grid-cols-5 gap-3 pt-3">
            {(() => {
              const gradeCounts: number[] = [
                overview.gradeDistribution.A,
                overview.gradeDistribution.B,
                overview.gradeDistribution.C,
                overview.gradeDistribution.D,
                overview.gradeDistribution.E
              ];
              const maxCount = Math.max(...gradeCounts, 1);

              return [
                { label: 'A (≥85)', count: overview.gradeDistribution.A, color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
                { label: 'B (75-84)', count: overview.gradeDistribution.B, color: 'bg-indigo-500', text: 'text-indigo-700', bg: 'bg-indigo-50' },
                { label: 'C (60-74)', count: overview.gradeDistribution.C, color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
                { label: 'D (50-59)', count: overview.gradeDistribution.D, color: 'bg-orange-500', text: 'text-orange-700', bg: 'bg-orange-50' },
                { label: 'E (<50)', count: overview.gradeDistribution.E, color: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50' },
              ].map((item, idx) => {
                const heightPercent = Math.max(Math.round((item.count / maxCount) * 100), 8);
                return (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="h-32 w-full bg-slate-50 rounded-xl flex items-end justify-center p-2 border border-slate-100">
                      <div
                        className={`w-full ${item.color} rounded-lg transition-all duration-500 flex items-center justify-center text-white text-xs font-bold shadow-2xs`}
                        style={{ height: `${heightPercent}%` }}
                      >
                        {item.count > 0 ? item.count : ''}
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold mt-2 ${item.text}`}>{item.label}</span>
                    <span className="text-[10px] text-slate-700">{item.count} Siswa</span>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Top 5 Leaderboard */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-500" />
              Siswa dengan Nilai Tertinggi
            </h3>
            <span className="text-xs text-slate-700">Top 5</span>
          </div>

          <div className="space-y-3">
            {overview.topStudents.length === 0 ? (
              <p className="text-xs text-slate-700 py-6 text-center">Belum ada data nilai kuis.</p>
            ) : (
              overview.topStudents.map((st, rank) => (
                <div
                  key={st.studentId}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/70"
                >
                  <div className="flex items-center gap-3">
                    <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      rank === 0 ? 'bg-amber-400 text-amber-950 font-black' :
                      rank === 1 ? 'bg-slate-300 text-slate-900' :
                      rank === 2 ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {rank + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{st.studentName}</h4>
                      <span className="text-[10px] text-slate-700">{st.studentBranch || st.studentClass || 'Brain Academy'} • {st.quizzesCompleted} kuis selesai</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-indigo-700">{st.averageScore}</span>
                    <span className="block text-[10px] text-slate-700">Rata-rata</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Full Submissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Rekapitulasi Nilai & Ujian Masuk ({filteredSubmissions.length})
            </h3>
            <p className="text-xs text-slate-700">Hasil pengerjaan kuis siswa yang dinilai secara otomatis oleh sistem</p>
          </div>

          {/* Table Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedQuizFilter}
              onChange={(e) => setSelectedQuizFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">Semua Kuis</option>
              {allQuizzesInSubmissions.map((q: any) => (
                <option key={q.id} value={q.id}>{q.title}</option>
              ))}
            </select>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">Semua Status</option>
              <option value="passed">Lulus Saja</option>
              <option value="failed">Remedial Saja</option>
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-700" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama siswa, cabang, atau judul kuis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Submissions Table */}
        <div className="overflow-x-auto">
          {filteredSubmissions.length === 0 ? (
            <div className="py-12 text-center text-slate-700 text-sm">
              Tidak ada rekaman nilai yang sesuai dengan kriteria filter.
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-700 uppercase tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-3 px-3">Nama Siswa & Cabang</th>
                  <th className="py-3 px-3">Kuis & Mata Pelajaran</th>
                  <th className="py-3 px-3">Nilai Akhir</th>
                  <th className="py-3 px-3">Predikat</th>
                  <th className="py-3 px-3">Status KKM</th>
                  <th className="py-3 px-3">Waktu Submit</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{sub.studentName}</div>
                      <div className="text-[11px] text-slate-700">
                        {sub.studentBranch || sub.studentClass || 'Brain Academy Pusat'}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-xs font-semibold text-slate-800">{sub.quizTitle}</div>
                      <div className="text-[11px] text-indigo-600">{sub.subject}</div>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      <span className="text-sm">{sub.percentage}</span>
                      <span className="text-[11px] text-slate-700 block font-normal">
                        ({sub.score} / {sub.maxScore} Poin)
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {sub.gradeLetter}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          sub.isPassed
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {sub.isPassed ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" /> Lulus
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" /> Remedial
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-600">
                      {formatDateTime(sub.submittedAt)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleInspect(sub.id)}
                        className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg inline-flex items-center gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" /> Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Submission Detail Modal */}
      {inspectSubmission && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-start justify-between">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {inspectSubmission.subject}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1 truncate">
                  Detail Ujian: {inspectSubmission.quizTitle}
                </h3>
                <p className="text-xs text-slate-700">
                  Siswa: <strong>{inspectSubmission.studentName}</strong> ({inspectSubmission.studentClass || '-'}) • Waktu: {formatDateTime(inspectSubmission.submittedAt)}
                </p>
              </div>
              <button
                onClick={() => setInspectSubmission(null)}
                className="text-slate-700 hover:text-slate-900 p-1 cursor-pointer shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {/* Score summary banner */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <div>
                  <span className="text-[10px] text-slate-700 uppercase font-bold">Nilai Akhir</span>
                  <div className="text-xl sm:text-2xl font-black text-indigo-600">{inspectSubmission.percentage}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-700 uppercase font-bold">Predikat</span>
                  <div className="text-xl sm:text-2xl font-black text-slate-800">{inspectSubmission.gradeLetter}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-700 uppercase font-bold">Status KKM</span>
                  <div className={`text-xs sm:text-base font-bold mt-1 ${inspectSubmission.isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {inspectSubmission.isPassed ? 'LULUS' : 'REMEDIAL'}
                  </div>
                </div>
              </div>

              {/* Questions breakdown */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Analisis Butir Soal & Jawaban Siswa
                </h4>
                {inspectSubmission.detailedResults?.map((item, idx) => (
                  <div
                    key={item.questionId}
                    className={`p-4 rounded-xl border text-xs space-y-2 ${
                      item.isCorrect ? 'border-emerald-200 bg-emerald-50/20' : 'border-rose-200 bg-rose-50/20'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>Soal {idx + 1}. {item.questionText}</span>
                      <span className={item.isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                        {item.pointsEarned} / {item.maxPoints} Poin
                      </span>
                    </div>

                    <div className="space-y-1">
                      {item.options.map((opt, oIdx) => {
                        const isChosen = item.selectedOption === oIdx;
                        const isCorrectKey = item.correctAnswerIndex === oIdx;
                        return (
                          <div
                            key={oIdx}
                            className={`p-1.5 rounded-lg border ${
                              isCorrectKey
                                ? 'bg-emerald-50 border-emerald-300 font-semibold text-emerald-900'
                                : isChosen
                                ? 'bg-rose-50 border-rose-300 font-semibold text-rose-900'
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            {opt} {isChosen && '(Dipilih Siswa)'} {isCorrectKey && '✓ Kunci Benar'}
                          </div>
                        );
                      })}
                    </div>

                    {item.explanation && (
                      <div className="p-2 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px]">
                        <strong>Pembahasan:</strong> {item.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl text-right">
              <button
                onClick={() => setInspectSubmission(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold"
              >
                Tutup Jendela
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
