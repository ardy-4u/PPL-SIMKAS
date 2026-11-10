import React, { useState } from 'react';
import { useSimkas } from '../context/SimkasContext';
import { TipeKas, KategoriKas } from '../types/simkas';
import { Wallet, ArrowDownRight, ArrowUpRight, Search, Filter, Trash2, Download, TrendingUp, CircleDollarSign, FileText } from 'lucide-react';

export const KasOperasionalView: React.FC = () => {
  const { role, currentUser, kasOperasionals, addKasOperasional, deleteKasOperasional, setCurrentView, showToast } = useSimkas();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipe, setFilterTipe] = useState<string>('Semua');
  const [filterKategori, setFilterKategori] = useState<string>('Semua');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Guard access: only admin can view operational general ledger
  if (role !== 'admin') {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm text-center max-w-xl mx-auto my-12 space-y-4 animate-fadeIn">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center text-3xl mx-auto border border-rose-100">
          🔒
        </div>
        <h3 className="text-lg font-extrabold text-slate-800">Akses Terbatas: Buku Kas Pesantren</h3>
        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
          Buku Kas Arus Operasional Pesantren berisi pencatatan mutasi kas perbendaharaan internal pondok yang hanya dapat dikelola oleh <strong>Pengurus & Bendahara Pesantren</strong>.
        </p>
        <div className="pt-2">
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={() => setCurrentView('spp')}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-700/25"
            >
              Buka Tagihan SPP Bulanan &rarr;
            </button>
            <button
              onClick={() => setCurrentView('kas-santri')}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-amber-600/25"
            >
              Buka Iuran Kas Santri &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form State
  const [tipe, setTipe] = useState<TipeKas>('masuk');
  const [kategori, setKategori] = useState<KategoriKas>('infaq_donasi');
  const [nominal, setNominal] = useState<number>(500000);
  const [tanggal, setTanggal] = useState(new Date().toISOString().substring(0, 10));
  const [keterangan, setKeterangan] = useState('');
  const [penanggungJawab, setPenanggungJawab] = useState(currentUser.name);
  const [nomorBukti, setNomorBukti] = useState(`BK-${Date.now().toString().slice(-6)}`);

  const KATEGORI_LABELS: Record<KategoriKas, string> = {
    listrik_air_wifi: 'Listrik, Air & WiFi',
    konsumsi_dapur: 'Konsumsi Dapur & Logistik',
    kebersihan_sarpras: 'Kebersihan & Sarpras Asrama',
    honor_asatidz: 'Honor / Bisyarah Asatidz',
    pemeliharaan_gedung: 'Pemeliharaan Gedung & Fasilitas',
    infaq_donasi: 'Infaq, Sedekah & Donasi',
    kegiatan_pondok: 'Kegiatan Kajian & Dakwah',
    lainnya: 'Lain-lain'
  };

  const handleOpenAdd = (type: TipeKas) => {
    setTipe(type);
    setKategori(type === 'masuk' ? 'infaq_donasi' : 'listrik_air_wifi');
    setNomorBukti(`${type === 'masuk' ? 'BKM' : 'BKK'}-${new Date().toISOString().substring(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`);
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nominal || nominal <= 0 || !keterangan.trim()) {
      return showToast('Lengkapi nominal transaksi dan keterangan dengan jelas', 'error');
    }

    addKasOperasional({
      tanggal,
      tipe,
      kategori,
      nominal: Number(nominal),
      keterangan,
      penanggungJawab,
      nomorBukti
    });

    setIsAddModalOpen(false);
    setKeterangan('');
    setNominal(500000);
  };

  // Sort chronologically for running balance calculation
  const sortedByDate = [...kasOperasionals].sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());

  // Calculate cumulative balance
  let running = 0;
  const ledgerData = sortedByDate.map(item => {
    if (item.tipe === 'masuk') running += item.nominal;
    else running -= item.nominal;
    return { ...item, saldoSetelahnya: running };
  });

  // Calculate metrics
  const totalMasuk = kasOperasionals.filter(k => k.tipe === 'masuk').reduce((sum, item) => sum + item.nominal, 0);
  const totalKeluar = kasOperasionals.filter(k => k.tipe === 'keluar').reduce((sum, item) => sum + item.nominal, 0);
  const saldoAkhir = totalMasuk - totalKeluar;

  // Filtered view
  const filteredData = ledgerData
    .filter(k => {
      const matchesSearch = k.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (k.nomorBukti && k.nomorBukti.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            k.penanggungJawab.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTipe = filterTipe === 'Semua' || k.tipe === filterTipe;
      const matchesKategori = filterKategori === 'Semua' || k.kategori === filterKategori;
      return matchesSearch && matchesTipe && matchesKategori;
    })
    .reverse(); // Display latest first in UI table

  const handleExportCsv = () => {
    const headers = ["ID", "Nomor Bukti", "Tanggal", "Tipe Transaksi", "Kategori", "Keterangan", "Debit (Masuk)", "Kredit (Keluar)", "Penanggung Jawab"];
    const rows = sortedByDate.map(k => [
      k.id,
      k.nomorBukti || '-',
      k.tanggal,
      k.tipe.toUpperCase(),
      `"${KATEGORI_LABELS[k.kategori]}"`,
      `"${k.keterangan}"`,
      k.tipe === 'masuk' ? k.nominal : 0,
      k.tipe === 'keluar' ? k.nominal : 0,
      `"${k.penanggungJawab}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `buku_kas_operasional_pondok_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan Buku Kas Operasional berhasil diexport ke CSV', 'success');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-800">Buku Kas Arus Operasional Pesantren</h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">Debit / Kredit</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan arus kas operasional internal pondok (di luar tagihan personal santri), klasifikasi beban, dan monitoring saldo kas berkala.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Buku Kas</span>
          </button>

          {role === 'admin' && (
            <>
              <button
                onClick={() => handleOpenAdd('masuk')}
                className="py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-700/20 transition"
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>Kas Masuk (Debit)</span>
              </button>

              <button
                onClick={() => handleOpenAdd('keluar')}
                className="py-2.5 px-4 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-700/20 transition"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Kas Keluar (Kredit)</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Financial Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Saldo Akhir */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-3xl shadow-lg border border-slate-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saldo Kas Riil Saat Ini</span>
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <CircleDollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              Rp {saldoAkhir.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Status Kas Pondok:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Surplus Sehat
            </span>
          </div>
        </div>

        {/* Total Kas Masuk */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Kas Masuk (Debit)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
              Rp {totalMasuk.toLocaleString('id-ID')}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">Infaq, Shadaqah & Donasi Operasional</p>
        </div>

        {/* Total Kas Keluar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Kas Keluar (Kredit)</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-700">
              Rp {totalKeluar.toLocaleString('id-ID')}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">Listrik, WiFi, Honor Asatidz, Sarpras</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari transaksi, no. bukti, penanggung jawab..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Arus Kas:</span>
            <select
              value={filterTipe}
              onChange={(e) => setFilterTipe(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
            >
              <option value="Semua">Semua Arus Kas</option>
              <option value="masuk">Kas Masuk (Debit)</option>
              <option value="keluar">Kas Keluar (Kredit)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <span>Kategori:</span>
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
            >
              <option value="Semua">Semua Kategori Beban</option>
              {Object.entries(KATEGORI_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Buku Kas Umum (BKU) Pesantren</span>
            </h3>
            <p className="text-xs text-slate-500">Mencatat mutasi debit kredit berurutan secara real-time</p>
          </div>
          <span className="text-xs bg-slate-200/70 text-slate-700 px-3 py-1 rounded-full font-bold">
            {filteredData.length} Transaksi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Tanggal & Bukti</th>
                <th className="py-3.5 px-4">Kategori Mutasi</th>
                <th className="py-3.5 px-4">Uraian / Keterangan</th>
                <th className="py-3.5 px-4 text-right">Debit (Masuk)</th>
                <th className="py-3.5 px-4 text-right">Kredit (Keluar)</th>
                <th className="py-3.5 px-4 text-right">Saldo Berjalan</th>
                <th className="py-3.5 px-4">Penanggung Jawab</th>
                {role === 'admin' && <th className="py-3.5 px-4 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={role === 'admin' ? 8 : 7} className="text-center py-12 text-slate-400">
                    Tidak ada data transaksi kas yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                filteredData.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50/80 transition group">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{k.tanggal}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{k.nomorBukti || '-'}</div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        k.tipe === 'masuk' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {KATEGORI_LABELS[k.kategori]}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="text-xs font-semibold text-slate-800 leading-relaxed">{k.keterangan}</p>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {k.tipe === 'masuk' ? (
                        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          +Rp {k.nominal.toLocaleString('id-ID')}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {k.tipe === 'keluar' ? (
                        <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                          -Rp {k.nominal.toLocaleString('id-ID')}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="font-mono font-extrabold text-slate-900">
                        Rp {k.saldoSetelahnya.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-xs text-slate-600 font-medium">{k.penanggungJawab}</span>
                    </td>
                    {role === 'admin' && (
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus transaksi kas "${k.keterangan}"?`)) {
                              deleteKasOperasional(k.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Transaksi Kas (Admin) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-scaleUp">
            <div className={`px-6 py-4 text-white flex items-center justify-between shrink-0 ${
              tipe === 'masuk' ? 'bg-emerald-700' : 'bg-rose-700'
            }`}>
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                {tipe === 'masuk' ? <ArrowDownRight className="w-5 h-5 text-emerald-200" /> : <ArrowUpRight className="w-5 h-5 text-rose-200" />}
                <span>Input Transaksi Kas {tipe === 'masuk' ? 'MASUK (Debit)' : 'KELUAR (Kredit)'}</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-white/70 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setTipe('masuk');
                    setKategori('infaq_donasi');
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    tipe === 'masuk' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Kas Masuk (Debit)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTipe('keluar');
                    setKategori('listrik_air_wifi');
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition ${
                    tipe === 'keluar' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Kas Keluar (Kredit)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nominal Transaksi (Rp)</label>
                <input
                  type="number"
                  required
                  min={1000}
                  step={1000}
                  value={nominal}
                  onChange={(e) => setNominal(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold font-mono outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Transaksi</label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value as KategoriKas)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    {Object.entries(KATEGORI_LABELS).map(([k, label]) => (
                      <option key={k} value={k}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Transaksi</label>
                  <input
                    type="date"
                    required
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Uraian / Keterangan Transaksi</label>
                <textarea
                  required
                  rows={2}
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Misal: Pembayaran tagihan listrik PLN bulan Mei, belanja sabun pel kamar mandi..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Bukti Kas (No. BKU)</label>
                  <input
                    type="text"
                    value={nomorBukti}
                    onChange={(e) => setNomorBukti(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold font-mono outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Penanggung Jawab / Penerima</label>
                  <input
                    type="text"
                    value={penanggungJawab}
                    onChange={(e) => setPenanggungJawab(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
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
                  className={`py-2.5 px-6 text-white rounded-xl text-xs font-bold shadow-lg transition ${
                    tipe === 'masuk' ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-rose-700 hover:bg-rose-800'
                  }`}
                >
                  Simpan Transaksi Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
