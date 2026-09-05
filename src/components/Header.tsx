import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Menu, Moon, Sun, Maximize, Minimize } from 'lucide-react';
import StudentProfileModal from './StudentProfileModal';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMobileMenu: () => void;
  onStartCreateQuiz?: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  onOpenMobileMenu,
  onStartCreateQuiz: _onStartCreateQuiz,
}: HeaderProps) {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {
          window.open(window.location.href, '_blank');
        });
      } else {
        window.open(window.location.href, '_blank');
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Determine Title according to Sleek Interface design
  const getHeaderTitle = () => {
    if (isAdmin) {
      switch (activeTab) {
        case 'dashboard':
          return 'Admin Central Command';
        case 'users':
          return 'User & Student Directory';
        case 'materials':
          return 'Learning Material Repository';
        case 'quizzes':
          return 'Interactive Quiz Management';
        case 'reports':
          return 'Grade Reports & Transcript';
        default:
          return 'Admin Command';
      }
    } else {
      switch (activeTab) {
        case 'dashboard':
          return 'Student Dashboard';
        case 'quizzes':
          return 'Interactive Examinations';
        case 'materials':
          return 'Study Materials & Modules';
        case 'reports':
          return 'Transcript & Nilai';
        default:
          return 'Student Dashboard';
      }
    }
  };

  const getInitials = (nameStr: string) => {
    return nameStr
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 -ml-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-sm xs:text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 tracking-tight truncate max-w-[150px] xs:max-w-[220px] sm:max-w-none">
          {getHeaderTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Dark Mode Toggle Button */}
        <button
          type="button"
          id="theme-toggle-btn"
          onClick={toggleTheme}
          title={isDark ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Gelap (Dark Mode)'}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer flex items-center justify-center"
          aria-label="Toggle dark mode"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Fullscreen Application Toggle Button */}
        <button
          type="button"
          id="fullscreen-toggle-btn"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Keluar dari Layar Penuh (Normal)' : 'Buka Aplikasi Layar Penuh (Full Screen)'}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer flex items-center justify-center"
          aria-label="Toggle fullscreen view"
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          ) : (
            <Maximize className="w-4 h-4 text-slate-700 dark:text-slate-300" />
          )}
        </button>

        {/* User Profile Avatar Quick Trigger */}
        {user && (
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            title="Pengaturan Profil Saya (Foto, Cabang, Password)"
            className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center shrink-0 border border-slate-300 dark:border-slate-600">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  {getInitials(user.name)}
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-xs font-medium text-slate-700 dark:text-slate-200 max-w-[80px] md:max-w-[120px] truncate">
              {user.name.split(' ')[0]}
            </span>
          </button>
        )}
      </div>

      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </header>
  );
}

