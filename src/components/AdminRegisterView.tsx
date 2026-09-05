import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { User, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  UserPlus, 
  Users, 
  ShieldCheck, 
  GraduationCap, 
  Search, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  CheckCircle, 
  X, 
  Phone,
  Mail,
  Lock,
  School,
  FileSpreadsheet
} from 'lucide-react';
import BulkUserRegisterModal from './BulkUserRegisterModal';

export default function AdminRegisterView() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'siswa'>('all');
  const [showBulkModal, setShowBulkModal] = useState(false);

  // New User Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('siswa');
  const [branch, setBranch] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('siswa');
  const [editBranch, setEditBranch] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return null;
  }

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await api.getUsers();
      setUsersList(data);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Gagal memuat daftar pengguna.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setFeedback({ type: 'error', message: 'Nama lengkap, email, dan kata sandi wajib diisi.' });
      return;
    }

    if (role === 'siswa' && !branch.trim()) {
      setFeedback({ type: 'error', message: 'Silakan isi nama cabang Brain Academy.' });
      return;
    }

    setFeedback(null);
    setIsSubmitting(true);

    try {
      const res = await api.registerUser({
        name,
        email,
        password,
        role,
        branch: role === 'siswa' ? branch.trim() : 'Brain Academy Pusat',
        phone: phone || undefined,
      });

      setFeedback({ type: 'success', message: res.message });
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setBranch('');
      setPhone('');
      fetchUsers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Gagal mendaftarkan pengguna baru.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userToDelete: User) => {
    if (userToDelete.id === currentUser?.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus akun "${userToDelete.name}" (${userToDelete.email})?`)) {
      return;
    }

    try {
      const res = await api.deleteUser(userToDelete.id);
      setFeedback({ type: 'success', message: res.message });
      fetchUsers();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Gagal menghapus pengguna.' });
    }
  };

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditRole(u.role);
    setEditBranch(u.branch || (u as any).studentClass || 'Brain Academy Jakarta Selatan (Tebet)');
    setEditPhone(u.phone || '');
    setEditPassword('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSavingEdit(true);
    try {
      const res = await api.updateUser(editingUser.id, {
        name: editName,
        email: editEmail,
        role: editRole,
        branch: editRole === 'siswa' ? editBranch : 'Brain Academy Pusat',
        phone: editPhone,
        password: editPassword.trim() ? editPassword : undefined,
      });

      setFeedback({ type: 'success', message: res.message });
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui pengguna.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const userBranch = u.branch || (u as any).studentClass || '';
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userBranch.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalAdmin = usersList.filter(u => u.role === 'admin').length;
  const totalSiswa = usersList.filter(u => u.role === 'siswa').length;

  return (
    <div className="space-y-8 pb-12 transition-colors">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <UserPlus className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
              Laman Registrasi & Manajemen Pengguna
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Daftarkan siswa atau admin baru, kelola role hak akses, dan pantau seluruh data akun pengguna LMS.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              id="open-bulk-register-btn"
              onClick={() => setShowBulkModal(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs cursor-pointer transition-colors shrink-0"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Bulk Regis Siswa (CSV)
            </button>
            <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800/60 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="font-semibold text-indigo-900 dark:text-indigo-200">Admin: {totalAdmin}</span>
              <span className="text-indigo-300 dark:text-indigo-700">|</span>
              <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold text-emerald-900 dark:text-emerald-200">Siswa: {totalSiswa}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-start justify-between gap-3 text-sm border animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <p className="font-medium">{feedback.message}</p>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Two Columns: Registration Form on Left, User List on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Pendaftaran (Register New User) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-700 dark:text-indigo-400">
              <UserPlus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Daftarkan Pengguna Baru</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tentukan role (Admin atau Siswa)</p>
            </div>
          </div>

          <form onSubmit={handleRegister} className="mt-5 space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Pilih Peran (Role) *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  id="role-select-siswa"
                  onClick={() => setRole('siswa')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                    role === 'siswa'
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-200 dark:ring-emerald-900'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800'
                  }`}
                >
                  <GraduationCap className={`h-5 w-5 mt-0.5 ${role === 'siswa' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                  <div>
                    <span className={`block text-xs font-bold ${role === 'siswa' ? 'text-emerald-950 dark:text-emerald-200' : 'text-slate-700 dark:text-slate-300'}`}>
                      Siswa / Murid
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Dapat mengerjakan kuis & akses materi</span>
                  </div>
                </button>

                <button
                  type="button"
                  id="role-select-admin"
                  onClick={() => setRole('admin')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                    role === 'admin'
                      ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-2 ring-indigo-200 dark:ring-indigo-900'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800'
                  }`}
                >
                  <ShieldCheck className={`h-5 w-5 mt-0.5 ${role === 'admin' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                  <div>
                    <span className={`block text-xs font-bold ${role === 'admin' ? 'text-indigo-950 dark:text-indigo-200' : 'text-slate-700 dark:text-slate-300'}`}>
                      Administrator / Guru
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Akses penuh kelola kuis, materi & nilai</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Nama Lengkap */}
            <div>
              <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Nama Lengkap *
              </label>
              <input
                id="reg-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Rian Pratama"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Alamat Email Akun *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rian@edutest.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Kata Sandi Awal *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  id="reg-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Fields specifically for Siswa */}
            {role === 'siswa' && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3.5 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                  <School className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  Cabang Brain Academy Siswa
                </div>

                <div>
                  <label htmlFor="reg-branch" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Nama Cabang Brain Academy *
                  </label>
                  <input
                    id="reg-branch"
                    type="text"
                    required
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="Contoh: Brain Academy Jakarta Selatan (Tebet), Bandung, dll"
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="reg-phone" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    No. Telepon / WhatsApp Siswa (Opsional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      id="reg-phone"
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0812xxxxxxxx"
                      className="w-full pl-8 pr-2.5 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              id="submit-register-user-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Mendaftarkan pengguna...</span>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Daftarkan Akun {role === 'admin' ? 'Admin' : 'Siswa'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Daftar Pengguna & Manajemen */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Daftar Pengguna Terdaftar ({usersList.length})
                </h2>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-medium">
                  <button
                    onClick={() => setRoleFilter('all')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      roleFilter === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setRoleFilter('siswa')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      roleFilter === 'siswa' ? 'bg-white dark:bg-slate-700 text-emerald-800 dark:text-emerald-400 shadow-2xs font-semibold' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Siswa ({totalSiswa})
                  </button>
                  <button
                    onClick={() => setRoleFilter('admin')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      roleFilter === 'admin' ? 'bg-white dark:bg-slate-700 text-indigo-800 dark:text-indigo-400 shadow-2xs font-semibold' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Admin ({totalAdmin})
                  </button>
                </div>
              </div>
            </div>

            {/* Search Input */}
            <div className="mt-4 relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama, email, atau cabang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            {/* Users Table */}
            <div className="mt-4 overflow-x-auto">
              {isLoading ? (
                <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                  Memuat data pengguna...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-10 text-center text-slate-500 dark:text-slate-400 text-sm">
                  Tidak ada data pengguna yang sesuai dengan pencarian.
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider border-y border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-3">Nama & Email</th>
                      <th className="py-3 px-3">Peran / Role</th>
                      <th className="py-3 px-3">Cabang Brain Academy</th>
                      <th className="py-3 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredUsers.map((u) => {
                      const isSelf = u.id === currentUser?.id;
                      const branchDisplay = u.branch || (u as any).studentClass || 'Brain Academy Pusat';
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {u.name}
                              {isSelf && (
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded font-normal">
                                  Anda
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{u.email}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                u.role === 'admin'
                                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              }`}
                            >
                              {u.role === 'admin' ? (
                                <>
                                  <ShieldCheck className="h-3 w-3" /> Admin
                                </>
                              ) : (
                                <>
                                  <GraduationCap className="h-3 w-3" /> Siswa
                                </>
                              )}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {u.role === 'siswa' ? (
                              <span className="font-medium text-slate-800 dark:text-slate-200 text-xs">{branchDisplay}</span>
                            ) : (
                              <span className="text-xs text-slate-500 dark:text-slate-400">Admin Pusat / Cabang</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(u)}
                                title="Edit Pengguna"
                                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              {!isSelf && (
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  title="Hapus Pengguna"
                                  className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                Edit Data Pengguna: {editingUser.name}
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Alamat Email</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Peran / Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="siswa">Siswa (Akses Pelajar)</option>
                  <option value="admin">Administrator (Guru / Staff)</option>
                </select>
              </div>

              {editRole === 'siswa' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cabang Brain Academy</label>
                  <input
                    type="text"
                    value={editBranch}
                    onChange={(e) => setEditBranch(e.target.value)}
                    placeholder="Contoh: Brain Academy Jakarta Selatan (Tebet)"
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nomor Telepon</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ganti Kata Sandi (Kosongkan jika tidak ingin mengubah)
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Masukkan password baru..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-60 cursor-pointer"
                >
                  {isSavingEdit ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk User Registration Modal */}
      <BulkUserRegisterModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onSuccess={() => {
          fetchUsers();
        }}
        existingUsers={usersList}
      />
    </div>
  );
}
