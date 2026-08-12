import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Loader, Sparkles, Navigation } from 'lucide-react';
import api from '../config/api';
import SalonCard from '../components/SalonCard';

const Salons = ({ onSelectSalon, searchTerm = '' }) => {
  const { t } = useTranslation();
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState(null);
  const [coordsLoading, setCoordsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSalons = async (latitude = null, longitude = null, query = searchTerm, isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      setError('');
      let url = '/api/salons';

      if (query) {
        url = `/api/salons?name=${encodeURIComponent(query)}&address=${encodeURIComponent(query)}`;
      } else if (latitude && longitude) {
        url = `/api/salons?latitude=${latitude}&longitude=${longitude}&radiusKm=50`;
      }

      const response = await api.get(url);
      setSalons(response.data.data);
    } catch (err) {
      if (!isSilent) setError('Failed to fetch salons. Please try again.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const getGeoLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setCoordsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
        setCoordsLoading(false);
        fetchSalons(latitude, longitude, searchTerm);
      },
      (error) => {
        console.warn('Geolocation access denied', error);
        setCoordsLoading(false);
        // Fallback to fetch without coords
        fetchSalons(null, null, searchTerm);
      }
    );
  };

  useEffect(() => {
    // Initial fetch using geolocation or search term
    getGeoLocation();

    const interval = setInterval(() => {
      fetchSalons(coords?.latitude, coords?.longitude, searchTerm, true);
    }, 4000); // 4-second live refresh

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Debounced fetch when search term changes from header
    const timer = setTimeout(() => {
      fetchSalons(coords?.latitude, coords?.longitude, searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="flex-1 flex flex-col space-y-6 pb-20 animate-fade-in">
      {/* Brand Greeting */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-1.5 font-sans">
            <Sparkles className="w-5 h-5 text-violet-400 animate-pulse" />
            {t('home.heroTitle')}
          </h2>
          <p className="text-xs text-slate-400 font-medium">{t('home.heroDesc')}</p>
        </div>

        {/* GPS Fetch Button */}
        <button
          onClick={getGeoLocation}
          disabled={coordsLoading}
          className={`p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5 ${
            coords ? 'text-violet-400 border-violet-500/20' : ''
          }`}
        >
          {coordsLoading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          <span className="text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
            {coords ? 'GPS Sync' : 'GPS Loc'}
          </span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Salons list */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20 min-h-[350px]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
        </div>
      ) : salons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {salons.map((salon) => (
            <SalonCard
              key={salon.id}
              salon={salon}
              onClick={() => onSelectSalon(salon.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-4 my-auto min-h-[350px]">
          <div className="w-16 h-16 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center mb-4 text-violet-400 shadow-xl shadow-slate-950/50">
            <Search className="w-8 h-8 opacity-80" />
          </div>
          <p className="font-bold text-slate-200 text-base">No salons found</p>
          <p className="text-xs text-slate-400 mt-1.5 max-w-xs leading-relaxed">
            Try resetting search filters or checking GPS permission.
          </p>
        </div>
      )}
    </div>
  );
};

export default Salons;
