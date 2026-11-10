import React, { useState } from 'react';
import { useSimkas } from '../context/SimkasContext';
import { KategoriPelanggaran } from '../types/simkas';
import { ShieldAlert, AlertTriangle, CheckCircle2, Clock, Plus, Search, Filter, Trash2, Check, ShieldCheck, Download, AlertCircle } from 'lucide-react';

export const KedisiplinanView: React.FC = () => {
  const { role, currentUser, santris, pelanggarans, addPelanggaran, updateStatusHukuman, deletePelanggaran, showToast } = useSimkas();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [selectedSantriId, setSelectedSantriId] = useState(santris[0]?.id || '');
  const [jenisPelanggaran, setJenisPelanggaran] = useState('Bolos Sholat Subuh Berjamaah');
  const [kategori, setKategori] = useState<KategoriPelanggaran>('ringan');
  const [poin, setPoin] = useState<number>(10);
  const [tanggal, setTanggal] = useState(new Date().toISOString().substring(0, 10));
  const [bentukHukuman, setBentukHukuman] = useState("Membaca Al-Qur'an 1 Juz di Serambi Masjid & Ditegur Pembina Kamar");
  const [catatan, setCatatan] = useState('');

  // Preset Jenis Pelanggaran
  const PRESET_PELANGGARAN = [
    {
      nama: 'Bolos Sholat Subuh Berjamaah',
      kategori: 'ringan' as KategoriPelanggaran,
      poin: 10,
      hukuman: "Membaca Al-Qur'an 1 Juz di Serambi Masjid & Ditegur Pembina Kamar"
    },
    {
      nama: 'Terlambat Jam Malam Asrama (> 22:00 WIB)',
      kategori: 'ringan' as KategoriPelanggaran,
      poin: 5,
      hukuman: 'Piket Kebersihan Serambi Kamar selama 2 hari berturut-turut'
    },
    {
      nama: 'Bolos Kajian Kitab Wajib (Ta\'lim / Fiqih)',
      kategori: 'ringan' as KategoriPelanggaran,
      poin: 15,
      hukuman: 'Merangkum 1 bab kitab turats dan setoran hafalan kepada Asatidz'
    },
    {
      nama: 'Tidak Mengikuti Kerja Bakti Ro\'an Kebersihan Jumat',
      kategori: 'ringan' as KategoriPelanggaran,
      poin: 10,
      hukuman: 'Membersihkan Tempat Wudhu & Kamar Mandi Asrama'
    },
    {
      nama: 'Keluar Area Pondok Tanpa Surat Izin Resmi',
      kategori: 'sedang' as KategoriPelanggaran,
      poin: 25,
      hukuman: 'Membersihkan Aula Utama Pesantren & Menghafal Surat Al-Mulk'
    },
    {
      nama: 'Merokok / Vape di Lingkungan Pesantren',
      kategori: 'sedang' as KategoriPelanggaran,
      poin: 30,
      hukuman: 'Pemberian Surat Peringatan (SP-1) dan Ro\'an Khusus Lingkungan Pondok'
    },
    {
      nama: 'Perkelahian / Pelanggaran Berat / Asusila',
      kategori: 'berat' as KategoriPelanggaran,
      poin: 100,
      hukuman: 'Pemanggilan Wali Santri, Sidang Mahkamah Santri & Skorsing / Boyong'
    }
  ];

  const handleSelectPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const preset = PRESET_PELANGGARAN.find(p => p.nama === e.target.value);
    if (preset) {
      setJenisPelanggaran(preset.nama);
      setKategori(preset.kategori);
      setPoin(preset.poin);
      setBentukHukuman(preset.hukuman);
    } else {
      setJenisPelanggaran(e.target.value);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetSantri = santris.find(s => s.id === selectedSantriId);
    if (!targetSantri) return showToast('Pilih santri terlebih dahulu', 'error');

    addPelanggaran({
      santriId: targetSantri.id,
      santriNama: targetSantri.name,
      nis: targetSantri.nis,
      kamar: targetSantri.kamar,
      jenisPelanggaran,
      kategori,
      poin: Number(poin),
      tanggal,
      bentukHukuman,
      statusHukuman: 'belum',
      catatan,
      dicatatOleh: currentUser.name
    });

    setIsAddModalOpen(false);
    setCatatan('');
  };

  // Filter based on user role
  const displayRecords = pelanggarans.filter(p => {
    if (role === 'santri') return p.santriId === currentUser.id;
    if (role === 'ortu') {
      // Rahmat is wali of David Febrianto (s1)
      const david = santris.find(s => s.id === 's1');
      return p.santriId === david?.id;
    }
    return true;
  });

  const filteredRecords = displayRecords.filter(p => {
    const matchesSearch = p.santriNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.nis.includes(searchTerm) ||
                          p.jenisPelanggaran.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKategori = filterKategori === 'Semua' || p.kategori === filterKategori;
    const matchesStatus = filterStatus === 'Semua' || p.statusHukuman === filterStatus;
    return matchesSearch && matchesKategori && matchesStatus;
  });

  // Calculate stats
  const totalPelanggaran = displayRecords.length;
  const pendingHukuman = displayRecords.filter(p => p.statusHukuman === 'belum').length;
  const prosesHukuman = displayRecords.filter(p => p.statusHukuman === 'proses').length;
  const selesaiHukuman = displayRecords.filter(p => p.statusHukuman === 'selesai').length;

  // Calculate points per santri
  const santriPoinMap = santris.map(s => {
    const santriPel = pelanggarans.filter(p => p.santriId === s.id);
    const totalPoin = santriPel.reduce((sum, item) => sum + item.poin, 0);
    const belumSelesai = santriPel.filter(p => p.statusHukuman !== 'selesai').length;
    return {
      santri: s,
      totalPoin,
      belumSelesai,
      count: santriPel.length
    };
  }).sort((a, b) => b.totalPoin - a.totalPoin);

  const handleExportCsv = () => {
    const headers = ["ID", "NIS", "Nama Santri", "Kamar", "Tanggal", "Jenis Pelanggaran", "Kategori", "Bobot Poin", "Bentuk Hukuman", "Status Hukuman", "Dicatat Oleh"];
    const rows = filteredRecords.map(p => [
      p.id,
      p.nis,
      `"${p.santriNama}"`,
      p.kamar,
      p.tanggal,
      `"${p.jenisPelanggaran}"`,
      p.kategori.toUpperCase(),
      p.poin,
      `"${p.bentukHukuman}"`,
      p.statusHukuman.toUpperCase(),
      `"${p.dicatatOleh}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rekap_kedisiplinan_santri_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Rekap riwayat pelanggaran berhasil diexport ke CSV', 'success');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-800">Sistem Kedisiplinan & Pelanggaran Santri</h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">Poin & Sanksi</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan pelanggaran tata tertib pondok, monitoring penyelesaian hukuman/ta'zir, dan akumulasi bobot poin kedisiplinan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          {role === 'admin' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="py-2.5 px-4 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-700/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Pelanggaran</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-slate-500 uppercase">Total Kasus</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-800">{totalPelanggaran}</span>
            <span className="text-xs text-slate-500 font-semibold">Tercatat</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Seluruh riwayat kedisiplinan</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-rose-600 uppercase">Belum Dijalankan</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-rose-600">{pendingHukuman}</span>
            <span className="text-xs text-rose-600 font-semibold">Perlu Ditindak</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Hukuman belum dituntaskan</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-amber-600 uppercase">Sedang Menjalani</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-amber-600">{prosesHukuman}</span>
            <span className="text-xs text-amber-600 font-semibold">Dalam Proses</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Sedang menyelesaikan sanksi</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-emerald-600 uppercase">Hukuman Tuntas</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-extrabold text-emerald-600">{selesaiHukuman}</span>
            <span className="text-xs text-emerald-600 font-semibold">Selesai Ta'zir</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Telah diverifikasi pengurus</p>
        </div>
      </div>

      {/* Monitoring Poin Kedisiplinan Per Santri (Admin Mode) */}
      {role === 'admin' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <span>📊 Rekapitulasi Akumulasi Poin Kedisiplinan Santri</span>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-600 font-bold">Ranking Risiko</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Batas aman: &lt; 20 poin. Peringatan: 20-50 poin. Panggilan Wali / SP: &gt; 50 poin.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {santriPoinMap.slice(0, 4).map(item => {
              const isDanger = item.totalPoin >= 50;
              const isWarning = item.totalPoin >= 20 && item.totalPoin < 50;
              return (
                <div key={item.santri.id} className={`p-4 rounded-2xl border transition ${
                  isDanger ? 'bg-rose-50/70 border-rose-300' : isWarning ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-xs text-slate-800 truncate max-w-[140px]">{item.santri.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isDanger ? 'bg-rose-200 text-rose-800' : isWarning ? 'bg-amber-200 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.totalPoin} Poin
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Kamar: {item.santri.kamar}</span>
                    <span>{item.belumSelesai > 0 ? `${item.belumSelesai} Hukuman Aktif` : 'Bebas Hukuman'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama santri, NIS, atau jenis pelanggaran..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Kategori:</span>
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
            >
              <option value="Semua">Semua Kategori</option>
              <option value="ringan">Ringan (5-15 Poin)</option>
              <option value="sedang">Sedang (20-40 Poin)</option>
              <option value="berat">Berat (50-100 Poin)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <span>Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
            >
              <option value="Semua">Semua Status</option>
              <option value="belum">Belum Dijalankan</option>
              <option value="proses">Sedang Menjalani</option>
              <option value="selesai">Selesai / Tuntas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Records */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Santri</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Jenis Pelanggaran</th>
                <th className="py-3.5 px-4">Kategori & Poin</th>
                <th className="py-3.5 px-4">Bentuk Sanksi / Hukuman</th>
                <th className="py-3.5 px-4">Status Sanksi</th>
                {role === 'admin' && <th className="py-3.5 px-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={role === 'admin' ? 7 : 6} className="text-center py-12 text-slate-400">
                    <ShieldCheck className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-60" />
                    <span>Tidak ada catatan pelanggaran kedisiplinan yang ditemukan.</span>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((p) => {
                  const isRingan = p.kategori === 'ringan';
                  const isSedang = p.kategori === 'sedang';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition group">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{p.santriNama}</div>
                        <div className="text-[10px] text-slate-400 font-mono">NIS: {p.nis} &bull; Kamar: {p.kamar}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {p.tanggal}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{p.jenisPelanggaran}</div>
                        {p.catatan && (
                          <div className="text-[10px] text-slate-500 mt-0.5 italic">Catatan: {p.catatan}</div>
                        )}
                        <div className="text-[9px] text-slate-400 mt-0.5">Oleh: {p.dicatatOleh}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isRingan ? 'bg-blue-100 text-blue-800' : isSedang ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {p.kategori.toUpperCase()}
                          </span>
                          <span className="font-mono font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            +{p.poin} Poin
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-xs font-semibold text-slate-800 leading-relaxed">{p.bentukHukuman}</p>
                        {p.tglSelesai && (
                          <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">
                            Tuntas pada: {p.tglSelesai}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {p.statusHukuman === 'selesai' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Selesai
                          </span>
                        )}
                        {p.statusHukuman === 'proses' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3" /> Menjalani
                          </span>
                        )}
                        {p.statusHukuman === 'belum' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                            <AlertCircle className="w-3 h-3" /> Belum Dikerjakan
                          </span>
                        )}
                      </td>
                      {role === 'admin' && (
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition">
                            {p.statusHukuman !== 'selesai' && (
                              <button
                                onClick={() => updateStatusHukuman(p.id, 'selesai', 'Sanksi telah dituntaskan dengan tertib.')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition shadow-xs flex items-center gap-1"
                                title="Tandai Selesai"
                              >
                                <Check className="w-3 h-3" />
                                <span>Tuntas</span>
                              </button>
                            )}

                            {p.statusHukuman === 'belum' && (
                              <button
                                onClick={() => updateStatusHukuman(p.id, 'proses')}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-[11px] transition shadow-xs"
                                title="Sedang Menjalani"
                              >
                                Proses
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (window.confirm(`Hapus catatan pelanggaran ${p.santriNama}?`)) {
                                  deletePelanggaran(p.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Hapus Catatan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Input Pelanggaran Baru (Admin) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-scaleUp">
            <div className="bg-rose-700 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-200" />
                <span>Pencatatan Pelanggaran Kedisiplinan Santri</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white/70 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Santri yang Melanggar</label>
                <select
                  value={selectedSantriId}
                  onChange={(e) => setSelectedSantriId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-rose-500/20"
                >
                  {santris.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.nis}) &bull; Kamar {s.kamar}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Template Jenis Pelanggaran (Auto-fill)</label>
                <select
                  onChange={handleSelectPreset}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-rose-500/20"
                >
                  {PRESET_PELANGGARAN.map((preset, idx) => (
                    <option key={idx} value={preset.nama}>
                      [{preset.kategori.toUpperCase()}] {preset.nama} (+{preset.poin} Poin)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tingkat / Kategori Sanksi</label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value as KategoriPelanggaran)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-rose-500/20"
                  >
                    <option value="ringan">Ringan (5 - 15 Poin)</option>
                    <option value="sedang">Sedang (20 - 40 Poin)</option>
                    <option value="berat">Berat (&ge; 50 Poin / Pemanggilan Wali)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bobot Poin Pelanggaran</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={poin}
                    onChange={(e) => setPoin(parseInt(e.target.value) || 5)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Kejadian</label>
                <input
                  type="date"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bentuk Hukuman / Ta'zir yang Diberikan</label>
                <textarea
                  required
                  rows={2}
                  value={bentukHukuman}
                  onChange={(e) => setBentukHukuman(e.target.value)}
                  placeholder="Misal: Membaca Al-Qur'an 1 juz, membersihkan masjid, dll."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan / Alasan Pelanggaran</label>
                <input
                  type="text"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Contoh: Terlambat bangun karena lembur tugas kampus."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-700/25 transition"
                >
                  Simpan Catatan Pelanggaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
