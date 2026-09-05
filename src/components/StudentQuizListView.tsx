import { useState, useEffect } from 'react';
import { api } from '../api';
import { Quiz, QuizSubmission } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  FileQuestion, 
  Clock, 
  Award, 
  Play, 
  CheckCircle2, 
  XCircle, 
  ListChecks, 
  Search,
  BookOpen,
  Lock,
  Users
} from 'lucide-react';

interface StudentQuizListViewProps {
  onStartQuiz: (quizId: string) => void;
  onViewSubmissionReview: (submissionId: string) => void;
}

export default function StudentQuizListView({ 
  onStartQuiz, 
  onViewSubmissionReview 
}: StudentQuizListViewProps) {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [mySubmissions, setMySubmissions] = useState<QuizSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [quizData, subsData] = await Promise.all([
        api.getQuizzes(),
        api.getSubmissions()
      ]);
      setQuizzes(quizData);
      setMySubmissions(subsData);
    } catch (err) {
      console.error('Failed to load quizzes', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getSubmissionsForQuiz = (quizId: string) => {
    return mySubmissions.filter(s => s.quizId === quizId);
  };

  const filteredQuizzes = quizzes.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 transition-colors">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <FileQuestion className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
          Kuis & Ujian Interaktif
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Pilih kuis yang tersedia untuk menguji pemahaman Anda. Nilai dan pembahasan akan keluar secara otomatis seketika setelah selesai.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari kuis atau mata pelajaran..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Quizzes List */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-sm">
          Memuat daftar kuis ujian...
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <FileQuestion className="h-10 w-10 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">Belum ada kuis yang tersedia untuk dikerjakan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQuizzes.map((quiz) => {
            const submissions = getSubmissionsForQuiz(quiz.id);
            const latestSubmission = submissions.length > 0 ? submissions[0] : null;
            const hasPassed = submissions.some(s => s.isPassed);
            const canRetake = quiz.allowRetake !== false;
            const isRestricted = quiz.registrationType === 'admin_only' && user && !quiz.enrolledStudentIds?.includes(user.id);

            return (
              <div
                key={quiz.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-600 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md">
                      {quiz.subject}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        quiz.registrationType === 'admin_only'
                          ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      }`}>
                        {quiz.registrationType === 'admin_only' ? 'Diregiskan Admin' : 'Regis Mandiri'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        canRetake
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      }`}>
                        {canRetake ? 'Bisa Diulang' : '1x Saja'}
                      </span>
                      {latestSubmission && (
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            hasPassed
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          {hasPassed ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {hasPassed ? `Lulus (${latestSubmission.percentage})` : `Remedial (${latestSubmission.percentage})`}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 mt-1">
                    {quiz.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                    {quiz.description || 'Kerjakan kuis ini untuk mengevaluasi pemahaman materi.'}
                  </p>

                  {isRestricted && (
                    <div className="mt-3 p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
                      <Lock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <span>Kuis khusus: Anda belum terdaftar dan harus didaftarkan oleh Admin.</span>
                    </div>
                  )}

                  <div className="mt-4 grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl text-center border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium">Durasi</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1">
                        <Clock className="h-3 w-3 text-indigo-500" />
                        {quiz.durationMinutes}m
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium">Jumlah Soal</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1">
                        <ListChecks className="h-3 w-3 text-emerald-500" />
                        {quiz.questions?.length || 0}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium">KKM</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1">
                        <Award className="h-3 w-3 text-amber-500" />
                        {quiz.passingScore}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  {latestSubmission ? (
                    <>
                      <button
                        onClick={() => onViewSubmissionReview(latestSubmission.id)}
                        className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
                      >
                        <BookOpen className="h-3.5 w-3.5" /> {quiz.showExplanation !== false ? 'Pembahasan' : 'Review Hasil'}
                      </button>

                      {canRetake ? (
                        isRestricted ? (
                          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-1">
                            <Lock className="h-3.5 w-3.5" /> Terkunci
                          </span>
                        ) : (
                          <button
                            onClick={() => onStartQuiz(quiz.id)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Play className="h-3 w-3" /> Ulangi Kuis
                          </button>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                          <Lock className="h-3.5 w-3.5" /> Kuis Selesai
                        </span>
                      )}
                    </>
                  ) : isRestricted ? (
                    <button
                      disabled
                      className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed opacity-80"
                    >
                      <Lock className="h-3.5 w-3.5" /> Akses Khusus: Harus Diregiskan Admin
                    </button>
                  ) : (
                    <button
                      onClick={() => onStartQuiz(quiz.id)}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5" /> Mulai Kerjakan Ujian
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
