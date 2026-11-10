import React, { useState } from 'react';
import { useSimkas } from '../context/SimkasContext';
import { AbsensiStatus } from '../types/simkas';
import { Calendar, Clock, MapPin, QrCode } from 'lucide-react';

export const KegiatanView: React.FC = () => {
  const { role, kegiatans, santris, absensis, addAbsensi, quickScanRFID, showToast } = useSimkas();
  const [activeTab, setActiveTab] = useState<'jadwal' | 'scan' | 'manual' | 'riwayat'>('jadwal');
  
  // Quick scan RFID state
  const [scanInput, setScanInput] = useState('');
  const [selectedKegiatanId, setSelectedKegiatanId] = useState('k1');

  // Manual logger state
  const [manualKegId, setManualKegId] = useState('k1');
  const [manualSantriId, setManualSantriId] = useState(santris[0]?.id || '');
  const [manualStatus, setManualStatus] = useState<AbsensiStatus>('hadir');
  const [manualKeterangan, setManualKeterangan] = useState('');

  // History filter state
  const [filterDate, setFilterDate] = useState(new Date().toISOString().substring(0, 10));
  const [filterStatus, setFilterStatus] = useState<string>('Semua');

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;
    if (quickScanRFID(scanInput.trim(), selectedKegiatanId)) {
      setScanInput('');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetSantri = santris.find(s => s.id === manualSantriId);
    const targetKegiatan = kegiatans.find(k => k.id === manualKegId);
    if (!targetSantri || !targetKegiatan) return showToast('Pilih santri dan kegiatan dengan benar', 'error');

    // Check duplicate
    const exists = absensis.find(a => a.santriId === manualSantriId && a.kegiatanId === manualKegId && a.tanggal === filterDate);
    if (exists) {
      return showToast(`Santri ${targetSantri.name} sudah tercatat pada tanggal ${filterDate}`, 'warning');
    }

    addAbsensi({
      kegiatanId: manualKegId,
      kegiatanNama: targetKegiatan.nama,
      tanggal: filterDate,
      santriId: manualSantriId,
      santriNama: targetSantri.name,
      status: manualStatus,
      keterangan: manualKeterangan,
      dicatatOleh: role === 'admin' ? 'Pengurus / Admin' : 'Ketua Kamar'
    });

    setManualKeterangan('');
  };

  const filteredHistory = absensis.filter(a => {
    const matchDate = a.tanggal === filterDate;
    const matchStatus = filterStatus === 'Semua' || a.status === filterStatus;
    return matchDate && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800">📅 Jadwal Kegiatan Wajib & Pencatatan Absensi</h2>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan kehadiran jamaah sholat, pengajian kitab kuning, dan khidmah pondok secara real-time.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-2xl self-start sm:self-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('jadwal')}
            className={`px-3 py-2 rounded-xl transition ${activeTab === 'jadwal' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Jadwal Rutin
          </button>
          
          {role === 'admin' && (
            <>
              <button
                onClick={() => setActiveTab('scan')}
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1 ${activeTab === 'scan' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                <span>Simulasi Scan RFID</span>
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`px-3 py-2 rounded-xl transition ${activeTab === 'manual' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Input Manual
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('riwayat')}
            className={`px-3 py-2 rounded-xl transition ${activeTab === 'riwayat' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Rekap Kehadiran
          </button>
        </div>
      </div>

      {/* Tab 1: Jadwal */}
      {activeTab === 'jadwal' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {kegiatans.map(k => (
            <div key={k.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase ${
                    k.kategori === 'jamaah' ? 'bg-emerald-100 text-emerald-800' :
                    k.kategori === 'kajian' ? 'bg-blue-100 text-blue-800' :
                    k.kategori === 'khidmah' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {k.kategori}
                  </span>
                  {k.wajib && (
                    <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Wajib Santri
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-base text-slate-800 leading-snug mb-2">{k.nama}</h3>
                
                <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Hari: <strong>{k.hari}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Waktu: <strong>{k.waktu}</strong> ({k.durasi})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Tempat: <strong>{k.tempat}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                    <span>Pengampu: <strong>{k.pengampu}</strong></span>
                  </div>
                </div>
              </div>

              {role === 'admin' && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => { setSelectedKegiatanId(k.id); setActiveTab('scan'); }}
                    className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 transition"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Buka Scanner</span>
                  </button>
                  <button
                    onClick={() => { setManualKegId(k.id); setActiveTab('manual'); }}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold text-center transition"
                  >
                    Input Manual
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Simulasi Scan RFID */}
      {activeTab === 'scan' && role === 'admin' && (
        <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-200 max-w-2xl mx-auto shadow-sm text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <QrCode className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-extrabold text-slate-800">Simulasi RFID / Barcode Scanner Absensi</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
            Dalam implementasi nyata, santri menempelkan Kartu RFID ke perangkat reader atau memindai QR Code di gerbang masjid/aula. Silakan pilih kegiatan dan ketik NIS atau nama santri untuk mensimulasikan tap kartu.
          </p>

          <form onSubmit={handleScanSubmit} className="mt-6 space-y-4 max-w-md mx-auto text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Pilih Kegiatan Wajib Saat Ini</label>
              <select
                value={selectedKegiatanId}
                onChange={(e) => setSelectedKegiatanId(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {kegiatans.map(k => (
                  <option key={k.id} value={k.id}>{k.nama} ({k.waktu})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Input Barcode / NIS / Nama Santri</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  value={scanInput}
                  onChange={(e) => setScanInput(e.target.value)}
                  placeholder="Ketik NIS (misal: 230411100062 atau David)..."
                  className="w-full p-3 pl-4 pr-24 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-sm"
                >
                  Tap RFID
                </button>
              </div>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 flex justify-center gap-2 flex-wrap">
            <span className="text-[11px] text-slate-400 self-center">Contoh Cepat Tap:</span>
            {santris.slice(0, 5).map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  quickScanRFID(s.nis, selectedKegiatanId);
                }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 rounded-lg text-xs font-bold font-mono transition"
              >
                {s.name.split(' ')[0]} ({s.nis.slice(-3)})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Manual Input */}
      {activeTab === 'manual' && role === 'admin' && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 max-w-3xl mx-auto shadow-sm">
          <h3 className="font-extrabold text-base text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
            <span>📝 Input Absensi Manual Santri</span>
          </h3>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Absensi</label>
                <input
                  type="date"
                  required
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Kegiatan</label>
                <select
                  value={manualKegId}
                  onChange={(e) => setManualKegId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {kegiatans.map(k => (
                    <option key={k.id} value={k.id}>{k.nama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Santri</label>
                <select
                  value={manualSantriId}
                  onChange={(e) => setManualSantriId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {santris.filter(s => s.statusAktif).map(s => (
                    <option key={s.id} value={s.id}>{s.name} - Kamar {s.kamar} ({s.nis})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Kehadiran</label>
                <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                  {(['hadir', 'izin', 'sakit', 'alpha'] as AbsensiStatus[]).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setManualStatus(st)}
                      className={`p-2 rounded-xl text-xs font-bold uppercase transition text-center ${
                        manualStatus === st
                          ? st === 'hadir' ? 'bg-emerald-600 text-white shadow-sm' :
                            st === 'izin' ? 'bg-amber-500 text-slate-900 shadow-sm' :
                            st === 'sakit' ? 'bg-blue-600 text-white shadow-sm' : 'bg-rose-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan / Alasan (Jika Izin/Sakit)</label>
                <input
                  type="text"
                  value={manualKeterangan}
                  onChange={(e) => setManualKeterangan(e.target.value)}
                  placeholder="Misal: Surat dokter terlampir, pulang kampung, dll."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-700/25 transition mt-4"
            >
              Simpan Catatan Absensi
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Riwayat / Log Kehadiran */}
      {activeTab === 'riwayat' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-800">📋 Log Rekapitulasi Absensi Harian</h3>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
              >
                <option value="Semua">Semua Status</option>
                <option value="hadir">Hadir</option>
                <option value="izin">Izin</option>
                <option value="sakit">Sakit</option>
                <option value="alpha">Alpha</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Waktu & Tanggal</th>
                  <th className="py-3 px-4">Nama Santri</th>
                  <th className="py-3 px-4">Kegiatan Wajib</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Keterangan</th>
                  <th className="py-3 px-4 text-right">Metode Pencatat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      Tidak ada catatan absensi untuk filter yang dipilih.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 text-slate-500 font-mono">{a.timestamp || `${a.tanggal} 04:30:00`}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{a.santriNama}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{a.kegiatanNama}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase ${
                          a.status === 'hadir' ? 'bg-emerald-100 text-emerald-800' :
                          a.status === 'izin' ? 'bg-amber-100 text-amber-800' :
                          a.status === 'sakit' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 italic text-slate-500">{a.keterangan || '-'}</td>
                      <td className="py-3.5 px-4 text-right text-slate-500 text-[11px] font-semibold">{a.dicatatOleh}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
