import { 
  User, 
  Material, 
  Quiz, 
  QuizSubmission, 
  GradeReportOverview 
} from './types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('edutest_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Terjadi kesalahan pada server');
  }
  return data;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User; message: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updateProfile(profileData: {
    avatar?: string;
    branch?: string;
    password?: string;
    currentPassword?: string;
  }): Promise<{ message: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(res);
  },

  async registerUser(userData: {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'siswa';
    branch?: string;
    studentClass?: string;
    nis?: string;
    phone?: string;
  }): Promise<{ message: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  async bulkRegisterUsers(userList: Array<{
    name: string;
    email: string;
    password?: string;
    branch?: string;
    phone?: string;
  }>): Promise<{ message: string; addedCount: number; users: User[]; errors: string[] }> {
    const res = await fetch(`${API_BASE}/users/bulk`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ users: userList }),
    });
    return handleResponse(res);
  },

  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/users`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updateUser(id: string, updateData: Partial<User> & { password?: string }): Promise<{ message: string; user: User }> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    return handleResponse(res);
  },

  async deleteUser(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Materials
  async getMaterials(): Promise<Material[]> {
    const res = await fetch(`${API_BASE}/materials`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createMaterial(materialData: {
    title: string;
    subtitle?: string;
    subject: string;
    description: string;
    content: string;
    images?: string[];
    status?: 'published' | 'draft';
    fileUrl?: string;
    fileName?: string;
    fileSize?: string;
    fileType?: string;
    externalLink?: string;
    registrationType?: 'open' | 'admin_only';
    enrolledStudentIds?: string[];
  }): Promise<{ message: string; material: Material }> {
    const res = await fetch(`${API_BASE}/materials`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(materialData),
    });
    return handleResponse(res);
  },

  async updateMaterial(id: string, updateData: Partial<Material>): Promise<{ message: string; material: Material }> {
    const res = await fetch(`${API_BASE}/materials/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    return handleResponse(res);
  },

  async toggleMaterialStatus(id: string): Promise<{ message: string; material: Material }> {
    const res = await fetch(`${API_BASE}/materials/${id}/toggle-status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async deleteMaterial(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/materials/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async toggleCompleteMaterial(id: string): Promise<{ message: string; isCompleted: boolean; completedCount: number }> {
    const res = await fetch(`${API_BASE}/materials/${id}/toggle-complete`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async enrollMaterial(id: string, studentId?: string): Promise<{ message: string; enrolledStudentIds: string[] }> {
    const res = await fetch(`${API_BASE}/materials/${id}/enroll`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ studentId }),
    });
    return handleResponse(res);
  },

  // Quizzes
  async getQuizzes(): Promise<Quiz[]> {
    const res = await fetch(`${API_BASE}/quizzes`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async enrollQuiz(id: string, studentId?: string): Promise<{ message: string; enrolledStudentIds: string[] }> {
    const res = await fetch(`${API_BASE}/quizzes/${id}/enroll`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ studentId }),
    });
    return handleResponse(res);
  },

  async getQuizById(id: string): Promise<Quiz> {
    const res = await fetch(`${API_BASE}/quizzes/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createQuiz(quizData: Partial<Quiz>): Promise<{ message: string; quiz: Quiz }> {
    const res = await fetch(`${API_BASE}/quizzes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(quizData),
    });
    return handleResponse(res);
  },

  async updateQuiz(id: string, quizData: Partial<Quiz>): Promise<{ message: string; quiz: Quiz }> {
    const res = await fetch(`${API_BASE}/quizzes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(quizData),
    });
    return handleResponse(res);
  },

  async toggleQuizStatus(id: string): Promise<{ message: string; quiz: Quiz }> {
    const res = await fetch(`${API_BASE}/quizzes/${id}/toggle-status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async deleteQuiz(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/quizzes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async submitQuiz(
    quizId: string, 
    answers: { questionId: string; selectedOption?: number; selectedOptions?: number[] }[],
    timeSpentSeconds: number
  ): Promise<{ message: string; submission: QuizSubmission }> {
    const res = await fetch(`${API_BASE}/quizzes/${quizId}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ answers, timeSpentSeconds }),
    });
    return handleResponse(res);
  },

  // Submissions & Reports
  async getSubmissions(filter?: { studentId?: string; quizId?: string }): Promise<QuizSubmission[]> {
    const params = new URLSearchParams();
    if (filter?.studentId) params.append('studentId', filter.studentId);
    if (filter?.quizId) params.append('quizId', filter.quizId);

    const res = await fetch(`${API_BASE}/submissions?${params.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getSubmissionById(id: string): Promise<QuizSubmission> {
    const res = await fetch(`${API_BASE}/submissions/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getReportsOverview(): Promise<GradeReportOverview> {
    const res = await fetch(`${API_BASE}/reports/overview`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getStudentReport(studentId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/reports/student/${studentId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  }
};
