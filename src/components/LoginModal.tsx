import React, { useState } from 'react';
import { useSimkas } from '../context/SimkasContext';
import { Role } from '../types/simkas';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, isLoggedIn, login, role } = useSimkas();
  const [selectedRole, setSelectedRole] = useState<Role>(role);
  const [emailInput, setEmailInput] = useState('jauhari@trunojoyo.ac.id');
  const [passwordInput, setPasswordInput] = useState('admin123');

  if (!isLoginModalOpen) return null;

  const handleQuickSelect = (r: Role) => {
    setSelectedRole(r);
    if (r === 'admin') {
      setEmailInput('jauhari@trunojoyo.ac.id');
      setPasswordInput('admin123');
    } else if (r === 'santri') {
      setEmailInput('david@santri.darutthalibin.id');
      setPasswordInput('santri123');
    } else if (r === 'ortu') {
      setEmailInput('rahmat.wali@gmail.com');
      setPasswordInput('ortu123');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(emailInput, passwordInput);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-scaleUp">
        <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 p-6 text-white text-center relative">
          {isLoggedIn && (
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition"
            >
              ✕
            </button>
          )}
          
          <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center text-emerald-800 font-black text-2xl shadow-xl mb-3">
            DT
          </div>
          <h2 className="text-xl font-bold">Portal Autentikasi SIMKAS</h2>
          <p className="text-xs text-emerald-100/80 mt-1">
            Pondok Pesantren Mahasiswa Darut Thalibin Telang
          </p>
        </div>

        <div className="p-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">
            Pilih Peran Demo Cepat
          </p>

          <div className="grid grid-cols-3 gap-2.5 mb-6">
            <button
              type="button"
              onClick={() => handleQuickSelect('admin')}
              className={`p-3 rounded-2xl border text-center transition ${
                selectedRole === 'admin'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold ring-2 ring-emerald-500/20'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold'
              }`}
            >
              <span className="text-xl block mb-1">👨‍💼</span>
              <span className="text-xs block">Pengurus</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelect('santri')}
              className={`p-3 rounded-2xl border text-center transition ${
                selectedRole === 'santri'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold ring-2 ring-emerald-500/20'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold'
              }`}
            >
              <span className="text-xl block mb-1">👳‍♂️</span>
              <span className="text-xs block">Santri</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSelect('ortu')}
              className={`p-3 rounded-2xl border text-center transition ${
                selectedRole === 'ortu'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold ring-2 ring-emerald-500/20'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold'
              }`}
            >
              <span className="text-xl block mb-1">👥</span>
              <span className="text-xs block">Wali Santri</span>
            </button>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Alamat Email Pengguna</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="user@pondok.id"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1.5">Kata Sandi (Password)</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-50 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-lg shadow-emerald-700/25 transition"
            >
              <span>Autentikasi & Masuk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-left space-y-2">
            <p className="text-[11px] font-extrabold text-slate-700">🔐 Daftar Kredensial Akses Akun Demo:</p>
            <div className="space-y-1 text-[11px] text-slate-600 font-medium bg-white p-2.5 rounded-xl border border-slate-200">
              <div>👨‍💼 <strong className="text-slate-900">Pengurus:</strong> <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800">jauhari@trunojoyo.ac.id</code> (Pass: <code className="font-bold text-slate-800">admin123</code>)</div>
              <div>👳‍♂️ <strong className="text-slate-900">Santri:</strong> <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800">david@santri.darutthalibin.id</code> (Pass: <code className="font-bold text-slate-800">santri123</code>)</div>
              <div>👥 <strong className="text-slate-900">Wali:</strong> <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800">rahmat.wali@gmail.com</code> (Pass: <code className="font-bold text-slate-800">ortu123</code>)</div>
            </div>
            <p className="text-[10px] text-slate-400 italic text-center">Catatan: Gunakan tombol cepat di atas atau ketik email & sandi dengan benar.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
