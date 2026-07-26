import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, CheckCircle2, Download, Bot, ShieldCheck, AlertCircle, X, ExternalLink, Sparkles } from 'lucide-react';

const TelegramNoticeModal = ({ isOpen, onClose, userId }) => {
  const { t } = useTranslation();
  const [isChecked, setIsChecked] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    if (!isChecked) return;
    if (userId) {
      localStorage.setItem(`telegram_bot_notice_read_${userId}`, 'true');
    } else {
      localStorage.setItem('telegram_bot_notice_read_guest', 'true');
    }
    onClose();
  };

  const handleDismissOnly = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      {/* Modal Container */}
      <div className="relative w-full max-w-xl glass-modal rounded-3xl overflow-hidden shadow-2xl border border-sky-500/30 my-auto max-h-[90vh] flex flex-col">
        
        {/* Glowing Decorative Background Gradients */}
        <div className="absolute -top-24 -right-24 w-56 h-56 bg-sky-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-violet-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/60 relative z-10 shrink-0 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 animate-bounce">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                {t('telegramModal.noticeTitle')}
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 uppercase">
                  {t('telegramModal.requiredBadge')}
                </span>
              </h3>
              <p className="text-xs text-sky-400 font-semibold">{t('telegramModal.setupGuide')}</p>
            </div>
          </div>

          <button
            onClick={handleDismissOnly}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable Instructions */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto relative z-10 custom-scrollbar flex-1">
          
          {/* Instructions Banner */}
          <div className="telegram-notice-banner p-4 rounded-2xl flex items-center gap-3 shadow-md">
            <Sparkles className="w-5 h-5 text-white shrink-0 animate-spin" />
            <span className="text-xs sm:text-sm font-black tracking-wide leading-snug">
              {t('telegramModal.bannerText')}
            </span>
          </div>

          {/* Steps List */}
          <div className="space-y-3.5">
            
            {/* Step 1 */}
            <div className="telegram-step-card p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="telegram-step-label text-xs font-black uppercase tracking-wider">{t('telegramModal.step1')}</span>
                <Download className="w-4 h-4 text-sky-400" />
              </div>
              <h4 className="telegram-step-title text-xs sm:text-sm font-bold">
                {t('telegramModal.step1Title')}
              </h4>
              <p className="telegram-step-desc text-xs">
                {t('telegramModal.step1Desc')}
              </p>
              <div className="pt-1">
                <a
                  href="https://telegram.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 hover:text-sky-300 underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {t('telegramModal.step1Link')}
                </a>
              </div>
            </div>

            {/* Step 2 */}
            <div className="telegram-step-card p-4 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="telegram-step-label text-xs font-black uppercase tracking-wider">{t('telegramModal.step2')}</span>
                <Bot className="w-4 h-4 text-sky-400" />
              </div>
              <h4 className="telegram-step-title text-xs sm:text-sm font-bold">
                {t('telegramModal.step2Title')}
              </h4>
              <p className="telegram-step-desc text-xs">
                {t('telegramModal.step2Desc')}
              </p>
              <div className="pt-1">
                <a
                  href="https://t.me/SalonQueueBot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:opacity-95 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all border border-sky-400/40 active:scale-98 animate-pulse text-center"
                >
                  <Send className="w-4 h-4 text-white animate-bounce" />
                  {t('telegramModal.step2Btn')}
                </a>
              </div>
            </div>

            {/* Step 3 */}
            <div className="telegram-step-card p-4 rounded-2xl space-y-1.5">
              <span className="telegram-step-label text-xs font-black uppercase tracking-wider">{t('telegramModal.step3')}</span>
              <h4 className="telegram-step-title text-xs sm:text-sm font-bold">
                {t('telegramModal.step3Title')}
              </h4>
              <p className="telegram-step-desc text-xs">
                {t('telegramModal.step3Desc')}
              </p>
            </div>

            {/* Step 4 */}
            <div className="telegram-step-card p-4 rounded-2xl space-y-1.5">
              <span className="telegram-step-label text-xs font-black uppercase tracking-wider">{t('telegramModal.step4')}</span>
              <h4 className="telegram-step-title text-xs sm:text-sm font-bold">
                {t('telegramModal.step4Title')}
              </h4>
              <p className="telegram-step-desc text-xs">
                {t('telegramModal.step4Desc')}
              </p>
            </div>

            {/* Step 5 */}
            <div className="telegram-step-card p-4 rounded-2xl space-y-2">
              <span className="telegram-step-label text-xs font-black uppercase text-emerald-400 tracking-wider">{t('telegramModal.step5')}</span>
              <h4 className="telegram-step-title text-xs sm:text-sm font-bold">
                {t('telegramModal.step5Title')}
              </h4>
              <p className="telegram-step-desc text-xs">
                {t('telegramModal.step5Desc')}
              </p>
              <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold">
                "{t('telegramModal.step5Sample')}"
              </div>
              <p className="text-[11px] text-amber-400 font-bold flex items-center gap-1 pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {t('telegramModal.step5Warning')}
              </p>
            </div>

          </div>

        </div>

        {/* Modal Footer - Checkbox & OK Button */}
        <div className="p-5 border-t border-slate-700/60 bg-slate-900/90 relative z-10 shrink-0 space-y-3">
          
          {/* Checkbox */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="w-4.5 h-4.5 rounded border-slate-600 text-sky-500 focus:ring-sky-500 focus:ring-offset-slate-900 bg-slate-950 cursor-pointer"
            />
            <span className="text-xs font-bold text-slate-200">
              {t('telegramModal.checkboxLabel')}
            </span>
          </label>

          {/* OK Button */}
          <button
            onClick={handleClose}
            disabled={!isChecked}
            className={`w-full py-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              isChecked
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/25 active:scale-98 cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-750 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4.5 h-4.5 text-white" />
            {t('telegramModal.okBtn')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default TelegramNoticeModal;
