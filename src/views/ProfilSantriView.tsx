import React from 'react';
import { useSimkas } from '../context/SimkasContext';
import { QrCode, Shield } from 'lucide-react';

export const ProfilSantriView: React.FC = () => {
  const { currentUser, santris, absensis, perizinans, showToast } = useSimkas();

  const mySantri = santris.find(s => s.id === currentUser.id) || santris[0]; // fallback to David

  const myAbsen = absensis.filter(a => a.santriId === mySantri.id);
  const totalHadir = myAbsen.filter(a => a.status === 'hadir').length;
  const totalIzin = myAbsen.filter(a => a.status === 'izin').length;
  const totalSakit = myAbsen.filter(a => a.status === 'sakit').length;
  const totalAlpha = myAbsen.filter(a => a.status === 'alpha').length;
  const myRate = Math.round((totalHadir / (myAbsen.length || 1)) * 100) || 100;

  const myPerizinans = perizinans.filter(p => p.santriId === mySantri.id);

  const handleDownloadId = () => {
    window.print();
    showToast('Membuka mode cetak Kartu Tanda Santri Digital (KTS)...', 'success');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800">💳 Kartu Tanda Santri & QR Code Absensi</h2>
          <p className="text-xs text-slate-500 mt-1">Identitas digital santri Pondok Pesantren Mahasiswa Darut Thalibin Telang.</p>
        </div>
        <button
          onClick={handleDownloadId}
          className="py-2.5 px-5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-700/25 transition self-start sm:self-auto"
        >
          🖨️ Cetak / Download Kartu ID
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Digital ID Card */}
        <div className="lg:col-span-1 flex justify-center">
          <div className="w-full max-w-sm bg-gradient-to-b from-emerald-800 via-emerald-700 to-teal-900 rounded-3xl text-white shadow-2xl overflow-hidden border-4 border-white relative flex flex-col">
            {/* Header ID Card */}
            <div className="p-5 text-center bg-emerald-950/40 backdrop-blur-xs border-b border-white/10 relative">
              <div className="absolute top-4 left-4 text-emerald-400 font-black text-lg">DT</div>
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-300 block">KARTU TANDA SANTRI DIGITAL</span>
              <h3 className="font-extrabold text-sm mt-0.5">Pondok Pesantren Darut Thalibin</h3>
              <p className="text-[9px] text-emerald-200">Telang · Bangkalan · Madura</p>
            </div>

            {/* Body ID Card */}
            <div className="p-6 text-center space-y-4 flex-1">
              <div className="relative inline-block">
                <img
                  src={currentUser.avatar}
                  alt={mySantri.name}
                  className="w-28 h-28 rounded-2xl object-cover ring-4 ring-emerald-400/50 mx-auto shadow-xl"
                />
                <span className="absolute bottom-1 right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-black shadow-md" title="Aktif">
                  ✓
                </span>
              </div>

              <div>
                <h2 className="text-xl font-black text-white">{mySantri.name}</h2>
                <p className="text-xs text-emerald-200 font-mono font-bold mt-1 tracking-wider">{mySantri.nis}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-left bg-emerald-950/40 p-3.5 rounded-2xl border border-white/10 text-xs">
                <div>
                  <span className="text-[9px] text-emerald-300 uppercase block font-bold">Kamar Asrama</span>
                  <span className="font-extrabold text-white text-sm">{mySantri.kamar}</span>
                </div>
                <div>
                  <span className="text-[9px] text-emerald-300 uppercase block font-bold">Angkatan Masuk</span>
                  <span className="font-extrabold text-white text-sm">{mySantri.angkatan}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-white/10">
                  <span className="text-[9px] text-emerald-300 uppercase block font-bold">Fakultas / Program Studi</span>
                  <span className="font-bold text-white text-xs truncate block">{mySantri.fakultasUtm} - {mySantri.prodiUtm}</span>
                </div>
              </div>

              {/* QR Code Simulation */}
              <div className="bg-white text-slate-900 p-3.5 rounded-2xl inline-block shadow-inner mx-auto">
                <div className="w-32 h-32 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
                  <QrCode className="w-24 h-24 text-slate-900" />
                </div>
                <span className="text-[10px] font-extrabold text-slate-500 block text-center mt-1 font-mono">{mySantri.nis}</span>
              </div>
            </div>

            {/* Footer ID Card */}
            <div className="p-3 bg-emerald-950 text-center text-[10px] font-bold text-emerald-300 border-t border-white/10 flex items-center justify-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Berlaku selama menjadi santri aktif asrama</span>
            </div>
          </div>
        </div>

        {/* Attendance Summary and Leave History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Stats */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm pb-3 border-b border-slate-100 flex items-center gap-2">
              <span>📊 Rangkuman Kehadiran Kegiatan Wajib Saya</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                <span className="text-xs text-slate-600 font-bold block">Total Hadir</span>
                <span className="text-2xl font-extrabold text-emerald-800 block mt-1">{totalHadir}</span>
              </div>

              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-center">
                <span className="text-xs text-slate-600 font-bold block">Izin Resmi</span>
                <span className="text-2xl font-extrabold text-amber-800 block mt-1">{totalIzin}</span>
              </div>

              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
                <span className="text-xs text-slate-600 font-bold block">Sakit di Kamar</span>
                <span className="text-2xl font-extrabold text-blue-800 block mt-1">{totalSakit}</span>
              </div>

              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-center">
                <span className="text-xs text-slate-600 font-bold block">Alpha / Terlambat</span>
                <span className="text-2xl font-extrabold text-rose-800 block mt-1">{totalAlpha}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-700 text-white rounded-2xl text-center text-xs font-bold shadow-sm flex items-center justify-center gap-2">
              <span>Tingkat Kehadiran Kumulatif:</span>
              <span className="text-lg font-black">{myRate}%</span>
              <span>— {myRate >= 80 ? 'Sangat Baik ✅' : 'Perlu Ditingkatkan ⚠️'}</span>
            </div>
          </div>

          {/* Personal Leave History */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm pb-3 border-b border-slate-100 flex items-center gap-2">
              <span>📝 Riwayat Pengajuan Surat Izin Saya</span>
            </h3>

            {myPerizinans.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-400 font-medium">Belum ada riwayat pengajuan izin atas nama Anda.</p>
            ) : (
              <div className="space-y-3">
                {myPerizinans.map(p => (
                  <div key={p.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          p.status === 'disetujui' ? 'bg-emerald-100 text-emerald-800' :
                          p.status === 'ditolak' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {p.status}
                        </span>
                        <span className="text-slate-500 font-semibold">{p.tglBerangkat} s/d {p.tglKembali}</span>
                      </div>
                      <p className="text-slate-800 font-bold">{p.jenis === 'keluar' ? '🚶‍♂️ Izin Keluar Singkat' : '🏠 Izin Pulang Kampung'} · {p.alasan}</p>
                      {p.catatanAdmin && <p className="text-[11px] text-slate-600 mt-1 italic">💬 Catatan: &ldquo;{p.catatanAdmin}&rdquo;</p>}
                    </div>

                    <span className="text-[11px] text-slate-400 self-end sm:self-auto shrink-0 font-mono font-semibold">{p.tglPengajuan}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
