import React, { useState, useEffect } from 'react';
import { Clock, User, Smartphone, Scissors, Loader, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../config/api';

const WalkInQueue = ({ salonId, onReset }) => {
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
        setError('Failed to load salon queue details.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSalonData();
  }, [salonId, walkInId]);

  // Live Tracking Polling Loop
  useEffect(() => {
    if (!walkInId) return;

    const fetchQueueStatus = async () => {
      try {
        const res = await api.get(`/api/queue/walkin/${walkInId}`);
        setTrackerData(res.data.data);
        setTrackerError('');
      } catch (err) {
        // If 404/400 (e.g. completed or deleted), or error
        setTrackerError('Your turn is completed or you were removed from the queue.');
      } finally {
        setLoading(false);
      }
    };

    fetchQueueStatus();
    const interval = setInterval(fetchQueueStatus, 3000); // 3-second live refresh
    return () => clearInterval(interval);
  }, [walkInId]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!selectedServiceId) {
      setError('Please select a service.');
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
      setError(err.response?.data?.message || 'Failed to join the queue. Please select a service.');
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

  const formatTime12Hr = (time24) => {
    if (!time24) return '';
    const [hoursStr, minutesStr] = time24.split(':');
    const hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${hours12}:${minutesStr} ${ampm}`;
  };

  if (loading && !trackerData) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader className="w-8 h-8 animate-spin text-violet-500" />
        <p className="text-xs text-slate-400 font-semibold">Connecting to live queue...</p>
      </div>
    );
  }

  // 1. Live Tracker View
  if (walkInId) {
    const isCompleted = trackerError || trackerData?.status === 'COMPLETED';
    const isServing = trackerData?.status === 'IN_SERVICE';

    return (
      <div className="space-y-6 max-w-md mx-auto pt-6 pb-20 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20 mb-1">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-xl font-black text-white tracking-wide">Live Queue Tracker</h2>
          <p className="text-xs text-slate-400 font-medium">Walk-in Client Queue Status</p>
        </div>

        {/* Tracking Details */}
        <div className="glass-card rounded-3xl p-6 relative overflow-hidden space-y-6">
          {isCompleted ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <div>
                <h3 className="font-bold text-white text-base">Service Completed</h3>
                <p className="text-xs text-slate-400 mt-1">Thank you for visiting! You have been checked out.</p>
              </div>
              <button
                onClick={handleClear}
                className="w-full mt-4 bg-slate-900 border border-slate-800 text-slate-200 py-2.5 rounded-xl text-xs font-bold"
              >
                Back to Registration
              </button>
            </div>
          ) : (
            <>
              {/* Tracker Widget */}
              <div className="text-center space-y-2">
                <span className="text-[10px] font-extrabold px-3 py-1 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-full uppercase tracking-wider">
                  Token #{trackerData?.queueNumber || '...'}
                </span>
                
                {isServing || trackerData?.position === 1 ? (
                  <div className="space-y-2 py-4 text-center">
                    <div className="relative w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/20">
                      <Scissors className="w-8 h-8 animate-bounce" />
                    </div>
                    <h1 className="text-3xl font-black text-emerald-400 tracking-tight uppercase animate-pulse">
                      {isServing ? 'YOU ARE BEING SERVED!' : "IT'S YOUR TURN!"}
                    </h1>
                    <p className="text-xs text-slate-200 font-bold">
                      {isServing ? 'Your styling session is currently in progress.' : 'Please proceed to the grooming chair.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 py-4">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Current Position</p>
                    <h1 className="text-6xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent tracking-tight">
                      {trackerData?.position !== undefined ? trackerData.position : '...'}
                    </h1>
                    <p className="text-xs text-slate-400 font-medium">
                      Estimated wait: <span className="text-violet-400 font-bold">{trackerData?.estimatedWaitingTime || 0} mins</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Booking Metadata */}
              <div className="space-y-3 text-xs text-slate-400 font-medium border-t border-slate-900 pt-4">
                <div className="flex justify-between py-2 border-b border-slate-900/60">
                  <span>Name</span>
                  <span className="text-slate-200 font-bold">{trackerData?.customerName || 'Walk-in Client'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-900/60">
                  <span>Service Selected</span>
                  <span className="text-slate-200 font-bold">{trackerData?.serviceName || 'Standard Service'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Status</span>
                  <span className={`font-bold uppercase ${isServing ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isServing ? 'Serving' : 'Waiting'}
                  </span>
                </div>
              </div>

              {/* Reset/Exit Button */}
              <button
                onClick={handleClear}
                className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-900 hover:border-slate-850 text-slate-400 hover:text-slate-250 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                Exit Tracker
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // 2. Registration Form View
  return (
    <div className="space-y-6 max-w-md mx-auto pt-6 pb-20 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20 mb-1">
          <Scissors className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-wide">
          {salon?.name || 'Walk-in Registration'}
        </h2>
        <p className="text-xs text-slate-400 font-medium">Join the live queue queue instantly</p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-red-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleRegister} className="glass-card rounded-3xl p-6 space-y-5">

        {/* Select Service Added by Admin */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">Select Service (Added by Salon Owner) *</label>
            <span className="text-[10px] text-violet-400 font-bold">{services.length} Services</span>
          </div>

          {/* Interactive Service Selection Cards Grid */}
          <div className="grid grid-cols-1 gap-2.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
            {services.map((srv) => {
              const isSelected = String(selectedServiceId) === String(srv.id);
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
                      <h4 className="text-xs font-bold text-white">{srv.name}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">{srv.durationMinutes || 30} mins duration</p>
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

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-550 hover:to-fuchsia-550 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-500/10 transition-all flex items-center justify-center gap-1.5 mt-2"
        >
          {submitting ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Join Walk-in Queue
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default WalkInQueue;
