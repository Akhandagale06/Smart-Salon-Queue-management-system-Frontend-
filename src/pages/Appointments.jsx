import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, Scissors, ChevronRight, RefreshCw, Loader, Trash2, Info } from 'lucide-react';
import api from '../config/api';
import { formatServiceName } from '../utils/serviceTranslator';

const Appointments = ({ onSelectAppointment }) => {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('active'); // 'active' or 'history'

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

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/customer/appointments?page=0&size=20');
      setAppointments(response.data.data.content);
    } catch (err) {
      setError('Failed to fetch appointment history.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm(t('appointments.clearHistoryConfirm') || 'Are you sure you want to clear your appointment history from the database?')) {
      return;
    }
    try {
      setClearing(true);
      await api.delete('/api/customer/appointments/history');
      await fetchAppointments();
    } catch (err) {
      setError('Failed to clear history from database.');
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'BOOKED':
      case 'CONFIRMED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'IN_SERVICE':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/20 animate-pulse';
      case 'COMPLETED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'CANCELLED':
        return 'bg-slate-800 text-slate-500 border-slate-700/50';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  const activeBookings = appointments.filter(apt => 
    apt.status !== 'COMPLETED' && apt.status !== 'CANCELLED' && apt.status !== 'NO_SHOW'
  );
  
  const historyBookings = appointments.filter(apt => 
    apt.status === 'COMPLETED' || apt.status === 'CANCELLED' || apt.status === 'NO_SHOW'
  );

  const displayedAppointments = activeSubTab === 'active' ? activeBookings : historyBookings;

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white font-sans">
            My Appointments
          </h2>
          <p className="text-xs text-slate-400 font-medium">Manage booked slots and check real-time wait times</p>
        </div>

        <button
          onClick={fetchAppointments}
          className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Sub Tabs */}
      <div className="subtab-container flex gap-2 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveSubTab('active')}
          className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-300 ${
            activeSubTab === 'active'
              ? 'subtab-button-active'
              : 'subtab-button-inactive'
          }`}
        >
          {t('appointments.activeBookings')} ({activeBookings.length})
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all duration-300 ${
            activeSubTab === 'history'
              ? 'subtab-button-active'
              : 'subtab-button-inactive'
          }`}
        >
          {t('appointments.history')} ({historyBookings.length})
        </button>
      </div>

      {activeSubTab === 'history' && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs">
          <div className="flex items-start gap-2 min-w-0">
            <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
            <p className="font-semibold text-violet-200 text-[11px] leading-snug">
              {t('appointments.autoClearNotice')}
            </p>
          </div>
          {historyBookings.length > 0 && (
            <button
              onClick={handleClearHistory}
              disabled={clearing}
              className="px-2.5 py-1 text-[11px] font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors flex items-center gap-1 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {clearing ? '...' : t('appointments.clearHistory')}
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedAppointments.length > 0 ? (
            displayedAppointments.map((apt) => (
              <div
                key={apt.id}
                onClick={() => onSelectAppointment(apt.id)}
                className="glass-card rounded-2xl p-4 border border-slate-900/60 hover:border-slate-800 transition-all duration-300 flex items-center justify-between cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Icon Wrapper */}
                  <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
                    <Scissors className="w-5 h-5" />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-100 text-sm truncate leading-snug">
                        {apt.salonName || 'Salon appointment'}
                      </h4>
                      <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full border shrink-0 ${getStatusBadgeClass(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 truncate font-semibold">
                      {formatServiceName(apt.serviceName || 'Grooming service', t)}
                    </p>

                    <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-600" />
                        {formatDateDMY(apt.bookingDate)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-600" />
                        {formatTime12Hr(apt.bookingTime?.substring(0, 5))}
                      </span>
                      <span>•</span>
                      <span className="px-1.5 py-0.5 rounded bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20 font-bold text-[9px]">
                        Chair #{apt.chairNumber || 1}
                      </span>
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-600 shrink-0" />
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-slate-500">
              <p className="font-semibold text-sm">
                {activeSubTab === 'active' 
                  ? t('appointments.noActive') 
                  : t('appointments.noHistory')}
              </p>
              <p className="text-xs mt-1">
                {activeSubTab === 'active' 
                  ? 'Book services to get live position tokens.' 
                  : 'Your completed or cancelled bookings will show here.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Appointments;
