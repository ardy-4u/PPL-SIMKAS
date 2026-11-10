import React, { useState, useEffect } from 'react';
import { useSimkas } from '../context/SimkasContext';
import { Users, FileText, CreditCard, ArrowRight, TrendingUp, Sparkles, UserCheck, Coins, Clock } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    role, 
    currentUser, 
    santris, 
    perizinans, 
    keuangans, 
    absensis, 
    pelanggarans, 
    kasOperasionals, 
    setCurrentView,
    addAbsensi,
    showToast
  } = useSimkas();

  // Live ticking clock (seconds)
  const [clock, setClock] = useState<Date>(new Date());
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setClock(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalSantri = santris.filter(s => s.statusAktif).length;
  const pendingIzin = perizinans.filter(p => p.status === 'pending').length;
  const pendingKeu = keuangans.filter(k => k.status === 'pending').length;
  const pendingHukuman = pelanggarans.filter(p => p.statusHukuman !== 'selesai').length;
  
  // Kas calculation
  const totalMasukKas = kasOperasionals.filter(k => k.tipe === 'masuk').reduce((sum, item) => sum + item.nominal, 0);
  const totalKeluarKas = kasOperasionals.filter(k => k.tipe === 'keluar').reduce((sum, item) => sum + item.nominal, 0);
  const saldoKas = totalMasukKas - totalKeluarKas;

  // Real-time formatted strings
  const liveTimeString = clock.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
  const liveDateString = clock.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const todayStr = clock.toISOString().substring(0, 10);

  // Today's attendance summary (truly real-time)
  const todayRecords = absensis.filter(a => a.tanggal === todayStr);
  const activeRecords = todayRecords.length > 0 ? todayRecords : absensis;

  const hadirCount = activeRecords.filter(a => a.status === 'hadir').length;
  const izinCount = activeRecords.filter(a => a.status === 'izin').length;
  const sakitCount = activeRecords.filter(a => a.status === 'sakit').length;
  const alphaCount = activeRecords.filter(a => a.status === 'alpha').length;
  const totalRecorded = (hadirCount + izinCount + sakitCount + alphaCount) || santris.length || 1;
  const attendanceRate = Math.round((hadirCount / totalRecorded) * 100);

  // Proportional percentages for exact bar rendering
  const hadirPct = ((hadirCount / totalRecorded) * 100).toFixed(1);
  const izinPct = ((izinCount / totalRecorded) * 100).toFixed(1);
  const sakitPct = ((sakitCount / totalRecorded) * 100).toFixed(1);
  const alphaPct = ((alphaCount / totalRecorded) * 100).toFixed(1);

  // Latest 3 real-time RFID taps
  const latestTaps = activeRecords.slice(0, 3);

  // Interactive Live RFID Tap Simulation
  const handleSimulateRfidTap = () => {
    setIsSimulating(true);
    const randomSantri = santris[Math.floor(Math.random() * santris.length)] || santris[0];
    const timeStr = clock.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    addAbsensi({
      kegiatanId: 'k1',
      kegiatanNama: 'Sholat Berjamaah & Wirid Rutin',
      tanggal: todayStr,
      santriId: randomSantri.id,
      santriNama: randomSantri.name,
      status: 'hadir',
      dicatatOleh: 'Sistem RFID Gate 1 (Live Gateway)',
      keterangan: `Live tap-in RFID santri pukul ${timeStr} WIB`
    });

    showToast(`📡 [RFID Gate 1] ${randomSantri.name} (${randomSantri.kamar}) tap-in hadir pada ${timeStr} WIB!`, 'success');
    setTimeout(() => setIsSimulating(false), 600);
  };

  // Filter for santri role
  const myKeu = keuangans.filter(k => k.santriId === currentUser.id);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute right-40 -top-20 w-48 h-48 bg-emerald-500/20 rounded-full blur-xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 md:gap-6">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-emerald-500/30 text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30 backdrop-blur-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>SIMKAS v2.0</span>
                </span>
                <span className="text-xs text-emerald-200">Pondok Pesantren Darut Thalibin Telang</span>
              </div>
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
                Selamat Datang, {currentUser.name} 👋
              </h2>
              <p className="text-xs md:text-sm text-emerald-100/90 mt-1 max-w-xl leading-relaxed">
                {role === 'admin' && 'Sistem Informasi Manajemen Kegiatan dan Administrasi Santri (SKPL Kelompok 9). Seluruh modul beroperasi dalam mode terintegrasi 24 jam.'}
                {role === 'santri' && 'Anda terdaftar sebagai santri aktif di kamar A-01. Harap lakukan absensi kegiatan wajib dan pastikan tagihan bulanan telah terverifikasi.'}
                {role === 'ortu' && 'Memantau aktivitas, absensi real-time, dan status pembayaran dari ananda David Febrianto (NIM: 230411100062).'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            {role === 'admin' && (
              <>
                <button
                  onClick={() => setCurrentView('perizinan')}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <FileText className="w-4 h-4" />
                  <span>Izin Pending ({pendingIzin})</span>
                </button>
                <button
                  onClick={() => setCurrentView('spp')}
                  className="px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-900 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Verifikasi SPP & Kas ({pendingKeu})</span>
                </button>
              </>
            )}
            {role === 'santri' && (
              <button
                onClick={() => setCurrentView('profil')}
                className="px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-900 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg"
              >
                <UserCheck className="w-4 h-4" />
                <span>Kartu Tanda Santri (KTS)</span>
              </button>
            )}
            {role === 'ortu' && (
              <button
                onClick={() => setCurrentView('spp')}
                className="px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-900 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg"
              >
                <CreditCard className="w-4 h-4" />
                <span>Tagihan SPP (1/3/Semester)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-slate-500 uppercase">Total Santri Aktif</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-800">{totalSantri}</span>
            <span className="text-xs text-emerald-600 font-bold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> 100%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Terbagi di 4 kamar asrama</p>
        </div>

        {/* Stat 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-slate-500 uppercase">Izin Keluar / Pulang</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-800">
              {role === 'admin' ? pendingIzin : myKeu.length}
            </span>
            <span className="text-xs text-amber-600 font-bold">
              {role === 'admin' ? 'Perlu Validasi' : 'Total Riwayat Saya'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Sistem persetujuan digital</p>
        </div>

        {/* Stat 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-slate-500 uppercase">Tingkat Kehadiran Realtime</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-800">{attendanceRate}%</span>
            <span className="text-xs text-blue-600 font-bold">Live Sensor</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Sholat Jamaah & Kajian Wajib</p>
        </div>

        {/* Stat 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-slate-500 uppercase">Verifikasi Keuangan</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-800">
              {role === 'admin' ? pendingKeu : myKeu.filter(k => k.status === 'lunas').length}
            </span>
            <span className="text-xs text-purple-600 font-bold">
              {role === 'admin' ? 'Menunggu Validasi' : 'Transaksi Lunas'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Tagihan SPP & Iuran Kas Santri</p>
        </div>
      </div>

      {/* Attendance summary bar (BENAR-BENAR REAL-TIME) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <span>📊 Pemantauan Kehadiran Real-time Hari Ini</span>
              </h3>
              <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-3 py-1 rounded-full border border-emerald-300 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                <span>LIVE • {liveTimeString}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {liveDateString} &bull; Gerbang RFID & Masjid PPM Darut Thalibin Telang (Sensor Online)
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              onClick={handleSimulateRfidTap}
              disabled={isSimulating}
              className={`px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 ${
                isSimulating ? 'opacity-80 ring-2 ring-emerald-400' : ''
              }`}
              title="Klik untuk mensimulasikan tap kartu RFID santri real-time"
            >
              <span>⚡</span>
              <span>{isSimulating ? 'Memproses Tap RFID...' : 'Simulasi Tap RFID Real-Time'}</span>
            </button>

            <button
              onClick={() => setCurrentView('kegiatan')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition"
            >
              <span>Lihat Log & Input Absen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* PROGRESS BAR PROPORTIONAL 100% */}
        <div className="space-y-1.5">
          <div className="h-6 rounded-full overflow-hidden bg-slate-100 flex p-0.5 border border-slate-200 shadow-inner">
            {hadirCount > 0 && (
              <div 
                style={{ width: `${hadirPct}%` }} 
                className="bg-emerald-600 h-full rounded-l-full transition-all duration-700 flex items-center justify-center text-[10px] text-white font-extrabold overflow-hidden shadow-xs" 
                title={`Hadir: ${hadirCount} Santri (${hadirPct}%)`}
              >
                {parseFloat(hadirPct) >= 12 && `${hadirPct}% Hadir`}
              </div>
            )}
            {izinCount > 0 && (
              <div 
                style={{ width: `${izinPct}%` }} 
                className="bg-amber-400 h-full transition-all duration-700 flex items-center justify-center text-[10px] text-amber-950 font-extrabold overflow-hidden" 
                title={`Izin: ${izinCount} Santri (${izinPct}%)`}
              >
                {parseFloat(izinPct) >= 8 && `${izinPct}%`}
              </div>
            )}
            {sakitCount > 0 && (
              <div 
                style={{ width: `${sakitPct}%` }} 
                className="bg-blue-500 h-full transition-all duration-700 flex items-center justify-center text-[10px] text-white font-extrabold overflow-hidden" 
                title={`Sakit: ${sakitCount} Santri (${sakitPct}%)`}
              >
                {parseFloat(sakitPct) >= 8 && `${sakitPct}%`}
              </div>
            )}
            {alphaCount > 0 && (
              <div 
                style={{ width: `${alphaPct}%` }} 
                className="bg-rose-500 h-full rounded-r-full transition-all duration-700 flex items-center justify-center text-[10px] text-white font-extrabold overflow-hidden" 
                title={`Alpha: ${alphaCount} Santri (${alphaPct}%)`}
              >
                {parseFloat(alphaPct) >= 8 && `${alphaPct}%`}
              </div>
            )}
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold px-1">
            <span>0%</span>
            <span>Total Tercatat: {hadirCount + izinCount + sakitCount + alphaCount} Santri Aktif</span>
            <span>100%</span>
          </div>
        </div>

        {/* Breakdown 4 Status Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-emerald-50 rounded-2xl p-3.5 flex items-center gap-3 border border-emerald-100">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 shrink-0"></div>
            <div>
              <p className="text-xs font-bold text-slate-700">Hadir</p>
              <p className="text-sm font-extrabold text-emerald-800">{hadirCount} Santri ({hadirPct}%)</p>
            </div>
          </div>

          <div className="bg-amber-50 rounded-2xl p-3.5 flex items-center gap-3 border border-amber-100">
            <div className="w-3.5 h-3.5 rounded-full bg-amber-400 shrink-0"></div>
            <div>
              <p className="text-xs font-bold text-slate-700">Izin Keluar/Pulang</p>
              <p className="text-sm font-extrabold text-amber-800">{izinCount} Santri ({izinPct}%)</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-3.5 flex items-center gap-3 border border-blue-100">
            <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shrink-0"></div>
            <div>
              <p className="text-xs font-bold text-slate-700">Sakit</p>
              <p className="text-sm font-extrabold text-blue-800">{sakitCount} Santri ({sakitPct}%)</p>
            </div>
          </div>

          <div className="bg-rose-50 rounded-2xl p-3.5 flex items-center gap-3 border border-rose-100">
            <div className="w-3.5 h-3.5 rounded-full bg-rose-500 shrink-0"></div>
            <div>
              <p className="text-xs font-bold text-slate-700">Alpha (Tanpa Keterangan)</p>
              <p className="text-sm font-extrabold text-rose-800">{alphaCount} Santri ({alphaPct}%)</p>
            </div>
          </div>
        </div>

        {/* Live Ticker Feed */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="font-extrabold text-slate-700 shrink-0 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Aktivitas Tap RFID Terbaru:</span>
            </span>
            <div className="flex items-center gap-2 overflow-x-auto truncate text-[11px]">
              {latestTaps.map((t, idx) => (
                <span key={t.id || idx} className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg text-slate-600 whitespace-nowrap">
                  <strong>{t.santriNama}</strong> ({t.status.toUpperCase()}) &bull; <span className="font-mono text-emerald-700">{t.timestamp.split(' ')[1] || t.timestamp}</span>
                </span>
              ))}
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-mono shrink-0">Gateway Antena: Gate 1 & 2 Aktif</span>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => setCurrentView('perizinan')}
          className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-amber-400 hover:shadow-lg transition cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition duration-300">
                📝
              </div>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                {pendingIzin} Pending
              </span>
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm group-hover:text-amber-700 transition">
              {role === 'admin' ? 'Verifikasi Izin Santri' : 'Surat Izin Santri'}
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Pengajuan izin keluar/pulang digital dengan persetujuan pengurus.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-700 font-bold">
            <span>Buka E-Izin</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>

        <div 
          onClick={() => setCurrentView('spp')}
          className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-purple-400 hover:shadow-lg transition cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition duration-300">
                💳
              </div>
              <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                {pendingKeu} Verifikasi
              </span>
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm group-hover:text-purple-700 transition">
              {role === 'admin' ? 'Persetujuan SPP Santri' : 'Tagihan SPP (1/3/Semester)'}
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              {role === 'admin' 
                ? 'Validasi & setujui bukti transfer SPP santri paket 1 bln (250rb), 3 bln (750rb), atau semester (1.5jt).' 
                : 'Bayar SPP praktis per 1 bulan, per 3 bulan (triwulan), atau per semester dengan upload transfer.'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-purple-700 font-bold">
            <span>{role === 'admin' ? 'Persetujuan SPP' : 'Buka Pilihan SPP'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>

        <div 
          onClick={() => setCurrentView('kedisiplinan')}
          className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-rose-400 hover:shadow-lg transition cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition duration-300">
                🛡️
              </div>
              <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                {pendingHukuman} Ta'zir Aktif
              </span>
            </div>
            <h4 className="font-extrabold text-slate-800 text-sm group-hover:text-rose-700 transition">
              Kedisiplinan & Poin Sanksi
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Monitoring pelanggaran tata tertib, bobot poin, dan eksekusi sanksi santri.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-rose-700 font-bold">
            <span>Buka Disiplin</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </div>

        {role === 'admin' ? (
          <div 
            onClick={() => setCurrentView('kas-operasional')}
            className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-teal-400 hover:shadow-lg transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition duration-300">
                  💼
                </div>
                <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                  Buku Kas
                </span>
              </div>
              <h4 className="font-extrabold text-slate-800 text-sm group-hover:text-teal-700 transition">
                Buku Kas Operasional
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Saldo: <strong className="text-teal-700 font-mono">Rp {saldoKas.toLocaleString('id-ID')}</strong> (Mutasi debit & kredit internal).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-teal-700 font-bold">
              <span>Buka Kas</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>
        ) : (
          <div 
            onClick={() => setCurrentView('kas-santri')}
            className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-amber-400 hover:shadow-lg transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition duration-300">
                  <Coins className="w-5 h-5 text-amber-700" />
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                  Kas Kamar
                </span>
              </div>
              <h4 className="font-extrabold text-slate-800 text-sm group-hover:text-amber-700 transition">
                Iuran Kas Santri
              </h4>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Iuran kas kebersihan, WiFi, dan perawatan fasilitas kamar asrama (Rp 50.000/bln).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-700 font-bold">
              <span>Buka Kas Santri</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </div>
        )}
      </div>

      {/* Info Dosen & Tim SKPL */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-bold border border-emerald-500/30 shrink-0">
            🎓
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-100">Spesifikasi Kebutuhan Perangkat Lunak (SKPL) - Kelompok 9</h4>
            <p className="text-xs text-slate-400 mt-1">Dosen Pengampu: Achmad Jauhari S.T., M.Kom (NIP: 1981010920060410003)</p>
            <p className="text-[11px] text-emerald-400/90 mt-1 font-semibold">Anggota: David Febrianto (230411100062) · Moh. Yusuf Ardiansyah (240411100050) · Sulhan Humaidi (240411100058) · Anas (240411100200) · Yoga Andrian Febriyanto (240411100167)</p>
          </div>
        </div>
        <div className="bg-slate-800 px-4 py-2.5 rounded-2xl border border-slate-700 text-xs font-bold text-center shrink-0">
          <span className="text-slate-400">Prodi: </span>
          <span className="text-white">Teknik Informatika UTM '26</span>
        </div>
      </div>
    </div>
  );
};
