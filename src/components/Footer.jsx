import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Footer() {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <footer className={`w-full mt-auto border-t transition-colors duration-200 text-center ${
      isLight 
        ? 'bg-white border-slate-200 text-slate-900' 
        : 'bg-slate-950 border-slate-800/80 text-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col items-center gap-1.5">
        <h3 className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
          © 2026 Salon Queue Management System
        </h3>

        <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          All Rights Reserved
        </p>

        <p className={`flex items-center gap-1 text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
          Made with
          <span className="text-red-500 animate-pulse">❤️</span>
          by
          <span className={`font-semibold ${isLight ? 'text-indigo-600' : 'text-violet-400'}`}>
            Aditya Khandagale
          </span>
        </p>

       
      </div>
    </footer>
  );
}
