import React from 'react';
import { useTranslation } from 'react-i18next';
import { Star, MapPin, Clock, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';

const SalonCard = ({ salon, onClick }) => {
  const { t } = useTranslation();
  
  const getModeDetails = () => {
    if (salon.isOpen === false) {
      return {
        bg: 'bg-red-500/10 text-red-400 border-red-500/20',
        label: t('home.statusClosed'),
        dot: 'bg-red-500'
      };
    }
    switch (salon.mode) {
      case 'BUSY':
        return {
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          label: t('home.statusPaused'),
          dot: 'bg-amber-500'
        };
      case 'EMERGENCY':
        return {
          bg: 'bg-red-500/10 text-red-400 border-red-500/20',
          label: t('home.statusClosed'),
          dot: 'bg-red-500'
        };
      default:
        return {
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          label: t('home.statusOpen'),
          dot: 'bg-emerald-500'
        };
    }
  };

  const mode = getModeDetails();

  return (
    <div 
      onClick={onClick}
      className="glass-card rounded-2xl p-4 hover:border-slate-800 transition-all duration-300 flex items-start gap-4 cursor-pointer active:scale-[0.98]"
    >
      {/* Thumbnail */}
      <div className="w-20 h-20 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center font-bold text-violet-400 shadow-inner shrink-0 relative overflow-hidden">
        {salon.profileImage ? (
          <img src={salon.profileImage} alt={salon.name} className="w-full h-full object-cover" />
        ) : (
          <StoreIcon className="w-8 h-8 text-slate-700" />
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-slate-100 text-sm truncate leading-snug">
            {salon.name}
          </h3>
          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${mode.bg}`}>
            {mode.label}
          </span>
        </div>

        <p className="text-[10px] text-violet-450 font-bold -mt-0.5 flex items-center gap-1">
          Owner: <span className="text-slate-300 font-semibold">{salon.ownerName || 'Sudam Khandagale'}</span>
        </p>

        {/* Info row */}
        <p className="text-xs text-slate-450 truncate flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-500" />
          {salon.address}
        </p>


      </div>
    </div>
  );
};

const StoreIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

export default SalonCard;
