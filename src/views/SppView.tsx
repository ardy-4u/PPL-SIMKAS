import React, { useState } from 'react';
import { useSimkas } from '../context/SimkasContext';
import { Keuangan } from '../types/simkas';
import { CreditCard, Upload, FileCheck, Check, X, CalendarDays, Receipt, Clock, CheckCircle2, ArrowRight, Building2, Download, UserCheck, Layers, Sparkles, Eye } from 'lucide-react';
import { BuktiPembayaranModal } from '../components/BuktiPembayaranModal';

type PaketSpp = '1_bulan' | '3_bulan' | 'semester';

const TRIWULAN_OPTIONS = [
  { id: 'tw1', label: 'Triwulan I (Januari - Maret 2026)', months: ['Januari 2026', 'Februari 2026', 'Maret 2026'] },
  { id: 'tw2', label: 'Triwulan II (April - Juni 2026)', months: ['April 2026', 'Mei 2026', 'Juni 2026'] },
  { id: 'tw3', label: 'Triwulan III (Juli - September 2026)', months: ['Juli 2026', 'Agustus 2026', 'September 2026'] },
  { id: 'tw4', label: 'Triwulan IV (Oktober - Desember 2026)', months: ['Oktober 2026', 'November 2026', 'Desember 2026'] },
];

const SEMESTER_OPTIONS = [
  { id: 'sem_genap', label: 'Semester Genap (Januari - Juni 2026)', months: ['Januari 2026', 'Februari 2026', 'Maret 2026', 'April 2026', 'Mei 2026', 'Juni 2026'] },
  { id: 'sem_ganjil', label: 'Semester Ganjil (Juli - Desember 2026)', months: ['Juli 2026', 'Agustus 2026', 'September 2026', 'Oktober 2026', 'November 2026', 'Desember 2026'] },
];

