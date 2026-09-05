import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { 
  User, 
  Material, 
  Quiz, 
  QuizSubmission, 
  GradeReportOverview 
} from "./src/types";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "edutest_jwt_super_secret_key_2025";
const PORT = 3000;

// Helper to determine letter grade
function calculateGradeLetter(percentage: number): 'A' | 'B' | 'C' | 'D' | 'E' {
  if (percentage >= 85) return 'A';
  if (percentage >= 75) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  return 'E';
}

// In-Memory Database with realistic seed data
interface UserWithPassword extends User {
  passwordHash: string;
}

let users: UserWithPassword[] = [
  {
    id: "usr-admin-1",
    name: "Admin",
    email: "sitiannisarahma@gmail.com",
    role: "admin",
    branch: "Brain Academy Pusat (Headquarter)",
    createdAt: "2025-01-10T08:00:00.000Z",
    phone: "081234567890",
    passwordHash: bcrypt.hashSync("123456", 10),
  },
];

let materials: Material[] = [
  {
    id: "mat-1",
    title: "Konsep Dasar Jaringan Komputer & Protokol HTTP",
    subject: "Pemrograman Web & Jaringan",
    description: "Memahami arsitektur client-server, cara kerja protokol HTTP/HTTPS, dan alur request-response web modern.",
    content: `### 1. Pengenalan Protokol HTTP
HTTP (*Hypertext Transfer Protocol*) adalah protokol lapisan aplikasi untuk transmisi dokumen hipermedia, seperti HTML. Ini dirancang untuk komunikasi antara peramban web (*client*) dan server web.

#### Arsitektur Client-Server:
1. **Client**: Mengirimkan HTTP Request (Method GET, POST, PUT, DELETE) beserta Headers dan optional Body.
2. **Server**: Memproses logika bisnis, mengambil data dari database, dan membalas dengan HTTP Response code (200 OK, 404 Not Found, 500 Internal Server Error).
3. **Stateless**: HTTP bersifat stateless; setiap permintaan diperlakukan secara independen tanpa mengingat konteks sebelumnya, itulah mengapa JWT atau Cookies dibutuhkan untuk autentikasi.

#### Token-Based Authentication (JWT):
JSON Web Token (JWT) terdiri dari 3 bagian:
- **Header**: Berisi jenis token dan algoritma enkripsi (e.g. HS256).
- **Payload**: Berisi klaim pengguna seperti ID, email, dan peran (role).
- **Signature**: Verifikasi keaslian token yang ditandatangani menggunakan kunci rahasia server (*secret key*).`,
    fileName: "Materi_Jaringan_Web_Dasar.pdf",
    fileSize: "1.8 MB",
    fileType: "application/pdf",
    externalLink: "https://developer.mozilla.org/en-US/docs/Web/HTTP",
    authorId: "usr-admin-1",
    authorName: "Admin",
    createdAt: "2025-02-01T08:00:00.000Z",
    completedByStudentIds: [],
    registrationType: "open",
    enrolledStudentIds: [],
  },
  {
    id: "mat-2",
    title: "Aljabar Boolean & Logika Proposisi Matematika Diskrit",
    subject: "Matematika Diskrit",
    description: "Pendalaman hukum De Morgan, gerbang logika, tabel kebenaran, dan aplikasinya dalam komputasi.",
    content: `### Logika Proposisi & Aljabar Boolean

Logika proposisi merupakan pondasi dari penalaran matematis dan rancangan gerbang logika dalam sirkuit komputer.

#### Operasi Dasar Logika:
- **Konjungsi (AND - ∧)**: Bernilai benar jika dan hanya jika kedua proposisi bernilai benar.
- **Disjungsi (OR - ∨)**: Bernilai benar jika minimal salah satu proposisi bernilai benar.
- **Negasi (NOT - ¬)**: Membalikkan nilai kebenaran.
- **Implikasi (→)**: "Jika P maka Q", hanya bernilai salah jika P benar dan Q salah.

#### Hukum De Morgan:
1. ¬(P ∧ Q) ≡ ¬P ∨ ¬Q
2. ¬(P ∨ Q) ≡ ¬P ∧ ¬Q

Penerapan hukum ini sangat krusial dalam optimasi kondisi pencarian pada query database dan penyederhanaan gerbang logika digital.`,
    fileName: "Buku_Ajar_Logika_Proposisi.pdf",
    fileSize: "2.4 MB",
    fileType: "application/pdf",
    externalLink: "https://id.wikipedia.org/wiki/Aljabar_Boolean",
    authorId: "usr-admin-1",
    authorName: "Admin",
    createdAt: "2025-02-05T09:00:00.000Z",
    completedByStudentIds: [],
    registrationType: "open",
    enrolledStudentIds: [],
  },
  {
    id: "mat-3",
    title: "Teknik Penulisan Ilmiah & Bahasa Indonesia Baku",
    subject: "Bahasa Indonesia",
    description: "Pedoman umum ejaan bahasa Indonesia (PUEBI), penyusunan paragraf deduktif-induktif, dan sitasi akademik.",
    content: `### Panduan Penulisan Karya Ilmiah

Dalam penulisan laporan akademik atau karya tulis ilmiah, penggunaan ragam bahasa baku sangat diutamakan untuk menjaga objektivitas dan kejelasan nalar pembaca.

#### Kaidah Kalimat Efektif:
1. **Kesepadanan Struktur**: Memiliki unsur subjek dan predikat yang tegas dan tidak rancu.
2. **Keparalelan Bentuk**: Kesejajaran bentuk kata yang digunakan dalam perincian (misal: penulisan, pengeditan, penerbitan).
3. **Kehematan Kata**: Menghindari penggunaan sinonim yang berulang (misal: *agar supaya* diganti menjadi *agar* atau *supaya*).
4. **Kecermatan Penalaran**: Pilihan kata tidak menimbulkan tafsir ganda.`,
    fileName: "Panduan_PUEBI_dan_Sitasi.pdf",
    fileSize: "1.2 MB",
    fileType: "application/pdf",
    authorId: "usr-admin-1",
    authorName: "Admin",
    createdAt: "2025-02-10T10:00:00.000Z",
    completedByStudentIds: [],
    registrationType: "open",
    enrolledStudentIds: [],
  }
];

