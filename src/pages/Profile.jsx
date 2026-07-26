import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Languages, 
  MapPin, 
  LogOut, 
  Loader,
  CheckCircle,
  Smartphone,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  RefreshCw,
  X
} from 'lucide-react';
import api from '../config/api';

const Profile = () => {
  const { t } = useTranslation();
  const { user, logout, updateProfileInContext } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '');
  const [email, setEmail] = useState(user?.email || '');
  const [language, setLanguage] = useState(user?.language || 'ENGLISH');
  const [latitude, setLatitude] = useState(user?.latitude || '');
  const [longitude, setLongitude] = useState(user?.longitude || '');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Mobile Update Modal States
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const [newMobileNumber, setNewMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStep, setOtpStep] = useState(1); // 1: Enter mobile, 2: Verify OTP
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpError, setOtpError] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!newMobileNumber.trim() || newMobileNumber.trim().length < 10) {
      setOtpError('Please enter a valid 10-digit mobile number');
      return;
    }
    setOtpSending(true);
    setOtpError('');
    setOtpMessage('');
    try {
      const res = await api.post('/api/auth/send-otp', { mobileNumber: newMobileNumber.trim() });
      const generatedOtp = res.data.data;
      setOtpStep(2);
      if (generatedOtp) {
        setOtp(generatedOtp);
      }
      setOtpMessage(`OTP Code sent to +91 ${newMobileNumber.trim()}: ${generatedOtp || '123456'}`);
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Failed to send OTP. Try again.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyAndUpdateMobile = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      setOtpError('Please enter 6-digit OTP');
      return;
    }
    setOtpVerifying(true);
    setOtpError('');
    try {
      const res = await api.put('/api/customer/update-mobile', {
        newMobileNumber: newMobileNumber.trim(),
        otp: otp.trim()
      });
      updateProfileInContext(res.data.data);
      setMobileNumber(res.data.data.mobileNumber);
      setSuccess(true);
      setMobileModalOpen(false);
      setNewMobileNumber('');
      setOtp('');
      setOtpStep(1);
      setOtpMessage('');
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const payload = {
        name,
        mobileNumber: mobileNumber ? mobileNumber.trim() : null,
        email: email || null,
        language,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      };

      const response = await api.put('/api/customer/profile', payload);
      // Update profile in AuthContext
      updateProfileInContext(response.data.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile details');
    } finally {
      setLoading(false);
    }
  };

  const getGeoLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      },
      (error) => {
        alert('Could not resolve location coordinates');
      }
    );
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in max-w-md mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white font-sans">
          {t('profile.title')}
        </h2>
        <p className="text-xs text-slate-400 font-medium">Update account settings and language options</p>
      </div>

      {/* Card Form */}
      <div className="glass-card rounded-3xl p-6 border border-slate-900/60">
        <form onSubmit={handleUpdate} className="space-y-4">
          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              Profile updated successfully!
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Mobile Number with Update & OTP Button */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">{t('profile.mobile')}</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Smartphone className="w-4.5 h-4.5" />
                </span>
                <input
                  type="text"
                  disabled
                  value={mobileNumber ? `+91 ${mobileNumber}` : ''}
                  className="w-full bg-slate-950/70 border border-slate-850 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-200 font-semibold cursor-not-allowed"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  setMobileModalOpen(true);
                  setOtpStep(1);
                  setOtpError('');
                  setOtpMessage('');
                  setNewMobileNumber('');
                  setOtp('');
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-550 hover:to-fuchsia-550 text-white font-bold text-xs shadow-md shadow-violet-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                Update
              </button>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">{t('profile.name')} *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <User className="w-4.5 h-4.5" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-violet-500 font-semibold"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Mail className="w-4.5 h-4.5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-violet-500 font-semibold"
              />
            </div>
          </div>

          {/* Language Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Preferred Language</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Languages className="w-4.5 h-4.5" />
              </span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl py-2.5 pl-9 pr-4 text-xs text-slate-250 focus:outline-none focus:border-violet-500 font-semibold appearance-none"
              >
                <option value="ENGLISH" className="bg-slate-900">English</option>
                <option value="HINDI" className="bg-slate-900">हिन्दी (Hindi)</option>
                <option value="MARATHI" className="bg-slate-900">मराठी (Marathi)</option>
                <option value="TAMIL" className="bg-slate-900">தமிழ் (Tamil)</option>
                <option value="TELUGU" className="bg-slate-900">తెలుగు (Telugu)</option>
                <option value="KANNADA" className="bg-slate-900">ಕನ್ನಡ (Kannada)</option>
                <option value="GUJARATI" className="bg-slate-900">ગુજરાતી (Gujarati)</option>
                <option value="BENGALI" className="bg-slate-900">বাংলা (Bengali)</option>
                <option value="PUNJABI" className="bg-slate-900">ਪੰਜਾਬੀ (Punjabi)</option>
              </select>
            </div>
          </div>

          {/* Coords row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-450">Latitude</label>
              <input
                type="number"
                step="0.0001"
                disabled
                value={latitude}
                className="w-full bg-slate-950/40 border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-450 cursor-not-allowed"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-450">Longitude</label>
              <input
                type="number"
                step="0.0001"
                disabled
                value={longitude}
                className="w-full bg-slate-950/40 border border-slate-850 rounded-xl py-2 px-3 text-xs text-slate-450 cursor-not-allowed"
              />
            </div>
          </div>

          {/* GPS Sync */}
          <button
            type="button"
            onClick={getGeoLocation}
            className="w-full py-2.5 rounded-xl border border-slate-850 hover:bg-slate-800/40 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <MapPin className="w-4 h-4 text-violet-400" />
            Sync Location Coordinates
          </button>

          {/* Save button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Logout button */}
      <button
        onClick={logout}
        className="w-full py-3.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        {t('profile.logout')}
      </button>

      {/* Update Mobile Number & OTP Verification Modal */}
      {mobileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-sm glass-modal rounded-3xl overflow-hidden shadow-2xl relative border border-violet-500/30 text-white p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-violet-400" />
                Update Mobile Number
              </h3>
              <button
                onClick={() => setMobileModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {otpError && (
              <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl text-xs font-semibold">
                {otpError}
              </div>
            )}

            {otpMessage && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs font-semibold space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle className="w-4 h-4 shrink-0 animate-bounce" />
                  <span>OTP Code Generated!</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-300">Your OTP Code:</span>
                  <span className="text-amber-400 font-black text-sm px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-400/40 tracking-widest animate-pulse shadow-md shadow-amber-500/10">
                    {otp || '123456'}
                  </span>
                </div>
              </div>
            )}

            {otpStep === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-350">Enter New Mobile Number *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <Smartphone className="w-4.5 h-4.5" />
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={newMobileNumber}
                      onChange={(e) => setNewMobileNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-violet-500 font-semibold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={otpSending}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-550 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {otpSending ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Send OTP
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndUpdateMobile} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-350">Enter 6-Digit OTP *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                      <KeyRound className="w-4.5 h-4.5 text-violet-400" />
                    </span>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="Enter 6-digit OTP (123456)"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-9 pr-4 text-xs text-slate-200 focus:outline-none focus:border-violet-500 font-bold tracking-widest text-center"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep(1);
                      setOtpError('');
                      setOtpMessage('');
                    }}
                    className="flex-1 py-3 bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-850 cursor-pointer"
                  >
                    Change Number
                  </button>

                  <button
                    type="submit"
                    disabled={otpVerifying}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-550 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {otpVerifying ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Verify & Update
                        <ShieldCheck className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
