import React, { useState } from 'react';
import { useSimkas } from '../context/SimkasContext';
import { CreditCard, Upload, Calendar, FileCheck, Check, X, CalendarDays, Receipt, Clock, CheckCircle2, ArrowRight, Building2, Filter, Download } from 'lucide-react';

export const KeuanganView: React.FC = () => {
  const { role, currentUser, keuangans, santris, submitPembayaran, verifyPembayaran, showToast } = useSimkas();

  // Active View Tab: 'bulanan' | 'form' | 'riwayat'
  const [activeTab, setActiveTab] = useState<'bulanan' | 'form' | 'riwayat'>('bulanan');

  // Filter state for riwayat
  const [filterJenis, setFilterJenis] = useState<string>('Semua');
  const [filterBulan, setFilterBulan] = useState<string>('Semua');

  // Form state for uploading proof
  const [jenis, setJenis] = useState<'spp' | 'uang_makan' | 'donasi' | 'daftar_ulang'>('spp');
  const [bulan, setBulan] = useState('Mei 2026');
  const [jumlah, setJumlah] = useState<number>(250000);
  const [tglBayar, setTglBayar] = useState(new Date().toISOString().substring(0, 10));
  const [fileName, setFileName] = useState('');
  const [catatan, setCatatan] = useState('');

  // Selected santri for admin view
  const [adminSelectedSantriId, setAdminSelectedSantriId] = useState<string>(santris[0]?.id || 's1');

  // Reject modal state
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Active target santri depending on role
  const targetSantriId = role === 'admin' ? adminSelectedSantriId : currentUser.id;
  const targetSantri = santris.find(s => s.id === targetSantriId) || santris[0] || { id: 's1', name: currentUser.name, kamar: 'A-01' };

  // Months list in academic year 2026
  const MONTHS_2026 = [
    'Januari 2026',
    'Februari 2026',
    'Maret 2026',
    'April 2026',
    'Mei 2026',
    'Juni 2026',
    'Juli 2026',
    'Agustus 2026',
    'September 2026',
    'Oktober 2026',
    'November 2026',
    'Desember 2026'
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      showToast(`Bukti transfer ${file.name} terpilih`, 'info');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jumlah || !tglBayar || !fileName) {
      return showToast('Lengkapi jumlah bayar, tanggal transfer, dan unggah file bukti transfer', 'error');
    }

    submitPembayaran({
      santriId: targetSantri.id,
      santriNama: targetSantri.name,
      kamar: targetSantri.kamar,
      jenis,
      bulan,
      jumlah,
      tglBayar,
      bukti: fileName,
      catatan
    });

    setFileName('');
    setCatatan('');
    setActiveTab('riwayat');
  };

  const handleQuickPay = (targetBulan: string, targetJenis: 'spp' | 'uang_makan') => {
    setBulan(targetBulan);
    setJenis(targetJenis);
    setJumlah(targetJenis === 'spp' ? 250000 : 350000);
    setActiveTab('form');
  };

  const handleApprove = (id: string) => {
    verifyPembayaran(id, true, 'Pembayaran valid dan telah dibukukan oleh Bendahara Pesantren.');
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim() && rejectingId) {
      return showToast('Catatan penolakan wajib diisi', 'error');
    }
    if (rejectingId) {
      verifyPembayaran(rejectingId, false, rejectReason);
      setRejectingId(null);
      setRejectReason('');
    }
  };

  // Filter records for the target santri
  const santriPayments = keuangans.filter(k => k.santriId === targetSantri.id);

  // Calculate monthly fee matrix for the target santri
  const monthlyMatrix = MONTHS_2026.map(m => {
    const sppPayment = santriPayments.find(k => k.bulan === m && k.jenis === 'spp');
    const makanPayment = santriPayments.find(k => k.bulan === m && k.jenis === 'uang_makan');

    const sppStatus = sppPayment ? sppPayment.status : 'belum_bayar';
    const makanStatus = makanPayment ? makanPayment.status : 'belum_bayar';

    const isFullyPaid = sppStatus === 'lunas' && makanStatus === 'lunas';
    const isPending = sppStatus === 'pending' || makanStatus === 'pending';

    return {
      bulan: m,
      sppPayment,
      makanPayment,
      sppStatus,
      makanStatus,
      isFullyPaid,
      isPending
    };
  });

  // Calculate stats for target santri
  const totalLunasNominal = santriPayments
    .filter(k => k.status === 'lunas')
    .reduce((acc, curr) => acc + curr.jumlah, 0);

  const pendingVerificationCount = santriPayments.filter(k => k.status === 'pending').length;

  // Filtered transactions for "Riwayat" tab
  const displayedHistory = keuangans.filter(k => {
    const matchUser = role === 'admin' ? true : k.santriId === currentUser.id;
    const matchJenis = filterJenis === 'Semua' || k.jenis === filterJenis;
    const matchBulan = filterBulan === 'Semua' || k.bulan === filterBulan;
    return matchUser && matchJenis && matchBulan;
  });

  const handleExportCsv = () => {
    const headers = ["ID", "Santri", "Kamar", "Jenis Tagihan", "Bulan", "Nominal (Rp)", "Tanggal Bayar", "Status", "Bukti File", "Verifikator"];
    const rows = displayedHistory.map(k => [
      k.id,
      `"${k.santriNama}"`,
      k.kamar,
      k.jenis.toUpperCase(),
      `"${k.bulan}"`,
      k.jumlah,
      k.tglBayar,
      k.status.toUpperCase(),
      `"${k.bukti}"`,
      `"${k.verifikator || '-'}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `rekap_kas_pembayaran_santri_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Rekap pembayaran berhasil diexport ke CSV', 'success');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-800">Administrasi SPP & Kas Bulanan Santri</h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">Tahun 2026</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring pembayaran iuran kas dan SPP per bulan (Januari - Desember 2026), upload bukti transfer, dan konfirmasi bendahara.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {role === 'admin' && (
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold">
              <span className="text-slate-500">Santri:</span>
              <select
                value={adminSelectedSantriId}
                onChange={(e) => setAdminSelectedSantriId(e.target.value)}
                className="bg-transparent text-slate-900 font-bold outline-none cursor-pointer"
              >
                {santris.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.nis})</option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleExportCsv}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Cards for the Santri */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 text-white p-5 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">Total Kas & SPP Terbayar</span>
            <div className="w-8 h-8 rounded-xl bg-white/10 text-emerald-300 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-white">
            Rp {totalLunasNominal.toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-emerald-200/90 mt-2 font-medium">
            Santri: <strong className="text-white">{targetSantri.name}</strong> (Kamar {targetSantri.kamar})
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status Bulan Berjalan (Mei 2026)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-800">
              SPP: Lunas &bull; Makan: Pending
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">
            Tarif: SPP Rp 250.000 + Makan Rp 350.000 / bln
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Menunggu Verifikasi</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-purple-700">
              {pendingVerificationCount} Transaksi
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-medium">Bukti transfer menunggu validasi bendahara</p>
        </div>
      </div>

      {/* Main Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-full sm:w-fit border border-slate-200">
        <button
          onClick={() => setActiveTab('bulanan')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition ${
            activeTab === 'bulanan'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Matriks Kas & Tagihan Bulanan (2026)</span>
        </button>

        <button
          onClick={() => setActiveTab('form')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition ${
            activeTab === 'form'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Bayar / Unggah Bukti Transfer</span>
        </button>

        <button
          onClick={() => setActiveTab('riwayat')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition ${
            activeTab === 'riwayat'
              ? 'bg-white text-emerald-800 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Riwayat Bukti Pembayaran ({santriPayments.length})</span>
        </button>
      </div>

      {/* TAB 1: MATRIKS KAS & TAGIHAN PER BULAN */}
      {activeTab === 'bulanan' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <span>🗓️ Lembar Kartu Kas & Tagihan Santri Per Bulan (Tahun 2026)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Menampilkan status pelunasan Iuran SPP dan Uang Makan untuk setiap bulan dari Januari hingga Desember.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Lunas
                </span>
                <span className="flex items-center gap-1.5 text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Pending
                </span>
                <span className="flex items-center gap-1.5 text-rose-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Belum Bayar
                </span>
              </div>
            </div>

            {/* 12 Months Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {monthlyMatrix.map((item, idx) => {
                const sppLunas = item.sppStatus === 'lunas';
                const sppPending = item.sppStatus === 'pending';
                const makanLunas = item.makanStatus === 'lunas';
                const makanPending = item.makanStatus === 'pending';

                return (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                      item.isFullyPaid
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : item.isPending
                        ? 'bg-amber-50/50 border-amber-200'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 mb-3">
                        <span className="font-extrabold text-sm text-slate-900">{item.bulan}</span>
                        {item.isFullyPaid ? (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ✓ Lunas
                          </span>
                        ) : item.isPending ? (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            ⌛ Pending
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                            ✕ Menunggak
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 text-xs">
                        {/* SPP Item */}
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">SPP (Rp 250.000):</span>
                          {sppLunas ? (
                            <span className="font-bold text-emerald-700 flex items-center gap-1 text-[11px]">
                              <CheckCircle2 className="w-3 h-3" /> Lunas
                            </span>
                          ) : sppPending ? (
                            <span className="font-bold text-amber-700 flex items-center gap-1 text-[11px]">
                              <Clock className="w-3 h-3" /> Verifikasi
                            </span>
                          ) : (
                            <button
                              onClick={() => handleQuickPay(item.bulan, 'spp')}
                              className="text-[11px] font-bold text-rose-600 hover:text-rose-800 hover:underline"
                            >
                              Bayar &rarr;
                            </button>
                          )}
                        </div>

                        {/* Uang Makan Item */}
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 font-medium">Makan (Rp 350.000):</span>
                          {makanLunas ? (
                            <span className="font-bold text-emerald-700 flex items-center gap-1 text-[11px]">
                              <CheckCircle2 className="w-3 h-3" /> Lunas
                            </span>
                          ) : makanPending ? (
                            <span className="font-bold text-amber-700 flex items-center gap-1 text-[11px]">
                              <Clock className="w-3 h-3" /> Verifikasi
                            </span>
                          ) : (
                            <button
                              onClick={() => handleQuickPay(item.bulan, 'uang_makan')}
                              className="text-[11px] font-bold text-rose-600 hover:text-rose-800 hover:underline"
                            >
                              Bayar &rarr;
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/70">
                      {item.isFullyPaid ? (
                        <div className="text-[11px] text-emerald-700 font-semibold text-center py-1">
                          Semua tagihan tuntas ✅
                        </div>
                      ) : (
                        <button
                          onClick={() => handleQuickPay(item.bulan, !sppLunas ? 'spp' : 'uang_makan')}
                          className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-xs"
                        >
                          <span>Bayar Kas Bulan Ini</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info Rekening Pembayaran */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl border border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gold-400 font-bold text-xs uppercase tracking-wider">
                <Building2 className="w-4 h-4" />
                <span>Rekening Resmi Pembayaran Pesantren Darut Thalibin</span>
              </div>
              <h4 className="text-lg font-extrabold text-white">Bank Negara Indonesia (BNI) & Bank Syariah Indonesia (BSI)</h4>
              <p className="text-xs text-slate-300">
                BNI: <code className="bg-slate-800 px-2 py-0.5 rounded text-emerald-400 font-bold">1234-5678-90</code> &bull; BSI: <code className="bg-slate-800 px-2 py-0.5 rounded text-emerald-400 font-bold">7123-456-789</code> a.n. <strong>Pondok Pesantren Mahasiswa Darut Thalibin</strong>
              </p>
            </div>
            <button
              onClick={() => setActiveTab('form')}
              className="shrink-0 px-6 py-3 bg-gold-500 hover:bg-gold-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg transition"
            >
              Upload Bukti Transfer Sekarang &rarr;
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: FORM UPLOAD BUKTI BAYAR */}
      {activeTab === 'form' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-700" />
              <span>Formulir Pembayaran Kas & SPP Santri</span>
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">Pilih Santri yang Membayar</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-slate-900 block text-xs">{targetSantri.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">NIS: {targetSantri.nis} &bull; Kamar: {targetSantri.kamar}</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Santri Aktif
                  </span>
                </div>
              </div>

              <div>
                <label className="block mb-1">Jenis Pembayaran</label>
                <select
                  value={jenis}
                  onChange={(e) => {
                    const j = e.target.value as any;
                    setJenis(j);
                    if (j === 'spp') setJumlah(250000);
                    if (j === 'uang_makan') setJumlah(350000);
                    if (j === 'donasi') setJumlah(100000);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 capitalize"
                >
                  <option value="spp">SPP Bulanan Asrama (Rp 250.000)</option>
                  <option value="uang_makan">Uang Makan / Katering Santri (Rp 350.000)</option>
                  <option value="donasi">Infaq / Donasi Perluasan Sarana</option>
                  <option value="daftar_ulang">Daftar Ulang Awal Tahun</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Bulan Tagihan</label>
                  <select
                    value={bulan}
                    onChange={(e) => setBulan(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    {MONTHS_2026.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Tanggal Transfer / Bayar</label>
                  <input
                    type="date"
                    required
                    value={tglBayar}
                    onChange={(e) => setTglBayar(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Jumlah Nominal Bayar (Rp)</label>
                <input
                  type="number"
                  required
                  min={10000}
                  value={jumlah}
                  onChange={(e) => setJumlah(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-900 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block mb-1">Unggah Struk Bukti Transfer / Resi ATM / M-Banking</label>
                <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-4 text-center bg-slate-50 transition cursor-pointer relative">
                  <input
                    type="file"
                    required
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-6 h-6 text-emerald-700 mx-auto mb-2" />
                  <span className="text-xs font-extrabold text-emerald-700 block">Pilih File Foto Bukti</span>
                  <span className="text-[10px] text-slate-400 block mt-1">Format JPG, PNG atau PDF (Maksimal 5MB)</span>
                  {fileName && (
                    <div className="mt-2 p-2 bg-emerald-100 text-emerald-900 rounded-lg text-[11px] font-bold truncate">
                      ✓ {fileName}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block mb-1">Catatan Pengirim (Opsional)</label>
                <input
                  type="text"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Misal: Transfer via BNI a.n. Orang Tua (Bpk. Abdullah)"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('bulanan')}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-lg shadow-emerald-700/25 transition flex items-center gap-2 text-xs"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Kirim Bukti Pembayaran</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Info Box */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gold-400" />
                <h4 className="font-extrabold text-sm">Petunjuk Pembayaran</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Silakan melakukan transfer ke nomor rekening resmi pondok pesantren di bawah ini, lalu simpan struk transfer untuk diunggah pada formulir.
              </p>

              <div className="space-y-2 bg-white/10 p-4 rounded-2xl border border-white/10 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">BANK NEGARA INDONESIA (BNI)</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">1234-5678-90</span>
                  <span className="block text-[11px] text-slate-300">a.n. PPM Darut Thalibin</span>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <span className="text-slate-400 block text-[10px]">BANK SYARIAH INDONESIA (BSI)</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">7123-456-789</span>
                  <span className="block text-[11px] text-slate-300">a.n. Pondok Darut Thalibin</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RIWAYAT BUKTI TRANSAKSI */}
      {activeTab === 'riwayat' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span>Kategori:</span>
                <select
                  value={filterJenis}
                  onChange={(e) => setFilterJenis(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                >
                  <option value="Semua">Semua Kategori</option>
                  <option value="spp">SPP Bulanan</option>
                  <option value="uang_makan">Uang Makan</option>
                  <option value="donasi">Donasi / Infaq</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <span>Bulan Tagihan:</span>
                <select
                  value={filterBulan}
                  onChange={(e) => setFilterBulan(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                >
                  <option value="Semua">Semua Bulan</option>
                  {MONTHS_2026.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <span className="text-xs text-slate-400 font-medium">
              Menampilkan {displayedHistory.length} transaksi
            </span>
          </div>

          {/* Transaction Cards List */}
          {displayedHistory.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 font-medium">
              Tidak ada catatan riwayat transaksi pembayaran yang sesuai dengan filter.
            </div>
          ) : (
            displayedHistory.map(k => {
              const isPending = k.status === 'pending';
              const isLunas = k.status === 'lunas';

              return (
                <div key={k.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase ${
                        isPending ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        isLunas ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {isPending ? 'Menunggu Verifikasi' : k.status}
                      </span>
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {k.tglBayar}
                      </span>
                    </div>

                    <span className="text-xs bg-slate-100 text-slate-800 px-3 py-1 rounded-lg font-extrabold uppercase tracking-wide">
                      {k.jenis.replace('_', ' ')} &bull; {k.bulan}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h4 className="font-bold text-base text-slate-800">{k.santriNama}</h4>
                      <p className="text-xs text-slate-500 font-medium">Kamar Asrama: {k.kamar}</p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-400 font-bold block uppercase">Total Dibayar</span>
                      <span className="text-lg font-extrabold text-emerald-700 font-mono">
                        Rp {k.jumlah.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 font-semibold">File Bukti Upload:</span>
                      <span className="font-extrabold text-emerald-700 ml-1.5 underline cursor-pointer hover:text-emerald-800">
                        📁 {k.bukti}
                      </span>
                      {k.catatan && <p className="text-slate-600 mt-1 italic font-medium">💬 &ldquo;{k.catatan}&rdquo;</p>}
                    </div>

                    {role === 'admin' && isPending && (
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <button
                          onClick={() => handleApprove(k.id)}
                          className="py-2 px-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                        >
                          <Check className="w-4 h-4" />
                          <span>Valid / Terima</span>
                        </button>
                        <button
                          onClick={() => { setRejectingId(k.id); setRejectReason(''); }}
                          className="py-2 px-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                        >
                          <X className="w-4 h-4" />
                          <span>Tolak</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {k.verifikator && (
                    <div className={`p-2.5 rounded-xl text-xs font-medium ${
                      isLunas ? 'bg-emerald-50 text-emerald-900 border border-emerald-100' : 'bg-rose-50 text-rose-900 border border-rose-100'
                    }`}>
                      <span className="font-bold">Diverifikasi oleh {k.verifikator} ({k.tglVerifikasi || k.tglBayar})</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-100 animate-scaleUp">
            <h3 className="font-bold text-base text-slate-800">Tolak Verifikasi Pembayaran</h3>
            <p className="text-xs text-slate-500">
              Silakan tuliskan alasan penolakan agar santri atau wali santri dapat mengunggah bukti yang sesuai.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alasan Penolakan</label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Misal: Bukti transfer buram, nominal tidak sesuai, rekening tujuan salah..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Konfirmasi Tolak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
