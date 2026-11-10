import React from 'react';
import { useSimkas } from '../context/SimkasContext';
import { LayoutDashboard, Users, CalendarDays, FileText, CreditCard, BarChart3, LogOut, ShieldCheck, UserCircle, ShieldAlert, Wallet, Coins } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role, currentView, setCurrentView, currentUser, logout } = useSimkas();

  const handleNav = (view: string) => {
    setCurrentView(view);
    onClose();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard, roles: ['admin', 'santri', 'ortu'] },
    { id: 'santris', label: 'Data Induk Santri', icon: Users, roles: ['admin'] },
    { id: 'kegiatan', label: 'Kegiatan & Absensi', icon: CalendarDays, roles: ['admin', 'santri'] },
    { id: 'perizinan', label: 'Pengajuan & Verifikasi Izin', icon: FileText, roles: ['admin', 'santri', 'ortu'] },
    { id: 'kedisiplinan', label: 'Kedisiplinan & Pelanggaran', icon: ShieldAlert, roles: ['admin', 'santri', 'ortu'] },
    { id: 'spp', label: role === 'admin' ? 'Persetujuan SPP Santri' : 'Tagihan SPP (1/3/Semester)', icon: CreditCard, roles: ['admin', 'santri', 'ortu'] },
    { id: 'kas-santri', label: role === 'admin' ? 'Persetujuan Kas Santri' : 'Iuran Kas Santri', icon: Coins, roles: ['admin', 'santri', 'ortu'] },
    { id: 'kas-operasional', label: 'Buku Kas Operasional', icon: Wallet, roles: ['admin'] },
    { id: 'laporan', label: 'Laporan Rekap Bulanan', icon: BarChart3, roles: ['admin'] },
    { id: 'profil', label: 'Kartu Tanda Santri', icon: UserCircle, roles: ['santri'] }
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside className={`fixed lg:relative top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-200 flex flex-col transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        {/* App Title in Sidebar for Mobile */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-700 rounded-xl flex items-center justify-center text-white font-bold">
              <span className="text-sm">DT</span>
            </div>
            <span className="font-bold text-slate-800 text-base">SIMKAS Pondok</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">✕</button>
        </div>

        {/* User Card */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-100 m-3 rounded-2xl">
          <div className="flex items-center gap-3 mb-2.5">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-600/30 shadow-sm"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold text-slate-800 truncate">{currentUser.name}</p>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5">
                {role === 'admin' ? 'Pengurus / Admin' : role === 'santri' ? 'Santri UTM' : 'Wali Santri'}
              </span>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full text-center py-1.5 px-3 bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 shadow-xs transition"
          >
            Keluar Akun / Login Ulang
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">MENU UTAMA</p>
          {filteredItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-700'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-100 bg-white">
          <div className="p-3 bg-gradient-to-br from-emerald-700 to-teal-900 rounded-2xl text-white mb-3 shadow-md">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span className="text-xs font-extrabold">SKPL Kelompok 9</span>
            </div>
            <p className="text-[10px] text-emerald-100/80 leading-relaxed">
              Teknik Informatika UTM 2026. Dosen: Achmad Jauhari S.T., M.Kom.
            </p>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Aplikasi</span>
          </button>
        </div>
      </aside>
    </>
  );
};