let quizzes: Quiz[] = [
  {
    id: "quiz-1",
    title: "Kuis 1: Dasar Pemrograman Web & RESTful API",
    subject: "Pemrograman Web & Jaringan",
    description: "Uji pemahaman tentang protokol HTTP, REST API, JSON Web Token (JWT), dan arsitektur web modern.",
    durationMinutes: 15,
    passingScore: 75,
    createdAt: "2025-02-12T08:00:00.000Z",
    isActive: true,
    allowRetake: true,
    showExplanation: true,
    registrationType: "open",
    enrolledStudentIds: [],
    totalPoints: 100,
    questions: [
      {
        id: "q1-1",
        text: "Metode HTTP manakah yang dirancang untuk memperbarui sebagian (partial update) sumber daya yang sudah ada di server?",
        type: "single",
        options: [
          "A. GET",
          "B. POST",
          "C. PATCH",
          "D. DELETE",
          "E. OPTIONS"
        ],
        correctAnswerIndex: 2,
        explanation: "Metode PATCH digunakan untuk modifikasi atau pembaruan sebagian entitas sumber daya, sedangkan PUT umumnya mengganti keseluruhan entitas.",
        points: 20
      },
      {
        id: "q1-2",
        text: "Struktur JSON Web Token (JWT) terdiri dari tiga bagian yang dipisahkan oleh tanda titik (.), yaitu:",
        type: "dropdown",
        options: [
          "A. Header, Body, Signature",
          "B. Header, Payload, Signature",
          "C. Prefix, Data, Hash",
          "D. Client, Server, Secret"
        ],
        correctAnswerIndex: 1,
        explanation: "Format standar JWT adalah Header.Payload.Signature di mana Header mendefinisikan algoritma, Payload berisi klaim pengguna, dan Signature memvalidasi keaslian.",
        points: 20
      },
      {
        id: "q1-3",
        text: "Pilihlah DUA kode status HTTP berikut yang termasuk dalam kategori kegagalan otorisasi atau autentikasi klien (Pilihan Ganda Majemuk):",
        type: "multiple",
        options: [
          "A. 401 Unauthorized",
          "B. 200 OK",
          "C. 403 Forbidden",
          "D. 500 Internal Server Error",
          "E. 301 Moved Permanently"
        ],
        correctAnswerIndices: [0, 2],
        explanation: "HTTP 401 Unauthorized (kredensial autentikasi belum valid) dan HTTP 403 Forbidden (pengguna terautentikasi namun tidak berwenang/dilarang) adalah kode otentikasi/otorisasi klien.",
        points: 20
      },
      {
        id: "q1-4",
        text: "Manakah header HTTP standar yang digunakan oleh peramban/client untuk mengirimkan token JWT ke server?",
        type: "dropdown",
        options: [
          "A. Authorization: Bearer <token>",
          "B. Authentication: Token <token>",
          "C. JWT-Token: Verify <token>",
          "D. Security-Key: Access <token>",
          "E. Cookie: session=<token>"
        ],
        correctAnswerIndex: 0,
        explanation: "Standar RFC 6750 menggunakan header 'Authorization: Bearer <token>' untuk otorisasi akses token.",
        points: 20
      },
      {
        id: "q1-5",
        text: "Mengapa HTTP disebut sebagai protokol yang bersifat 'Stateless'?",
        type: "single",
        options: [
          "A. Karena tidak dapat mengirimkan data dalam bentuk teks terenkripsi",
          "B. Karena server tidak menyimpan informasi state/sesi klien di antara setiap request berturut-turut",
          "C. Karena hanya bisa berjalan di satu sistem operasi tertentu",
          "D. Karena koneksi internet harus terputus setelah satu halaman dimuat"
        ],
        correctAnswerIndex: 1,
        explanation: "Stateless berarti setiap request berdiri sendiri tanpa bergantung pada state transaksi sebelumnya.",
        points: 20
      }
    ]
  },
  {
    id: "quiz-2",
    title: "Kuis 2: Logika Proposisi & Aljabar Boolean",
    subject: "Matematika Diskrit",
    description: "Evaluasi penguasaan tabel kebenaran, negasi, hukum De Morgan, dan implikasi logis.",
    durationMinutes: 20,
    passingScore: 70,
    createdAt: "2025-02-14T09:00:00.000Z",
    isActive: true,
    allowRetake: false,
    showExplanation: true,
    registrationType: "open",
    enrolledStudentIds: [],
    totalPoints: 100,
    questions: [
      {
        id: "q2-1",
        text: "Berdasarkan Hukum De Morgan, bentuk ekuivalen dari pernyataan negasi ¬(P ∧ Q) adalah:",
        type: "single",
        options: [
          "A. ¬P ∧ ¬Q",
          "B. ¬P ∨ ¬Q",
          "C. P ∨ Q",
          "D. ¬P → Q",
          "E. P ∧ ¬Q"
        ],
        correctAnswerIndex: 1,
        explanation: "Hukum De Morgan menyatakan negasi dari konjungsi ¬(P ∧ Q) ekuivalen dengan disjungsi dari masing-masing negasi: ¬P ∨ ¬Q.",
        points: 25
      },
      {
        id: "q2-2",
        text: "Pernyataan implikasi 'P → Q' hanya akan bernilai SALAH (False) jika:",
        type: "dropdown",
        options: [
          "A. P bernilai Benar dan Q bernilai Salah",
          "B. P bernilai Salah dan Q bernilai Benar",
          "C. P bernilai Benar dan Q bernilai Benar",
          "D. P bernilai Salah dan Q bernilai Salah"
        ],
        correctAnswerIndex: 0,
        explanation: "Implikasi 'P maka Q' salah satu-satunya saat premis P terpenuhi (Benar) namun konklusinya Q tidak terpenuhi (Salah).",
        points: 25
      },
      {
        id: "q2-3",
        text: "Jika proposisi P bernilai SALAH, maka nilai kebenaran dari pernyataan (P ∨ Q) tergantung pada:",
        type: "single",
        options: [
          "A. Pasti bernilai Salah tanpa memandang Q",
          "B. Nilai kebenaran proposisi Q",
          "C. Pasti bernilai Benar",
          "D. Tidak dapat ditentukan secara logis",
          "E. Bergantung pada negasi ¬P saja"
        ],
        correctAnswerIndex: 1,
        explanation: "Pada operasi Disjungsi (OR), jika salah satu bernilai Salah (P = F), maka hasilnya F ∨ Q = Q, jadi ditentukan oleh nilai Q.",
        points: 25
      },
      {
        id: "q2-4",
        text: "Manakah pernyataan majemuk berikut yang tergolong sebagai Tautologi (selalu bernilai benar)? (Pilihan Ganda Majemuk):",
        type: "multiple",
        options: [
          "A. P ∨ ¬P (Hukum Ketiga Dikecualikan)",
          "B. P ∧ ¬P",
          "C. P → P (Hukum Identitas)",
          "D. P ↔ ¬P"
        ],
        correctAnswerIndices: [0, 2],
        explanation: "P ∨ ¬P dan P → P selalu bernilai Benar (True) untuk semua kemungkinan nilai kebenaran P, sehingga keduanya merupakan Tautologi.",
        points: 25
      }
    ]
  }
];

