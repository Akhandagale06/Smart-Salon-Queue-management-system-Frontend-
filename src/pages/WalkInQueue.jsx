import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, User, Smartphone, Scissors, Loader, CheckCircle2, ArrowRight, Globe } from 'lucide-react';
import api from '../config/api';
import LanguageSelector from '../components/LanguageSelector';
import { formatWaitTime } from '../utils/timeFormatter';

const WalkInQueue = ({ salonId, onReset }) => {
  const { t, i18n } = useTranslation();
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Registration Form States
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Live Tracking States
  const [walkInId, setWalkInId] = useState(localStorage.getItem(`walkInId_${salonId}`) || null);
  const [trackerData, setTrackerData] = useState(null);
  const [trackerError, setTrackerError] = useState('');

  // Default language to Marathi ('mr') on walk-in QR scan if no language previously chosen
  useEffect(() => {
    const savedLang = localStorage.getItem('customer_lang');
    if (!savedLang) {
      i18n.changeLanguage('mr');
      localStorage.setItem('customer_lang', 'mr');
    }
  }, [i18n]);

  // Fetch Salon details & Services for registration
  useEffect(() => {
    if (walkInId) return; // Skip if already tracking
    
    const fetchSalonData = async () => {
      try {
        setLoading(true);
        setError('');
        const [salonRes, serviceRes] = await Promise.all([
          api.get(`/api/salons/${salonId}`),
          api.get(`/api/salons/${salonId}/services`)
        ]);
        setSalon(salonRes.data.data);
        
        const activeServices = serviceRes.data.data.filter(s => s.isActive);
        setServices(activeServices);
        if (activeServices.length > 0) {
          setSelectedServiceId(activeServices[0].id);
        }
      } catch (err) {
        setError(t('walkin.loadError', { defaultValue: 'Failed to load salon queue details.' }));
      } finally {
        setLoading(false);
      }
    };
    
    fetchSalonData();
  }, [salonId, walkInId, t]);

  // Live Tracking Polling Loop
  useEffect(() => {
    if (!walkInId) return;

    const fetchQueueStatus = async () => {
      try {
        const res = await api.get(`/api/queue/walkin/${walkInId}`);
        setTrackerData(res.data.data);
        setTrackerError('');
      } catch (err) {
        setTrackerError(t('walkin.completedOrRemoved', { defaultValue: 'Your turn is completed or you were removed from the queue.' }));
      } finally {
        setLoading(false);
      }
    };

    fetchQueueStatus();
    const interval = setInterval(fetchQueueStatus, 3000); // 3-second live refresh
    return () => clearInterval(interval);
  }, [walkInId, t]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!selectedServiceId) {
      setError(t('walkin.selectServiceError', { defaultValue: 'Please select a service.' }));
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const payload = {
        salonId: parseInt(salonId, 10),
        customerName: customerName.trim() || 'Walk-in Client',
        mobileNumber: mobileNumber.trim() || '9999999999',
        serviceId: parseInt(selectedServiceId, 10)
      };
      
      const res = await api.post('/api/walkins', payload);
      const walkInResponse = res.data.data;
      
      // Save ID to resume tracking on refresh
      localStorage.setItem(`walkInId_${salonId}`, walkInResponse.id);
      setWalkInId(walkInResponse.id);
    } catch (err) {
      setError(err.response?.data?.message || t('walkin.joinError', { defaultValue: 'Failed to join the queue. Please select a service.' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
    localStorage.removeItem(`walkInId_${salonId}`);
    setWalkInId(null);
    setTrackerData(null);
    setCustomerName('');
    setMobileNumber('');
    if (onReset) onReset();
  };

  if (loading && !trackerData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader className="w-8 h-8 animate-spin text-violet-500" />
        <p className="text-xs text-slate-400 font-semibold">{t('common.loading', { defaultValue: 'Loading...' })}</p>
      </div>
    );
  }

  // 1. Live Tracker View
  if (walkInId) {
    const isCompleted = trackerError || trackerData?.status === 'COMPLETED';
    const isServing = trackerData?.status === 'IN_SERVICE';

    return (
      <div className="space-y-6 max-w-md mx-auto pt-4 pb-20 animate-fade-in">
        {/* Top Header Bar with Language Dropdown */}
        <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white shadow-md shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-white tracking-wide truncate">{t('walkin.trackerTitle', { defaultValue: 'थेट रांग ट्रॅकर (Live Queue Tracker)' })}</h2>
              <p className="text-[10px] text-slate-400 font-medium truncate">{t('walkin.trackerSubTitle', { defaultValue: 'वॉकिन ग्राहक रांग स्थिती' })}</p>
            </div>
          </div>
          <LanguageSelector storageKey="customer_lang" />
        </div>

        {/* Tracking Details */}
        <div className="glass-card rounded-3xl p-6 relative overflow-hidden space-y-6">
          {isCompleted ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <div>
                <h3 className="font-bold text-white text-base">{t('walkin.serviceCompleted', { defaultValue: 'सेवा पूर्ण झाली (Service Completed)' })}</h3>
                <p className="text-xs text-slate-400 mt-1">{t('walkin.thankYou', { defaultValue: 'भेट दिल्याबद्दल धन्यवाद! तुमची सेवा पूर्ण झाली आहे.' })}</p>
              </div>
              <button
                onClick={handleClear}
                className="w-full mt-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 py-3 rounded-xl text-xs font-bold transition-all"
              >
                {t('walkin.backToRegistration', { defaultValue: 'नवीन नोंदणी करा (New Registration)' })}
              </button>
            </div>
          ) : (
            <>
              {/* Tracker Widget */}
              <div className="text-center space-y-2">
                <span className="text-[10px] font-extrabold px-3 py-1 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-full uppercase tracking-wider">
                  {t('walkin.token', { defaultValue: 'टोकन #' })} {trackerData?.queueNumber || '...'}
                </span>
                
                {isServing || trackerData?.position === 1 ? (
                  <div className="space-y-2 py-4 text-center">
                    <div className="relative w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/20">
                      <Scissors className="w-8 h-8 animate-bounce" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight uppercase animate-pulse">
                      {isServing ? t('walkin.beingServed', { defaultValue: 'तुमची सेवा सुरू आहे!' }) : t('walkin.yourTurn', { defaultValue: 'तुमची वेळ आली आहे!' })}
                    </h1>
                    <p className="text-xs text-slate-200 font-bold">
                      {isServing ? t('walkin.sessionProgress', { defaultValue: 'तुमचे काम चालू आहे.' }) : t('walkin.proceedChair', { defaultValue: 'कृपया सलूनच्या खुर्चीवर या.' })}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 py-4">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('walkin.currentPosition', { defaultValue: 'रांगेतील स्थान (Current Position)' })}</p>
                    <h1 className="text-6xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent tracking-tight">
                      {trackerData?.position !== undefined ? trackerData.position : '...'}
                    </h1>
                    <p className="text-xs text-slate-400 font-medium">
                      {t('walkin.estimatedWait', { defaultValue: 'अंदाजे वेळ' })}: <span className="text-violet-400 font-bold">{formatWaitTime(trackerData?.estimatedWaitingTime || 0, t)}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Booking Metadata */}
              <div className="space-y-3 text-xs text-slate-400 font-medium border-t border-slate-900 pt-4">
                <div className="flex justify-between py-2 border-b border-slate-900/60">
                  <span>{t('detail.customerName', { defaultValue: 'नाव' })}</span>
                  <span className="text-slate-200 font-bold">{trackerData?.customerName || 'Walk-in Client'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-900/60">
                  <span>{t('walkin.selectedService', { defaultValue: 'निवडलेली सेवा' })}</span>
                  <span className="text-slate-200 font-bold">{t(`serviceNames.${trackerData?.serviceName}`, { defaultValue: trackerData?.serviceName || 'Standard Service' })}</span>
                </div>
                {trackerData?.chairNumber && (
                  <div className="flex justify-between py-2 border-b border-slate-900/60">
                    <span>Chair Number</span>
                    <span className="text-fuchsia-300 font-extrabold">Chair #{trackerData.chairNumber}</span>
                  </div>
                )}
                {trackerData?.expectedChairTime && (
                  <div className="flex justify-between py-2 border-b border-slate-900/60">
                    <span>{t('walkin.expectedChairTime', { defaultValue: 'सेवा सुरू होण्याची वेळ (Chair Time)' })}</span>
                    <span className="text-violet-300 font-extrabold">{trackerData.expectedChairTime}</span>
                  </div>
                )}
                <div className="flex justify-between py-2">
                  <span>{t('walkin.status', { defaultValue: 'स्थिती' })}</span>
                  <span className={`font-bold uppercase ${isServing ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isServing ? t('walkin.statusServing', { defaultValue: 'सेवा सुरू' }) : t('walkin.statusWaiting', { defaultValue: 'रांगेत प्रतीक्षेत' })}
                  </span>
                </div>
              </div>

              {/* Reset/Exit Button */}
              <button
                onClick={handleClear}
                className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-850 text-slate-400 hover:text-slate-250 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
              >
                {t('walkin.exitTracker', { defaultValue: 'ट्रॅकर बंद करा (Exit Tracker)' })}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // 2. Registration Form View
  return (
    <div className="space-y-5 max-w-md mx-auto pt-4 pb-20 animate-fade-in">
      {/* Header Bar with Salon Info & Language Dropdown */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white shadow-md shrink-0">
            <Scissors className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-white tracking-wide truncate">
              {salon?.name || t('walkin.registrationTitle', { defaultValue: 'वॉकिन ग्राहक नोंदणी' })}
            </h2>
            <p className="text-[10px] text-slate-400 font-medium truncate">{t('walkin.registrationSub', { defaultValue: 'थेट रांगेत सामील व्हा' })}</p>
          </div>
        </div>

        {/* Language Selector (Default Marathi) */}
        <LanguageSelector storageKey="customer_lang" />
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleRegister} className="glass-card rounded-3xl p-5 space-y-5">

        {/* Select Service */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200">{t('walkin.selectService', { defaultValue: 'सेवा निवडा (Select Service) *' })}</label>
            <span className="text-[10px] text-violet-400 font-bold">{services.length} {t('walkin.serviceCount', { defaultValue: 'सेवा उपलब्ध' })}</span>
          </div>

          {/* Interactive Service Selection Cards Grid */}
          <div className="grid grid-cols-1 gap-2.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
            {services.map((srv) => {
              const isSelected = String(selectedServiceId) === String(srv.id);
              const translatedName = t(`serviceNames.${srv.name}`, { defaultValue: srv.name });
              return (
                <div
                  key={srv.id}
                  onClick={() => setSelectedServiceId(srv.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between active:scale-[0.98] ${
                    isSelected
                      ? 'bg-gradient-to-r from-violet-900/60 to-fuchsia-900/60 border-violet-500 shadow-lg shadow-violet-500/20 ring-1 ring-violet-500'
                      : 'bg-slate-950/60 border-slate-850 hover:border-slate-750'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30' : 'bg-slate-900 text-slate-400'
                    }`}>
                      <Scissors className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{translatedName}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">{srv.durationMinutes || 30} {t('walkin.mins', { defaultValue: 'मिनिटे' })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-400/20 px-2.5 py-1 rounded-lg">₹{srv.price}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer Details Input (Optional) */}
        <div className="space-y-3 pt-1 border-t border-slate-900/80">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">{t('walkin.customerName', { defaultValue: 'तुमचे नाव (पर्यायी)' })}</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder={t('walkin.namePlaceholder', { defaultValue: 'उदा. राहुल पाटील' })}
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">{t('walkin.mobileNumber', { defaultValue: 'मोबाईल नंबर (पर्यायी)' })}</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Smartphone className="w-4 h-4" />
              </span>
              <input
                type="tel"
                placeholder={t('walkin.mobilePlaceholder', { defaultValue: 'उदा. 9876543210' })}
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-550 hover:to-fuchsia-550 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-violet-500/20 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer active:scale-95 disabled:opacity-50"
        >
          {submitting ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>{t('walkin.joinQueue', { defaultValue: 'रांगेत सामील व्हा (Join Queue)' })}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default WalkInQueue;
