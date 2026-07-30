import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  Calendar, 
  RefreshCw, 
  Hourglass, 
  User, 
  Loader,
  Play,
  Scissors,
  Coffee,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import api from '../config/api';
import { formatServiceName } from '../utils/serviceTranslator';
import { formatWaitTime } from '../utils/timeFormatter';

const AppointmentDetail = ({ appointmentId, onBack, onCancelSuccess }) => {
  const { t, i18n } = useTranslation();
  const [appointment, setAppointment] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const [breaks, setBreaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lateLoading, setLateLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  
  // Reschedule panel state
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newChairId, setNewChairId] = useState(null);
  const [chairs, setChairs] = useState([]);
  const [error, setError] = useState('');

  const formatTime12Hr = (time24) => {
    if (!time24) return '';
    const [hoursStr, minutesStr] = time24.split(':');
    const hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${hours12}:${minutesStr} ${ampm}`;
  };

  const formatDateDMY = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const monthName = months[monthIndex] || parts[1];
      return `${day} ${monthName} ${year}`;
    }
    return dateStr;
  };

  const getActiveBreak = () => {
    if (!breaks || breaks.length === 0) return null;
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    for (const b of breaks) {
      if (!b.startTime || !b.endTime) continue;
      const [sH, sM] = b.startTime.split(':').map(Number);
      const [eH, eM] = b.endTime.split(':').map(Number);
      const startMins = sH * 60 + sM;
      const endMins = eH * 60 + eM;

      if (currentMins >= startMins && currentMins <= endMins) {
        return b;
      }
    }
    return null;
  };

  const getUpcomingBreak = () => {
    if (!breaks || breaks.length === 0) return null;
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    for (const b of breaks) {
      if (!b.startTime) continue;
      const [sH, sM] = b.startTime.split(':').map(Number);
      const startMins = sH * 60 + sM;

      if (startMins > currentMins) {
        return b;
      }
    }
    return null;
  };

  const getMinutesUntilAppointment = () => {
    if (!appointment?.bookingDate || !appointment?.bookingTime) return null;

    const todayStr = new Date().toISOString().split('T')[0];
    if (appointment.bookingDate !== todayStr) return null;

    const [h, m] = appointment.bookingTime.split(':').map(Number);
    const now = new Date();
    const apptTime = new Date();
    apptTime.setHours(h, m, 0, 0);

    if (appointment.lateByMinutes) {
      apptTime.setMinutes(apptTime.getMinutes() + appointment.lateByMinutes);
    }

    const diffMs = apptTime - now;
    return Math.round(diffMs / (1000 * 60));
  };

  const renderQueueTrack = () => {
    const isCompleted = appointment?.status === 'COMPLETED';
    const isServing = appointment?.status === 'IN_SERVICE';

    if (isCompleted) {
      return (
        <div className="live-queue-card flex flex-col items-center py-4 px-5 bg-gradient-to-b from-emerald-950/80 via-slate-900/90 to-emerald-950/60 border-2 border-emerald-500/50 rounded-3xl space-y-3.5 shadow-2xl my-2 max-w-sm mx-auto animate-fade-in relative overflow-hidden text-white">
          {/* Glow Effects */}
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none animate-pulse"></div>
          <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none animate-pulse"></div>

          {/* Animated Icon */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-md opacity-60 bg-emerald-400 animate-pulse"></div>
            <div className="relative w-14 h-14 rounded-full border-2 border-emerald-400 bg-emerald-600/30 flex items-center justify-center shadow-xl text-emerald-300">
              <CheckCircle2 className="w-8 h-8 text-emerald-300 animate-bounce" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
              </span>
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center space-y-1">
            <p className="text-xs sm:text-sm text-white font-semibold max-w-xs mx-auto leading-relaxed">
              {t('detail.serviceCompletedSub')}
            </p>
          </div>

          {/* Footer thank you notice */}
          <div className="w-full pt-2 border-t border-emerald-500/20 text-center">
            <p className="text-[10px] text-emerald-300 font-bold flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>{t('detail.thankYouNotice')}</span>
            </p>
          </div>
        </div>
      );
    }

    if (!queueStatus) return null;
    const activeBreak = getActiveBreak();
    const position = queueStatus.position || 1;

    if (activeBreak) {
      return (
        <div className="flex flex-col items-center py-4 px-5 bg-gradient-to-b from-amber-500/20 to-amber-950/80 border-2 border-amber-400/60 rounded-2xl space-y-3 shadow-2xl my-3 max-w-sm mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-400 rounded-full blur-xl opacity-60 animate-pulse"></div>
            <div className="relative w-14 h-14 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-slate-950 shadow-xl">
              <Coffee className="w-7 h-7 text-slate-950 animate-bounce" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
              </span>
            </div>
          </div>
          <div className="text-center space-y-1.5">
            <p className="text-xs font-black text-amber-300 animate-pulse uppercase tracking-wider flex items-center justify-center gap-1.5">
              <span>{t('detail.salonOnBreak')}</span>
            </p>
            <p className="text-sm font-black text-white">
              {activeBreak.name || t('detail.salonBreakActive')} ({formatTime12Hr(activeBreak.startTime?.substring(0, 5))} - {formatTime12Hr(activeBreak.endTime?.substring(0, 5))})
            </p>
            <p className="text-xs text-white/90 font-medium max-w-xs mx-auto pt-0.5 leading-relaxed">
              {t('detail.salonBreakDesc')}
            </p>
          </div>
        </div>
      );
    }

    if (isServing) {
      return (
        <div className="flex flex-col items-center py-2 space-y-3">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 rounded-full blur-md opacity-30 animate-pulse"></div>
            <div className="relative w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400">
              <Play className="w-7 h-7 fill-current animate-ping absolute opacity-20" />
              <Scissors className="w-7 h-7 rotate-90" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-base sm:text-lg font-black text-emerald-400 animate-pulse uppercase tracking-wider">
              {t('detail.beingServedTitle')}
            </p>
            <p className="text-xs sm:text-sm text-slate-200 font-bold mt-1">
              {t('detail.beingServedSub')}
            </p>
          </div>
        </div>
      );
    }

    if (position === 1) {
      const minsUntil = getMinutesUntilAppointment();
      // If appointment slot is in the future (> 2 mins away) and no one is ahead in queue
      if (minsUntil !== null && minsUntil > 2) {
        const formattedSlot = formatTime12Hr(appointment.bookingTime);
        const isSoon = minsUntil <= 10;

        return (
          <div className="live-queue-card flex flex-col items-center py-4 px-5 bg-gradient-to-b from-violet-900/40 via-slate-900/90 to-fuchsia-950/50 border-2 border-violet-500/40 rounded-3xl space-y-3.5 shadow-2xl my-2 max-w-sm mx-auto animate-fade-in relative overflow-hidden text-white">
            {/* Glow Effects */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-violet-500/20 rounded-full blur-2xl pointer-events-none animate-pulse"></div>
            <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-fuchsia-500/20 rounded-full blur-2xl pointer-events-none animate-pulse"></div>

            {/* Header Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-violet-500/20 border border-violet-400/30 rounded-full text-white text-[10px] font-extrabold uppercase tracking-wider">
              <Hourglass className="w-3.5 h-3.5 text-violet-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="text-white font-black">{t('detail.noOneAheadTitle')}</span>
            </div>

            {/* Animated Icon */}
            <div className="relative">
              <div className={`absolute inset-0 rounded-full blur-md opacity-50 animate-pulse ${isSoon ? 'bg-amber-400' : 'bg-violet-500'}`}></div>
              <div className={`relative w-14 h-14 rounded-full border-2 flex items-center justify-center shadow-xl ${isSoon ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-violet-600/20 border-violet-400 text-violet-300'}`}>
                <Clock className="w-7 h-7 animate-bounce text-white" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSoon ? 'bg-amber-300' : 'bg-violet-400'}`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${isSoon ? 'bg-amber-400' : 'bg-violet-500'}`}></span>
                </span>
              </div>
            </div>

            {/* Text Content */}
            <div className="text-center space-y-1">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white drop-shadow-sm animate-pulse">
                {isSoon
                  ? t('detail.yourTurnComesInSoon', { min: minsUntil })
                  : t('detail.yourTurnComesIn', { min: minsUntil, time: formattedSlot })
                }
              </h3>
              <p className="text-xs text-white font-semibold max-w-xs mx-auto leading-relaxed">
                {isSoon
                  ? t('detail.getReadySub', { min: minsUntil, time: formattedSlot })
                  : t('detail.noOneAheadSub', { time: formattedSlot })
                }
              </p>
            </div>

            {/* Footer Alert notice */}
            <div className="w-full pt-2 border-t border-violet-500/20 text-center">
              <p className="text-[10px] text-white font-bold flex items-center justify-center gap-1">
                <span>📢</span>
                <span className="text-white">{t('detail.getReadyAlertNotice')}</span>
              </p>
            </div>
          </div>
        );
      }

      return (
        <div className="flex flex-col items-center py-2 space-y-3">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 rounded-full blur-md opacity-30 animate-pulse"></div>
            <div className="relative w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400">
              <Play className="w-7 h-7 fill-current animate-ping absolute opacity-20" />
              <Scissors className="w-7 h-7 rotate-90" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-base sm:text-lg font-black text-emerald-400 animate-pulse uppercase tracking-wider">
              {t('detail.yourTurnTitle')}
            </p>
            <p className="text-xs sm:text-sm text-slate-200 font-bold mt-1">
              {t('detail.yourTurnSub')}
            </p>
          </div>
        </div>
      );
    }

    const chairLabel = queueStatus?.assignedChairName || t('detail.serving');
    const aheadCount = Math.max(0, position - 1);

    return (
      <div className="py-4 px-2 w-full max-w-xs mx-auto">
        <div className="relative flex items-center justify-between">
          {/* Track Lines */}
          <div className="absolute left-4 right-4 top-4 h-0.5 bg-slate-800 z-0"></div>
          <div className="absolute left-4 top-4 h-0.5 bg-gradient-to-r from-emerald-500 to-violet-500 z-0 transition-all duration-1000" style={{ width: position > 2 ? '50%' : '100%' }}></div>

          {/* Node 1: Serving */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/50 flex items-center justify-center text-emerald-400 relative">
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Scissors className="w-3.5 h-3.5" />
            </div>
            <span className="text-[9px] font-black text-emerald-400 mt-2 truncate max-w-[75px] text-center">{chairLabel}</span>
          </div>

          {/* Node 2: Ahead */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="ahead-count-node w-8 h-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center shadow-md">
              <span className="text-xs font-black text-slate-950 font-sans">{aheadCount}</span>
            </div>
            <span className="text-[9px] font-extrabold text-white mt-2 uppercase tracking-wide">{t('detail.aheadLabel')}</span>
          </div>

          {/* Node 3: You */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-violet-600 border-2 border-violet-400 flex items-center justify-center text-white relative shadow-lg shadow-violet-500/30 animate-bounce">
              <span className="absolute -inset-1 rounded-full border border-violet-400/30 animate-pulse"></span>
              <User className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-extrabold text-violet-300 mt-1.5 uppercase tracking-wide">{t('detail.youLabel')} (#{position})</span>
          </div>
        </div>
      </div>
    );
  };

  const fetchDetails = async () => {
    try {
      setError('');
      // Fetch appointment details
      const response = await api.get(`/api/appointments/${appointmentId}`);
      setAppointment(response.data.data);

      const salonId = response.data.data.salonId;
      const bookingDate = response.data.data.bookingDate;

      // Fetch breaks for this salon on booking date
      if (salonId && bookingDate) {
        try {
          const breaksRes = await api.get(`/api/salons/${salonId}/breaks?date=${bookingDate}`);
          setBreaks(breaksRes.data.data || []);
        } catch (ignored) {}
      }

      // Fetch queue position details if booked for today and not completed/cancelled
      const isToday = bookingDate === new Date().toISOString().split('T')[0];
      const activeStatus = ['BOOKED', 'CONFIRMED', 'WAITING', 'ARRIVED', 'IN_SERVICE', 'LATE'].includes(response.data.data.status);

      if (isToday && activeStatus) {
        try {
          const queueRes = await api.get(`/api/queue/status/${appointmentId}`);
          setQueueStatus(queueRes.data.data);
        } catch (ignored) {}
      }
    } catch (err) {
      setError('Failed to load appointment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    const interval = setInterval(fetchDetails, 3000);
    return () => clearInterval(interval);
  }, [appointmentId]);

  const handleRunningLate = async (minutes) => {
    setLateLoading(true);
    try {
      await api.put(`/api/appointments/${appointmentId}/running-late`, { lateByMinutes: minutes });
      fetchDetails();
      alert(`Owner notified that you are running ${minutes} minutes late.`);
    } catch (err) {
      alert('Failed to send status update');
    } finally {
      setLateLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this appointment slot?')) return;
    setCancelLoading(true);
    try {
      await api.put(`/api/appointments/${appointmentId}/cancel`);
      alert('Appointment cancelled successfully!');
      if (onCancelSuccess) onCancelSuccess();
      if (onBack) onBack();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!newDate || !newTime) return;

    setRescheduleLoading(true);
    const currentLang = (i18n.language || localStorage.getItem('customer_lang') || 'en').substring(0, 2).toLowerCase();
    const formattedTime = newTime.includes(':') && newTime.split(':').length === 2 ? `${newTime}:00` : newTime;

    try {
      await api.put(`/api/appointments/${appointmentId}/reschedule`, {
        newDate,
        newTime: formattedTime,
        lang: currentLang,
        preferredChairId: newChairId
      });
      setRescheduleOpen(false);
      fetchDetails();
      alert('Appointment rescheduled successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reschedule. Selected slot might be unavailable.');
    } finally {
      setRescheduleLoading(false);
    }
  };

  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const fetchSlotsForReschedule = async () => {
    if (!appointment?.salonId || !newDate) return;
    try {
      setSlotsLoading(true);
      const serviceParam = appointment.serviceId ? `&serviceId=${appointment.serviceId}` : '';
      const chairParam = newChairId ? `&preferredChairId=${newChairId}` : '';
      const res = await api.get(`/api/salons/${appointment.salonId}/slots?date=${newDate}${serviceParam}${chairParam}&excludeAppointmentId=${appointmentId}`);
      const fetchedSlots = res.data?.data || [];
      setSlots(fetchedSlots);
      
      const availableSlots = fetchedSlots.filter(s => s.available);
      if (availableSlots.length > 0) {
        // Keep current selected time if it's available, otherwise pick first available slot
        if (!availableSlots.some(s => s.time === newTime)) {
          setNewTime(availableSlots[0].time);
        }
      } else {
        setNewTime('');
      }
    } catch (err) {
      console.error('Failed to load slots for reschedule:', err);
      setSlots([]);
      setNewTime('');
    } finally {
      setSlotsLoading(false);
    }
  };

  const fetchChairsForReschedule = async () => {
    if (!appointment?.salonId) return;
    try {
      const res = await api.get(`/api/salons/${appointment.salonId}/chairs/active`);
      const fetchedChairs = res.data?.data || [];
      setChairs(fetchedChairs);
      // Pre-select the appointment's current preferred chair if it exists
      if (fetchedChairs.length > 0) {
        setNewChairId(appointment?.preferredChairId || null);
      }
    } catch (err) {
      console.error('Failed to load chairs for reschedule:', err);
      setChairs([]);
    }
  };

  useEffect(() => {
    if (rescheduleOpen && newDate) {
      fetchSlotsForReschedule();
    }
  }, [newDate, newChairId, rescheduleOpen]);

  useEffect(() => {
    if (rescheduleOpen) {
      fetchChairsForReschedule();
    }
  }, [rescheduleOpen]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  const isToday = appointment?.bookingDate === new Date().toISOString().split('T')[0];
  const isCancellable = ['BOOKED', 'CONFIRMED', 'WAITING', 'LATE'].includes(appointment?.status);

  return (
    <div className="flex justify-center">
    <div className="max-w-2xl w-full  space-y-6 pb-24 animate-fade-in">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('detail.back')}
      </button>

      {/* Live tracker widget if today */}
      {isToday && (queueStatus || appointment?.status === 'COMPLETED') && (() => {
        const activeBreak = getActiveBreak();
        const upcomingBreak = getUpcomingBreak();
        const isCompleted = appointment?.status === 'COMPLETED';

        return (
          <div className="live-queue-card p-6 rounded-3xl text-center space-y-4 relative overflow-hidden shadow-xl transition-all duration-500">
            <div className="absolute top-2 right-2">
              <button onClick={fetchDetails} className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {!isCompleted && (
              <span className={`text-xs font-black uppercase tracking-widest ${activeBreak ? 'text-amber-300 animate-pulse' : 'text-white'}`}>
                {activeBreak ? `☕ ${t('detail.salonBreakActive')}` : t('detail.liveQueuePosition')}
              </span>
            )}

            {!isCompleted && (
              <div className="flex items-center justify-center gap-8 py-1">
                <div>
                  <span className="text-[11px] uppercase font-extrabold text-white/90 tracking-wider">
                    {appointment?.status === 'IN_SERVICE' ? t('detail.serving') : t('detail.position')}
                  </span>
                  <p className="text-4xl font-black text-white drop-shadow-md">
                    {appointment?.status === 'IN_SERVICE' ? t('detail.serving') : (queueStatus?.position || '1')}
                  </p>
                </div>
                <div className="h-10 border-l border-white/30"></div>
                <div>
                  <span className="text-[11px] uppercase font-extrabold text-white/90 tracking-wider">{t('detail.token')}</span>
                  <p className="text-4xl font-black text-white drop-shadow-md">#{appointment?.queueNumber || queueStatus?.queueNumber || '1'}</p>
                </div>
              </div>
            )}

            {queueStatus?.assignedChairName && !isCompleted && (
              <div className="chair-pill inline-flex items-center gap-1.5 px-4 py-1.5 bg-white text-slate-950 border border-slate-200 rounded-full text-xs font-black shadow-md">
                <span className="text-slate-950 font-black">💈 {queueStatus.assignedChairName}</span>
                {queueStatus.barberName && <span className="text-slate-950 font-black">({queueStatus.barberName})</span>}
              </div>
            )}

            {/* Animated Queue Track visualization */}
            {renderQueueTrack()}

            {/* Wait Time Indicator (only if active) */}
            {!isCompleted && (
              <div className="live-queue-wait-pill px-4 py-2.5 rounded-2xl inline-flex items-center gap-2 bg-slate-900/60 border border-violet-400/30 text-white font-black shadow-lg">
                {activeBreak ? (
                  <>
                    <Coffee className="w-4 h-4 text-amber-400 animate-bounce shrink-0" />
                    <span className="text-xs font-black text-white">
                      Queue Paused (Break in Progress) • {t('detail.estimatedWait')}: {formatWaitTime(queueStatus?.estimatedWaitingTime || 0, t)}
                    </span>
                  </>
                ) : (
                  <>
                    <Hourglass className="w-4 h-4 text-violet-300 animate-spin shrink-0" />
                    <span className="text-xs font-black text-white">
                      {t('detail.estimatedWait')}: {formatWaitTime(queueStatus?.estimatedWaitingTime || 0, t)}
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Upcoming Break Notice if any */}
            {upcomingBreak && !activeBreak && !isCompleted && (
              <div className="live-queue-break-banner rounded-2xl p-2.5 flex items-center justify-between gap-2 text-xs font-semibold animate-pulse">
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-amber-400 animate-bounce shrink-0" />
                  <span>Upcoming Break Today: <strong className="text-white">{upcomingBreak.name}</strong></span>
                </div>
                <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-500/30 text-amber-200 shrink-0 font-bold">
                  {formatTime12Hr(upcomingBreak.startTime?.substring(0, 5))} - {formatTime12Hr(upcomingBreak.endTime?.substring(0, 5))}
                </span>
              </div>
            )}
          </div>
        );
      })()}

      {/* Appointment Information Card */}
      <div className="glass-card rounded-3xl p-6 space-y-4">
        <h3 className="font-bold text-white text-base">{t('detail.bookingSummary')}</h3>
        
        <div className="space-y-3 text-xs text-slate-400 font-medium">
          <div className="flex justify-between py-2 border-b border-slate-900">
            <span>{t('detail.salonLabel')}</span>
            <span className="text-slate-200 font-bold">{appointment?.salonName || 'Royal Cuts'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-900">
            <span>{t('detail.serviceLabel')}</span>
            <span className="text-slate-200 font-bold">{formatServiceName(appointment?.serviceName || 'Haircut', t)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-900">
            <span>{t('detail.scheduledDate')}</span>
            <span className="text-slate-200 font-bold">{formatDateDMY(appointment?.bookingDate)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-900">
            <span>{t('detail.scheduledTime')}</span>
            <span className="text-slate-200 font-bold">{formatTime12Hr(appointment?.bookingTime?.substring(0, 5))}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-900">
            <span>{t('detail.statusLabel')}</span>
            <span className="text-violet-400 font-bold">{appointment?.status}</span>
          </div>
        </div>
      </div>

      {/* Running late controls if today */}
      {isToday && isCancellable && (
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4.5 h-4.5 text-violet-400" />
            {t('detail.runningLateTitle')}
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            {t('detail.runningLateDesc')}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleRunningLate(10)}
              disabled={lateLoading}
              className="py-3 rounded-xl border border-slate-850 hover:bg-slate-800/40 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              {t('detail.lateMinutes', { min: 10 })}
            </button>
            <button
              onClick={() => handleRunningLate(15)}
              disabled={lateLoading}
              className="py-3 rounded-xl border border-slate-850 hover:bg-slate-800/40 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              {t('detail.lateMinutes', { min: 15 })}
            </button>
          </div>
        </div>
      )}

      {/* Reschedule & Cancel Deck */}
      {isCancellable && (
        <div className="space-y-4">
          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => {
                setNewDate(appointment?.bookingDate || new Date().toISOString().split('T')[0]);
                setRescheduleOpen(true);
              }}
              className="flex-1 py-3.5 rounded-xl border border-slate-850 hover:bg-slate-800/40 text-slate-200 font-bold text-xs flex items-center justify-center transition-colors"
            >
              {t('detail.rescheduleBtn')}
            </button>
            
            <button
              onClick={handleCancel}
              disabled={cancelLoading}
              className="flex-1 py-3.5 rounded-xl bg-red-600/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              {cancelLoading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-4.5 h-4.5" />
                  {t('detail.cancelBtn')}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass-modal rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">{t('detail.rescheduleTitle')}</h3>
              <button
                onClick={() => setRescheduleOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400"
              >
                X
              </button>
            </div>

            <form onSubmit={handleReschedule} className="p-6 space-y-4">
              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-350">{t('detail.chooseNewDate')}</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-xs text-slate-200 focus:outline-none focus:border-violet-500 font-semibold cursor-pointer [color-scheme:dark]"
                />
              </div>

              {/* Chair Preference */}
              {chairs.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-350">{t('detail.chooseChair', { defaultValue: 'Choose Chair (Optional)' })}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Any Chair option */}
                    <button
                      type="button"
                      onClick={() => setNewChairId(null)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all duration-200 flex items-center gap-2 ${
                        newChairId === null
                          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-violet-400 shadow-lg shadow-violet-500/20'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      <span className="text-base">✨</span>
                      <span>{t('detail.anyChair', { defaultValue: 'Any Chair' })}</span>
                    </button>
                    {chairs.map(chair => (
                      <button
                        key={chair.id}
                        type="button"
                        onClick={() => setNewChairId(chair.id)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all duration-200 flex flex-col items-start gap-0.5 ${
                          newChairId === chair.id
                            ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-violet-400 shadow-lg shadow-violet-500/20'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="text-sm">💈</span>
                          <span>{chair.chairName || `Chair ${chair.chairNumber}`}</span>
                        </span>
                        {chair.barberName && (
                          <span className={`text-[10px] font-medium pl-5 ${
                            newChairId === chair.id ? 'text-violet-200' : 'text-slate-500'
                          }`}>{chair.barberName}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Slots Grid */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-350">{t('detail.chooseNewTime')}</label>
                {slotsLoading ? (
                  <div className="flex items-center gap-2 py-3 text-xs text-slate-400">
                    <Loader className="w-4 h-4 animate-spin text-violet-500" />
                    {t('detail.calculatingSlots')}
                  </div>
                ) : slots.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2 max-h-[160px] overflow-y-auto pr-1">
                    {slots.map((slot) => {
                      const isSelected = newTime === slot.time;
                      const label = slot.breakName ? (
                        slot.breakName.toLowerCase().includes('lunch') ? '☕ Lunch' :
                        slot.breakName.toLowerCase().includes('tea') ? '☕ Tea' : '☕ Break'
                      ) : formatTime12Hr(slot.time);

                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setNewTime(slot.time)}
                          title={slot.breakName || undefined}
                          className={`py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-300 border ${
                            isSelected
                              ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-violet-400'
                              : slot.breakName
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 cursor-not-allowed opacity-75'
                              : slot.available
                              ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
                              : 'bg-slate-950 text-slate-650 border-slate-900 cursor-not-allowed opacity-40'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-2">{t('detail.noSlots')}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-800/80 mt-6">
                <button
                  type="button"
                  onClick={() => setRescheduleOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-805 text-slate-300 font-semibold text-sm"
                >
                  {t('detail.cancelModalBtn')}
                </button>
                <button
                  type="submit"
                  disabled={rescheduleLoading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold text-sm"
                >
                  {rescheduleLoading ? <Loader className="w-4 h-4 animate-spin" /> : t('detail.confirmBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </div> 
    
  );
  
};

export default AppointmentDetail;
