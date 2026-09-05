import React, { useRef, useState } from 'react';
import { 
  Heading1, 
  Heading2, 
  Heading3, 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Table as TableIcon, 
  Image as ImageIcon, 
  Trash2, 
  Plus, 
  Minus, 
  Eye, 
  Edit3,
  X,
  Upload,
  Calculator
} from 'lucide-react';
import RichContentRenderer from './RichContentRenderer';
import EquationBuilderModal from './EquationBuilderModal';

interface MaterialRichEditorProps {
  content: string;
  onChangeContent: (val: string) => void;
  subtitle?: string;
  images: string[];
  onChangeImages: (imgs: string[]) => void;
}

export default function MaterialRichEditor({
  content,
  onChangeContent,
  subtitle,
  images,
  onChangeImages
}: MaterialRichEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showEquationModal, setShowEquationModal] = useState(false);

  // Helper to wrap or insert text in textarea
  const insertFormatting = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = selectedText 
      ? `${prefix}${selectedText}${suffix}`
      : `${prefix}${defaultText}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    onChangeContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 10);
  };

  // Table manipulation helpers
  const handleInsertTable = () => {
    const tableTemplate = `\n| No | Judul / Topik | Keterangan |\n|---|---|---|\n| 1 | Konsep Dasar | Penjelasan awal materi |\n| 2 | Studi Kasus | Contoh konkret penerapan |\n`;
    insertFormatting('\n', '', tableTemplate);
    setShowTableMenu(false);
  };

  const handleAddTableRow = () => {
    const lines = content.split('\n');
    let lastTableIndex = -1;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        lastTableIndex = i;
        break;
      }
    }

    if (lastTableIndex === -1) {
      handleInsertTable();
      return;
    }

    // Determine number of columns from last table row
    const cols = lines[lastTableIndex].slice(1, -1).split('|').length;
    const newRowCells = Array.from({ length: cols }, (_, i) => ` Data ${i + 1} `).join('|');
    const newRow = `|${newRowCells}|`;

    lines.splice(lastTableIndex + 1, 0, newRow);
    onChangeContent(lines.join('\n'));
    setShowTableMenu(false);
  };

  const handleRemoveTableRow = () => {
    const lines = content.split('\n');
    let lastTableIndex = -1;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        lastTableIndex = i;
        break;
      }
    }

    if (lastTableIndex !== -1) {
      lines.splice(lastTableIndex, 1);
      onChangeContent(lines.join('\n'));
    }
    setShowTableMenu(false);
  };

  const handleAddTableColumn = () => {
    const lines = content.split('\n');
    let inTable = false;
    const updatedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        inTable = true;
        const inner = trimmed.slice(1, -1);
        if (/^(\s*[-:]+\s*\|)+/.test(trimmed)) {
          return `|${inner}|---|`;
        }
        return `|${inner}| Kolom Baru |`;
      }
      return line;
    });

    if (inTable) {
      onChangeContent(updatedLines.join('\n'));
    } else {
      handleInsertTable();
    }
    setShowTableMenu(false);
  };

  const handleRemoveTableColumn = () => {
    const lines = content.split('\n');
    let inTable = false;
    const updatedLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        inTable = true;
        const parts = trimmed.slice(1, -1).split('|');
        if (parts.length > 1) {
          parts.pop();
          return `|${parts.join('|')}|`;
        }
        return '';
      }
      return line;
    });

    if (inTable) {
      onChangeContent(updatedLines.filter(l => l !== '').join('\n'));
    }
    setShowTableMenu(false);
  };

  const handleDeleteAllTables = () => {
    if (!confirm('Hapus semua tabel yang ada di dalam materi?')) return;
    const lines = content.split('\n');
    const filtered = lines.filter(line => !(line.trim().startsWith('|') && line.trim().endsWith('|')));
    onChangeContent(filtered.join('\n'));
    setShowTableMenu(false);
  };

  // Image Upload / Add
  const handleAddImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        onChangeImages([...images, base64]);
        setShowImageModal(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    onChangeImages([...images, imageUrlInput.trim()]);
    setImageUrlInput('');
    setShowImageModal(false);
  };

  const handleDeleteImage = (index: number) => {
    if (confirm('Hapus gambar ini dari materi?')) {
      onChangeImages(images.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-2 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
      {/* Editor Top Bar: Tabs & Quick Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Pratinjau Hasil
          </button>
        </div>

        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium px-2">
          {images.length > 0 && `${images.length} Gambar terlampir`}
        </span>
      </div>

      {/* Formatting Toolbar (Only in Editor Mode) */}
      {activeTab === 'editor' && (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-xs">
          {/* Header 1, 2, 3 */}
          <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => insertFormatting('\n# ', '\n', 'Judul Utama (H1)')}
              className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-200 font-black cursor-pointer"
              title="Header 1 (#)"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('\n## ', '\n', 'Sub-bab (H2)')}
              className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-200 font-bold cursor-pointer"
              title="Header 2 (##)"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('\n### ', '\n', 'Bagian Kecil (H3)')}
              className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
              title="Header 3 (###)"
            >
              H3
            </button>
          </div>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Bold, Italic, Underline, Strikethrough */}
          <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => insertFormatting('**', '**', 'teks tebal')}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-200 cursor-pointer"
              title="Tebal / Bold (**)"
            >
              <Bold className="h-3.5 w-3.5 font-bold" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*', '*', 'teks miring')}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-200 cursor-pointer"
              title="Miring / Italic (*)"
            >
              <Italic className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('<u>', '</u>', 'teks bergaris bawah')}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-200 cursor-pointer"
              title="Garis Bawah / Underline (<u>)"
            >
              <UnderlineIcon className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('~~', '~~', 'teks dicoret')}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-200 cursor-pointer"
              title="Coret / Strikethrough (~~)"
            >
              <Strikethrough className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Bullet List & Numbering */}
          <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => insertFormatting('\n- ', '\n', 'Poin pembelajaran')}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-200 cursor-pointer"
              title="Daftar Poin / Bullet List (-)"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('\n1. ', '\n', 'Langkah pertama')}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-200 cursor-pointer"
              title="Penomoran / Numbering (1.)"
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          {/* Add Table Controls */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTableMenu(!showTableMenu)}
              className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 font-semibold text-xs cursor-pointer"
            >
              <TableIcon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Kelola Tabel</span>
            </button>

            {showTableMenu && (
              <div className="absolute left-0 mt-1 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 p-1 space-y-0.5 text-xs animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={handleInsertTable}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 rounded-lg font-medium flex items-center gap-2"
                >
                  <Plus className="h-3.5 w-3.5 text-indigo-600" />
                  Sisipkan Tabel Baru
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                <button
                  type="button"
                  onClick={handleAddTableRow}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg flex items-center gap-2"
                >
                  <Plus className="h-3.5 w-3.5 text-emerald-600" />
                  Tambah Baris (Row)
                </button>
                <button
                  type="button"
                  onClick={handleRemoveTableRow}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg flex items-center gap-2"
                >
                  <Minus className="h-3.5 w-3.5 text-rose-500" />
                  Hapus Baris Terakhir
                </button>
                <button
                  type="button"
                  onClick={handleAddTableColumn}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg flex items-center gap-2"
                >
                  <Plus className="h-3.5 w-3.5 text-emerald-600" />
                  Tambah Kolom (Column)
                </button>
                <button
                  type="button"
                  onClick={handleRemoveTableColumn}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg flex items-center gap-2"
                >
                  <Minus className="h-3.5 w-3.5 text-rose-500" />
                  Hapus Kolom Terakhir
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                <button
                  type="button"
                  onClick={handleDeleteAllTables}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-lg font-medium flex items-center gap-2"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Hapus Semua Tabel
                </button>
              </div>
            )}
          </div>

          {/* Add Image Button */}
          <button
            type="button"
            onClick={() => setShowImageModal(true)}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 font-semibold text-xs cursor-pointer"
          >
            <ImageIcon className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>+ Tambah Gambar</span>
          </button>

          {/* Add Equation (LaTeX) Button */}
          <button
            type="button"
            onClick={() => setShowEquationModal(true)}
            className="px-2.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 font-semibold text-xs cursor-pointer"
            title="Sisipkan Rumus Matematika / Fisika / Kimia (LaTeX)"
          >
            <Calculator className="h-3.5 w-3.5 text-amber-500" />
            <span>∑ Persamaan</span>
          </button>
        </div>
      )}

      {/* Main Area: Editor or Live Preview */}
      {activeTab === 'editor' ? (
        <div className="p-3">
          <textarea
            ref={textareaRef}
            rows={10}
            required
            value={content}
            onChange={(e) => onChangeContent(e.target.value)}
            placeholder="Tuliskan isi materi di sini. Gunakan tombol di toolbar atas untuk menambahkan Header (H1, H2, H3), Bold, Italic, Underline, Coret, List, Numbering, Tabel, dan Gambar..."
            className="w-full p-3 text-xs sm:text-sm font-mono border-0 focus:ring-0 bg-transparent text-slate-900 dark:text-white leading-relaxed resize-y focus:outline-none min-h-[220px]"
          />

          {/* Gallery of Attached Images below editor (with delete button) */}
          {images.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Gambar Terlampir ({images.length}) — Bisa dihapus kapan saja:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800 aspect-video flex items-center justify-center shadow-2xs"
                  >
                    <img src={img} alt={`Gambar ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-md shadow-xs opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Hapus gambar ini"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 bg-slate-50/50 dark:bg-slate-950/40 min-h-[260px]">
          <RichContentRenderer
            content={content || '*Belum ada konten materi yang ditulis.*'}
            subtitle={subtitle}
            images={images}
            canDeleteImage={true}
            onDeleteImage={handleDeleteImage}
          />
        </div>
      )}

      {/* Modal Add Image */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-emerald-600" />
                Tambah Gambar ke Materi
              </h3>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Option 1: Upload from computer */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  1. Unggah File Gambar (PNG, JPG, SVG, WebP)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAddImageFile}
                  className="mt-1 block w-full text-slate-600 dark:text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 dark:file:bg-emerald-950/60 file:text-emerald-700 dark:file:text-emerald-300 hover:file:bg-emerald-100 cursor-pointer"
                />
              </div>

              {/* Option 2: Enter URL */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  2. Atau Masukkan URL Gambar Web
                </label>
                <div className="flex gap-2 mt-1">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="https://example.com/gambar.png"
                    className="flex-1 px-3 py-1.5 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    disabled={!imageUrlInput.trim()}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg disabled:opacity-50 cursor-pointer"
                  >
                    Tambahkan
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-4 py-1.5 text-slate-600 dark:text-slate-400 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Equation LaTeX Modal */}
      <EquationBuilderModal
        isOpen={showEquationModal}
        onClose={() => setShowEquationModal(false)}
        onInsert={(formulaSnippet) => insertFormatting('', '', formulaSnippet)}
        targetContextName="Materi Pelajaran"
      />
    </div>
  );
}
