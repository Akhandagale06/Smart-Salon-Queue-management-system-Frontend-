import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English', short: 'EN' },
  { code: 'hi', name: 'हिन्दी', short: 'HI' },
  { code: 'mr', name: 'मराठी', short: 'MR' }
];

export default function LanguageSelector({ storageKey = 'customer_lang' }) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Normalize language code (e.g. 'mr-IN' -> 'mr')
  const rawLang = i18n.language || localStorage.getItem(storageKey) || 'en';
  const langCode = rawLang.substring(0, 2).toLowerCase();
  const currentLang = LANGUAGES.find(l => l.code === langCode) || LANGUAGES[0];

  const handleSelect = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem(storageKey, code);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left z-50" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-white shadow-lg transition-all cursor-pointer active:scale-95"
      >
        <Globe className="w-4 h-4 text-violet-400 shrink-0" />
        <span className="text-white text-xs font-bold whitespace-nowrap tracking-wide leading-none inline-block">
          {currentLang.name} ({currentLang.short})
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-300 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 rounded-xl bg-slate-950 border border-slate-700 shadow-2xl z-[100] overflow-hidden p-1.5 space-y-1.5">
          {LANGUAGES.map((lang) => {
            const isSelected = currentLang.code === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                    : 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-800/80'
                }`}
              >
                <span className="text-xs font-extrabold text-white tracking-wide">{lang.name} ({lang.short})</span>
                {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
