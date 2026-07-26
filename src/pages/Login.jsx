import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Phone, Lock, Sparkles, Loader, ArrowRight, User, MessageSquare } from 'lucide-react';
import api from '../config/api';
import Footer from '../components/Footer';

const Login = ({ forceStep3 }) => {
  const { sendOtp, verifyOtp, updateProfileInContext } = useAuth();
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(forceStep3 ? 3 : 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [customerName, setCustomerName] = useState('');

  // 20-Second OTP Pop-up Toast State
  const [otpPopup, setOtpPopup] = useState({ show: false, code: '', number: '', timeLeft: 20 });

  useEffect(() => {
    if (!otpPopup.show || otpPopup.timeLeft <= 0) return;
    const timer = setInterval(() => {
      setOtpPopup(prev => {
        if (prev.timeLeft <= 1) {
          return { ...prev, show: false, timeLeft: 0 };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [otpPopup.show, otpPopup.timeLeft]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    
    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const responseData = await sendOtp(mobileNumber);
      const fetchedOtp = responseData?.data || responseData;
      setStep(2);

      if (fetchedOtp && (typeof fetchedOtp === 'string' || typeof fetchedOtp === 'number')) {
        const codeStr = String(fetchedOtp);
        setOtpPopup({ show: true, code: codeStr, number: mobileNumber, timeLeft: 20 });
        setInfoMessage('OTP generated! See the pop-up notification at the top.');
      } else {
        setInfoMessage('OTP sent! Please check SMS or backend logs.');
      }
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!/^\d{6}$/.test(otp)) {
      setError('OTP must be a 6-digit number');
      return;
    }

    setLoading(true);
    try {
      const authData = await verifyOtp(mobileNumber, otp);
      if (authData && (authData.isNewUser || !authData.name || authData.name.trim() === '')) {
        setStep(3); // Go to name entry step
        setInfoMessage('Please enter your name to complete registration.');
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      setError(err.message || 'Invalid OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveName = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (!customerName.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    try {
      await api.put('/api/customer/profile', { name: customerName });
      updateProfileInContext({ name: customerName });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save name');
    } finally {
      setLoading(false);
    }
  };

  // Custom Logo Image support (logo.png or icon.png in public/ directory)
  const [logoSrc, setLogoSrc] = useState('/logo.png');
  const [logoFailed, setLogoFailed] = useState(false);

  const handleLogoError = () => {
    if (logoSrc === '/logo.png') {
      setLogoSrc('/icon.png');
    } else {
      setLogoFailed(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 p-6 relative overflow-hidden">
      {/* 20-Second OTP Pop-up Toast */}
      {otpPopup.show && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-bounce-in">
          <div className="bg-slate-900/95 border-2 border-violet-500/80 backdrop-blur-xl rounded-2xl p-4 shadow-2xl shadow-violet-500/30 text-white relative overflow-hidden">
            {/* 20s Countdown Progress Bar */}
            <div 
              className="absolute top-0 left-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 transition-all duration-1000 ease-linear"
              style={{ width: `${(otpPopup.timeLeft / 20) * 100}%` }}
            ></div>

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 animate-pulse">
                  <MessageSquare className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-violet-300 flex items-center gap-2">
                    <span>💬 Simulated SMS Received</span>
                    <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full border border-violet-500/30 font-bold">
                      {otpPopup.timeLeft}s
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">
                    Your verification OTP for <span className="text-slate-100 font-bold">+91 {otpPopup.number}</span> is:
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setOtpPopup(prev => ({ ...prev, show: false }))}
                className="text-slate-400 hover:text-white text-xs font-bold p-1"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* OTP Code Display Box */}
            <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <span className="text-2xl font-black tracking-[0.3em] font-mono text-violet-400 pl-2">
                {otpPopup.code}
              </span>
              <button
                type="button"
                onClick={() => {
                  setOtp(otpPopup.code);
                  setOtpPopup(prev => ({ ...prev, show: false }));
                }}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md"
              >
                Auto-fill Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl"></div>

      <div className="my-auto w-full max-w-md mx-auto relative z-10 pt-4">
        {/* Centered Brand Header directly upper side of the box */}
        <div className="text-center mb-6 flex justify-center">
          {!logoFailed ? (
            <img 
              src={logoSrc} 
              alt="Smart Salon Logo" 
              onError={handleLogoError}
              className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-2xl hover:scale-105 transition-transform"
            />
          ) : (
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-tr from-violet-600 via-purple-500 to-pink-500 text-white shadow-2xl shadow-violet-500/30 border border-violet-400/30 group hover:scale-105 transition-transform">
              <Sparkles className="w-14 h-14" />
            </div>
          )}
        </div>

        {/* Card */}
        <div className="glass-panel rounded-3xl px-6 sm:px-8 py-8 sm:py-10 shadow-2xl relative border-t-2 border-t-violet-500/40 mb-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-1.5">
            {step === 3 ? 'Complete Profile' : 'Customer Login'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mb-6 font-medium">
            {step === 3 ? 'Please enter your name to complete registration' : 'Enter mobile number to get instant OTP code'}
          </p>

          {error && (
            <div className="p-3.5 mb-5 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl text-xs sm:text-sm font-semibold">
              {error}
            </div>
          )}

          {infoMessage && (
            <div className="p-3.5 mb-5 bg-violet-500/10 border border-violet-500/25 text-violet-300 rounded-xl text-xs sm:text-sm font-medium">
              {infoMessage}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-200">Mobile Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Phone className="w-5 h-5" />
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="Enter 10-digit mobile number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3.5 sm:py-4 pl-11 pr-4 text-base text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none transition-colors font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 disabled:opacity-50 text-white text-base font-bold rounded-xl py-3.5 sm:py-4 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 transition-all"
              >
                {loading ? <Loader className="w-6 h-6 animate-spin" /> : <>Send OTP <ArrowRight className="w-5 h-5" /></>}
              </button>
            </form>
          ) : step === 2 ? (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-200">Enter OTP</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3.5 sm:py-4 pl-11 pr-4 text-base sm:text-lg text-slate-100 focus:border-violet-500 focus:outline-none tracking-[0.25em] font-mono text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 disabled:opacity-50 text-white text-base font-bold rounded-xl py-3.5 sm:py-4 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 transition-all"
              >
                {loading ? <Loader className="w-6 h-6 animate-spin" /> : 'Verify & Log In'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-xs sm:text-sm text-slate-400 hover:text-slate-200 mt-2 block transition-colors"
              >
                Change mobile number
              </button>
            </form>
          ) : (
            <form onSubmit={handleSaveName} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-200">Your Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3.5 sm:py-4 pl-11 pr-4 text-base text-slate-100 placeholder-slate-500 focus:border-violet-500 focus:outline-none transition-colors font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 disabled:opacity-50 text-white text-base font-bold rounded-xl py-3.5 sm:py-4 flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 transition-all"
              >
                {loading ? <Loader className="w-6 h-6 animate-spin" /> : 'Complete Registration'}
              </button>
            </form>
          )}
        </div>

        {/* Info */}
        <div className="text-center space-y-1.5 mb-6">
          <p className="text-xs text-violet-400 font-medium">
            ✨ Any new mobile number will automatically register as a new Customer!
          </p>
          <p className="text-xs text-slate-500">
            For testing existing customer login, use <span className="text-slate-350 font-bold">9988776655</span>.
          </p>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Login;
