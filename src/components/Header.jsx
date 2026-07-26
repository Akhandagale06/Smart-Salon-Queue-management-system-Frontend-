import React, { useState } from 'react';
import { Search, Calendar, Bell, User, Sparkles, X, Bot, Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LanguageSelector from './LanguageSelector';

const Header = ({ activeTab, setActiveTab, searchTerm, setSearchTerm, onLogoClick, onOpenTelegramNotice }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const [logoSrc, setLogoSrc] = useState('/logo.png');
  const [logoFailed, setLogoFailed] = useState(false);

  const handleLogoError = () => {
    if (logoSrc === '/logo.png') {
      setLogoSrc('/icon.png');
    } else {
      setLogoFailed(true);
    }
  };

  const handleBookingsClick = () => {
    setActiveTab('appointments');
  };

  const handleNotificationsClick = () => {
    setActiveTab('notifications');
  };

  const handleProfileClick = () => {
    setActiveTab('profile');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-6 md:px-8 py-2.5 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-4">
        
        {/* Top Header Row on Mobile / Left Section on Desktop */}
        <div className="flex items-center justify-between w-full md:w-auto">
          {/* Logo & Web Title */}
          <button
            onClick={onLogoClick}
            className="flex items-center gap-2.5 text-left focus:outline-none group shrink-0"
          >
            {!logoFailed ? (
              <img
                src={logoSrc}
                alt="Logo"
                onError={handleLogoError}
                className="w-10 h-10 sm:w-14 sm:h-14 object-contain rounded-2xl group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-9 h-9 sm:w-10.5 sm:h-10.5 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="header-logo-title text-sm sm:text-base md:text-lg font-extrabold text-white tracking-tight leading-tight group-hover:text-violet-300 transition-colors">
                <span>{t('nav.title')}</span>
              </span>
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wide">{t('nav.subTitle')}</span>
            </div>
          </button>

          {/* Profile Button - Positioned in top-right corner on mobile (< md) */}
          <button
            onClick={handleProfileClick}
            title="Profile"
            className={`md:hidden flex items-center gap-1.5 p-1 rounded-full transition-all shrink-0 ${
              activeTab === 'profile'
                ? 'bg-violet-600/30 text-violet-300 border border-violet-500/50 shadow-md ring-2 ring-violet-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-violet-500/40 flex items-center justify-center text-xs font-bold text-violet-300 shadow-inner">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="w-full md:w-auto md:flex-1 max-w-full md:max-w-xl mx-auto">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder={t('home.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800/90 rounded-full py-2 pl-9 pr-8 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/30 focus:outline-none transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Action Buttons - Smooth horizontal scroll on small devices */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2.5 w-full md:w-auto overflow-x-auto no-scrollbar py-0.5">
          
          {/* Bookings Button */}
          <button
            onClick={handleBookingsClick}
            title={t('nav.myAppointments')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs sm:text-sm font-semibold shrink-0 transition-all ${
              activeTab === 'appointments'
                ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <Calendar className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            <span className="hidden md:inline">{t('nav.myAppointments')}</span>
          </button>

          {/* Bell Icon */}
          <button
            onClick={handleNotificationsClick}
            title="Notifications"
            className={`relative p-2 sm:p-2.5 rounded-full shrink-0 transition-all ${
              activeTab === 'notifications'
                ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-violet-500 ring-2 ring-slate-900 animate-pulse"></span>
          </button>

          {/* Telegram Bot Notice Button */}
          <button
            onClick={onOpenTelegramNotice}
            title={t('nav.telegram')}
            className="p-2 sm:p-2.5 rounded-full bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 transition-all active:scale-95 shadow-md shadow-sky-500/10 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Bot className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-sky-400 animate-pulse" />
            <span className="hidden xl:inline text-xs font-bold text-sky-300">{t('nav.telegram')}</span>
          </button>

          {/* Language Selector */}
          <div className="shrink-0">
            <LanguageSelector storageKey="customer_lang" />
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`px-2.5 sm:px-3 py-2 rounded-full border text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-md shrink-0 ${
              theme === 'dark'
                ? 'border-amber-500/40 bg-slate-900 text-amber-300 hover:bg-slate-800 shadow-amber-500/10'
                : 'border-violet-400 bg-white text-violet-700 hover:bg-slate-50 shadow-violet-500/10'
            }`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline font-extrabold">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-violet-600" />
                <span className="hidden sm:inline font-extrabold">Dark</span>
              </>
            )}
          </button>

          {/* Profile Button - Desktop view (md:flex) */}
          <button
            onClick={handleProfileClick}
            title="Profile"
            className={`hidden md:flex items-center gap-2 pl-1.5 sm:pl-2 pr-2.5 sm:pr-3 py-1.5 rounded-full transition-all shrink-0 ${
              activeTab === 'profile'
                ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 border border-violet-500/40 flex items-center justify-center text-xs sm:text-sm font-bold text-violet-300 shadow-inner">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </div>
            <span className="hidden lg:inline text-xs sm:text-sm font-semibold max-w-[110px] truncate">
              {user?.name || 'Profile'}
            </span>
          </button>

        </div>

      </div>
    </header>
  );
};

export default Header;
