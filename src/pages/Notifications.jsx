import React, { useState, useEffect } from 'react';
import { Bell, Clock, RefreshCw, Trash2, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../config/api';

const Notifications = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState('');

  const formatDateDMY = (dateObj) => {
    const d = new Date(dateObj);
    if (isNaN(d.getTime())) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime12Hr = (dateObj) => {
    const d = new Date(dateObj);
    if (isNaN(d.getTime())) return '';
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 === 0 ? 12 : hours % 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const isToday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/customer/notifications?page=0&size=30');
      const rawContent = response.data?.data?.content || [];
      // Auto-clear logic: Filter so only today's notifications are shown
      const todaysNotifications = rawContent.filter(n => isToday(n.createdAt));
      setNotifications(todaysNotifications);
    } catch (err) {
      setError('Failed to fetch notification history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Set up midnight timer to automatically clear notifications at the end of the day (00:00:00)
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();

    const midnightTimer = setTimeout(() => {
      setNotifications([]);
      fetchNotifications();
    }, msUntilMidnight);

    // Interval check every minute for date rollover
    let currentDay = new Date().getDate();
    const interval = setInterval(() => {
      const todayNum = new Date().getDate();
      if (todayNum !== currentDay) {
        currentDay = todayNum;
        setNotifications([]);
        fetchNotifications();
      }
    }, 60000);

    return () => {
      clearTimeout(midnightTimer);
      clearInterval(interval);
    };
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/api/customer/notifications/${id}/read`);
      // Update in local state
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm(t('notifications.clearAllConfirm', 'Are you sure you want to clear your notification inbox?'))) {
      return;
    }
    try {
      setClearing(true);
      setError('');
      await api.delete('/api/customer/notifications');
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear notifications', err);
      setError('Failed to clear notifications in database. Please restart your backend Java server to load the new delete endpoint.');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-sans">
            {t('notifications.title', 'Notification Center')}
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            {t('notifications.subTitle', 'Inbox and alerts history')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={clearing}
              className="px-3 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('notifications.clearAll', 'Clear Inbox')}</span>
            </button>
          )}

          <button
            onClick={fetchNotifications}
            title={t('common.refresh', 'Refresh')}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Auto-clear Notice Banner */}
      <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl text-xs text-violet-300 flex items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-violet-400 shrink-0 animate-pulse" />
          <span>{t('notifications.autoClearNotice', 'Notifications automatically clear at the end of each day (midnight).')}</span>
        </div>
        <span className="px-2 py-0.5 rounded-md bg-violet-600/30 text-[10px] font-bold text-violet-300 shrink-0 uppercase tracking-wider">
          Daily Reset
        </span>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && handleMarkRead(n.id)}
                className={`p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 relative overflow-hidden cursor-pointer ${
                  n.isRead
                    ? 'glass-card border-slate-900 text-slate-400'
                    : 'bg-violet-600/5 border-violet-500/20 text-slate-200 shadow-lg shadow-violet-500/2'
                }`}
              >
                {/* Unread indicator dot */}
                {!n.isRead && (
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-violet-500 animate-pulse"></div>
                )}

                <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${
                  n.isRead 
                    ? 'bg-slate-900 border-slate-800 text-slate-500' 
                    : 'bg-violet-600/15 border-violet-500/20 text-violet-400'
                }`}>
                  <Bell className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0 space-y-1 pr-4">
                  <h4 className={`text-sm font-bold truncate leading-snug ${n.isRead ? 'text-slate-350' : 'text-white'}`}>
                    {n.title}
                  </h4>
                  <p className="text-xs leading-relaxed break-words opacity-90">{n.message}</p>
                  <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1.5 pt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-650" />
                    {formatDateDMY(n.createdAt)} at {formatTime12Hr(n.createdAt)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-slate-500 space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
                <Bell className="w-6 h-6" />
              </div>
              <p className="font-semibold text-sm text-slate-300">
                {t('notifications.emptyTitle', 'Inbox is empty')}
              </p>
              <p className="text-xs text-slate-500">
                {t('notifications.emptySub', 'Operational alerts and reminders will appear here.')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
