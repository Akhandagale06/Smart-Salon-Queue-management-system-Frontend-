import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Header from './components/Header';
import TelegramNoticeModal from './components/TelegramNoticeModal';

// Pages
import Login from './pages/Login';
import Salons from './pages/Salons';
import SalonDetail from './pages/SalonDetail';
import Appointments from './pages/Appointments';
import AppointmentDetail from './pages/AppointmentDetail';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import WalkInQueue from './pages/WalkInQueue';

const MainApp = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const { theme } = useTheme();
  
  // Navigation & Search states
  const [activeTab, setActiveTab] = useState('salons');
  const [selectedSalonId, setSelectedSalonId] = useState(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTelegramNoticeOpen, setIsTelegramNoticeOpen] = useState(false);

  // Auto-open Telegram Bot notice modal on customer login if not yet read
  useEffect(() => {
    if (isAuthenticated && user) {
      const readKey = `telegram_bot_notice_read_${user.id || 'guest'}`;
      const hasRead = localStorage.getItem(readKey);
      if (!hasRead) {
        setIsTelegramNoticeOpen(true);
      }
    }
  }, [isAuthenticated, user]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedSalonId(null);
    setSelectedAppointmentId(null);
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    if (activeTab !== 'salons') {
      setActiveTab('salons');
      setSelectedSalonId(null);
      setSelectedAppointmentId(null);
    }
  };

  const handleLogoClick = () => {
    setActiveTab('salons');
    setSelectedSalonId(null);
    setSelectedAppointmentId(null);
    setSearchTerm('');
  };

  // URL override for scan-to-join walk-in queue
  const urlParams = new URLSearchParams(window.location.search);
  const paramWalkInSalonId = urlParams.get('walkInSalonId');

  useEffect(() => {
    if (paramWalkInSalonId) {
      localStorage.setItem('activeWalkInSalonId', paramWalkInSalonId);
    }
  }, [paramWalkInSalonId]);

  const activeWalkInSalonId = paramWalkInSalonId || localStorage.getItem('activeWalkInSalonId');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
      </div>
    );
  }

  if (activeWalkInSalonId) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <main className="flex-1 p-6 overflow-y-auto w-full max-w-md mx-auto">
          <WalkInQueue 
            salonId={activeWalkInSalonId} 
            onReset={() => {
              localStorage.removeItem('activeWalkInSalonId');
              localStorage.removeItem(`walkInId_${activeWalkInSalonId}`);
              window.history.replaceState({}, document.title, window.location.pathname);
              window.location.reload();
            }} 
          />
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  if (!user?.name || user.name.trim() === '') {
    return <Login forceStep3={true} />;
  }

  const renderContent = () => {
    // Salon Detail override
    if (activeTab === 'salons' && selectedSalonId) {
      return (
        <SalonDetail
          salonId={selectedSalonId}
          onBack={() => setSelectedSalonId(null)}
          onBookingSuccess={() => {
            setSelectedSalonId(null);
            setActiveTab('appointments');
          }}
        />
      );
    }

    // Appointment Detail override
    if (activeTab === 'appointments' && selectedAppointmentId) {
      return (
        <AppointmentDetail
          appointmentId={selectedAppointmentId}
          onBack={() => setSelectedAppointmentId(null)}
          onCancelSuccess={() => setSelectedAppointmentId(null)}
        />
      );
    }

    // Normal Tab Views
    switch (activeTab) {
      case 'salons':
        return <Salons onSelectSalon={setSelectedSalonId} searchTerm={searchTerm} />;
      case 'appointments':
        return <Appointments onSelectAppointment={setSelectedAppointmentId} />;
      case 'notifications':
        return <Notifications />;
      case 'profile':
        return <Profile />;
      default:
        return <Salons onSelectSalon={setSelectedSalonId} searchTerm={searchTerm} />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans ${theme === 'light' ? 'theme-light bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'}`}>
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        searchTerm={searchTerm}
        setSearchTerm={handleSearchChange}
        onLogoClick={handleLogoClick}
        onOpenTelegramNotice={() => setIsTelegramNoticeOpen(true)}
      />

      {/* Dynamic Content */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full flex flex-col">
        {renderContent()}
      </main>

      <TelegramNoticeModal
        isOpen={isTelegramNoticeOpen}
        onClose={() => setIsTelegramNoticeOpen(false)}
        userId={user?.id}
      />
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