let submissions: QuizSubmission[] = [];

// Extend Express Request type for authenticated requests
interface AuthRequest extends Request {
  user?: User;
}

// Authentication Middleware
function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Akses ditolak: Token autentikasi tidak ditemukan" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: "Sesi telah berakhir atau token tidak valid. Silakan login kembali." });
    }
    const user = users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan di sistem." });
    }
    const { passwordHash, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    next();
  });
}

function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Akses terbatas: Fitur ini hanya dapat diakses oleh Administrator/Guru." });
  }
  next();
}

async function startServer() {
  const app = express();

  // Increase payload limit for base64 file attachments (materials)
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // ==========================================
  // AUTHENTICATION ROUTES
  // ==========================================

  // POST /api/auth/login
  app.post("/api/auth/login", (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email dan kata sandi wajib diisi." });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = users.find(u => u.email.toLowerCase() === cleanEmail);

    // Otomatis buat / pastikan akun Admin sitiannisarahma@gmail.com
    if (!user && cleanEmail === "sitiannisarahma@gmail.com") {
      user = {
        id: "usr-admin-1",
        name: "Admin",
        email: "sitiannisarahma@gmail.com",
        role: "admin",
        branch: "Brain Academy Pusat (Headquarter)",
        phone: "081234567890",
        createdAt: new Date().toISOString(),
        passwordHash: bcrypt.hashSync("123456", 10),
      };
      users.push(user);
    }

    if (!user) {
      return res.status(401).json({ message: "Email atau kata sandi tidak cocok." });
    }

    // Validasi kata sandi (untuk Admin sitiannisarahma@gmail.com: 123456)
    const isAdminPassword = cleanEmail === "sitiannisarahma@gmail.com" &&
      ["123456", "admin123"].includes(password);

    const isMatch = isAdminPassword || bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Email atau kata sandi tidak cocok." });
    }

    // Pastikan jika sitiannisarahma@gmail.com, role selalu admin
    if (cleanEmail === "sitiannisarahma@gmail.com") {
      user.role = "admin";
      if (!user.name || user.name !== "Admin") {
        user.name = "Admin";
      }
    }

    const { passwordHash, ...userClean } = user;
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login berhasil! Selamat datang di EduTest LMS.",
      token,
      user: userClean
    });
  });

  // GET /api/auth/me
  app.get("/api/auth/me", authenticateToken, (req: AuthRequest, res: Response) => {
    res.json({ user: req.user });
  });

  // PUT /api/auth/profile (Self-service: Siswa/Pengguna dapat mengganti foto profil, cabang, dan password saja)
  app.put("/api/auth/profile", authenticateToken, (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Pengguna tidak terautentikasi." });
    }

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ message: "Data pengguna tidak ditemukan." });
    }

    const user = users[userIndex];
    const { avatar, branch, password, currentPassword } = req.body;

    // 1. Foto Profil
    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    // 2. Cabang (siswa hanya boleh mengubah cabang, bukan role/email/nama)
    if (branch !== undefined) {
      user.branch = String(branch).trim();
      user.studentClass = user.branch;
    }

    // 3. Password (Kata Sandi)
    if (password && String(password).trim().length > 0) {
      const cleanPassword = String(password).trim();
      if (cleanPassword.length < 6) {
        return res.status(400).json({ message: "Kata sandi baru minimal harus 6 karakter." });
      }

      // Validasi kata sandi lama jika diisi
      if (currentPassword && String(currentPassword).trim().length > 0) {
        const isCurrentValid = bcrypt.compareSync(currentPassword, user.passwordHash) ||
          (user.email === "sitiannisarahma@gmail.com" && ["123456", "admin123"].includes(currentPassword));
        if (!isCurrentValid) {
          return res.status(400).json({ message: "Kata sandi saat ini (lama) tidak sesuai." });
        }
      }

      user.passwordHash = bcrypt.hashSync(cleanPassword, 10);
    }

    const { passwordHash, ...cleanUser } = user;
    res.json({
      message: "Profil Anda berhasil diperbarui!",
      user: cleanUser
    });
  });

  // POST /api/auth/register (Laman Register dari Admin untuk Mendaftarkan Pengguna dengan Role Admin atau Siswa)
  app.post("/api/auth/register", authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const { name, email, password, role, branch, studentClass, nis, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Nama, email, password, dan peran (role) wajib diisi." });
    }

    if (role !== "admin" && role !== "siswa") {
      return res.status(400).json({ message: "Peran harus berupa 'admin' atau 'siswa'." });
    }

    const existingUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existingUser) {
      return res.status(400).json({ message: `Email ${email} sudah terdaftar dalam sistem.` });
    }

    const newUser: UserWithPassword = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      branch: (branch || studentClass || (role === "siswa" ? "Brain Academy Jakarta Selatan (Tebet)" : "Brain Academy Pusat")).trim(),
      studentClass: role === "siswa" ? (studentClass || branch)?.trim() : undefined,
      nis: role === "siswa" ? nis?.trim() : undefined,
      phone: phone?.trim(),
      createdAt: new Date().toISOString(),
      passwordHash: bcrypt.hashSync(password, 10),
    };

    users.push(newUser);

    const { passwordHash, ...userClean } = newUser;
    res.status(201).json({
      message: `Berhasil mendaftarkan akun ${role === 'admin' ? 'Administrator' : 'Siswa'}: ${name}.`,
      user: userClean
    });
  });

  // POST /api/users/bulk (Admin only: Bulk register students via CSV)
  app.post("/api/users/bulk", authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const { users: userList } = req.body;
    if (!Array.isArray(userList) || userList.length === 0) {
      return res.status(400).json({ message: "Daftar peserta tidak boleh kosong." });
    }

    const addedUsers: any[] = [];
    const errors: string[] = [];

    for (let i = 0; i < userList.length; i++) {
      const item = userList[i];
      const name = item.name ? String(item.name).trim() : "";
      const email = item.email ? String(item.email).trim().toLowerCase() : "";
      const password = item.password ? String(item.password).trim() : "123456";
      const branch = item.branch ? String(item.branch).trim() : "Brain Academy Pusat";
      const phone = item.phone ? String(item.phone).trim() : undefined;

      if (!name || !email) {
        errors.push(`Baris ${i + 1}: Nama dan email wajib diisi.`);
        continue;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push(`Baris ${i + 1}: Format email '${email}' tidak valid.`);
        continue;
      }

      const exists = users.some(u => u.email.toLowerCase() === email);
      if (exists) {
        errors.push(`Baris ${i + 1}: Email '${email}' sudah terdaftar.`);
        continue;
      }

      const newUser: UserWithPassword = {
        id: `usr-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        name,
        email,
        role: "siswa",
        branch,
        studentClass: branch,
        phone,
        createdAt: new Date().toISOString(),
        passwordHash: bcrypt.hashSync(password, 10),
      };

      users.push(newUser);
      const { passwordHash, ...clean } = newUser;
      addedUsers.push(clean);
    }

    res.status(201).json({
      message: `Berhasil mendaftarkan ${addedUsers.length} peserta secara massal!`,
      addedCount: addedUsers.length,
      users: addedUsers,
      errors
    });
  });

  // GET /api/users (Admin only: Manage users)
  app.get("/api/users", authenticateToken, requireAdmin, (_req: AuthRequest, res: Response) => {
    const safeUsers = users.map(({ passwordHash, ...u }) => u);
    res.json(safeUsers);
  });

  // PUT /api/users/:id (Admin only: update user)
  app.put("/api/users/:id", authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { name, email, role, branch, studentClass, nis, phone, password, avatar } = req.body;

    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan." });
    }

    const user = users[userIndex];
    if (avatar !== undefined) user.avatar = avatar;
    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const emailExists = users.some(u => u.id !== id && u.email.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        return res.status(400).json({ message: "Email sudah digunakan oleh pengguna lain." });
      }
      user.email = email.toLowerCase();
    }

    if (name) user.name = name;
    if (role && (role === "admin" || role === "siswa")) user.role = role;
    if (branch !== undefined) user.branch = branch;
    if (studentClass !== undefined) user.studentClass = studentClass;
    if (nis !== undefined) user.nis = nis;
    if (phone !== undefined) user.phone = phone;
    if (password && password.trim().length > 0) {
      user.passwordHash = bcrypt.hashSync(password, 10);
    }

    const { passwordHash, ...cleanUser } = user;
    res.json({ message: "Data pengguna berhasil diperbarui.", user: cleanUser });
  });

  // DELETE /api/users/:id (Admin only: delete user)
  app.delete("/api/users/:id", authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    if (req.user?.id === id) {
      return res.status(400).json({ message: "Tidak dapat menghapus akun Anda sendiri saat sedang aktif." });
    }

    const initialLength = users.length;
    users = users.filter(u => u.id !== id);
    if (users.length === initialLength) {
      return res.status(404).json({ message: "Pengguna tidak ditemukan." });
    }

    // Clean submissions by deleted student
    submissions = submissions.filter(s => s.studentId !== id);

    res.json({ message: "Akun pengguna berhasil dihapus dari sistem." });
  });

  // ==========================================
  // MATERIALS ROUTES
  // ==========================================

  // GET /api/materials
  app.get("/api/materials", authenticateToken, (req: AuthRequest, res: Response) => {
    const isAdmin = req.user?.role === "admin";
    if (isAdmin) {
      return res.json(materials);
    }
    // Students only see published materials
    const publishedMaterials = materials.filter(m => (m.status || "published") === "published");
    res.json(publishedMaterials);
  });

  // POST /api/materials (Admin only: upload/create material)
  app.post("/api/materials", authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const { title, subtitle, subject, description, content, images, status, fileUrl, fileName, fileSize, fileType, externalLink, registrationType, enrolledStudentIds } = req.body;

    if (!title || !subject || !content) {
      return res.status(400).json({ message: "Judul, mata pelajaran, dan isi materi wajib diisi." });
    }

    const newMaterial: Material = {
      id: `mat-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : undefined,
      subject: subject.trim(),
      description: description ? description.trim() : "",
      content: content.trim(),
      images: Array.isArray(images) ? images : [],
      status: status === "draft" ? "draft" : "published",
      fileUrl,
      fileName,
      fileSize,
      fileType,
      externalLink: externalLink ? externalLink.trim() : undefined,
      registrationType: registrationType === "admin_only" ? "admin_only" : "open",
      enrolledStudentIds: Array.isArray(enrolledStudentIds) ? enrolledStudentIds : [],
      authorId: req.user!.id,
      authorName: req.user!.name,
      createdAt: new Date().toISOString(),
      completedByStudentIds: []
    };

    materials.unshift(newMaterial);
    res.status(201).json({ 
      message: newMaterial.status === "published" ? "Materi pembelajaran berhasil dipublikasikan!" : "Materi pembelajaran berhasil disimpan sebagai draf.", 
      material: newMaterial 
    });
  });

  // PUT /api/materials/:id (Admin only: edit material)
  app.put("/api/materials/:id", authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const material = materials.find(m => m.id === id);
    if (!material) {
      return res.status(404).json({ message: "Materi tidak ditemukan." });
    }

    const { title, subtitle, subject, description, content, images, status, fileUrl, fileName, fileSize, fileType, externalLink, registrationType, enrolledStudentIds } = req.body;
    if (title) material.title = title.trim();
    if (subtitle !== undefined) material.subtitle = subtitle.trim() || undefined;
    if (subject) material.subject = subject.trim();
    if (description !== undefined) material.description = description.trim();
    if (content) material.content = content.trim();
    if (Array.isArray(images)) material.images = images;
    if (status === "published" || status === "draft") material.status = status;
    if (fileUrl !== undefined) material.fileUrl = fileUrl;
    if (fileName !== undefined) material.fileName = fileName;
    if (fileSize !== undefined) material.fileSize = fileSize;
    if (fileType !== undefined) material.fileType = fileType;
    if (externalLink !== undefined) material.externalLink = externalLink.trim() || undefined;
    if (registrationType) material.registrationType = registrationType === "admin_only" ? "admin_only" : "open";
    if (Array.isArray(enrolledStudentIds)) material.enrolledStudentIds = enrolledStudentIds;

    res.json({ message: "Materi pembelajaran berhasil diperbarui!", material });
  });

  // PATCH /api/materials/:id/toggle-status (Admin only: Toggle between published & draft)
  app.patch("/api/materials/:id/toggle-status", authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const material = materials.find(m => m.id === id);
    if (!material) {
      return res.status(404).json({ message: "Materi tidak ditemukan." });
    }
    material.status = (material.status || "published") === "draft" ? "published" : "draft";
    res.json({
      message: material.status === "published" ? "Materi berhasil dipublikasikan!" : "Materi berhasil diubah menjadi draf.",
      material
    });
  });

  // DELETE /api/materials/:id (Admin only)
  app.delete("/api/materials/:id", authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const initialLength = materials.length;
    materials = materials.filter(m => m.id !== id);
    if (materials.length === initialLength) {
      return res.status(404).json({ message: "Materi tidak ditemukan." });
    }
    res.json({ message: "Materi berhasil dihapus." });
  });

  // POST /api/materials/:id/toggle-complete (Student marks material read/done)
  app.post("/api/materials/:id/toggle-complete", authenticateToken, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const material = materials.find(m => m.id === id);
    if (!material) {
      return res.status(404).json({ message: "Materi tidak ditemukan." });
    }

    const studentId = req.user!.id;
    const index = material.completedByStudentIds.indexOf(studentId);
    let isCompleted = false;

    if (index === -1) {
      material.completedByStudentIds.push(studentId);
      isCompleted = true;
    } else {
      material.completedByStudentIds.splice(index, 1);
      isCompleted = false;
    }

    res.json({
      message: isCompleted ? "Materi ditandai selesai!" : "Tanda selesai materi dicabut.",
      isCompleted,
      completedCount: material.completedByStudentIds.length
    });
  });

  // POST /api/materials/:id/enroll (Self-enroll or Admin enroll)
  app.post("/api/materials/:id/enroll", authenticateToken, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const material = materials.find(m => m.id === id);
    if (!material) {
      return res.status(404).json({ message: "Materi tidak ditemukan." });
    }

    const isAdmin = req.user?.role === "admin";
    const targetStudentId = (isAdmin && req.body.studentId) ? req.body.studentId : req.user!.id;

    if (!material.enrolledStudentIds) {
      material.enrolledStudentIds = [];
    }

    if (!isAdmin && material.registrationType === "admin_only") {
      return res.status(403).json({
        message: "Materi ini memiliki tipe pendaftaran khusus dan harus didaftarkan oleh Admin."
      });
    }

    if (!material.enrolledStudentIds.includes(targetStudentId)) {
      material.enrolledStudentIds.push(targetStudentId);
    }

    res.json({
      message: "Berhasil terdaftar pada materi ini!",
      enrolledStudentIds: material.enrolledStudentIds
    });
  });

  // ==========================================
  // QUIZZES ROUTES
  // ==========================================

  // GET /api/quizzes
  app.get("/api/quizzes", authenticateToken, (req: AuthRequest, res: Response) => {
    const isAdmin = req.user?.role === "admin";

    // If student, do not reveal correct answers and only show published quizzes
    if (isAdmin) {
      return res.json(quizzes);
    }

    const studentQuizzes = quizzes
      .filter(q => (q.status || "published") === "published")
      .map(q => ({
        ...q,
        questions: q.questions.map(({ correctAnswerIndex, correctAnswerIndices, explanation, ...rest }) => rest)
      }));
    res.json(studentQuizzes);
  });

  // GET /api/quizzes/:id
  app.get("/api/quizzes/:id", authenticateToken, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const quiz = quizzes.find(q => q.id === id);
    if (!quiz) {
      return res.status(404).json({ message: "Kuis tidak ditemukan." });
    }

    const isAdmin = req.user?.role === "admin";
    if (isAdmin) {
      return res.json(quiz);
    }

    if ((quiz.status || "published") === "draft") {
      return res.status(403).json({ message: "Kuis ini masih dalam bentuk draf dan belum dapat diakses." });
    }

    // Hide answers for students taking test
    const sanitizedQuiz = {
      ...quiz,
      questions: quiz.questions.map(({ correctAnswerIndex, correctAnswerIndices, explanation, ...rest }) => rest)
    };
    res.json(sanitizedQuiz);
  });

  // POST /api/quizzes (Admin: Create interactive quiz)
  app.post("/api/quizzes", authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const { title, subject, description, durationMinutes, passingScore, allowRetake, showExplanation, registrationType, enrolledStudentIds, status, questions } = req.body;

    if (!title || !subject || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Judul kuis, mata pelajaran, dan minimal 1 butir pertanyaan wajib diisi." });
    }

    const validQuestions = questions.map((q: any, idx: number) => {
      const qType = q.type === "multiple" || q.type === "dropdown" ? q.type : "single";
      const validOpts = Array.isArray(q.options) && q.options.length >= 2 
        ? q.options 
        : ["Opsi A", "Opsi B", "Opsi C", "Opsi D"];

      let correctAnswerIndex = typeof q.correctAnswerIndex === "number" ? q.correctAnswerIndex : 0;
      let correctAnswerIndices: number[] | undefined = undefined;

      if (qType === "multiple") {
        correctAnswerIndices = Array.isArray(q.correctAnswerIndices) && q.correctAnswerIndices.length > 0
          ? q.correctAnswerIndices
          : [correctAnswerIndex];
      }

      return {
        id: q.id || `q-${Date.now()}-${idx}`,
        text: q.text?.trim() || `Pertanyaan ${idx + 1}`,
        type: qType,
        options: validOpts,
        correctAnswerIndex,
        correctAnswerIndices,
        explanation: q.explanation ? q.explanation.trim() : "",
        points: Number(q.points) > 0 ? Number(q.points) : 20,
      };
    });

    const totalPoints = validQuestions.reduce((sum: number, q: any) => sum + q.points, 0);

    const newQuiz: Quiz = {
      id: `quiz-${Date.now()}`,
      title: title.trim(),
      subject: subject.trim(),
      description: description ? description.trim() : "",
      durationMinutes: Number(durationMinutes) > 0 ? Number(durationMinutes) : 15,
      passingScore: Number(passingScore) >= 0 ? Number(passingScore) : 75,
      allowRetake: allowRetake !== false, // default to true unless specified false
      showExplanation: showExplanation !== false, // default to true (pembahasan bisa diaktifkan/dinonaktifkan)
      registrationType: registrationType === "admin_only" ? "admin_only" : "open",
      enrolledStudentIds: Array.isArray(enrolledStudentIds) ? enrolledStudentIds : [],
      status: status === "draft" ? "draft" : "published",
      questions: validQuestions,
      createdAt: new Date().toISOString(),
      isActive: true,
      totalPoints,
    };

    quizzes.unshift(newQuiz);
    res.status(201).json({ 
      message: newQuiz.status === "published" ? "Kuis interaktif berhasil dipublikasikan!" : "Kuis berhasil disimpan sebagai draf.", 
      quiz: newQuiz 
    });
  });

  // PUT /api/quizzes/:id (Admin: Edit quiz)
  app.put("/api/quizzes/:id", authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const quizIndex = quizzes.findIndex(q => q.id === id);
    if (quizIndex === -1) {
      return res.status(404).json({ message: "Kuis tidak ditemukan." });
    }

    const { title, subject, description, durationMinutes, passingScore, allowRetake, showExplanation, registrationType, enrolledStudentIds, status, questions, isActive } = req.body;
    const quiz = quizzes[quizIndex];

    if (title) quiz.title = title.trim();
    if (subject) quiz.subject = subject.trim();
    if (description !== undefined) quiz.description = description.trim();
    if (durationMinutes) quiz.durationMinutes = Number(durationMinutes);
    if (passingScore !== undefined) quiz.passingScore = Number(passingScore);
    if (allowRetake !== undefined) quiz.allowRetake = Boolean(allowRetake);
    if (showExplanation !== undefined) quiz.showExplanation = Boolean(showExplanation);
    if (registrationType) quiz.registrationType = registrationType === "admin_only" ? "admin_only" : "open";
    if (Array.isArray(enrolledStudentIds)) quiz.enrolledStudentIds = enrolledStudentIds;
    if (status === "published" || status === "draft") quiz.status = status;
    if (typeof isActive === "boolean") quiz.isActive = isActive;

    if (Array.isArray(questions) && questions.length > 0) {
      quiz.questions = questions.map((q: any, idx: number) => {
        const qType = q.type === "multiple" || q.type === "dropdown" ? q.type : "single";
        const validOpts = Array.isArray(q.options) && q.options.length >= 2 
          ? q.options 
          : ["Opsi A", "Opsi B", "Opsi C", "Opsi D"];

        let correctAnswerIndex = typeof q.correctAnswerIndex === "number" ? q.correctAnswerIndex : 0;
        let correctAnswerIndices: number[] | undefined = undefined;

        if (qType === "multiple") {
          correctAnswerIndices = Array.isArray(q.correctAnswerIndices) && q.correctAnswerIndices.length > 0
            ? q.correctAnswerIndices
            : [correctAnswerIndex];
        }

        return {
          id: q.id || `q-${Date.now()}-${idx}`,
          text: q.text?.trim() || `Pertanyaan ${idx + 1}`,
          type: qType,
          options: validOpts,
          correctAnswerIndex,
          correctAnswerIndices,
          explanation: q.explanation ? q.explanation.trim() : "",
          points: Number(q.points) > 0 ? Number(q.points) : 20,
        };
      });
      quiz.totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    }

    res.json({ message: "Kuis berhasil diperbarui.", quiz });
  });

  // DELETE /api/quizzes/:id (Admin)
  app.delete("/api/quizzes/:id", authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const initialLength = quizzes.length;
    quizzes = quizzes.filter(q => q.id !== id);
    if (quizzes.length === initialLength) {
      return res.status(404).json({ message: "Kuis tidak ditemukan." });
    }
    // Delete associated submissions
    submissions = submissions.filter(s => s.quizId !== id);
    res.json({ message: "Kuis beserta rekaman nilainya berhasil dihapus." });
  });

  // PATCH /api/quizzes/:id/toggle-status (Admin only: Toggle between published & draft)
  app.patch("/api/quizzes/:id/toggle-status", authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const quiz = quizzes.find(q => q.id === id);
    if (!quiz) {
      return res.status(404).json({ message: "Kuis tidak ditemukan." });
    }
    quiz.status = (quiz.status || "published") === "draft" ? "published" : "draft";
    res.json({
      message: quiz.status === "published" ? "Kuis berhasil dipublikasikan!" : "Kuis berhasil diubah menjadi draf.",
      quiz
    });
  });

  // POST /api/quizzes/:id/enroll (Self-enroll or Admin enroll)
  app.post("/api/quizzes/:id/enroll", authenticateToken, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const quiz = quizzes.find(q => q.id === id);
    if (!quiz) {
      return res.status(404).json({ message: "Kuis tidak ditemukan." });
    }

    const isAdmin = req.user?.role === "admin";
    const targetStudentId = (isAdmin && req.body.studentId) ? req.body.studentId : req.user!.id;

    if (!quiz.enrolledStudentIds) {
      quiz.enrolledStudentIds = [];
    }

    if (!isAdmin && quiz.registrationType === "admin_only") {
      return res.status(403).json({
        message: "Kuis ini memiliki pendaftaran khusus dan harus didaftarkan oleh Admin."
      });
    }

    if (!quiz.enrolledStudentIds.includes(targetStudentId)) {
      quiz.enrolledStudentIds.push(targetStudentId);
    }

    res.json({
      message: "Berhasil terdaftar pada kuis ini!",
      enrolledStudentIds: quiz.enrolledStudentIds
    });
  });

  // POST /api/quizzes/:id/submit (Automatic Grading System!)
  app.post("/api/quizzes/:id/submit", authenticateToken, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { answers, timeSpentSeconds } = req.body;

    const quiz = quizzes.find(q => q.id === id);
    if (!quiz) {
      return res.status(404).json({ message: "Kuis tidak ditemukan." });
    }

    const student = req.user!;

    // Check registration access
    if (quiz.registrationType === "admin_only" && student.role !== "admin") {
      const isEnrolled = quiz.enrolledStudentIds?.includes(student.id);
      if (!isEnrolled) {
        return res.status(403).json({
          message: "Akses Ditolak: Anda belum didaftarkan oleh Admin untuk mengikuti kuis khusus ini."
        });
      }
    }

    // Check if quiz allows retake
    if (quiz.allowRetake === false) {
      const existingSubmission = submissions.find(s => s.quizId === quiz.id && s.studentId === student.id);
      if (existingSubmission) {
        return res.status(400).json({ 
          message: "Kuis ini hanya dapat dikerjakan 1 kali dan tidak dapat diulang kembali." 
        });
      }
    }

    let earnedPoints = 0;
    const totalMaxPoints = quiz.totalPoints || 100;

    const detailedResults = quiz.questions.map(q => {
      const userAnswer = answers?.find((a: any) => a.questionId === q.id);
      const qType = q.type || 'single';
      let isCorrect = false;
      let selectedOption = userAnswer?.selectedOption !== undefined ? userAnswer.selectedOption : -1;
      let selectedOptions: number[] = [];

      if (qType === 'multiple') {
        selectedOptions = Array.isArray(userAnswer?.selectedOptions) 
          ? userAnswer.selectedOptions 
          : (selectedOption !== -1 ? [selectedOption] : []);
        
        const correctList = Array.isArray(q.correctAnswerIndices) && q.correctAnswerIndices.length > 0
          ? q.correctAnswerIndices
          : (typeof q.correctAnswerIndex === 'number' ? [q.correctAnswerIndex] : []);

        const sortedUser = [...selectedOptions].sort((a, b) => a - b);
        const sortedCorrect = [...correctList].sort((a, b) => a - b);
        isCorrect = sortedUser.length === sortedCorrect.length && sortedUser.every((val, idx) => val === sortedCorrect[idx]);
      } else {
        // Single or Dropdown
        isCorrect = selectedOption === q.correctAnswerIndex;
      }

      const pointsEarned = isCorrect ? q.points : 0;
      earnedPoints += pointsEarned;

      return {
        questionId: q.id,
        questionText: q.text,
        type: qType,
        options: q.options,
        selectedOption,
        selectedOptions,
        correctAnswerIndex: q.correctAnswerIndex,
        correctAnswerIndices: q.correctAnswerIndices,
        isCorrect,
        pointsEarned,
        maxPoints: q.points,
        explanation: quiz.showExplanation !== false && q.explanation ? q.explanation : undefined
      };
    });

    const percentage = Math.round((earnedPoints / totalMaxPoints) * 100);
    const isPassed = percentage >= quiz.passingScore;
    const gradeLetter = calculateGradeLetter(percentage);

    const submission: QuizSubmission = {
      id: `sub-${Date.now()}`,
      quizId: quiz.id,
      quizTitle: quiz.title,
      subject: quiz.subject,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      studentBranch: student.branch || (student as any).studentClass || 'Brain Academy Pusat',
      studentClass: student.studentClass,
      studentNis: student.nis,
      answers: answers || [],
      score: earnedPoints,
      maxScore: totalMaxPoints,
      percentage,
      isPassed,
      gradeLetter,
      timeSpentSeconds: Number(timeSpentSeconds) || 0,
      submittedAt: new Date().toISOString(),
      detailedResults
    };

    submissions.unshift(submission);

    res.status(201).json({
      message: isPassed 
        ? `Selamat! Anda LULUS dengan nilai ${percentage} (Predikat: ${gradeLetter}).`
        : `Nilai Anda adalah ${percentage} (Predikat: ${gradeLetter}). Tetap semangat, pelajari pembahasan soal!`,
      submission
    });
  });

  // ==========================================
  // SUBMISSIONS & AUTOMATIC GRADE REPORTING
  // ==========================================

  // GET /api/submissions (Admin gets all, Student gets only own)
  app.get("/api/submissions", authenticateToken, (req: AuthRequest, res: Response) => {
    const { studentId, quizId } = req.query;
    const isAdmin = req.user?.role === "admin";

    let filtered = submissions;

    if (!isAdmin) {
      filtered = filtered.filter(s => s.studentId === req.user?.id);
    } else if (studentId) {
      filtered = filtered.filter(s => s.studentId === studentId);
    }

    if (quizId) {
      filtered = filtered.filter(s => s.quizId === quizId);
    }

    res.json(filtered);
  });

  // GET /api/submissions/:id
  app.get("/api/submissions/:id", authenticateToken, (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const submission = submissions.find(s => s.id === id);
    if (!submission) {
      return res.status(404).json({ message: "Hasil ujian tidak ditemukan." });
    }

    // Security check: non-admin can only access own submissions
    if (req.user?.role !== "admin" && submission.studentId !== req.user?.id) {
      return res.status(403).json({ message: "Anda tidak berhak melihat hasil ujian siswa lain." });
    }

    // If detailedResults were not saved in memory, reconstruct them from quiz questions
    if (!submission.detailedResults) {
      const quiz = quizzes.find(q => q.id === submission.quizId);
      if (quiz) {
        submission.detailedResults = quiz.questions.map(q => {
          const ans = submission.answers.find(a => a.questionId === q.id);
          const sel = ans ? ans.selectedOption : -1;
          const isCorrect = sel === q.correctAnswerIndex;
          return {
            questionId: q.id,
            questionText: q.text,
            options: q.options,
            selectedOption: sel,
            correctAnswerIndex: q.correctAnswerIndex,
            isCorrect,
            pointsEarned: isCorrect ? q.points : 0,
            maxPoints: q.points,
            explanation: q.explanation
          };
        });
      }
    }

    res.json(submission);
  });

  // GET /api/reports/overview (Dashboard analytics for admin)
  app.get("/api/reports/overview", authenticateToken, (req: AuthRequest, res: Response) => {
    const studentUsers = users.filter(u => u.role === "siswa");
    const totalStudents = studentUsers.length;
    const totalQuizzes = quizzes.length;
    const totalMaterials = materials.length;
    const totalSubmissions = submissions.length;

    let averageClassScore = 0;
    let passedCount = 0;
    const gradeDistribution = { A: 0, B: 0, C: 0, D: 0, E: 0 };

    if (totalSubmissions > 0) {
      const totalPct = submissions.reduce((sum, s) => sum + s.percentage, 0);
      averageClassScore = Math.round((totalPct / totalSubmissions) * 10) / 10;
      passedCount = submissions.filter(s => s.isPassed).length;

      submissions.forEach(s => {
        const letter = s.gradeLetter || calculateGradeLetter(s.percentage);
        gradeDistribution[letter] = (gradeDistribution[letter] || 0) + 1;
      });
    }

    const passRatePercentage = totalSubmissions > 0 
      ? Math.round((passedCount / totalSubmissions) * 100) 
      : 0;

    // Top students ranking
    const studentPerformanceMap = new Map<string, { totalScore: number; count: number; name: string; branch?: string }>();
    studentUsers.forEach(u => {
      studentPerformanceMap.set(u.id, { totalScore: 0, count: 0, name: u.name, branch: u.branch });
    });

    submissions.forEach(s => {
      const entry = studentPerformanceMap.get(s.studentId);
      if (entry) {
        entry.totalScore += s.percentage;
        entry.count += 1;
      }
    });

    const topStudents = Array.from(studentPerformanceMap.entries())
      .filter(([_, data]) => data.count > 0)
      .map(([studentId, data]) => ({
        studentId,
        studentName: data.name,
        studentBranch: data.branch || "Brain Academy Pusat",
        studentClass: data.branch || "Brain Academy Pusat",
        averageScore: Math.round(data.totalScore / data.count),
        quizzesCompleted: data.count,
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5);

    // Subject averages
    const subjectMap = new Map<string, { totalScore: number; count: number }>();
    submissions.forEach(s => {
      const sub = s.subject || "Umum";
      const existing = subjectMap.get(sub) || { totalScore: 0, count: 0 };
      existing.totalScore += s.percentage;
      existing.count += 1;
      subjectMap.set(sub, existing);
    });

    const subjectAverages = Array.from(subjectMap.entries()).map(([subject, data]) => ({
      subject,
      averageScore: Math.round(data.totalScore / data.count),
      totalSubmissions: data.count
    }));

    const overview: GradeReportOverview = {
      totalStudents,
      totalQuizzes,
      totalMaterials,
      totalSubmissions,
      averageClassScore,
      passRatePercentage,
      gradeDistribution,
      recentSubmissions: submissions.slice(0, 10),
      topStudents,
      subjectAverages
    };

    res.json(overview);
  });

  // GET /api/reports/student/:studentId (Individual Student Report Card)
  app.get("/api/reports/student/:studentId", authenticateToken, (req: AuthRequest, res: Response) => {
    const { studentId } = req.params;

    // Security check
    if (req.user?.role !== "admin" && req.user?.id !== studentId) {
      return res.status(403).json({ message: "Akses ditolak ke rapor siswa lain." });
    }

    const student = users.find(u => u.id === studentId);
    if (!student) {
      return res.status(404).json({ message: "Siswa tidak ditemukan." });
    }

    const studentSubmissions = submissions.filter(s => s.studentId === studentId);
    const completedMaterials = materials.filter(m => m.completedByStudentIds.includes(studentId));

    const totalScore = studentSubmissions.reduce((sum, s) => sum + s.percentage, 0);
    const averageScore = studentSubmissions.length > 0 
      ? Math.round((totalScore / studentSubmissions.length) * 10) / 10 
      : 0;

    const overallPredicate = calculateGradeLetter(averageScore);

    res.json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        branch: student.branch || "Brain Academy Pusat",
        studentClass: student.branch || "Brain Academy Pusat",
        phone: student.phone || "-"
      },
      stats: {
        quizzesTaken: studentSubmissions.length,
        quizzesPassed: studentSubmissions.filter(s => s.isPassed).length,
        averageScore,
        overallPredicate,
        materialsCompleted: completedMaterials.length,
        totalMaterials: materials.length,
        materialCompletionRate: materials.length > 0 
          ? Math.round((completedMaterials.length / materials.length) * 100) 
          : 0
      },
      submissions: studentSubmissions,
      completedMaterials: completedMaterials.map(m => ({ id: m.id, title: m.title, subject: m.subject }))
    });
  });

  // ==========================================
  // SYSTEM & STATIC ASSETS
  // ==========================================
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const publicPath = path.join(process.cwd(), "public");
  app.use(express.static(publicPath));

  app.get("/favicon.ico", (_req: Request, res: Response) => {
    res.sendFile(path.join(publicPath, "favicon.svg"));
  });

  // ==========================================
  // VITE & STATIC SPA SERVING
  // ==========================================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EduTest LMS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start EduTest LMS server:", err);
});
