import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatServiceName } from '../utils/serviceTranslator';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Clock, 
  Scissors, 
  AlertTriangle, 
  Zap, 
  CheckCircle,
  Loader,
  Calendar,
  Sparkles,
  Heart
} from 'lucide-react';
import api from '../config/api';

const SalonDetail = ({ salonId, onBack, onBookingSuccess }) => {
  const { t,i18n } = useTranslation();
  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Booking pane states
  const [selectedService, setSelectedService] = useState(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingTime, setBookingTime] = useState('09:00');
  const [chairs, setChairs] = useState([]);
  const [selectedChairId, setSelectedChairId] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

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

  const getSlotLabel = (slot) => {
    if (slot.breakName) {
      if (slot.breakName.toLowerCase().includes('lunch')) return '☕ Lunch';
      if (slot.breakName.toLowerCase().includes('tea')) return '☕ Tea';
      return '☕ Break';
    }
    return formatTime12Hr(slot.time);
  };

  const fetchSalonDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/api/salons/${salonId}`);
      setSalon(response.data.data);
    } catch (err) {
      setError('Failed to load salon details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchChairs = async () => {
    try {
      const res = await api.get(`/api/salons/${salonId}/chairs/active`);
      setChairs(res.data.data || []);
    } catch (err) {}
  };

  const fetchSlots = async () => {
    if (!selectedService || !bookingDate) return;
    try {
      setSlotsLoading(true);
      const chairParam = selectedChairId ? `&preferredChairId=${selectedChairId}` : '';
      const res = await api.get(`/api/salons/${salonId}/slots?date=${bookingDate}&serviceId=${selectedService.id}${chairParam}`);
      setSlots(res.data.data);
      
      const availableSlots = res.data.data.filter(s => s.available);
      if (availableSlots.length > 0) {
        setBookingTime(availableSlots[0].time);
      } else {
        setBookingTime('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    if (salonId) {
      fetchSalonDetails();
      fetchChairs();
    }
  }, [salonId]);

  useEffect(() => {
    fetchSlots();
  }, [selectedService, bookingDate, selectedChairId]);

  const handleBookSlot = async (e) => {
    e.preventDefault();
    if (!selectedService) return;

    setBookingLoading(true);
    setBookingError('');

    const currentLang = (i18n.language || localStorage.getItem('customer_lang') || 'en').substring(0, 2).toLowerCase();

    try {
      const payload = {
        salonId,
        serviceId: selectedService.id,
        bookingDate,
        bookingTime: bookingTime + ":00", // Format to LocalTime HH:mm:ss
        preferredChairId: selectedChairId,
        lang: currentLang
      };

      await api.post('/api/appointments', payload);

      onBookingSuccess();
    } catch (err) {
      setBookingError(err.response?.data?.message || 'Failed to complete booking. Slot might be unavailable.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  const isBookingDateToday = bookingDate === new Date().toISOString().split('T')[0];
  const isCurrentlyClosed = salon?.isOpen === false;
  const isUnavailable = salon?.mode === 'EMERGENCY' || (salon?.mode === 'BUSY' && isBookingDateToday) || (isCurrentlyClosed && isBookingDateToday);

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('detail.back')}
      </button>

      {/* Hero Section */}
      <div className="glass-card rounded-3xl p-6 relative overflow-hidden space-y-4">
        {/* Dynamic Status Tag */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">{salon?.name}</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">By {salon?.ownerName}</p>
          </div>
          
          <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${
            salon?.isOpen === false
              ? 'bg-red-500/10 border-red-500/35 text-red-400'
              : salon?.mode === 'EMERGENCY' 
              ? 'bg-red-500/10 border-red-500/35 text-red-400' 
              : salon?.mode === 'BUSY'
              ? 'bg-amber-500/10 border-amber-500/35 text-amber-400'
              : 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400'
          }`}>
            {salon?.isOpen === false ? 'CLOSED' : salon?.mode}
          </span>
        </div>

        {/* Address and working hours info */}
        <div className="space-y-2 text-xs text-slate-400 font-medium pt-2 border-t border-slate-900">
          <p className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-500" />
            {salon?.address}
          </p>
          <p className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            Working Hours: {formatTime12Hr(salon?.workingHoursStart?.substring(0, 5))} - {formatTime12Hr(salon?.workingHoursEnd?.substring(0, 5))}
          </p>

        </div>
      </div>

      {/* Animated Holiday Announcement Banner */}
      {salon?.holidayDate && (
        <div 
          className="relative overflow-hidden p-6 rounded-3xl backdrop-blur-md space-y-4 animate-fade-in group shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #2e1065 0%, #4c1d95 50%, #701a75 100%)',
            border: '2px solid rgba(167, 139, 250, 0.5)',
            color: '#ffffff'
          }}
        >
          {/* Animated Glowing Ambient Orbs */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-fuchsia-500/20 rounded-full blur-2xl animate-pulse pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-violet-500/20 rounded-full blur-2xl animate-pulse pointer-events-none" />

          <div className="flex items-center justify-between gap-3 border-b border-violet-400/30 pb-3.5 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 border border-violet-300/40 flex items-center justify-center text-white shadow-lg shadow-violet-500/30 shrink-0 animate-bounce">
                <Sparkles className="w-5 h-5 text-amber-300 fill-current animate-spin" />
              </div>
              <div>
                <h4 className="font-black text-base tracking-wide flex items-center gap-2" style={{ color: '#ffffff' }}>
                  {t('holiday.announcementTitle')}
                </h4>
                <p className="text-[11px] font-semibold flex items-center gap-1" style={{ color: '#ddd6fe' }}>
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  {t('holiday.noticeSub')}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-violet-500/30 border border-violet-300/40 shadow-sm animate-pulse" style={{ color: '#fde047' }}>
              {t('holiday.badge')}
            </span>
          </div>

          <div className="space-y-2.5 relative z-10">
            <div 
              className="p-4 rounded-2xl shadow-inner space-y-2"
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid rgba(139, 92, 246, 0.4)'
              }}
            >
              <div className="flex items-center justify-between text-xs font-bold flex-wrap gap-2">
                <span className="flex items-center gap-1.5" style={{ color: '#c4b5fd' }}>
                  {t('holiday.dateLabel')} 
                  <span 
                    className="text-sm font-black tracking-wider px-2 py-0.5 rounded-lg font-mono"
                    style={{ color: '#fde047', backgroundColor: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(251, 191, 36, 0.5)' }}
                  >
                    {salon.holidayDate}
                  </span>
                </span>
                {salon.holidayReason && (
                  <span 
                    className="font-extrabold text-xs flex items-center gap-1 px-2.5 py-0.5 rounded-lg"
                    style={{ color: '#f0abfc', backgroundColor: 'rgba(217, 70, 239, 0.2)', border: '1px solid rgba(232, 121, 249, 0.5)' }}
                  >
                    {salon.holidayReason}
                  </span>
                )}
              </div>
              {salon.holidayMessage && (
                <p 
                  className="text-xs font-bold italic pt-2 border-t"
                  style={{ color: '#ffffff', borderColor: 'rgba(139, 92, 246, 0.35)' }}
                >
                  "{salon.holidayMessage}"
                </p>
              )}
            </div>
            <p className="text-[11px] font-semibold flex items-center gap-1.5 pt-0.5" style={{ color: '#e9d5ff' }}>
              <span>{t('holiday.resumeNotice')}</span>
            </p>
          </div>
        </div>
      )}

      {/* Closed notice */}
      {salon?.isOpen === false && (
        <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-start gap-3 text-red-400">
          <Clock className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Salon is Closed</h4>
            <p className="text-xs opacity-90 mt-0.5">
              The salon is currently outside of working hours ({formatTime12Hr(salon?.workingHoursStart?.substring(0, 5))} - {formatTime12Hr(salon?.workingHoursEnd?.substring(0, 5))}). Booking and queue services are locked.
            </p>
          </div>
        </div>
      )}

      {/* Emergency closure alert box */}
      {salon?.mode === 'EMERGENCY' && (
        <div className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-amber-950/80 via-slate-900/95 to-purple-950/50 border border-amber-500/35 text-amber-200 shadow-xl shadow-amber-950/30 backdrop-blur-md space-y-3.5 animate-fade-in">
          <div className="flex items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-amber-100 tracking-tight flex items-center gap-2">
                  Salon Temporarily Closed
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300">
                    Special Notice
                  </span>
                </h4>
                <p className="text-[11px] text-amber-300/80 font-medium">Notice from Salon Owner</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-0.5">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/20 shadow-inner">
              <p className="text-xs font-bold text-slate-100 leading-relaxed flex items-start gap-2">
                <span className="text-amber-400 text-sm shrink-0">🌺</span>
                <span>{salon.emergencyMessage || 'The salon is temporarily closed today due to a special occasion / family function.'}</span>
              </p>
            </div>
            <p className="text-[11px] text-slate-400 pt-1 flex items-center gap-1.5 font-medium">
              <Heart className="w-3 h-3 text-pink-400 fill-current shrink-0" />
              <span>Online bookings & live queue slots are temporarily paused. Thank you for your warm understanding!</span>
            </p>
          </div>
        </div>
      )}

      {/* Busy mode notice */}
      {salon?.mode === 'BUSY' && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-start gap-3 text-amber-400">
          <Zap className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Busy Mode Active</h4>
            <p className="text-xs opacity-90 mt-0.5">
              The salon is currently experiencing high demand. Online bookings are paused. Please visit as walk-in or check back later.
            </p>
          </div>
        </div>
      )}

      {/* Services and Booking Pane layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Services catalog */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-900 pb-3">
            <Scissors className="w-4.5 h-4.5 text-violet-400" />
            Available Services Menu
          </h3>

          <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
            {salon?.services?.length > 0 ? (
              salon.services.map((service) => (
                <div 
                  key={service.id}
                  onClick={() => !isUnavailable && setSelectedService(service)}
                  className={`p-3.5 rounded-2xl border transition-all duration-300 flex justify-between items-center cursor-pointer ${
                    isUnavailable 
                      ? 'opacity-50 cursor-not-allowed border-slate-800 bg-slate-900/10'
                      : selectedService?.id === service.id
                      ? 'border-violet-500/50 bg-violet-600/10 shadow-inner'
                      : 'border-slate-850 hover:bg-slate-900/40 bg-slate-950/20'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      {formatServiceName(service.name, t)}
                    </h4>
                    <p className="text-[11px] text-slate-450 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-600" />
                      {service.durationMinutes} {t('common.mins')}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-white">₹{service.price}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">No active services provided</p>
            )}
          </div>
        </div>

        {/* Booking Form Pane */}
        {selectedService && (
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-900 pb-3">
              <Calendar className="w-4.5 h-4.5 text-violet-400" />
              Book Appointment Slot
            </h3>

            <form onSubmit={handleBookSlot} className="space-y-4">
              {bookingError && (
                <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl text-xs font-semibold">
                  {bookingError}
                </div>
              )}

              {/* Selected service summary */}
              <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl flex justify-between text-xs">
                <div>
                  <span className="text-slate-500 font-semibold uppercase text-[9px]">Selected Service</span>
                  <p className="font-bold text-white mt-0.5">
                    {t(`serviceNames.${selectedService.name}`, { defaultValue: selectedService.name })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 font-semibold uppercase text-[9px]">Service cost</span>
                  <p className="font-extrabold text-violet-400 mt-0.5">₹{selectedService.price}</p>
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Select Date</label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={formatDateDMY(bookingDate)}
                    onClick={() => {
                      const picker = document.getElementById('booking-date-picker');
                      if (picker && typeof picker.showPicker === 'function') {
                        picker.showPicker();
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-xs text-slate-200 focus:outline-none focus:border-violet-500 font-semibold cursor-pointer"
                  />
                  <input
                    id="booking-date-picker"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0"
                  />
                </div>
              </div>

              {/* Chair / Barber Preference Selector */}
              {chairs.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400">Select Barber / Chair Preference</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedChairId(null)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left ${
                        selectedChairId === null
                          ? 'bg-violet-600 border-violet-500 text-white shadow-lg'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      ✨ Any Chair (Auto)
                    </button>
                    {chairs.map((chair) => (
                      <button
                        key={chair.id}
                        type="button"
                        onClick={() => setSelectedChairId(chair.id)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left truncate ${
                          selectedChairId === chair.id
                            ? 'bg-violet-600 border-violet-500 text-white shadow-lg'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        💈 {chair.barberName ? `${chair.name} (${chair.barberName})` : chair.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Slots Grid */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400">Available Time Slots</label>
                {slotsLoading ? (
                  <div className="flex items-center gap-2 py-3 text-xs text-slate-400">
                    <Loader className="w-4 h-4 animate-spin text-violet-500" />
                    Calculating empty slots...
                  </div>
                ) : slots.length > 0 ? (
                  <div className="grid grid-cols-4 gap-2 max-h-[160px] overflow-y-auto pr-1">
                    {slots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setBookingTime(slot.time)}
                        title={slot.breakName || undefined}
                        className={`py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-300 border ${
                          bookingTime === slot.time
                            ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-violet-400'
                            : slot.breakName
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 cursor-not-allowed opacity-75'
                            : slot.available
                            ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
                            : 'bg-slate-950 text-slate-650 border-slate-900 cursor-not-allowed opacity-40'
                        }`}
                      >
                        {getSlotLabel(slot)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-2">No slots available for the selected date.</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={bookingLoading || !bookingTime}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-500/10 transition-opacity"
              >
                {bookingLoading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  'Confirm Booking Slot'
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default SalonDetail;
