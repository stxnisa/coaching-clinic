import { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { Quiz, QuizSubmission } from '../types';
import confetti from 'canvas-confetti';
import { renderWithEquations } from './MathEquation';
import { 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  Flag, 
  CheckCircle2, 
  XCircle, 
  Award, 
  RotateCcw,
  Check
} from 'lucide-react';

interface QuizPlayerViewProps {
  quizId: string;
  onExit: () => void;
  onViewReports?: () => void;
}

export default function QuizPlayerView({ quizId, onExit, onViewReports }: QuizPlayerViewProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Test state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, number[]>>(new Map());
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState<number>(0); // in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Result state
  const [submissionResult, setSubmissionResult] = useState<QuizSubmission | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    fetchQuizDetails();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizId]);

  const fetchQuizDetails = async () => {
    try {
      setIsLoading(true);
      const data = await api.getQuizById(quizId);
      setQuiz(data);
      const totalSeconds = (data.durationMinutes || 15) * 60;
      setTimeLeft(totalSeconds);
      startTimeRef.current = Date.now();
      startTimer(totalSeconds);
    } catch (err) {
      console.error('Failed to fetch quiz', err);
      alert('Gagal memuat kuis.');
      onExit();
    } finally {
      setIsLoading(false);
    }
  };

  const startTimer = (initialSeconds: number) => {
    let current = initialSeconds;
    timerRef.current = setInterval(() => {
      current -= 1;
      setTimeLeft(current);

      if (current <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        alert('Waktu ujian telah habis! Jawaban Anda akan otomatis dikumpulkan dan dinilai.');
        autoSubmitQuiz();
      }
    }, 1000);
  };

  const handleSelectOption = (questionId: string, optionIndex: number, type: 'single' | 'multiple' | 'dropdown' = 'single') => {
    setAnswers(prev => {
      const next = new Map<string, number[]>(prev);
      if (type === 'multiple') {
        const current = next.get(questionId) || [];
        if (current.includes(optionIndex)) {
          const filtered = current.filter(i => i !== optionIndex);
          if (filtered.length === 0) {
            next.delete(questionId);
          } else {
            next.set(questionId, filtered);
          }
        } else {
          next.set(questionId, [...current, optionIndex].sort((a, b) => a - b));
        }
      } else {
        // single or dropdown
        next.set(questionId, [optionIndex]);
      }
      return next;
    });
  };

  const handleToggleFlag = (index: number) => {
    setFlaggedQuestions(prev => {
      const next = new Set<number>(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const autoSubmitQuiz = async () => {
    if (!quiz) return;
    performSubmission();
  };

  const performSubmission = async () => {
    if (!quiz || isSubmitting) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setIsSubmitting(true);

    const formattedAnswers = quiz.questions.map(q => {
      const selected = answers.get(q.id) || [];
      return {
        questionId: q.id,
        selectedOption: selected.length > 0 ? selected[0] : -1,
        selectedOptions: selected,
      };
    });

    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);

    try {
      const res = await api.submitQuiz(quiz.id, formattedAnswers, timeSpent);
      setSubmissionResult(res.submission);

      // Trigger Confetti if passed!
      if (res.submission.isPassed) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err: any) {
      alert(err.message || 'Gagal mengirimkan jawaban kuis.');
    } finally {
      setIsSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Menyiapkan lembar ujian interaktif...</p>
      </div>
    );
  }

  if (!quiz) return null;

  // Render Post-Submission Review
  if (submissionResult) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in transition-colors">
        {/* Score Hero Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm text-center relative overflow-hidden">
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase mb-4 ${
              submissionResult.isPassed
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
            }`}
          >
            {submissionResult.isPassed ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Lulus Standar KKM ({quiz.passingScore})
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                Perlu Remedial / Belum Mencapai KKM ({quiz.passingScore})
              </>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Hasil Evaluasi Ujian Otomatis
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{quiz.title} • {quiz.subject}</p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            <div>
              <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Nilai Akhir
              </span>
              <span className={`text-4xl sm:text-5xl font-black ${
                submissionResult.isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {submissionResult.percentage}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                {submissionResult.score} / {submissionResult.maxScore} Poin
              </span>
            </div>

            <div className="h-12 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            <div>
              <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Predikat
              </span>
              <span className="text-4xl sm:text-5xl font-black text-indigo-600 dark:text-indigo-400">
                {submissionResult.gradeLetter}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                Skala Akademik
              </span>
            </div>

            <div className="h-12 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            <div>
              <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Waktu Selesai
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-200">
                {Math.floor(submissionResult.timeSpentSeconds / 60)}m {submissionResult.timeSpentSeconds % 60}d
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                dari batas {quiz.durationMinutes} menit
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onExit}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              Kembali ke Daftar Kuis
            </button>
            {onViewReports && (
              <button
                onClick={onViewReports}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Award className="h-4 w-4" />
                Buka Lembar Rapor Digital
              </button>
            )}
          </div>
        </div>

        {/* Detailed Review Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pembahasan & Review Jawaban</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pelajari kunci jawaban yang tepat dan pembahasan di setiap butir soal.</p>
            </div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {submissionResult.detailedResults?.filter(r => r.isCorrect).length} dari {submissionResult.detailedResults?.length} Soal Benar
            </div>
          </div>

          <div className="space-y-6">
            {submissionResult.detailedResults?.map((res, idx) => {
              const optionLetters = ['A', 'B', 'C', 'D', 'E'];
              const correctIndices = res.correctAnswerIndices || (res.correctAnswerIndex !== undefined ? [res.correctAnswerIndex] : []);
              const selectedIndices = res.selectedOptions || (res.selectedOption !== undefined && res.selectedOption >= 0 ? [res.selectedOption] : []);

              return (
                <div
                  key={res.questionId}
                  className={`p-5 rounded-2xl border transition-all ${
                    res.isCorrect
                      ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/20'
                      : 'border-rose-200 dark:border-rose-800 bg-rose-50/20 dark:bg-rose-950/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        res.isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                      }`}>
                        {idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{renderWithEquations(res.questionText)}</h4>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md shrink-0 ${
                      res.isCorrect 
                        ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300' 
                        : 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300'
                    }`}>
                      {res.pointsEarned} / {res.maxPoints} Poin
                    </span>
                  </div>

                  {/* Options status */}
                  <div className="mt-3.5 space-y-2">
                    {res.options.map((opt, oIdx) => {
                      const isUserChoice = selectedIndices.includes(oIdx);
                      const isCorrectAnswer = correctIndices.includes(oIdx);

                      let rowStyle = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300';
                      if (isCorrectAnswer) {
                        rowStyle = 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold ring-1 ring-emerald-300';
                      } else if (isUserChoice && !res.isCorrect) {
                        rowStyle = 'border-rose-300 dark:border-rose-700 bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-semibold ring-1 ring-rose-300';
                      }

                      return (
                        <div
                          key={oIdx}
                          className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${rowStyle}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isCorrectAnswer 
                                ? 'bg-emerald-600 text-white' 
                                : 'border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}>
                              {optionLetters[oIdx]}
                            </span>
                            <span>{renderWithEquations(opt)}</span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] font-semibold">
                            {isUserChoice && (
                              <span className={res.isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}>
                                (Jawaban Anda)
                              </span>
                            )}
                            {isCorrectAnswer && (
                              <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                <Check className="h-3.5 w-3.5" /> Kunci Benar
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {res.explanation && (
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                      <strong className="block text-amber-950 dark:text-amber-300 mb-0.5">Pembahasan & Penjelasan Soal:</strong>
                      {renderWithEquations(res.explanation)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active Quiz Taking Layout
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const optionLetters = ['A', 'B', 'C', 'D', 'E'];
  const totalQuestions = quiz.questions.length;
  const answeredCount = answers.size;
  const isFlagged = flaggedQuestions.has(currentQuestionIndex);
  const isCurrentAnswered = answers.has(currentQuestion.id);

  const isTimerCritical = timeLeft < 180; // less than 3 minutes

  const qType = currentQuestion.type || 'single';
  const selectedOptions = answers.get(currentQuestion.id) || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in transition-colors">
      {/* Sticky Test Header with Countdown Timer */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3 sticky top-16 sm:top-18 z-30">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
              {quiz.subject}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 truncate">
              {qType === 'multiple' ? 'PG Majemuk' : qType === 'dropdown' ? 'Dropdown' : 'Pilihan Ganda'}
            </span>
          </div>
          <h2 className="text-xs sm:text-base font-bold text-slate-900 dark:text-white mt-1 truncate max-w-[200px] sm:max-w-md">
            {quiz.title}
          </h2>
        </div>

        {/* Timer Box */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl border text-xs sm:text-sm font-mono font-bold transition-colors ${
              isTimerCritical
                ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 animate-pulse'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
            }`}
          >
            <Clock className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isTimerCritical ? 'text-rose-600' : 'text-indigo-600 dark:text-indigo-400'}`} />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <span className="hidden sm:inline">Selesai & Kumpulkan</span>
            <span className="sm:hidden">Kumpulkan</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Question */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
            {/* Question Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-extrabold text-indigo-900 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/80 px-3 py-1 rounded-lg">
                Pertanyaan {currentQuestionIndex + 1} dari {totalQuestions}
              </span>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Bobot: {currentQuestion.points} Poin
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleFlag(currentQuestionIndex)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    isFlagged
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Flag className={`h-3.5 w-3.5 ${isFlagged ? 'text-amber-700 fill-amber-700' : 'text-slate-400'}`} />
                  {isFlagged ? 'Ragu-ragu' : 'Tandai Ragu'}
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="text-base sm:text-lg font-medium text-slate-900 dark:text-white leading-relaxed font-sans">
              {renderWithEquations(currentQuestion.text)}
            </div>

            {/* Dropdown specific interface */}
            {qType === 'dropdown' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Pilih Jawaban melalui Menu Dropdown:
                </label>
                <select
                  value={selectedOptions.length > 0 ? selectedOptions[0] : ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val !== '') {
                      handleSelectOption(currentQuestion.id, Number(val), 'dropdown');
                    }
                  }}
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-sans cursor-pointer"
                >
                  <option value="">-- Pilih Salah Satu Jawaban --</option>
                  {currentQuestion.options.map((opt, optIndex) => (
                    <option key={optIndex} value={optIndex}>
                      {optionLetters[optIndex]}. {opt}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Hint for Multiple Choice */}
            {qType === 'multiple' && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                💡 Pilihan Ganda Majemuk: Anda dapat memilih lebih dari satu jawaban yang benar.
              </p>
            )}

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {currentQuestion.options.map((opt, optIndex) => {
                const isSelected = selectedOptions.includes(optIndex);
                return (
                  <button
                    key={optIndex}
                    type="button"
                    onClick={() => handleSelectOption(currentQuestion.id, optIndex, qType)}
                    className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center gap-3.5 cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/50 ring-2 ring-indigo-200 dark:ring-indigo-900 text-indigo-950 dark:text-indigo-200 font-semibold shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {isSelected && qType === 'multiple' ? '✓' : optionLetters[optIndex]}
                    </span>
                    <span className="flex-1">{renderWithEquations(opt)}</span>
                  </button>
                );
              })}
            </div>

            {/* Bottom Nav: Prev, Next, Submit */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Sebelumnya
              </button>

              {currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  Selanjutnya <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(true)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  Kumpulkan Ujian <CheckCircle2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Question Navigator Grid */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
              Nomor Soal Ujian
            </h3>

            {/* Grid */}
            <div className="grid grid-cols-5 gap-2">
              {quiz.questions.map((q, idx) => {
                const isCurrent = currentQuestionIndex === idx;
                const isAnswered = answers.has(q.id);
                const isFlag = flaggedQuestions.has(idx);

                let btnClass = 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';
                if (isCurrent) {
                  btnClass = 'bg-indigo-600 border-indigo-600 text-white font-bold ring-2 ring-indigo-300 dark:ring-indigo-700';
                } else if (isFlag) {
                  btnClass = 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 font-bold';
                } else if (isAnswered) {
                  btnClass = 'bg-emerald-500 border-emerald-500 text-white font-semibold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-9 rounded-lg border text-xs font-medium transition-all relative flex items-center justify-center cursor-pointer ${btnClass}`}
                  >
                    {idx + 1}
                    {isFlag && !isCurrent && (
                      <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-amber-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-[11px] text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500 shrink-0" />
                <span>Sudah dijawab ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-400 shrink-0" />
                <span>Ditandai ragu-ragu ({flaggedQuestions.size})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                <span>Belum dijawab ({totalQuestions - answeredCount})</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowSubmitModal(true)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs cursor-pointer"
              >
                Selesai & Kumpulkan Jawaban
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Konfirmasi Pengumpulan Ujian
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Anda telah menjawab <strong>{answeredCount}</strong> dari {totalQuestions} pertanyaan.
              {totalQuestions - answeredCount > 0 && (
                <span className="text-amber-700 dark:text-amber-400 block mt-1 font-semibold">
                  ⚠️ Peringatan: Masih terdapat {totalQuestions - answeredCount} butir soal yang belum dijawab.
                </span>
              )}
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Periksa Kembali
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={performSubmission}
                className="px-5 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? 'Menilai jawaban...' : 'Ya, Kumpulkan Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
