import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BrandProvider, useBrand } from './context/BrandContext';
import { ThemeProvider } from './context/ThemeContext';
import BrandSettingsModal from './components/BrandSettingsModal';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginView from './components/LoginView';
import AdminRegisterView from './components/AdminRegisterView';
import MaterialsView from './components/MaterialsView';
import QuizManagementView from './components/QuizManagementView';
import StudentQuizListView from './components/StudentQuizListView';
import QuizPlayerView from './components/QuizPlayerView';
import GradeMonitoringDashboard from './components/GradeMonitoringDashboard';
import GradeReportingView from './components/GradeReportingView';
import { api } from './api';
import { QuizSubmission } from './types';
import { X, ShieldCheck, Maximize2, Minimize2 } from 'lucide-react';

function MainApp() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { logoUrl, brandName } = useBrand();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Test mode state
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);

  // Submission review modal state
  const [viewingSubmission, setViewingSubmission] = useState<QuizSubmission | null>(null);
  const [isReviewMaximized, setIsReviewMaximized] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white mx-auto mb-4 text-lg shadow-lg animate-pulse overflow-hidden p-1">
            {logoUrl ? (
              <img src={logoUrl} alt={brandName} className="w-full h-full object-contain" />
            ) : (
              <span>{brandName ? brandName.charAt(0).toUpperCase() : 'L'}</span>
            )}
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">{brandName}</h3>
          <p className="text-xs text-slate-400 mt-1">Menyiapkan sesi JWT dan dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <>
        <LoginView />
        <BrandSettingsModal />
      </>
    );
  }

  const isAdmin = user.role === 'admin';

  const handleStartQuiz = (quizId: string) => {
    setActiveQuizId(quizId);
  };

  const handleExitQuiz = () => {
    setActiveQuizId(null);
  };

  const handleViewSubmissionReview = async (submissionId: string) => {
    try {
      const sub = await api.getSubmissionById(submissionId);
      setViewingSubmission(sub);
    } catch (err: any) {
      alert(err.message || 'Gagal memuat review submission.');
    }
  };

  // If in active quiz taking mode, render full-screen Quiz Player
  if (activeQuizId) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 py-6 px-4 sm:px-6 transition-colors">
        <QuizPlayerView
          quizId={activeQuizId}
          onExit={handleExitQuiz}
          onViewReports={() => {
            setActiveQuizId(null);
            setActiveTab('reports');
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden text-slate-800 dark:text-slate-100 antialiased transition-colors">
      {/* Sleek Interface Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Main App Container */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Sleek Interface Top Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onStartCreateQuiz={() => setActiveTab('quizzes')}
        />

        {/* Scrollable View Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
          {activeTab === 'dashboard' && (
            <GradeMonitoringDashboard
              onNavigateToQuiz={() => setActiveTab('quizzes')}
              onNavigateToReports={() => setActiveTab('reports')}
              onNavigateToStudents={() => setActiveTab('users')}
            />
          )}

          {activeTab === 'quizzes' && (
            isAdmin ? (
              <QuizManagementView onTakeQuiz={handleStartQuiz} />
            ) : (
              <StudentQuizListView
                onStartQuiz={handleStartQuiz}
                onViewSubmissionReview={handleViewSubmissionReview}
              />
            )
          )}

          {activeTab === 'materials' && <MaterialsView />}

          {activeTab === 'users' && isAdmin && <AdminRegisterView />}

          {activeTab === 'reports' && <GradeReportingView />}

          {/* Footer note in content */}
          <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2 print:hidden">
            <div className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>EduTest LMS Platform • Autentikasi JWT Terenkripsi</span>
            </div>
            <span>Sistem Ujian CBT & Pelaporan Nilai Otomatis</span>
          </div>
        </div>
      </main>

      {/* Submission Review Modal (triggered from Student Quiz List) */}
      {viewingSubmission && (
        <div className={`fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-center ${
          isReviewMaximized ? 'p-0 items-stretch' : 'p-2 sm:p-4 overflow-y-auto items-center'
        }`}>
          <div className={`bg-white dark:bg-slate-900 flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 transition-all duration-200 ${
            isReviewMaximized
              ? 'w-full h-full rounded-none max-w-none'
              : 'rounded-2xl sm:rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden'
          }`}>
            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between shrink-0 bg-white dark:bg-slate-900">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded">
                  {viewingSubmission.subject}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1 truncate">
                  Pembahasan Kuis: {viewingSubmission.quizTitle}
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-400">
                  Nilai Anda: <strong>{viewingSubmission.percentage}</strong> ({viewingSubmission.score}/{viewingSubmission.maxScore} Poin) • Predikat: {viewingSubmission.gradeLetter}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsReviewMaximized(!isReviewMaximized)}
                  title={isReviewMaximized ? 'Perkecil Layar (Normal)' : 'Buka Layar Penuh (Fullscreen)'}
                  className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  {isReviewMaximized ? <Minimize2 className="h-4 w-4 sm:h-5 sm:w-5" /> : <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
                <button
                  onClick={() => {
                    setViewingSubmission(null);
                    setIsReviewMaximized(false);
                  }}
                  className="text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              {viewingSubmission.detailedResults?.map((res, idx) => {
                const userChoices = res.selectedOptions && res.selectedOptions.length > 0
                  ? res.selectedOptions
                  : res.selectedOption !== undefined && res.selectedOption !== -1
                  ? [res.selectedOption]
                  : [];
                const correctKeys = res.correctAnswerIndices && res.correctAnswerIndices.length > 0
                  ? res.correctAnswerIndices
                  : res.correctAnswerIndex !== undefined
                  ? [res.correctAnswerIndex]
                  : [];

                return (
                  <div
                    key={res.questionId}
                    className={`p-4 rounded-xl border text-xs space-y-2 ${
                      res.isCorrect 
                        ? 'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/30 dark:bg-emerald-950/20' 
                        : 'border-rose-200 dark:border-rose-800/80 bg-rose-50/30 dark:bg-rose-950/20'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span>Soal {idx + 1}. {res.questionText}</span>
                      <span className={res.isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}>
                        {res.pointsEarned} / {res.maxPoints} Poin
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {res.options.map((opt, oIdx) => {
                        const isChosen = userChoices.includes(oIdx);
                        const isCorrectKey = correctKeys.includes(oIdx);
                        return (
                          <div
                            key={oIdx}
                            className={`p-2 rounded-lg border text-xs ${
                              isCorrectKey
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 font-semibold text-emerald-900 dark:text-emerald-200'
                                : isChosen
                                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 font-semibold text-rose-900 dark:text-rose-200'
                                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {opt} {isChosen && ' (Jawaban Anda)'} {isCorrectKey && ' ✓ Kunci Benar'}
                          </div>
                        );
                      })}
                    </div>

                    {res.explanation && (
                      <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 rounded-lg text-amber-900 dark:text-amber-200 text-xs">
                        <strong>Pembahasan:</strong> {res.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 rounded-b-3xl text-right">
              <button
                onClick={() => setViewingSubmission(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Tutup Pembahasan
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Brand Settings & Logo Upload Modal */}
      <BrandSettingsModal />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrandProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </BrandProvider>
    </ThemeProvider>
  );
}

