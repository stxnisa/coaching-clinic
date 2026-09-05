export type UserRole = 'admin' | 'siswa';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string; // Foto profil (Base64 atau URL gambar)
  branch?: string; // Cabang Brain Academy (e.g., 'Brain Academy Jakarta Selatan')
  studentClass?: string; // Kept for backwards-compatibility
  nis?: string; // Kept for backwards-compatibility
  phone?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Material {
  id: string;
  title: string;
  subtitle?: string; // Subtitle (opsional)
  subject: string;
  description: string;
  content: string; // Formatting H1, H2, H3, Bold, Italic, Underline, Strikethrough, Lists, Tables, Images
  images?: string[]; // Daftar gambar lampiran materi (bisa dihapus)
  status?: 'published' | 'draft'; // dipublish atau draft
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  externalLink?: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  completedByStudentIds: string[];
  registrationType?: 'open' | 'admin_only'; // 'open' = Bisa daftar sendiri, 'admin_only' = Harus diregiskan admin
  enrolledStudentIds?: string[]; // Daftar ID siswa yang telah didaftarkan
}

export type QuestionType = 'single' | 'multiple' | 'dropdown';

export interface QuizQuestion {
  id: string;
  text: string;
  type?: QuestionType; // 'single' (Pilihan Ganda Biasa), 'multiple' (Pilihan Ganda Majemuk), 'dropdown' (Dropdown)
  options: string[]; // Supports dynamic count (e.g. A, B, C, D, E)
  correctAnswerIndex?: number; // For 'single' and 'dropdown'
  correctAnswerIndices?: number[]; // For 'multiple' (Pilihan Ganda Majemuk)
  explanation?: string; // Pembahasan bersifat opsional
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  description: string;
  durationMinutes: number;
  passingScore: number; // KKM, e.g. 75
  allowRetake?: boolean; // Mengatur apakah kuis dapat diulang oleh siswa atau tidak
  showExplanation?: boolean; // Mengatur apakah pembahasan & kunci jawaban ditampilkan ke siswa setelah ujian (opsional)
  registrationType?: 'open' | 'admin_only'; // 'open' = Siswa bisa regis sendiri, 'admin_only' = Harus diregiskan admin
  enrolledStudentIds?: string[]; // Daftar ID siswa yang telah didaftarkan admin
  status?: 'published' | 'draft'; // Bisa dibikin dipublish atau draft
  questions: QuizQuestion[];
  createdAt: string;
  isActive: boolean;
  totalPoints: number;
}

export interface QuestionAnswer {
  questionId: string;
  selectedOption?: number; // For single & dropdown (-1 if skipped)
  selectedOptions?: number[]; // For multiple choice / majemuk
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  quizTitle: string;
  subject: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentBranch?: string; // Cabang Brain Academy
  studentClass?: string;
  studentNis?: string;
  answers: QuestionAnswer[];
  score: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  gradeLetter: 'A' | 'B' | 'C' | 'D' | 'E';
  timeSpentSeconds: number;
  submittedAt: string;
  detailedResults?: {
    questionId: string;
    questionText: string;
    type?: QuestionType;
    options: string[];
    selectedOption?: number;
    selectedOptions?: number[];
    correctAnswerIndex?: number;
    correctAnswerIndices?: number[];
    isCorrect: boolean;
    pointsEarned: number;
    maxPoints: number;
    explanation: string;
  }[];
}

export interface GradeReportOverview {
  totalStudents: number;
  totalQuizzes: number;
  totalMaterials: number;
  totalSubmissions: number;
  averageClassScore: number;
  passRatePercentage: number;
  gradeDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    E: number;
  };
  recentSubmissions: QuizSubmission[];
  topStudents: {
    studentId: string;
    studentName: string;
    studentClass?: string;
    averageScore: number;
    quizzesCompleted: number;
  }[];
  subjectAverages: {
    subject: string;
    averageScore: number;
    totalSubmissions: number;
  }[];
}