export const SppView: React.FC = () => {
  const { role, currentUser, keuangans, santris, submitPembayaran, verifyPembayaran, showToast } = useSimkas();

  // Active Tab:
  // For Admin: 'verifikasi' | 'matriks-admin' | 'riwayat-admin'
  // For Santri/Ortu: 'kartu-spp' | 'form-bayar' | 'riwayat-santri'
  const [activeTab, setActiveTab] = useState<string>(role === 'admin' ? 'verifikasi' : 'kartu-spp');

  // Form state for uploading proof (Santri / Ortu only)
  const [selectedPaket, setSelectedPaket] = useState<PaketSpp>('1_bulan');
  const [selectedBulan, setSelectedBulan] = useState<string>('Mei 2026');
  const [selectedTriwulan, setSelectedTriwulan] = useState<string>('tw2');
  const [selectedSemester, setSelectedSemester] = useState<string>('sem_genap');

  const [tglBayar, setTglBayar] = useState(new Date().toISOString().substring(0, 10));
  const [fileName, setFileName] = useState('');
  const [filePreview, setFilePreview] = useState<string>('');
  const [catatan, setCatatan] = useState('');

  // Modal preview bukti bayar (Admin & Santri)
  const [selectedBuktiRecord, setSelectedBuktiRecord] = useState<Keuangan | null>(null);

  // Reject modal state for Admin
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Target santri for upload & personal status (santri / ortu)
  const targetSantri = santris.find(s => s.id === currentUser.id) || santris[0] || { id: 's1', name: currentUser.name, kamar: 'A-01' };

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

  // Dynamic calculations based on selected package
  let currentNominal = 250000;
  let currentCakupanBulan: string[] = [selectedBulan];
  let currentPeriodeLabel = selectedBulan;

  if (selectedPaket === '3_bulan') {
    const tw = TRIWULAN_OPTIONS.find(t => t.id === selectedTriwulan) || TRIWULAN_OPTIONS[0];
    currentNominal = 750000;
    currentCakupanBulan = tw.months;
    currentPeriodeLabel = tw.label;
  } else if (selectedPaket === 'semester') {
    const sem = SEMESTER_OPTIONS.find(s => s.id === selectedSemester) || SEMESTER_OPTIONS[0];
    currentNominal = 1500000;
    currentCakupanBulan = sem.months;
    currentPeriodeLabel = sem.label;
  }

  // Filter all SPP records
  const allSppRecords = keuangans.filter(k => k.jenis === 'spp');
  const pendingSppAdmin = allSppRecords.filter(k => k.status === 'pending');

  // Helper to match a payment for a specific santri and month
  const getPaymentForMonth = (santriId: string, month: string) => {
    return allSppRecords.find(k => 
      k.santriId === santriId && 
      (k.bulan === month || (k.cakupanBulan && k.cakupanBulan.includes(month)))
    );
  };

  // Records for current santri
  const mySppRecords = allSppRecords.filter(k => k.santriId === targetSantri.id);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setFilePreview(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
      showToast(`Bukti transfer ${file.name} terpilih`, 'info');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tglBayar || !fileName) {
      return showToast('Lengkapi tanggal transfer dan unggah file bukti transfer SPP', 'error');
    }

    submitPembayaran({
      santriId: targetSantri.id,
      santriNama: targetSantri.name,
      kamar: targetSantri.kamar,
      jenis: 'spp',
      bulan: currentPeriodeLabel,
      jumlah: currentNominal,
      tglBayar,
      bukti: fileName,
      buktiUrl: filePreview,
      catatan,
      paket: selectedPaket,
      cakupanBulan: currentCakupanBulan,
      periodeLabel: currentPeriodeLabel
    });

    setFileName('');
    setFilePreview('');
    setCatatan('');
    setActiveTab('riwayat-santri');
  };

  const handleQuickPay = (targetBulan: string) => {
    setSelectedPaket('1_bulan');
    setSelectedBulan(targetBulan);
    setActiveTab('form-bayar');
  };

  const handleSelectPaketAndPay = (paket: PaketSpp) => {
    setSelectedPaket(paket);
    setActiveTab('form-bayar');
  };

  const handleApprove = (id: string) => {
    verifyPembayaran(id, true, 'Pembayaran SPP valid dan telah disetujui oleh Bendahara.');
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

  // Matrix per month for target santri
  const sppMatrix = MONTHS_2026.map(m => {
    const payment = getPaymentForMonth(targetSantri.id, m);
    const status = payment ? payment.status : 'belum_bayar';
    return { bulan: m, payment, status };
  });

  const totalSppLunas = sppMatrix.filter(k => k.status === 'lunas').length;
  const totalSppNominalLunas = totalSppLunas * 250000;

  // Export CSV
  const handleExportCsv = () => {
    const headers = ["ID", "Santri", "Kamar", "Bulan/Periode SPP", "Paket", "Nominal (Rp)", "Tanggal Bayar", "Status", "Bukti File", "Verifikator"];
    const recordsToExport = role === 'admin' ? allSppRecords : mySppRecords;
    const rows = recordsToExport.map(k => [
      k.id,
      `"${k.santriNama}"`,
      k.kamar,
      `"${k.bulan}"`,
      `"${k.paket || '1_bulan'}"`,
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
    link.setAttribute("download", `rekap_spp_santri_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Rekap SPP berhasil diexport ke CSV', 'success');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-800">
              {role === 'admin' ? 'Verifikasi & Pengelolaan SPP Santri' : 'Administrasi SPP Santri (1 Bulan / 3 Bulan / Semester)'}
            </h2>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Fleksibel: 1 Bln (250rb) / 3 Bln (750rb) / Semester (1.5jt)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {role === 'admin' 
              ? 'Menyetujui dan memverifikasi bukti setoran SPP santri (paket 1 bulan, 3 bulan, atau semester) serta memantau rekapitulasi pelunasan.'
              : 'Informasi tagihan SPP santri tahun 2026. Santri dapat membayar per 1 bulan, per 3 bulan (triwulan), atau per semester.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* METRIC STATS */}
      {role === 'admin' ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-600 uppercase">Menunggu Persetujuan</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-extrabold text-amber-600">{pendingSppAdmin.length} Bukti SPP</p>
            <p className="text-xs text-slate-400 mt-1">Perlu dicek dan disetujui bendahara</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-700 uppercase">SPP Disetujui (Lunas)</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-700">
              {allSppRecords.filter(k => k.status === 'lunas').length} Pembayaran
            </p>
            <p className="text-xs text-slate-400 mt-1">Telah dibukukan ke sistem</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Total Santri Wajib SPP</span>
              <UserCheck className="w-4 h-4 text-slate-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-800">{santris.length} Santri</p>
            <p className="text-xs text-slate-400 mt-1">Kamar Asrama A, B, C, D</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 text-white p-5 rounded-3xl shadow-lg">
            <span className="text-xs font-bold text-emerald-200 uppercase block mb-1">Total SPP Lunas (2026)</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">
              Rp {totalSppNominalLunas.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-emerald-100/80 mt-2 font-medium">
              {totalSppLunas} dari 12 Bulan telah terbayar
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Status Bulan Ini (Mei 2026)</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                ✓ Lunas Terverifikasi
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Tarif Dasar: Rp 250.000 / bulan</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Menunggu Verifikasi</span>
            <p className="text-2xl font-extrabold text-purple-700 mt-1">
              {mySppRecords.filter(k => k.status === 'pending').length} Bukti
            </p>
            <p className="text-xs text-slate-400 mt-2 font-medium">Dalam proses verifikasi bendahara</p>
          </div>
        </div>
      )}

      {/* SUB-NAVIGATION TABS */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl w-full sm:w-fit border border-slate-200">
        {role === 'admin' ? (
          <>
            <button
              onClick={() => setActiveTab('verifikasi')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition ${
                activeTab === 'verifikasi'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Persetujuan SPP Masuk ({pendingSppAdmin.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('matriks-admin')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition ${
                activeTab === 'matriks-admin'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Rekap SPP 12 Bulan (Semua Santri)</span>
            </button>

            <button
              onClick={() => setActiveTab('riwayat-admin')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition ${
                activeTab === 'riwayat-admin'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Semua Riwayat Setoran SPP</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('kartu-spp')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition ${
                activeTab === 'kartu-spp'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Kartu SPP Bulanan (2026)</span>
            </button>

            <button
              onClick={() => setActiveTab('form-bayar')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition ${
                activeTab === 'form-bayar'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Bayar SPP (Pilih Paket)</span>
            </button>

            <button
              onClick={() => setActiveTab('riwayat-santri')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition ${
                activeTab === 'riwayat-santri'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Riwayat Pembayaran Saya ({mySppRecords.length})</span>
            </button>
          </>
        )}
      </div>

      {/* ADMIN TAB 1: PERSETUJUAN BUKTI TRANSFER SPP MASUK */}
      {role === 'admin' && activeTab === 'verifikasi' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <h3 className="font-extrabold text-sm text-slate-800 pb-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Daftar Bukti Transfer SPP Menunggu Persetujuan Bendahara</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Pengurus/Bendahara hanya perlu memeriksa kesesuaian struk bukti transfer dari santri atau wali santri lalu menyetujui atau menolak.
            </p>

            {pendingSppAdmin.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                <p className="font-bold text-slate-700 text-sm">Tidak ada bukti setoran SPP yang menunggu verifikasi.</p>
                <p className="text-xs text-slate-400 mt-0.5">Semua pengajuan bukti transfer telah tuntas diverifikasi.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingSppAdmin.map(k => (
                  <div key={k.id} className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-amber-200/60">
                      <div>
                        <span className="font-extrabold text-sm text-slate-900">{k.santriNama}</span>
                        <span className="text-xs text-slate-500 ml-2 font-mono">(Kamar: {k.kamar})</span>
                        {k.paket && (
                          <span className="ml-2 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                            {k.paket === 'semester' ? '🎓 PAKET 1 SEMESTER' : k.paket === '3_bulan' ? '📦 PAKET 3 BULAN' : '🏷️ PAKET 1 BULAN'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-200 font-mono">
                          SPP {k.bulan} &bull; Rp {k.jumlah.toLocaleString('id-ID')}
                        </span>
                        <span className="text-xs text-slate-400">{k.tglBayar}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        {k.cakupanBulan && k.cakupanBulan.length > 1 && (
                          <p className="text-[11px] text-purple-900 font-semibold mb-1">
                            Mencakup {k.cakupanBulan.length} Bulan: {k.cakupanBulan.join(', ')}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-slate-500">Bukti Transfer:</span>
                          <button
                            type="button"
                            onClick={() => setSelectedBuktiRecord(k)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat Bukti Transfer</span>
                          </button>
                          <span className="text-[11px] text-slate-400 font-mono">({k.bukti})</span>
                        </div>
                        {k.catatan && <p className="text-slate-600 mt-1 italic">Catatan santri: &ldquo;{k.catatan}&rdquo;</p>}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleApprove(k.id)}
                          className="py-2 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                        >
                          <Check className="w-4 h-4" />
                          <span>Setujui SPP ({k.cakupanBulan && k.cakupanBulan.length > 1 ? `${k.cakupanBulan.length} Bulan Sekaligus` : '1 Bulan'})</span>
                        </button>
                        <button
                          onClick={() => { setRejectingId(k.id); setRejectReason(''); }}
                          className="py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                        >
                          <X className="w-4 h-4" />
                          <span>Tolak</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADMIN TAB 2: REKAP MATRIKS SPP 12 BULAN SELURUH SANTRI */}
      {role === 'admin' && activeTab === 'matriks-admin' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">📊 Rekapitulasi Pelunasan SPP Seluruh Santri (Tahun 2026)</h3>
              <p className="text-xs text-slate-500">Matriks status pelunasan SPP per santri per bulan (Rp 250.000 / bln atau paket semester/3 bln)</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="text-emerald-700 font-extrabold">✓ = Lunas</span>
              <span className="text-amber-600 font-extrabold">⌛ = Pending</span>
              <span className="text-rose-600 font-extrabold">✕ = Belum Bayar</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3 sticky left-0 bg-slate-50 z-10">Nama Santri</th>
                  <th className="p-3">Kamar</th>
                  {MONTHS_2026.map(m => (
                    <th key={m} className="p-2 text-center whitespace-nowrap">
                      {m.substring(0, 3)}
                    </th>
                  ))}
                  <th className="p-3 text-right">Lunas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {santris.map(s => {
                  let lunasCount = 0;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-3 font-bold text-slate-800 sticky left-0 bg-white">
                        {s.name}
                      </td>
                      <td className="p-3 font-mono text-slate-500">{s.kamar}</td>
                      {MONTHS_2026.map(m => {
                        const payment = getPaymentForMonth(s.id, m);
                        if (payment && payment.status === 'lunas') {
                          lunasCount++;
                          const isPaketSem = payment.paket === 'semester';
                          const isPaket3Bln = payment.paket === '3_bulan';
                          return (
                            <td key={m} className="p-2 text-center" title={`${m}: Lunas ${isPaketSem ? '(Semester)' : isPaket3Bln ? '(3 Bln)' : ''}`}>
                              <span className="inline-flex flex-col items-center justify-center">
                                <span className="inline-block w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold leading-6">✓</span>
                                {(isPaketSem || isPaket3Bln) && (
                                  <span className="text-[8px] font-bold text-purple-700 mt-0.5">
                                    {isPaketSem ? 'Sem' : '3Bln'}
                                  </span>
                                )}
                              </span>
                            </td>
                          );
                        } else if (payment && payment.status === 'pending') {
                          return (
                            <td key={m} className="p-2 text-center" title={`${m}: Menunggu Verifikasi`}>
                              <span className="inline-block w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-extrabold leading-6">⌛</span>
                            </td>
                          );
                        } else {
                          return (
                            <td key={m} className="p-2 text-center" title={`${m}: Belum Bayar`}>
                              <span className="inline-block w-6 h-6 rounded-lg bg-rose-50 text-rose-600 font-bold leading-6">✕</span>
                            </td>
                          );
                        }
                      })}
                      <td className="p-3 text-right font-bold text-emerald-700">
                        {lunasCount} / 12 Bln
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADMIN TAB 3: SEMUA RIWAYAT SETORAN SPP */}
      {role === 'admin' && activeTab === 'riwayat-admin' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-800">Semua Catatan Pembayaran SPP Masuk</h3>
            <span className="text-xs font-bold text-slate-500">{allSppRecords.length} Total Data</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Santri</th>
                  <th className="p-3">Kamar</th>
                  <th className="p-3">Periode / Bulan</th>
                  <th className="p-3">Paket</th>
                  <th className="p-3 text-right">Nominal</th>
                  <th className="p-3">Tgl Transfer</th>
                  <th className="p-3">Bukti</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Verifikator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allSppRecords.map(k => (
                  <tr key={k.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800">{k.santriNama}</td>
                    <td className="p-3 font-mono text-slate-500">{k.kamar}</td>
                    <td className="p-3 font-semibold text-slate-700">{k.bulan}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700">
                        {k.paket === 'semester' ? '1 Semester (6 Bln)' : k.paket === '3_bulan' ? '3 Bulan (Triwulan)' : '1 Bulan'}
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900 font-mono">
                      Rp {k.jumlah.toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 text-slate-500">{k.tglBayar}</td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => setSelectedBuktiRecord(k)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] transition"
                        title="Klik untuk melihat bukti transfer / struk"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Lihat Bukti</span>
                      </button>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        k.status === 'lunas'
                          ? 'bg-emerald-100 text-emerald-800'
                          : k.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {k.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{k.verifikator || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SANTRI / WALI TAB 1: KARTU SPP BULANAN (2026) */}
      {role !== 'admin' && activeTab === 'kartu-spp' && (
        <div className="space-y-6">
          {/* Quick Pay Banner Options */}
          <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 text-white shadow-lg space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold bg-emerald-400 text-emerald-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1">
                  Pilihan Pembayaran Fleksibel
                </span>
                <h3 className="font-extrabold text-base md:text-lg">Bayar SPP Lebih Praktis: 1 Bulan, 3 Bulan, atau 1 Semester</h3>
                <p className="text-xs text-emerald-100/80 mt-0.5">
                  Santri dapat memilih pembayaran bulanan, triwulan, atau pelunasan langsung per semester.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div 
                onClick={() => handleSelectPaketAndPay('1_bulan')}
                className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl p-4 cursor-pointer transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-emerald-300">Paket 1 Bulan</span>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md">Bulanan</span>
                  </div>
                  <p className="text-xl font-extrabold text-white font-mono">Rp 250.000</p>
                  <p className="text-[11px] text-slate-300 mt-1">Bayar fleksibel per 1 bulan berjalan.</p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-xs text-emerald-300 font-bold group-hover:translate-x-0.5 transition">
                  <span>Pilih 1 Bulan &rarr;</span>
                </div>
              </div>

              <div 
                onClick={() => handleSelectPaketAndPay('3_bulan')}
                className="bg-purple-900/40 hover:bg-purple-900/60 border border-purple-400/40 rounded-2xl p-4 cursor-pointer transition flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-purple-300">Paket 3 Bulan (Triwulan)</span>
                    <span className="text-[10px] bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded-md">Praktis</span>
                  </div>
                  <p className="text-xl font-extrabold text-white font-mono">Rp 750.000</p>
                  <p className="text-[11px] text-purple-200/80 mt-1">Cakup 3 bulan sekaligus (TW 1 s/d TW 4).</p>
                </div>
                <div className="mt-3 pt-2 border-t border-purple-400/20 flex items-center justify-between text-xs text-purple-300 font-bold group-hover:translate-x-0.5 transition">
                  <span>Pilih 3 Bulan &rarr;</span>
                </div>
              </div>

              <div 
                onClick={() => handleSelectPaketAndPay('semester')}
                className="bg-amber-900/40 hover:bg-amber-900/60 border border-amber-400/40 rounded-2xl p-4 cursor-pointer transition flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-amber-400/10 rounded-full blur-xl pointer-events-none"></div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Paket 1 Semester (6 Bulan)</span>
                    </span>
                    <span className="text-[10px] bg-amber-500/30 text-amber-200 px-2 py-0.5 rounded-md">Rekomendasi</span>
                  </div>
                  <p className="text-xl font-extrabold text-white font-mono">Rp 1.500.000</p>
                  <p className="text-[11px] text-amber-200/80 mt-1">Lunas 6 bulan (Semester Genap / Ganjil).</p>
                </div>
                <div className="mt-3 pt-2 border-t border-amber-400/20 flex items-center justify-between text-xs text-amber-300 font-bold group-hover:translate-x-0.5 transition">
                  <span>Pilih Semester &rarr;</span>
                </div>
              </div>
            </div>
          </div>

          {/* 12 Months Cards Grid */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">🗓️ Kartu SPP Bulanan Santri (Tahun 2026)</h3>
                <p className="text-xs text-slate-500 mt-0.5">Pantau status pembayaran 12 bulan (Rp 250.000 / bulan atau paket semester/3 bln).</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                Santri: {targetSantri.name}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sppMatrix.map(item => {
                const isLunas = item.status === 'lunas';
                const isPending = item.status === 'pending';
                const payment = item.payment;
                const isPaketSem = payment?.paket === 'semester';
                const isPaket3Bln = payment?.paket === '3_bulan';

                return (
                  <div
                    key={item.bulan}
                    className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                      isLunas
                        ? 'border-emerald-200 bg-emerald-50/40'
                        : isPending
                        ? 'border-amber-200 bg-amber-50/40'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-extrabold text-sm text-slate-800">{item.bulan}</span>
                        {isLunas && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <span>✓ Lunas</span>
                            {isPaketSem && <span className="text-purple-700 font-mono">(Sem)</span>}
                            {isPaket3Bln && <span className="text-purple-700 font-mono">(3Bln)</span>}
                          </span>
                        )}
                        {isPending && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            ⌛ Menunggu
                          </span>
                        )}
                        {!isLunas && !isPending && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            ✕ Belum Bayar
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 font-medium">Tarif SPP: Rp 250.000</p>

                      {payment && (
                        <div className="mt-2 text-[11px] text-slate-500 border-t border-slate-200/60 pt-2 space-y-1">
                          <p>Tgl Bayar: <span className="font-bold text-slate-700">{payment.tglBayar}</span></p>
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <span className="text-slate-500">Bukti:</span>
                            <button
                              type="button"
                              onClick={() => setSelectedBuktiRecord(payment)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline"
                              title="Klik untuk membuka bukti transfer"
                            >
                              <Eye className="w-3 h-3" />
                              <span className="truncate max-w-[130px]">{payment.bukti}</span>
                            </button>
                          </div>
                          {payment.periodeLabel && (
                            <p className="text-purple-700 font-bold truncate">🏷️ {payment.periodeLabel}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-2">
                      {isLunas ? (
                        <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Terverifikasi Lunas</span>
                        </div>
                      ) : isPending ? (
                        <div className="text-[11px] text-amber-700 font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Sedang Diverifikasi Bendahara</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleQuickPay(item.bulan)}
                          className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <span>Bayar SPP Ini</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SANTRI / WALI TAB 2: FORM UPLOAD BUKTI SPP (PILIH PAKET 1 BULAN / 3 BULAN / SEMESTER) */}
      {role !== 'admin' && activeTab === 'form-bayar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-700" />
              <span>Formulir Setor Bukti Transfer SPP (Pilih Paket)</span>
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-slate-900 block text-xs">{targetSantri.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">NIS: {targetSantri.nis} &bull; Kamar: {targetSantri.kamar}</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Santri Aktif
                </span>
              </div>

              {/* PAKET SELECTOR RADIO/CARDS */}
              <div>
                <label className="block mb-2 text-xs font-extrabold text-slate-800">
                  1. Pilih Paket Pembayaran SPP Santri:
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedPaket('1_bulan')}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      selectedPaket === '1_bulan'
                        ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-600/30'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">Bulanan</span>
                      <span className="text-xs font-extrabold text-slate-900 block mt-0.5">1 Bulan</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-700 mt-2">Rp 250.000</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaket('3_bulan')}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      selectedPaket === '3_bulan'
                        ? 'border-purple-600 bg-purple-50/80 ring-2 ring-purple-600/30'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-bold text-purple-600 block uppercase">Triwulan</span>
                      <span className="text-xs font-extrabold text-slate-900 block mt-0.5">3 Bulan</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-purple-700 mt-2">Rp 750.000</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPaket('semester')}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      selectedPaket === 'semester'
                        ? 'border-amber-600 bg-amber-50/80 ring-2 ring-amber-600/30'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-bold text-amber-600 block uppercase">Semester</span>
                      <span className="text-xs font-extrabold text-slate-900 block mt-0.5">6 Bulan</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-700 mt-2">Rp 1.500.000</span>
                  </button>
                </div>
              </div>

              {/* DYNAMIC PERIODE PICKER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block mb-1 text-slate-700">
                    {selectedPaket === '1_bulan' && 'Pilih Bulan SPP'}
                    {selectedPaket === '3_bulan' && 'Pilih Periode Triwulan (3 Bulan)'}
                    {selectedPaket === 'semester' && 'Pilih Periode Semester (6 Bulan)'}
                  </label>

                  {selectedPaket === '1_bulan' && (
                    <select
                      value={selectedBulan}
                      onChange={(e) => setSelectedBulan(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    >
                      {MONTHS_2026.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  )}

                  {selectedPaket === '3_bulan' && (
                    <select
                      value={selectedTriwulan}
                      onChange={(e) => setSelectedTriwulan(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-purple-200 rounded-xl outline-none text-purple-900 font-bold"
                    >
                      {TRIWULAN_OPTIONS.map(tw => (
                        <option key={tw.id} value={tw.id}>{tw.label}</option>
                      ))}
                    </select>
                  )}

                  {selectedPaket === 'semester' && (
                    <select
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-amber-200 rounded-xl outline-none text-amber-900 font-bold"
                    >
                      {SEMESTER_OPTIONS.map(sem => (
                        <option key={sem.id} value={sem.id}>{sem.label}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block mb-1">Tanggal Transfer</label>
                  <input
                    type="date"
                    required
                    value={tglBayar}
                    onChange={(e) => setTglBayar(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* SUMMARY BOX */}
              <div className="p-3.5 bg-slate-900 text-white rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Total Nominal Transfer:</span>
                  <span className="text-base font-extrabold text-emerald-400 font-mono">
                    Rp {currentNominal.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 pt-1 border-t border-white/10 flex items-start gap-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Mencakup <strong>{currentCakupanBulan.length} Bulan:</strong> {currentCakupanBulan.join(', ')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block mb-1">Upload Foto / Resi Struk Transfer</label>
                <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-2xl p-4 text-center bg-slate-50 transition cursor-pointer relative">
                  <input
                    type="file"
                    required
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-6 h-6 text-emerald-700 mx-auto mb-2" />
                  <span className="text-xs font-extrabold text-emerald-700 block">Pilih File Foto Bukti Transfer</span>
                  <span className="text-[10px] text-slate-400 block mt-1">JPG, PNG atau PDF (Maks. 5MB)</span>
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
                  placeholder="Misal: SPP Semester Genap via transfer BNI a.n. Orang Tua"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('kartu-spp')}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-lg shadow-emerald-700/25 transition flex items-center gap-2 text-xs"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Kirim Bukti Pembayaran SPP</span>
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <h4 className="font-extrabold text-sm">Rekening Pembayaran SPP Resmi</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Silakan melakukan transfer ke salah satu rekening resmi bendahara pesantren di bawah ini, kemudian lampirkan foto/struk bukti transfer.
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
                  <span className="block text-[11px] text-slate-300">a.n. Pondok Darut Thalibin Telang</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-500/20 text-[11px] text-emerald-200">
                💡 <strong>Tips:</strong> Pembayaran per semester langsung menyelesaikan administrasi 6 bulan sekaligus tanpa perlu setor struk tiap bulan.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SANTRI / WALI TAB 3: RIWAYAT PEMBAYARAN SPP SAYA */}
      {role !== 'admin' && activeTab === 'riwayat-santri' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-800">Riwayat Setoran SPP Saya</h3>
            <span className="text-xs font-bold text-slate-500">{mySppRecords.length} Bukti SPP Terdaftar</span>
          </div>

          {mySppRecords.length === 0 ? (
            <div className="p-12 text-center text-slate-400">Belum ada riwayat pembayaran SPP yang diunggah.</div>
          ) : (
            <div className="space-y-3">
              {mySppRecords.map(k => (
                <div key={k.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900">SPP: {k.bulan}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        k.status === 'lunas' ? 'bg-emerald-100 text-emerald-800' : k.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {k.status.toUpperCase()}
                      </span>
                      {k.paket && (
                        <span className="text-[10px] bg-purple-100 text-purple-800 font-extrabold px-2 py-0.5 rounded-full">
                          {k.paket === 'semester' ? '1 Semester' : k.paket === '3_bulan' ? '3 Bulan' : '1 Bulan'}
                        </span>
                      )}
                    </div>
                    {k.cakupanBulan && k.cakupanBulan.length > 1 && (
                      <p className="text-slate-600 font-semibold mt-0.5">
                        Mencakup: {k.cakupanBulan.join(', ')}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-slate-500">Tanggal Bayar: {k.tglBayar}</span>
                      <span className="text-slate-300">&bull;</span>
                      <button
                        type="button"
                        onClick={() => setSelectedBuktiRecord(k)}
                        className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 underline text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Bukti ({k.bukti})</span>
                      </button>
                    </div>
                    {k.catatan && <p className="text-slate-600 italic mt-0.5">&ldquo;{k.catatan}&rdquo;</p>}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-emerald-700 font-mono">Rp {k.jumlah.toLocaleString('id-ID')}</span>
                    {k.verifikator && <p className="text-[10px] text-slate-400 mt-0.5">Disetujui oleh {k.verifikator}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reject Modal (Admin) */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-100 animate-scaleUp">
            <h3 className="font-bold text-base text-slate-800">Tolak Pembayaran SPP</h3>
            <p className="text-xs text-slate-500">
              Tuliskan alasan penolakan bukti transfer SPP santri (misal: nominal kurang, struk transfer tidak terbaca).
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alasan Penolakan</label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Contoh: Bukti transfer tidak jelas atau nominal tidak sesuai paket..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-rose-600/20"
                >
                  Konfirmasi Tolak
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Bukti Pembayaran Modal */}
      <BuktiPembayaranModal
        record={selectedBuktiRecord}
        onClose={() => setSelectedBuktiRecord(null)}
        onApprove={handleApprove}
        onReject={(id) => {
          setRejectingId(id);
          setRejectReason('');
        }}
        role={role}
      />
    </div>
  );
};
