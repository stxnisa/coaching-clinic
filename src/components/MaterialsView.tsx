import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Material } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Upload, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Plus, 
  Search, 
  X, 
  Calendar, 
  User as UserIcon,
  Download,
  File,
  Check,
  Lock,
  Users,
  Edit2,
  Send,
  FileEdit,
  Eye,
  Layers,
  Maximize2,
  Minimize2
} from 'lucide-react';
import MaterialRichEditor from './MaterialRichEditor';
import RichContentRenderer from './RichContentRenderer';

export default function MaterialsView() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'draft'>('all');

  // Modal State for Reading
  const [activeMaterial, setActiveMaterial] = useState<Material | null>(null);
  const [isReaderMaximized, setIsReaderMaximized] = useState(false);

  // Upload/Edit Modal State (Admin)
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isEditorMaximized, setIsEditorMaximized] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [externalLink, setExternalLink] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; type: string; url?: string } | null>(null);
  const [registrationType, setRegistrationType] = useState<'open' | 'admin_only'>('open');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      const data = await api.getMaterials();
      setMaterials(data);
    } catch (err) {
      console.error('Failed to load materials', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingMaterialId(null);
    setTitle('');
    setSubtitle('');
    setSubject('');
    setDescription('');
    setContent('');
    setImages([]);
    setStatus('published');
    setExternalLink('');
    setAttachedFile(null);
    setRegistrationType('open');
    setShowUploadModal(true);
  };

  const handleOpenEditModal = (mat: Material) => {
    setEditingMaterialId(mat.id);
    setTitle(mat.title);
    setSubtitle(mat.subtitle || '');
    setSubject(mat.subject);
    setDescription(mat.description || '');
    setContent(mat.content);
    setImages(mat.images || []);
    setStatus(mat.status || 'published');
    setExternalLink(mat.externalLink || '');
    setAttachedFile(mat.fileName ? {
      name: mat.fileName,
      size: mat.fileSize || '',
      type: mat.fileType || '',
      url: mat.fileUrl,
    } : null);
    setRegistrationType(mat.registrationType || 'open');
    setShowUploadModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const sizeStr = `${sizeMb} MB`;

      const reader = new FileReader();
      reader.onload = () => {
        setAttachedFile({
          name: file.name,
          size: sizeStr,
          type: file.type || 'document',
          url: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim() || !content.trim()) {
      alert('Judul, mata pelajaran, dan isi materi wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingMaterialId) {
        // Edit existing material
        await api.updateMaterial(editingMaterialId, {
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          subject: subject.trim(),
          description: description.trim(),
          content: content.trim(),
          images,
          status,
          fileName: attachedFile?.name,
          fileSize: attachedFile?.size,
          fileType: attachedFile?.type,
          fileUrl: attachedFile?.url,
          externalLink: externalLink.trim() || undefined,
          registrationType,
        });
      } else {
        // Create new material
        await api.createMaterial({
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          subject: subject.trim(),
          description: description.trim(),
          content: content.trim(),
          images,
          status,
          fileName: attachedFile?.name,
          fileSize: attachedFile?.size,
          fileType: attachedFile?.type,
          fileUrl: attachedFile?.url,
          externalLink: externalLink.trim() || undefined,
          registrationType,
        });
      }

      setShowUploadModal(false);
      fetchMaterials();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan materi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.toggleMaterialStatus(id);
      setMaterials(prev => prev.map(m => m.id === id ? { ...m, status: res.material.status } : m));
      if (activeMaterial?.id === id) {
        setActiveMaterial(prev => prev ? { ...prev, status: res.material.status } : null);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status publikasi.');
    }
  };

  const handleDeleteMaterial = async (id: string, matTitle: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm(`Hapus materi "${matTitle}"?`)) return;

    try {
      await api.deleteMaterial(id);
      fetchMaterials();
      if (activeMaterial?.id === id) {
        setActiveMaterial(null);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus materi.');
    }
  };

  const handleToggleComplete = async (materialId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await api.toggleCompleteMaterial(materialId);
      setMaterials(prev => prev.map(m => {
        if (m.id === materialId) {
          const studentId = user!.id;
          const completed = res.isCompleted
            ? [...m.completedByStudentIds, studentId]
            : m.completedByStudentIds.filter(id => id !== studentId);
          return { ...m, completedByStudentIds: completed };
        }
        return m;
      }));

      if (activeMaterial?.id === materialId) {
        const studentId = user!.id;
        setActiveMaterial(prev => prev ? {
          ...prev,
          completedByStudentIds: res.isCompleted
            ? [...prev.completedByStudentIds, studentId]
            : prev.completedByStudentIds.filter(id => id !== studentId)
        } : null);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status penyelesaian.');
    }
  };

  // Subjects for filtering
  const allSubjects = Array.from(new Set(materials.map(m => m.subject)));

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.subtitle && m.subtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject = selectedSubject === 'all' || m.subject === selectedSubject;
    const matchesStatus = selectedStatus === 'all' || (m.status || 'published') === selectedStatus;

    return matchesSearch && matchesSubject && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Materi Pembelajaran
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Modul lengkap dengan rich formatting (H1, H2, H3, tabel, gambar, daftar) untuk memperdalam pemahaman.
              </p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            + Buat Materi Baru
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari materi berdasarkan judul, subjudul, topik, atau isi modul..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>

        {/* Status Filter Tabs for Admin */}
        {isAdmin && (
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedStatus === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Semua ({materials.length})
            </button>
            <button
              onClick={() => setSelectedStatus('published')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedStatus === 'published'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Dipublikasi ({materials.filter(m => (m.status || 'published') === 'published').length})
            </button>
            <button
              onClick={() => setSelectedStatus('draft')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                selectedStatus === 'draft'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Draf ({materials.filter(m => m.status === 'draft').length})
            </button>
          </div>
        )}

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              selectedSubject === 'all'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            Semua Topik
          </button>
          {allSubjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                selectedSubject === sub
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-500 text-sm">
          Memuat data materi pembelajaran...
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <BookOpen className="h-10 w-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">Tidak ada materi pembelajaran yang ditemukan.</p>
          {isAdmin && (
            <button
              onClick={handleOpenCreateModal}
              className="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              + Klik di sini untuk membuat materi pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMaterials.map((mat) => {
            const isCompleted = user ? mat.completedByStudentIds?.includes(user.id) : false;
            const isRestricted = !isAdmin && mat.registrationType === 'admin_only' && user && !mat.enrolledStudentIds?.includes(user.id);
            const isDraft = mat.status === 'draft';

            return (
              <div
                key={mat.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between group ${
                  isDraft 
                    ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/20 dark:bg-amber-950/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600'
                }`}
              >
                <div>
                  {/* Top Badges & Subject */}
                  <div className="flex items-center justify-between gap-2 mb-2.5 flex-wrap">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md">
                      {mat.subject}
                    </span>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Status Badge (Published vs Draft) */}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={(e) => handleToggleStatus(mat.id, e)}
                          title="Klik untuk mengubah status publikasi"
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer transition-all ${
                            isDraft
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-200'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isDraft ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                          {isDraft ? 'Draf' : 'Dipublikasi'}
                        </button>
                      )}

                      {/* Access type badge */}
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        mat.registrationType === 'admin_only'
                          ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}>
                        {mat.registrationType === 'admin_only' ? (
                          <>
                            <Lock className="h-2.5 w-2.5" /> Khusus
                          </>
                        ) : (
                          <>
                            <Users className="h-2.5 w-2.5" /> Terbuka
                          </>
                        )}
                      </span>

                      {!isAdmin && (
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isCompleted
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {isCompleted ? <Check className="h-3 w-3" /> : null}
                          {isCompleted ? 'Selesai' : 'Belum Selesai'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 
                    onClick={() => {
                      if (!isRestricted) setActiveMaterial(mat);
                    }}
                    className={`text-base font-bold transition-colors line-clamp-2 ${
                      isRestricted
                        ? 'text-slate-700 dark:text-slate-300 cursor-not-allowed'
                        : 'text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 cursor-pointer'
                    }`}
                  >
                    {mat.title}
                  </h3>

                  {mat.subtitle && (
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1 line-clamp-1">
                      {mat.subtitle}
                    </p>
                  )}

                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-3">
                    {mat.description || mat.content.substring(0, 120)}
                  </p>

                  {/* Indicators for Images & Tables */}
                  {(mat.images && mat.images.length > 0) && (
                    <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <span>🖼️ {mat.images.length} Gambar terlampir</span>
                    </div>
                  )}

                  {isRestricted && (
                    <div className="mt-3 p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
                      <Lock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <span>Materi khusus: Anda belum terdaftar dan harus didaftarkan oleh Admin.</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  {/* File / Link indicators */}
                  <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
                    {mat.fileName && (
                      <span className="inline-flex items-center gap-1 font-medium">
                        <FileText className="h-3.5 w-3.5 text-indigo-500" />
                        {mat.fileName.length > 18 ? mat.fileName.substring(0, 18) + '...' : mat.fileName}
                      </span>
                    )}
                    {mat.externalLink && (
                      <a
                        href={mat.externalLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Tautan
                      </a>
                    )}
                  </div>

                  {/* Footer actions */}
                  <div className="flex items-center justify-between pt-1">
                    {isRestricted ? (
                      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Lock className="h-3.5 w-3.5" /> Akses Dibatasi
                      </span>
                    ) : (
                      <button
                        onClick={() => setActiveMaterial(mat)}
                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Buka & Baca Materi →
                      </button>
                    )}

                    {/* Student toggle done */}
                    {!isAdmin && !isRestricted && (
                      <button
                        onClick={(e) => handleToggleComplete(mat.id, e)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
                          isCompleted
                            ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                        {isCompleted ? 'Selesai' : 'Tandai Selesai'}
                      </button>
                    )}

                    {/* Admin actions: Edit & Delete */}
                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(mat)}
                          title="Edit materi"
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteMaterial(mat.id, mat.title, e)}
                          title="Hapus materi"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reader Modal (Active Material) */}
      {activeMaterial && (
        <div className={`fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-center ${
          isReaderMaximized ? 'p-0 items-stretch' : 'p-2 sm:p-4 md:p-6 items-center overflow-y-auto'
        }`}>
          <div className={`bg-white dark:bg-slate-900 flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 transition-all duration-200 ${
            isReaderMaximized
              ? 'w-full h-full rounded-none max-w-none'
              : 'rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden'
          }`}>
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 shrink-0 bg-white dark:bg-slate-900">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md">
                    {activeMaterial.subject}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    activeMaterial.status === 'draft'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  }`}>
                    {activeMaterial.status === 'draft' ? 'Draf' : 'Dipublikasi'}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
                  {activeMaterial.title}
                </h2>
                {activeMaterial.subtitle && (
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                    {activeMaterial.subtitle}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                  <span className="flex items-center gap-1">
                    <UserIcon className="h-3.5 w-3.5" /> {activeMaterial.authorName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> {new Date(activeMaterial.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsReaderMaximized(!isReaderMaximized)}
                  title={isReaderMaximized ? 'Perkecil Layar (Normal)' : 'Buka Layar Penuh (Fullscreen)'}
                  className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  {isReaderMaximized ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => {
                    setActiveMaterial(null);
                    setIsReaderMaximized(false);
                  }}
                  title="Tutup"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body: Rich Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
              {activeMaterial.description && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-l-4 border-indigo-500 rounded-r-xl text-xs text-slate-600 dark:text-slate-400 italic">
                  {activeMaterial.description}
                </div>
              )}

              {/* Document/File Attachment Box if present */}
              {activeMaterial.fileName && (
                <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">{activeMaterial.fileName}</h4>
                      <p className="text-[11px] text-indigo-700 dark:text-indigo-400">Lampiran Dokumen Modul ({activeMaterial.fileSize || 'Dokumen'})</p>
                    </div>
                  </div>
                  {activeMaterial.fileUrl ? (
                    <a
                      href={activeMaterial.fileUrl}
                      download={activeMaterial.fileName}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Unduh Dokumen
                    </a>
                  ) : (
                    <span className="text-xs text-indigo-800 dark:text-indigo-300 font-medium px-2 py-1 bg-indigo-100 dark:bg-indigo-900/60 rounded">
                      Dokumen Tersedia
                    </span>
                  )}
                </div>
              )}

              {/* Rich Content Renderer (H1, H2, H3, bold, italic, underline, strikethrough, lists, tables, images) */}
              <RichContentRenderer
                content={activeMaterial.content}
                subtitle={activeMaterial.subtitle}
                images={activeMaterial.images}
              />

              {/* External Reference Link */}
              {activeMaterial.externalLink && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tautan Referensi Tambahan:</p>
                  <a
                    href={activeMaterial.externalLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {activeMaterial.externalLink}
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 rounded-b-2xl flex items-center justify-between">
              {!isAdmin && user && (
                <button
                  onClick={() => handleToggleComplete(activeMaterial.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                    activeMaterial.completedByStudentIds.includes(user.id)
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {activeMaterial.completedByStudentIds.includes(user.id) ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Sudah Selesai Dipelajari
                    </>
                  ) : (
                    <>
                      <Circle className="h-4 w-4" /> Tandai Selesai
                    </>
                  )}
                </button>
              )}

              {isAdmin && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleToggleStatus(activeMaterial.id, e)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      activeMaterial.status === 'draft'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'border-amber-600 bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    {activeMaterial.status === 'draft' ? 'Publikasikan Sekarang' : 'Jadikan Draf'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const mat = activeMaterial;
                      setActiveMaterial(null);
                      handleOpenEditModal(mat);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
                  >
                    Edit Materi
                  </button>
                </div>
              )}

              <button
                onClick={() => setActiveMaterial(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Tutup Modul
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload & Edit Modal (Admin) with Rich Text Editor */}
      {showUploadModal && (
        <div className={`fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex justify-center ${
          isEditorMaximized ? 'p-0 items-stretch' : 'p-2 sm:p-4 md:p-6 items-center overflow-y-auto'
        }`}>
          <div className={`bg-white dark:bg-slate-900 flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 transition-all duration-200 ${
            isEditorMaximized
              ? 'w-full h-full rounded-none max-w-none'
              : 'rounded-2xl max-w-5xl w-full max-h-[95vh] my-auto overflow-hidden'
          }`}>
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <FileEdit className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {editingMaterialId ? 'Edit Materi Pembelajaran' : 'Buat Materi Pembelajaran Baru'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Format materi lengkap: Header 1-3, Subjudul, Bold, Italic, Underline, Coret, Gambar, Tabel, & Status Publikasi.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsEditorMaximized(!isEditorMaximized)}
                  title={isEditorMaximized ? 'Perkecil Layar (Normal)' : 'Buka Layar Penuh (Fullscreen)'}
                  className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  {isEditorMaximized ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setIsEditorMaximized(false);
                  }}
                  title="Tutup"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveMaterial} className="flex-1 overflow-y-auto flex flex-col">
              <div className="p-5 sm:p-6 space-y-5 flex-1">
              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Judul Materi (Title) *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Aljabar Boolean & Logika Proposisi"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Subjudul (Subtitle - Opsional)
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Konsep Dasar, Tabel Kebenaran & Penerapannya"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Subject & External Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Mata Pelajaran / Topik *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Pemrograman Web, Fisika, Matematika"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Tautan Referensi Luar (Opsional)
                  </label>
                  <input
                    type="url"
                    value={externalLink}
                    onChange={(e) => setExternalLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Publish vs Draft Status Selector */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Status Publikasi Materi *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus('published')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      status === 'published'
                        ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 ring-1 ring-emerald-500 text-emerald-950 dark:text-emerald-200'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Send className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Publikasikan Sekarang (Published)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Materi langsung tayang dan dapat diakses/dipelajari oleh siswa.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('draft')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      status === 'draft'
                        ? 'border-amber-600 bg-amber-50/60 dark:bg-amber-950/40 ring-1 ring-amber-500 text-amber-950 dark:text-amber-200'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Layers className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span>Simpan sebagai Draf (Draft)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Materi disimpan namun disembunyikan dari siswa hingga siap dipublikasi.
                    </p>
                  </button>
                </div>
              </div>

              {/* Access Type Selector */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Tipe Akses Siswa
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRegistrationType('open')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      registrationType === 'open'
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-500 text-indigo-950 dark:text-indigo-200'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Users className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Terbuka (Mandiri)</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegistrationType('admin_only')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      registrationType === 'admin_only'
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-500 text-indigo-950 dark:text-indigo-200'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Lock className="h-3.5 w-3.5 text-amber-600" />
                      <span>Diregiskan Khusus oleh Admin</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Ringkasan / Deskripsi Singkat
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ringkasan 1-2 kalimat tentang poin utama materi..."
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Rich Text Editor for Content */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Isi Materi Pembelajaran (Lengkap) *
                </label>
                <MaterialRichEditor
                  content={content}
                  onChangeContent={setContent}
                  subtitle={subtitle}
                  images={images}
                  onChangeImages={setImages}
                />
              </div>

              {/* Document File Attachment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Lampiran Dokumen Tambahan (PDF, DOCX, PPTX)
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 rounded-xl p-3 text-center bg-slate-50 dark:bg-slate-800/50 transition-colors">
                  {attachedFile ? (
                    <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 text-left">
                        <File className="h-4 w-4 text-indigo-600" />
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{attachedFile.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{attachedFile.size}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAttachedFile(null)}
                        className="text-rose-500 hover:text-rose-700 text-xs font-semibold cursor-pointer"
                      >
                        Hapus File
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Klik untuk memilih dokumen dari komputer
                      </p>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-950/60 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky Footer Actions */}
            <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xs flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    status === 'published'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                  }`}>
                    {status === 'published' ? '● Mode: Siap Dipublikasikan' : '○ Mode: Disimpan Sebagai Draf'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadModal(false);
                      setIsEditorMaximized(false);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-5 py-2.5 text-xs font-bold rounded-xl text-white shadow-xs cursor-pointer flex items-center gap-2 transition-all ${
                      status === 'published' 
                        ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20' 
                        : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                    }`}
                  >
                    <Send className="h-3.5 w-3.5" />
                    {isSubmitting 
                      ? 'Menyimpan...' 
                      : editingMaterialId 
                        ? (status === 'published' ? 'Perbarui & Publikasikan' : 'Simpan Perubahan Draf')
                        : (status === 'published' ? 'Publikasikan Materi' : 'Simpan sebagai Draf')
                    }
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
