import React, { useState, useEffect } from 'react';
import { Bell, Clock, RefreshCw, Eye, EyeOff, Loader } from 'lucide-react';
import api from '../config/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/customer/notifications?page=0&size=30');
      setNotifications(response.data.data.content);
    } catch (err) {
      setError('Failed to fetch notification history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
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

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white font-sans">
            Notification Center
          </h2>
          <p className="text-xs text-slate-400 font-medium">Inbox and alerts history</p>
        </div>

        <button
          onClick={fetchNotifications}
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
                className={`p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 relative overflow-hidden ${
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
            <div className="text-center py-20 text-slate-500">
              <p className="font-semibold text-sm">Inbox is empty</p>
              <p className="text-xs mt-1">Operational alerts and reminders will appear here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
