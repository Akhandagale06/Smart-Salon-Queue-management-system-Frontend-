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
  Coffee
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

  const renderQueueTrack = () => {
    if (!queueStatus) return null;
    const activeBreak = getActiveBreak();
    const position = queueStatus.position || 1;
    const isServing = appointment?.status === 'IN_SERVICE';

    if (activeBreak) {
      return (
        <div className="flex flex-col items-center py-3 px-4 bg-amber-950/40 border border-amber-500/40 rounded-2xl space-y-3 shadow-inner my-2">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-500 rounded-full blur-lg opacity-40 animate-pulse"></div>
            <div className="relative w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/30">
              <Coffee className="w-8 h-8 animate-bounce" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs font-black text-amber-400 animate-pulse uppercase tracking-wider flex items-center justify-center gap-1.5">
              <span>☕ SALON IS CURRENTLY ON BREAK</span>
            </p>
            <p className="text-xs text-slate-200 font-bold">
              {activeBreak.name || 'Salon Break'} ({formatTime12Hr(activeBreak.startTime?.substring(0, 5))} - {formatTime12Hr(activeBreak.endTime?.substring(0, 5))})
            </p>
            <p className="text-[10px] text-slate-400 max-w-xs mx-auto pt-0.5">
              Salon staff is taking a break. Live queue progress will resume automatically once break ends!
            </p>
          </div>
        </div>
      );
    }

    if (isServing || position === 1) {
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
              {isServing ? 'YOU ARE BEING SERVED!' : "IT'S YOUR TURN!"}
            </p>
            <p className="text-xs sm:text-sm text-slate-200 font-bold mt-1">
              {isServing ? 'Your service is currently in progress.' : 'Please proceed to the grooming chair.'}
            </p>
          </div>
        </div>
      );
    }

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
            <span className="text-[9px] font-bold text-emerald-400 mt-2">Serving</span>
          </div>

          {/* Node 2: Ahead */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
              <span className="text-xs font-bold font-sans">{position - 1}</span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 mt-2">Ahead</span>
          </div>

          {/* Node 3: You */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-9 h-9 rounded-full bg-violet-600 border-2 border-violet-400 flex items-center justify-center text-white relative shadow-lg shadow-violet-500/30 animate-bounce">
              <span className="absolute -inset-1 rounded-full border border-violet-400/30 animate-pulse"></span>
              <User className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-extrabold text-violet-400 mt-1.5 uppercase tracking-wide">You</span>
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
        lang: currentLang
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
      const res = await api.get(`/api/salons/${appointment.salonId}/slots?date=${newDate}${serviceParam}&excludeAppointmentId=${appointmentId}`);
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

  useEffect(() => {
    if (rescheduleOpen && newDate) {
      fetchSlotsForReschedule();
    }
  }, [newDate, rescheduleOpen]);

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
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to appointments
      </button>

      {/* Live tracker widget if today */}
      {isToday && queueStatus && (() => {
        const activeBreak = getActiveBreak();
        const upcomingBreak = getUpcomingBreak();

        return (
          <div className="live-queue-card p-6 rounded-3xl text-center space-y-4 relative overflow-hidden shadow-xl transition-all duration-500">
            <div className="absolute top-2 right-2">
              <button onClick={fetchDetails} className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <span className={`live-queue-badge text-[10px] font-extrabold uppercase tracking-widest ${activeBreak ? 'text-amber-400 animate-pulse' : ''}`}>
              {activeBreak ? `☕ ${t('detail.salonBreakActive')}` : t('detail.liveQueuePosition')}
            </span>

            <div className="flex items-center justify-center gap-8 py-1">
              <div>
                <span className="live-queue-label text-[10px] uppercase font-bold">
                  {appointment?.status === 'IN_SERVICE' ? t('detail.serving') : t('detail.position')}
                </span>
                <p className="live-queue-value text-3xl font-black">
                  {appointment?.status === 'IN_SERVICE' ? t('detail.serving') : (queueStatus.position || '1')}
                </p>
              </div>
              <div className="h-10 border-l border-white/20"></div>
              <div>
                <span className="live-queue-label text-[10px] uppercase font-bold">{t('detail.token')}</span>
                <p className="live-queue-value text-4xl font-black">#{queueStatus.queueNumber}</p>
              </div>
            </div>

            {/* Animated Queue Track visualization */}
            {renderQueueTrack()}

            {/* Wait Time Indicator */}
            <div className={`live-queue-wait-pill p-3 rounded-2xl inline-flex items-center gap-2 ${activeBreak ? 'bg-amber-950/80 border-amber-500/40 text-amber-300' : ''}`}>
              {activeBreak ? (
                <>
                  <Coffee className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span className="text-xs font-bold">
                    Queue Paused (Break in Progress) • {t('detail.estimatedWait')}: {formatWaitTime(queueStatus.estimatedWaitingTime || 0, t)}
                  </span>
                </>
              ) : (
                <>
                  <Hourglass className="w-4 h-4 text-violet-300 animate-spin" />
                  <span className="text-xs font-semibold">
                    {t('detail.estimatedWait')}: {formatWaitTime(queueStatus.estimatedWaitingTime || 0, t)}
                  </span>
                </>
              )}
            </div>

            {/* Upcoming Break Notice if any */}
            {upcomingBreak && !activeBreak && (
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
        <h3 className="font-bold text-white text-base">Booking Summary</h3>
        
        <div className="space-y-3 text-xs text-slate-400 font-medium">
          <div className="flex justify-between py-2 border-b border-slate-900">
            <span>Salon</span>
            <span className="text-slate-200 font-bold">{appointment?.salonName || 'Royal Cuts'}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-900">
            <span>Service</span>
            <span className="text-slate-200 font-bold">{formatServiceName(appointment?.serviceName || 'Haircut', t)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-900">
            <span>Scheduled Date</span>
            <span className="text-slate-200 font-bold">{formatDateDMY(appointment?.bookingDate)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-900">
            <span>Scheduled Time</span>
            <span className="text-slate-200 font-bold">{formatTime12Hr(appointment?.bookingTime?.substring(0, 5))}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-900">
            <span>Assigned Chair</span>
            <span className="text-fuchsia-300 font-extrabold">Chair #{appointment?.chairNumber || queueStatus?.chairNumber || 1}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-900">
            <span>Status</span>
            <span className="text-violet-400 font-bold">{appointment?.status}</span>
          </div>
        </div>
      </div>

      {/* Running late controls if today */}
      {isToday && isCancellable && (
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4.5 h-4.5 text-violet-400" />
            Running Late?
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Tap to notify the salon. The system will adjust your queue position to prevent cancellation.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleRunningLate(10)}
              disabled={lateLoading}
              className="py-3 rounded-xl border border-slate-850 hover:bg-slate-800/40 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              10 Minutes Late
            </button>
            <button
              onClick={() => handleRunningLate(15)}
              disabled={lateLoading}
              className="py-3 rounded-xl border border-slate-850 hover:bg-slate-800/40 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              15 Minutes Late
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
              Reschedule Appointment
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
                  Cancel Appointment
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
              <h3 className="text-lg font-bold text-white">Reschedule Appointment</h3>
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
                <label className="text-xs font-semibold text-slate-350">Choose New Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-xs text-slate-200 focus:outline-none focus:border-violet-500 font-semibold cursor-pointer [color-scheme:dark]"
                />
              </div>

              {/* Time Slots Grid */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-350">Choose New Time</label>
                {slotsLoading ? (
                  <div className="flex items-center gap-2 py-3 text-xs text-slate-400">
                    <Loader className="w-4 h-4 animate-spin text-violet-500" />
                    Calculating empty slots...
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
                  <p className="text-xs text-slate-500 py-2">No slots available for the selected date.</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-800/80 mt-6">
                <button
                  type="button"
                  onClick={() => setRescheduleOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-805 text-slate-300 font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduleLoading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold text-sm"
                >
                  {rescheduleLoading ? <Loader className="w-4 h-4 animate-spin" /> : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentDetail;
