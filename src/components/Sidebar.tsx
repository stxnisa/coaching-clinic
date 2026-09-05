import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBrand } from '../context/BrandContext';
import { useTheme } from '../context/ThemeContext';
import { 
  BarChart3, 
  BookOpen, 
  FileQuestion, 
  UserPlus, 
  FileSpreadsheet, 
  X, 
  Check,
  Moon,
  Sun
} from 'lucide-react';
import StudentProfileModal from './StudentProfileModal';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const { logoUrl, brandName, brandSubtitle } = useBrand();
  const { isDark, toggleTheme } = useTheme();
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Manage Students', icon: UserPlus },
    { id: 'materials', label: 'Materials', icon: BookOpen },
    { id: 'quizzes', label: 'Quizzes', icon: FileQuestion },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
  ];

  const studentNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'quizzes', label: 'Kuis & Ujian', icon: FileQuestion },
    { id: 'materials', label: 'Materi Belajar', icon: BookOpen },
    { id: 'reports', label: 'Rapor Nilai', icon: FileSpreadsheet },
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between">
      <div>
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 text-left w-full select-none">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm overflow-hidden bg-white shrink-0 p-1 border border-slate-700">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={brandName} 
                  className="w-full h-full object-contain" 
                />
              ) : (
                <span className="text-slate-900 font-black">{brandName ? brandName.charAt(0).toUpperCase() : 'B'}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-sm sm:text-base font-bold text-white tracking-tight leading-snug line-clamp-1">
                {brandName}
              </span>
              <span className="block text-[11px] text-teal-400 font-semibold truncate -mt-0.5">
                {brandSubtitle}
              </span>
            </div>
          </div>

          {mobileOpen && (
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1 ml-2 shrink-0 cursor-pointer"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <div
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (mobileOpen) setMobileOpen(false);
                }}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="p-4 sm:p-5 bg-slate-950 mt-auto border-t border-slate-800/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setProfileModalOpen(true);
              if (mobileOpen) setMobileOpen(false);
            }}
            title="Klik untuk edit foto profil, cabang, dan kata sandi"
            className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden border border-slate-600 hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer group"
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-white tracking-wider group-hover:text-indigo-300">
                {getInitials(user.name)}
              </span>
            )}
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate" title={user.name}>
              {user.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-indigo-400 font-semibold truncate max-w-[100px]" title={user.branch || user.studentClass || 'Siswa'}>
                {isAdmin ? 'Admin Root' : (user.branch || user.studentClass || 'Siswa')}
              </span>
              <span className="text-slate-600">•</span>
              <button
                id="sidebar-logout-btn"
                onClick={logout}
                className="text-xs text-slate-400 hover:text-rose-400 underline cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>

        {/* Theme Toggle in Footer */}
        <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer text-[11px]"
            title="Ubah tema gelap / terang"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Mode Terang</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-300" />
                <span>Mode Gelap</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-slate-900 hidden md:flex flex-col shrink-0 h-screen select-none">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 bg-slate-900 flex flex-col h-full z-10 shadow-2xl animate-in slide-in-from-left">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Student/User Profile Modal */}
      <StudentProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
}
