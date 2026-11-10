import React, { useState } from 'react';
import { useSimkas } from '../context/SimkasContext';
import { Check, X, Clock, FileText, Send, AlertTriangle, Calendar } from 'lucide-react';

export const PerizinanView: React.FC = () => {
  const { role, currentUser, perizinans, santris, submitIzin, verifyIzin, showToast } = useSimkas();
  const [filterStatus, setFilterStatus] = useState<string>('Semua');

  // Form state for santri submission
  const [jenis, setJenis] = useState<'keluar' | 'pulang'>('keluar');
  const [tglBerangkat, setTglBerangkat] = useState('');
  const [tglKembali, setTglKembali] = useState('');
  const [alasan, setAlasan] = useState('');

  // Reject modal state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const mySantriInfo = santris.find(s => s.id === currentUser.id) || { name: currentUser.name, kamar: 'A-01' };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tglBerangkat || !tglKembali || !alasan) {
      return showToast('Lengkapi seluruh tanggal dan alasan perizinan', 'error');
    }
    if (new Date(tglBerangkat) > new Date(tglKembali)) {
      return showToast('Tanggal kembali tidak boleh lebih awal dari keberangkatan', 'error');
    }

    submitIzin({
      santriId: currentUser.id,
      santriNama: mySantriInfo.name,
      kamar: mySantriInfo.kamar,
      jenis,
      tglBerangkat,
      tglKembali,
      alasan
    });

    setTglBerangkat('');
    setTglKembali('');
    setAlasan('');
  };

  const handleApprove = (id: string) => {
    verifyIzin(id, true, 'Telah diverifikasi dan disetujui pengurus. Harap menjaga nama baik almamater pondok.');
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim() && rejectingId) {
      return showToast('Alasan penolakan wajib diisi untuk transparansi santri/wali', 'error');
    }
    if (rejectingId) {
      verifyIzin(rejectingId, false, rejectReason);
      setRejectingId(null);
      setRejectReason('');
    }
  };

  const displayedList = perizinans.filter(p => {
    const matchUser = role === 'admin' || p.santriId === currentUser.id;
    const matchStatus = filterStatus === 'Semua' || p.status === filterStatus;
    return matchUser && matchStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800">📝 Modul Perizinan Keluar / Pulang Santri</h2>
          <p className="text-xs text-slate-500 mt-1">
            Mekanisme pengajuan dan verifikasi perizinan santri secara terpusat, transparan, dan terdokumentasi dengan baik.
          </p>
        </div>

        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold self-start md:self-auto">
          {['Semua', 'pending', 'disetujui', 'ditolak'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-2 rounded-xl capitalize transition ${
                filterStatus === st ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'Semua' ? 'Semua Status' : st}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Submission Form (For Santri) or Admin Info Card */}
        <div className="lg:col-span-1 space-y-6">
          {role === 'santri' ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <h3 className="font-extrabold text-sm text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-700" />
                <span>Form Pengajuan Izin Baru</span>
              </h3>

              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-bold text-slate-700">
                <div>
                  <label className="block mb-1.5">Jenis Izin</label>
                  <select
                    value={jenis}
                    onChange={(e) => setJenis(e.target.value as 'keluar' | 'pulang')}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="keluar">🚶‍♂️ Izin Keluar Pondok Singkat</option>
                    <option value="pulang">🏠 Izin Pulang Kampung / Nginap</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1.5">Mulai Berangkat</label>
                    <input
                      type="date"
                      required
                      value={tglBerangkat}
                      onChange={(e) => setTglBerangkat(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5">Tanggal Kembali</label>
                    <input
                      type="date"
                      required
                      value={tglKembali}
                      onChange={(e) => setTglKembali(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1.5">Alasan / Kepentingan Lengkap</label>
                  <textarea
                    rows={3}
                    required
                    value={alasan}
                    onChange={(e) => setAlasan(e.target.value)}
                    placeholder="Tuliskan tujuan dan alasan yang jelas agar pengurus dapat memverifikasi..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-lg shadow-emerald-700/25 transition flex items-center justify-center gap-2 mt-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Surat Pengajuan</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-sm">Panel Pengawas Perizinan</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {role === 'admin' 
                  ? 'Sebagai pengurus, Anda berwenang memvalidasi alasan izin keluar/pulang santri. Apabila menolak, berikan catatan perbaikan yang mendidik.' 
                  : 'Sebagai wali santri, Anda dapat memantau kapan putra Anda mengajukan izin pulang atau keluar lingkungan pesantren secara real-time.'}
              </p>

              <div className="bg-white/10 rounded-2xl p-4 border border-white/10 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Menunggu Persetujuan:</span>
                  <span className="font-bold text-amber-300">
                    {perizinans.filter(p => p.status === 'pending').length} Santri
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Telah Disetujui:</span>
                  <span className="font-bold text-emerald-400">
                    {perizinans.filter(p => p.status === 'disetujui').length} Santri
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: List of Requests */}
        <div className="lg:col-span-2 space-y-4">
          {displayedList.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 font-medium">
              Tidak ada data pengajuan perizinan yang sesuai dengan filter.
            </div>
          ) : (
            displayedList.map(p => {
              const isPending = p.status === 'pending';
              const isApproved = p.status === 'disetujui';

              return (
                <div key={p.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase ${
                        isPending ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        isApproved ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {p.status}
                      </span>
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {p.tglPengajuan}
                      </span>
                    </div>

                    <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-extrabold uppercase tracking-wide">
                      {p.jenis === 'keluar' ? '🚶‍♂️ Izin Keluar Singkat' : '🏠 Izin Pulang Kampung'}
                    </span>
                  </div>

                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-base text-slate-800">{p.santriNama}</h4>
                      <p className="text-xs text-emerald-700 font-bold">Kamar Asrama: {p.kamar}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium pt-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Periode: <strong>{p.tglBerangkat}</strong> s/d <strong>{p.tglKembali}</strong></span>
                      </div>
                    </div>

                    {role === 'admin' && isPending && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleApprove(p.id)}
                          className="py-2 px-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                        >
                          <Check className="w-4 h-4" />
                          <span>Setujui</span>
                        </button>
                        <button
                          onClick={() => { setRejectingId(p.id); setRejectReason(''); }}
                          className="py-2 px-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                        >
                          <X className="w-4 h-4" />
                          <span>Tolak</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
                    <strong className="text-slate-900 block mb-0.5">Alasan Perizinan:</strong>
                    {p.alasan}
                  </div>

                  {p.catatanAdmin && (
                    <div className={`p-3 rounded-2xl text-xs font-medium ${
                      isApproved ? 'bg-emerald-50/80 text-emerald-900 border border-emerald-200' : 'bg-rose-50 text-rose-900 border border-rose-200'
                    }`}>
                      <strong className="block mb-0.5">Catatan Pengurus ({p.diverifikasiOleh || 'Admin'}):</strong>
                      {p.catatanAdmin}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Rejection Note Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 p-6">
            <h3 className="font-extrabold text-base text-slate-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>Berikan Alasan Penolakan Izin</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              SKPL mewajibkan adanya alasan penolakan yang transparan agar santri atau wali santri mengetahui alasan pengajuan tidak disetujui.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                autoFocus
                required
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Misal: Bertabrakan dengan jadwal piket wajib, atau sedang masa ujian pesantren..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none font-medium leading-relaxed"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  className="py-2.5 px-4 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/20"
                >
                  Konfirmasi Tolak Izin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
