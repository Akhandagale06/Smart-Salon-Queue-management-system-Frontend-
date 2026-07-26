import React from 'react';
import { Search, Calendar, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navigation = ({ activeTab, setActiveTab }) => {
  const { logout } = useAuth();

  const tabs = [
    { id: 'salons', label: 'Salons', icon: Search },
    { id: 'appointments', label: 'Bookings', icon: Calendar },
    { id: 'notifications', label: 'Inbox', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="glass-bottom-bar fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-5xl h-16 flex items-center justify-around px-4 z-40">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-all duration-300 ${
              isActive 
                ? 'text-violet-400 font-bold scale-105' 
                : 'text-slate-500 hover:text-slate-350'
            }`}
          >
            <Icon className={`w-5.5 h-5.5 mb-1 ${isActive ? 'stroke-[2.5px] drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]' : ''}`} />
            <span className="text-[10px] tracking-wide">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default Navigation;
