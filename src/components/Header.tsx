import React, { useState } from 'react';
import { useSimkas } from '../context/SimkasContext';
import { Bell, Database, Menu, LogOut } from 'lucide-react';

interface HeaderProps {
  toggleMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleMobileMenu }) => {
  const { role, currentUser, notifikasis, markAllNotifRead, setIsDbModalOpen, logout } = useSimkas();
  const [showNotif, setShowNotif] = useState(false);

  const unreadCount = notifikasis.filter(n => !n.read).length;

  return (
    <header className="bg-white border-b border-slate-200 h-16 shrink-0 flex items-center justify-between px-4 lg:px-8 z-20 sticky top-0 shadow-sm/50">
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleMobileMenu} 
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-emerald-700 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-emerald-700/20">
            <span className="text-lg">DT</span>
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-sm md:text-base leading-tight flex items-center gap-1.5">
              <span>SIMKAS</span>
              <span className="hidden md:inline-block text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Darut Thalibin Telang</span>
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">Bangkalan, Madura</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 md:gap-4">
        {/* Simulasi MySQL / DB Center */}
        <button
          onClick={() => setIsDbModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          title="Pusat Database & SQL Simulator"
        >
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">MySQL / DB Center</span>
        </button>

        {/* Notifikasi Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotif(!showNotif);
              if (!showNotif && unreadCount > 0) markAllNotifRead();
            }}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition relative"
            title="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 py-3 px-4 z-50 animate-slideDown">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2.5">
                <h3 className="font-bold text-slate-800 text-sm">Notifikasi Sistem</h3>
                <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">{notifikasis.length} Total</span>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {notifikasis.map((n) => (
                  <div key={n.id} className="p-2.5 hover:bg-slate-50 rounded-xl transition">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-xs text-slate-800">{n.title}</p>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">{n.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Ganti Akun / Info Portal Button */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="flex items-center gap-2 text-slate-700">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/20 shadow-xs"
            />
            <div className="text-left hidden xl:block">
              <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[130px]">{currentUser.name.split(' ')[0]}</p>
              <p className="text-[10px] text-slate-500 mt-0.5 capitalize font-medium">{role === 'admin' ? 'Pengurus' : role === 'santri' ? 'Santri' : 'Wali Santri'}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-1.5 font-bold text-xs"
            title="Keluar dari Akun"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
