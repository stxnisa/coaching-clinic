import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Quiz, QuizQuestion, QuestionType } from '../types';
import { 
  FileQuestion, 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  Award, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Eye, 
  ListChecks, 
  Check, 
  HelpCircle,
  Play,
  FileSpreadsheet,
  FileText,
  Maximize2,
  Minimize2,
  Calculator
} from 'lucide-react';
import BulkQuestionImportModal from './BulkQuestionImportModal';
import EquationBuilderModal from './EquationBuilderModal';
import { renderWithEquations } from './MathEquation';

interface QuizManagementViewProps {
  onTakeQuiz?: (quizId: string) => void;
}

export default function QuizManagementView({ onTakeQuiz }: QuizManagementViewProps) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Modal / Editor State
  const [showEditor, setShowEditor] = useState(false);
  const [isEditorMaximized, setIsEditorMaximized] = useState(false);
  const [isPreviewMaximized, setIsPreviewMaximized] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [showBulkQuestionModal, setShowBulkQuestionModal] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [passingScore, setPassingScore] = useState(75);
  const [allowRetake, setAllowRetake] = useState(true);
  const [showExplanation, setShowExplanation] = useState(true);
  const [registrationType, setRegistrationType] = useState<'open' | 'admin_only'>('open');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: `q-temp-1`,
      text: '',
      type: 'single',
      options: ['', '', ''],
      correctAnswerIndex: 0,
      correctAnswerIndices: [0],
      explanation: '',
      points: 25,
    }
  ]);

  // Preview Modal
  const [previewQuiz, setPreviewQuiz] = useState<Quiz | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Equation Modal State for questions
  const [equationModalState, setEquationModalState] = useState<{
    isOpen: boolean;
    questionIndex: number;
    field: 'text' | 'explanation';
  }>({
    isOpen: false,
    questionIndex: -1,
    field: 'text',
  });

  const handleInsertEquationToQuestion = (formulaSnippet: string) => {
    const { questionIndex, field } = equationModalState;
    if (questionIndex >= 0 && questionIndex < questions.length) {
      setQuestions(prev => {
        const next = [...prev];
        const targetQ = { ...next[questionIndex] };
        if (field === 'text') {
          targetQ.text = targetQ.text ? `${targetQ.text} ${formulaSnippet}` : formulaSnippet;
        } else {
          targetQ.explanation = targetQ.explanation ? `${targetQ.explanation} ${formulaSnippet}` : formulaSnippet;
        }
        next[questionIndex] = targetQ;
        return next;
      });
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);
      const data = await api.getQuizzes();
      setQuizzes(data);
    } catch (err) {
      console.error('Failed to load quizzes', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingQuizId(null);
    setTitle('');
    setSubject('');
    setDescription('');
    setDurationMinutes(15);
    setPassingScore(75);
    setAllowRetake(true);
    setShowExplanation(true);
    setRegistrationType('open');
    setStatus('published');
    setQuestions([
      {
        id: `q-${Date.now()}-1`,
        text: '',
        type: 'single',
        options: ['', '', ''],
        correctAnswerIndex: 0,
        correctAnswerIndices: [0],
        explanation: '',
        points: 25,
      }
    ]);
    setShowEditor(true);
  };

  const handleOpenEdit = (q: Quiz) => {
    setEditingQuizId(q.id);
    setTitle(q.title);
    setSubject(q.subject);
    setDescription(q.description || '');
    setDurationMinutes(q.durationMinutes);
    setPassingScore(q.passingScore);
    setAllowRetake(q.allowRetake !== false);
    setShowExplanation(q.showExplanation !== false);
    setRegistrationType(q.registrationType || 'open');
    setStatus(q.status || 'published');
    setQuestions(
      q.questions.map(item => ({
        ...item,
        type: item.type || 'single',
        options: [...item.options],
        correctAnswerIndex: item.correctAnswerIndex ?? 0,
        correctAnswerIndices: item.correctAnswerIndices || (item.correctAnswerIndex !== undefined ? [item.correctAnswerIndex] : [0]),
      }))
    );
    setShowEditor(true);
  };

  const handleAddQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        id: `q-${Date.now()}-${prev.length + 1}`,
        text: '',
        type: 'single',
        options: ['', '', ''],
        correctAnswerIndex: 0,
        correctAnswerIndices: [0],
        explanation: '',
        points: 20,
      }
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) {
      alert('Kuis harus memiliki minimal 1 butir pertanyaan.');
      return;
    }
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuestionTextChange = (index: number, text: string) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[index].text = text;
      return updated;
    });
  };

  const handleQuestionTypeChange = (index: number, newType: QuestionType) => {
    setQuestions(prev => {
      const updated = [...prev];
      const q = updated[index];
      q.type = newType;
      if (newType === 'multiple') {
        if (!q.correctAnswerIndices || q.correctAnswerIndices.length === 0) {
          q.correctAnswerIndices = [q.correctAnswerIndex ?? 0];
        }
      } else {
        if (q.correctAnswerIndices && q.correctAnswerIndices.length > 0) {
          q.correctAnswerIndex = q.correctAnswerIndices[0];
        } else if (q.correctAnswerIndex === undefined) {
          q.correctAnswerIndex = 0;
        }
        q.correctAnswerIndices = [q.correctAnswerIndex ?? 0];
      }
      return updated;
    });
  };

  const handleAddOption = (qIndex: number) => {
    setQuestions(prev => {
      const updated = [...prev];
      if (updated[qIndex].options.length < 5) {
        updated[qIndex].options = [...updated[qIndex].options, ''];
      }
      return updated;
    });
  };

  const handleRemoveOption = (qIndex: number, optIndex: number) => {
    setQuestions(prev => {
      const updated = [...prev];
      const currentOpts = updated[qIndex].options;
      if (currentOpts.length <= 2) {
        alert('Setiap soal minimal harus memiliki 2 pilihan jawaban.');
        return prev;
      }
      const newOpts = currentOpts.filter((_, i) => i !== optIndex);
      updated[qIndex].options = newOpts;

      // Adjust correctAnswerIndex
      if ((updated[qIndex].correctAnswerIndex ?? 0) >= newOpts.length) {
        updated[qIndex].correctAnswerIndex = Math.max(0, newOpts.length - 1);
      }
      // Adjust correctAnswerIndices
      if (updated[qIndex].correctAnswerIndices) {
        let indices = updated[qIndex].correctAnswerIndices!
          .filter(i => i !== optIndex)
          .map(i => (i > optIndex ? i - 1 : i));
        if (indices.length === 0) indices = [0];
        updated[qIndex].correctAnswerIndices = indices;
      }
      return updated;
    });
  };

  const handleOptionChange = (qIndex: number, optIndex: number, text: string) => {
    setQuestions(prev => {
      const updated = [...prev];
      const newOpts = [...updated[qIndex].options];
      newOpts[optIndex] = text;
      updated[qIndex].options = newOpts;
      return updated;
    });
  };

  const handleCorrectAnswerChange = (qIndex: number, optIndex: number) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[qIndex].correctAnswerIndex = optIndex;
      updated[qIndex].correctAnswerIndices = [optIndex];
      return updated;
    });
  };

  const handleToggleMultipleCorrect = (qIndex: number, optIndex: number) => {
    setQuestions(prev => {
      const updated = [...prev];
      const q = updated[qIndex];
      const current = q.correctAnswerIndices || [];
      let next: number[];
      if (current.includes(optIndex)) {
        if (current.length === 1) {
          alert('Pilihan ganda majemuk harus memiliki minimal 1 kunci jawaban benar.');
          return prev;
        }
        next = current.filter(i => i !== optIndex);
      } else {
        next = [...current, optIndex].sort((a, b) => a - b);
      }
      q.correctAnswerIndices = next;
      q.correctAnswerIndex = next[0];
      return updated;
    });
  };

  const handleExplanationChange = (index: number, explanation: string) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[index].explanation = explanation;
      return updated;
    });
  };

  const handlePointsChange = (index: number, points: number) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[index].points = points;
      return updated;
    });
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) {
      alert('Judul kuis dan mata pelajaran wajib diisi.');
      return;
    }

    // Validation
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        alert(`Soal nomor ${i + 1} belum memiliki teks pertanyaan.`);
        return;
      }
      if (q.options.length < 2) {
        alert(`Soal nomor ${i + 1} harus memiliki minimal 2 pilihan jawaban.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          alert(`Pilihan jawaban ke-${j + 1} pada soal nomor ${i + 1} tidak boleh kosong.`);
          return;
        }
      }
      if (q.type === 'multiple' && (!q.correctAnswerIndices || q.correctAnswerIndices.length === 0)) {
        alert(`Soal nomor ${i + 1} (Pilihan Ganda Majemuk) harus memiliki minimal 1 kunci jawaban benar.`);
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload = {
        title,
        subject,
        description,
        durationMinutes,
        passingScore,
        allowRetake,
        showExplanation,
        registrationType,
        status,
        questions,
      };

      if (editingQuizId) {
        await api.updateQuiz(editingQuizId, payload);
      } else {
        await api.createQuiz(payload);
      }

      setShowEditor(false);
      fetchQuizzes();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan kuis.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleQuizStatus = async (quizId: string) => {
    try {
      const res = await api.toggleQuizStatus(quizId);
      setQuizzes(prev => prev.map(q => q.id === quizId ? { ...q, status: res.quiz.status } : q));
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status publikasi kuis.');
    }
  };

  const handleDeleteQuiz = async (id: string, qTitle: string) => {
    if (!confirm(`Hapus kuis "${qTitle}" beserta seluruh rekaman nilai yang terkait?`)) return;

    try {
      await api.deleteQuiz(id);
      fetchQuizzes();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus kuis.');
    }
  };

  const calculateTotalPoints = () => questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0);

  return (
    <div className="space-y-6 pb-12 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FileQuestion className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            Manajemen & Pembuatan Kuis Interaktif
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Rancang kuis pilihan ganda, atur batas durasi, tentukan KKM kelulusan, dan tambahkan pembahasan jawaban otomatis.
          </p>
        </div>

        <button
          id="btn-create-quiz"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Buat Kuis Baru</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Semua ({quizzes.length})
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'published'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
            }`}
          >
            Dipublikasi ({quizzes.filter(q => (q.status || 'published') === 'published').length})
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'draft'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
            }`}
          >
            Draf ({quizzes.filter(q => q.status === 'draft').length})
          </button>
        </div>
      </div>

      {/* Quizzes List */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-500 dark:text-slate-400 text-sm">
          Memuat daftar kuis...
        </div>
      ) : quizzes.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <FileQuestion className="h-10 w-10 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">Belum ada kuis yang dibuat.</p>
          <button
            onClick={handleOpenCreate}
            className="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            + Klik di sini untuk membuat kuis pertama Anda
          </button>
        </div>
      ) : quizzes.filter(q => {
        if (statusFilter === 'published') return (q.status || 'published') === 'published';
        if (statusFilter === 'draft') return q.status === 'draft';
        return true;
      }).length === 0 ? (
        <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">
            Tidak ada kuis dengan status "{statusFilter === 'draft' ? 'Draf' : 'Dipublikasi'}".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {quizzes.filter(q => {
            if (statusFilter === 'published') return (q.status || 'published') === 'published';
            if (statusFilter === 'draft') return q.status === 'draft';
            return true;
          }).map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-600 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md">
                    {quiz.subject}
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      quiz.registrationType === 'admin_only'
                        ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                        : 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                    }`}>
                      {quiz.registrationType === 'admin_only' ? 'Diregiskan Admin' : 'Regis Mandiri'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      quiz.allowRetake !== false
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    }`}>
                      {quiz.allowRetake !== false ? 'Bisa Diulang' : '1x Pengerjaan'}
                    </span>
                    {quiz.status === 'draft' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                        <FileText className="h-3 w-3" /> Draf
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                        <Check className="h-3 w-3" /> Dipublikasi
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 mt-1">
                  {quiz.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                  {quiz.description || 'Tidak ada deskripsi singkat.'}
                </p>

                {/* Specs */}
                <div className="mt-4 grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl text-center border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium">Durasi</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3 text-indigo-500" />
                      {quiz.durationMinutes}m
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium">Jml Soal</span>
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

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewQuiz(quiz)}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Pratinjau
                  </button>
                  <button
                    onClick={() => handleToggleQuizStatus(quiz.id)}
                    title={quiz.status === 'draft' ? 'Publikasikan Kuis' : 'Ubah Menjadi Draf'}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 cursor-pointer transition-colors ${
                      quiz.status === 'draft'
                        ? 'border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {quiz.status === 'draft' ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        Publikasikan
                      </>
                    ) : (
                      <>
                        <FileText className="h-3 w-3" />
                        Drafkan
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {onTakeQuiz && (
                    <button
                      onClick={() => onTakeQuiz(quiz.id)}
                      title="Uji coba kuis ini"
                      className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="h-3 w-3" /> Uji Coba
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenEdit(quiz)}
                    title="Edit Kuis"
                    className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                    title="Hapus Kuis"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Quiz Modal */}
      {previewQuiz && (
        <div className={`fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-center ${
          isPreviewMaximized ? 'p-0 items-stretch' : 'p-4 overflow-y-auto items-center'
        }`}>
          <div className={`bg-white dark:bg-slate-900 flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 transition-all duration-200 ${
            isPreviewMaximized
              ? 'w-full h-full rounded-none max-w-none'
              : 'rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden'
          }`}>
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                  {previewQuiz.subject}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">{previewQuiz.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Durasi: {previewQuiz.durationMinutes} menit | KKM: {previewQuiz.passingScore}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsPreviewMaximized(!isPreviewMaximized)}
                  title={isPreviewMaximized ? 'Perkecil Layar (Normal)' : 'Buka Layar Penuh (Fullscreen)'}
                  className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  {isPreviewMaximized ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => {
                    setPreviewQuiz(null);
                    setIsPreviewMaximized(false);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {previewQuiz.questions?.map((q, idx) => {
                const qType = q.type || 'single';
                const correctIndices = q.correctAnswerIndices || (q.correctAnswerIndex !== undefined ? [q.correctAnswerIndex] : []);
                return (
                  <div key={q.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/80 px-2 py-0.5 rounded">
                            {qType === 'multiple' ? 'Pilihan Ganda Majemuk' : qType === 'dropdown' ? 'Dropdown Menu' : 'Pilihan Ganda'}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            {q.points} Poin
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          Soal {idx + 1}. {renderWithEquations(q.text)}
                        </h4>
                      </div>
                    </div>

                    <div className="space-y-1.5 pl-2">
                      {q.options.map((opt, oIdx) => {
                        const isCorrect = correctIndices.includes(oIdx);
                        const letters = ['A', 'B', 'C', 'D', 'E'];
                        return (
                          <div
                            key={oIdx}
                            className={`text-xs p-2 rounded-lg border flex items-center justify-between ${
                              isCorrect
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span>
                              <strong className="mr-2">{letters[oIdx]}.</strong>
                              {renderWithEquations(opt)}
                            </span>
                            {isCorrect && (
                              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                                ✓ Kunci Jawaban
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="mt-2 p-2.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-900 dark:text-amber-200">
                        <strong>Pembahasan:</strong> {renderWithEquations(q.explanation)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 rounded-b-2xl text-right">
              <button
                onClick={() => setPreviewQuiz(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Editor Modal (Full interactive builder) */}
      {showEditor && (
        <div className={`fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-center ${
          isEditorMaximized ? 'p-0 items-stretch' : 'p-2 sm:p-4 overflow-y-auto items-center'
        }`}>
          <div className={`bg-white dark:bg-slate-900 flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 transition-all duration-200 ${
            isEditorMaximized
              ? 'w-full h-full rounded-none max-w-none'
              : 'rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden'
          }`}>
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <FileQuestion className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {editingQuizId ? 'Edit Kuis Interaktif' : 'Rancang Kuis Interaktif Baru'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Total {questions.length} Butir Soal | Total Bobot Nilai: {calculateTotalPoints()} Poin
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEditorMaximized(!isEditorMaximized)}
                  title={isEditorMaximized ? 'Perkecil Layar (Normal)' : 'Buka Layar Penuh (Fullscreen)'}
                  className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  {isEditorMaximized ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditor(false);
                    setIsEditorMaximized(false);
                  }}
                  title="Tutup"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveQuiz} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Basic Settings */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  1. Informasi Umum Kuis
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Judul Kuis / Ujian *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Contoh: Evaluasi Bab 2 - Struktur Aljabar"
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Mata Pelajaran / Topik *
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Contoh: Matematika Diskrit"
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Petunjuk / Deskripsi Ujian
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Pilihlah salah satu jawaban yang paling tepat. Waktu pengerjaan dibatasi."
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Batas Waktu (Menit) *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="number"
                        min="1"
                        max="180"
                        required
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(Number(e.target.value))}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Standar KKM Kelulusan *
                    </label>
                    <div className="relative">
                      <Award className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        required
                        value={passingScore}
                        onChange={(e) => setPassingScore(Number(e.target.value))}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Registration Mode Setting */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Kebijakan Pendaftaran Siswa (Access / Registration Mode) *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <label
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        registrationType === 'open'
                          ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/60 ring-1 ring-indigo-400'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="quizRegistrationType"
                        value="open"
                        checked={registrationType === 'open'}
                        onChange={() => setRegistrationType('open')}
                        className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <span className="block text-xs font-bold text-slate-900 dark:text-white">
                          Siswa Regis Sendiri (Terbuka)
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Semua siswa dapat langsung mendaftar atau mengerjakan kuis ini secara mandiri.
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        registrationType === 'admin_only'
                          ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/60 ring-1 ring-indigo-400'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="quizRegistrationType"
                        value="admin_only"
                        checked={registrationType === 'admin_only'}
                        onChange={() => setRegistrationType('admin_only')}
                        className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <span className="block text-xs font-bold text-slate-900 dark:text-white">
                          Harus Diregiskan Admin (Khusus)
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Hanya siswa yang telah didaftarkan/diberi akses khusus oleh Admin yang dapat mengerjakan kuis.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Retake & Explanation Settings */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={allowRetake}
                      onChange={(e) => setAllowRetake(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Izinkan Siswa Mengulang Kuis (Retake)
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {allowRetake
                          ? 'Aktif: Siswa dapat mengulang kuis berkali-kali untuk evaluasi.'
                          : 'Nonaktif: Siswa hanya dapat mengerjakan kuis ini 1 kali saja.'}
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showExplanation}
                      onChange={(e) => setShowExplanation(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 dark:border-slate-700"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Sertakan Pembahasan Soal (Opsional)
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {showExplanation
                          ? 'Aktif: Kunci jawaban dan pembahasan akan ditampilkan kepada siswa setelah selesai.'
                          : 'Nonaktif: Pembahasan disembunyikan (hanya nilai/skor akhir yang tampil).'}
                      </p>
                    </div>
                  </label>
                </div>

                {/* Quiz Publication Status Setting */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Status Publikasi Kuis *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <label
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        status === 'published'
                          ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/60 ring-1 ring-emerald-400'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="quizEditorStatus"
                        value="published"
                        checked={status === 'published'}
                        onChange={() => setStatus('published')}
                        className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="block text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          Publikasikan Sekarang (Published)
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Kuis langsung aktif dan dapat diakses/dikerjakan oleh siswa yang berhak.
                        </p>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        status === 'draft'
                          ? 'border-amber-600 dark:border-amber-500 bg-amber-50/70 dark:bg-amber-950/60 ring-1 ring-amber-400'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="quizEditorStatus"
                        value="draft"
                        checked={status === 'draft'}
                        onChange={() => setStatus('draft')}
                        className="mt-0.5 text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <span className="block text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-amber-600" />
                          Simpan Sebagai Draf (Draft)
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Hanya Admin yang dapat melihat dan mengedit. Siswa belum dapat melihat kuis ini.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Questions Builder */}
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    2. Butir Pertanyaan ({questions.length} Soal)
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowBulkQuestionModal(true)}
                      className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5" />
                      Bulk Tambah Soal (CSV)
                    </button>
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Tambah Soal
                    </button>
                  </div>
                </div>

                {questions.map((q, qIndex) => {
                  const qType = q.type || 'single';
                  const isMultiple = qType === 'multiple';
                  const optionLetters = ['A', 'B', 'C', 'D', 'E'];
                  const correctIndices = q.correctAnswerIndices || (q.correctAnswerIndex !== undefined ? [q.correctAnswerIndex] : [0]);

                  return (
                    <div
                      key={q.id}
                      className="bg-white dark:bg-slate-800/80 p-5 rounded-xl border border-slate-300 dark:border-slate-700 shadow-2xs space-y-4 relative"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                        <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-1 rounded-md">
                          Nomor {qIndex + 1}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                            <span>Bobot:</span>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={q.points}
                              onChange={(e) => handlePointsChange(qIndex, Number(e.target.value))}
                              className="w-16 px-2 py-1 text-xs border border-slate-300 dark:border-slate-700 rounded text-center font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            />
                            <span>Poin</span>
                          </div>
                          {questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(qIndex)}
                              className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 p-1 rounded cursor-pointer"
                              title="Hapus soal ini"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Question Type Selector */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Tipe / Format Soal
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => handleQuestionTypeChange(qIndex, 'single')}
                            className={`px-3 py-2 rounded-lg border text-left transition-all cursor-pointer ${
                              qType === 'single'
                                ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-400'
                                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            <span className="block text-xs font-bold">Pilihan Ganda</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">1 kunci jawaban benar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuestionTypeChange(qIndex, 'multiple')}
                            className={`px-3 py-2 rounded-lg border text-left transition-all cursor-pointer ${
                              qType === 'multiple'
                                ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-400'
                                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            <span className="block text-xs font-bold">Pilihan Ganda Majemuk</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Bisa &gt; 1 kunci benar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuestionTypeChange(qIndex, 'dropdown')}
                            className={`px-3 py-2 rounded-lg border text-left transition-all cursor-pointer ${
                              qType === 'dropdown'
                                ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-400'
                                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            <span className="block text-xs font-bold">Pilihan Dropdown</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Menu tarik-turun</span>
                          </button>
                        </div>
                      </div>

                      {/* Question text */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Teks Pertanyaan *
                          </label>
                          <button
                            type="button"
                            onClick={() => setEquationModalState({ isOpen: true, questionIndex: qIndex, field: 'text' })}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800 transition-colors"
                            title="Sisipkan Rumus / Equation Matematika (LaTeX)"
                          >
                            <Calculator className="h-3 w-3" />
                            + Rumus / Equation
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          required
                          value={q.text}
                          onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                          placeholder="Tuliskan pertanyaan soal di sini... (Mendukung rumus LaTeX seperti $E=mc^2$ atau \frac{a}{b})"
                          className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 font-sans bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                        {/* Live Equation / Math Preview */}
                        {(q.text.includes('$') || q.text.includes('[eq')) && (
                          <div className="mt-1.5 p-2 bg-slate-50 dark:bg-slate-900/90 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200">
                            <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Pratinjau Rumus Pertanyaan:</span>
                            {renderWithEquations(q.text)}
                          </div>
                        )}
                      </div>

                      {/* Options list */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {isMultiple
                              ? 'Pilihan Jawaban (Centang semua opsi yang merupakan kunci jawaban benar) *'
                              : 'Pilihan Jawaban (Klik opsi untuk menandai kunci jawaban yang benar) *'}
                          </label>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {q.options.length} Opsi aktif (Maksimal 5: A - E)
                          </span>
                        </div>

                        <div className="space-y-2">
                          {q.options.map((opt, optIndex) => {
                            const isCorrect = isMultiple
                              ? correctIndices.includes(optIndex)
                              : q.correctAnswerIndex === optIndex;

                            return (
                              <div
                                key={optIndex}
                                className={`flex items-center gap-2.5 p-2 rounded-lg border transition-colors ${
                                  isCorrect
                                    ? 'border-emerald-500 dark:border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/40 ring-1 ring-emerald-300 dark:ring-emerald-900'
                                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    isMultiple
                                      ? handleToggleMultipleCorrect(qIndex, optIndex)
                                      : handleCorrectAnswerChange(qIndex, optIndex)
                                  }
                                  title={
                                    isCorrect
                                      ? 'Kunci Jawaban Terpilih (Klik untuk membatalkan/ubah)'
                                      : 'Klik untuk jadikan kunci jawaban'
                                  }
                                  className={`h-7 w-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-all cursor-pointer ${
                                    isCorrect
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                  }`}
                                >
                                  {isCorrect ? '✓ ' + optionLetters[optIndex] : optionLetters[optIndex]}
                                </button>

                                <input
                                  type="text"
                                  required
                                  value={opt}
                                  onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                                  placeholder={`Teks Opsi ${optionLetters[optIndex]}`}
                                  className="flex-1 px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-indigo-500"
                                />

                                {isCorrect && (
                                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 whitespace-nowrap px-1.5">
                                    Kunci Benar
                                  </span>
                                )}

                                {q.options.length > 2 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveOption(qIndex, optIndex)}
                                    title={`Hapus opsi ${optionLetters[optIndex]}`}
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Button to add options D or up to E */}
                        {q.options.length < 5 && (
                          <div className="mt-2.5 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleAddOption(qIndex)}
                              className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-200 bg-indigo-50/80 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-3 py-1.5 rounded-lg border border-dashed border-indigo-300 dark:border-indigo-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              <span>Tambah Opsi {optionLetters[q.options.length]} {q.options.length === 3 ? '(Opsi D)' : '(Opsi E - Maksimal)'}</span>
                            </button>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              (Admin dapat menambahkan hingga 5 pilihan: A, B, C, D, E)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Explanation (Optional) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <HelpCircle className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                            Pembahasan Soal <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">(Opsional)</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEquationModalState({ isOpen: true, questionIndex: qIndex, field: 'explanation' })}
                              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800 transition-colors"
                              title="Sisipkan Rumus ke Pembahasan"
                            >
                              <Calculator className="h-3 w-3" />
                              + Rumus
                            </button>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">
                              (Bisa dikosongkan)
                            </span>
                          </div>
                        </div>
                        <textarea
                          rows={2}
                          value={q.explanation}
                          onChange={(e) => handleExplanationChange(qIndex, e.target.value)}
                          placeholder="Tuliskan pembahasan jawaban di sini jika ada (opsional)... (Mendukung LaTeX)"
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800"
                        />
                        {(q.explanation?.includes('$') || q.explanation?.includes('[eq')) && (
                          <div className="mt-1.5 p-2 bg-slate-50 dark:bg-slate-900/90 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200">
                            <span className="text-[10px] font-bold text-slate-400 block mb-0.5">Pratinjau Rumus Pembahasan:</span>
                            {renderWithEquations(q.explanation)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-2 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Tambah Butir Soal Baru
                </button>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-900 py-2">
                <button
                  type="button"
                  onClick={() => setShowEditor(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`px-5 py-2.5 text-xs font-semibold text-white rounded-xl shadow-xs disabled:opacity-60 cursor-pointer flex items-center gap-1.5 ${
                    status === 'draft'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isSaving
                    ? 'Menyimpan kuis...'
                    : editingQuizId
                    ? (status === 'draft' ? 'Perbarui Draf Kuis' : 'Perbarui & Publikasikan')
                    : (status === 'draft' ? 'Simpan Sebagai Draf' : 'Publikasikan Kuis')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Questions Modal */}
      <BulkQuestionImportModal
        isOpen={showBulkQuestionModal}
        onClose={() => setShowBulkQuestionModal(false)}
        currentQuestionCount={questions.length}
        onImport={(importedQuestions, mode) => {
          if (mode === 'append') {
            setQuestions(prev => {
              // If there's only 1 default empty question, replace it instead of appending
              if (prev.length === 1 && !prev[0].text.trim() && prev[0].options.every(o => !o.trim())) {
                return importedQuestions;
              }
              return [...prev, ...importedQuestions];
            });
          } else {
            setQuestions(importedQuestions);
          }
        }}
      />
      {/* Equation Builder Modal for Questions and Explanations */}
      <EquationBuilderModal
        isOpen={equationModalState.isOpen}
        onClose={() => setEquationModalState(prev => ({ ...prev, isOpen: false }))}
        onInsert={(snippet) => {
          handleInsertEquationToQuestion(snippet);
        }}
      />
    </div>
  );
}
