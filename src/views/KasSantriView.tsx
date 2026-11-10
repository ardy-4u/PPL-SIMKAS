import React, { useState } from 'react';
import { useSimkas } from '../context/SimkasContext';
import { Coins, Upload, FileCheck, Check, X, CalendarDays, Receipt, Clock, CheckCircle2, ArrowRight, Building2, Download, Users, Eye } from 'lucide-react';
import { Keuangan } from '../types/simkas';
import { BuktiPembayaranModal } from '../components/BuktiPembayaranModal';

export const KasSantriView: React.FC = () => {
  const { role, currentUser, keuangans, santris, submitPembayaran, verifyPembayaran, showToast } = useSimkas();

  // Active Tab:
  // For Admin: 'verifikasi' | 'matriks-admin' | 'riwayat-admin'
  // For Santri/Ortu: 'kartu-kas' | 'form-bayar' | 'riwayat-santri'
  const [activeTab, setActiveTab] = useState<string>(role === 'admin' ? 'verifikasi' : 'kartu-kas');

  // Bukti modal inspection state
  const [selectedBuktiRecord, setSelectedBuktiRecord] = useState<Keuangan | null>(null);

  // Form state for uploading proof (Santri / Ortu only)
  const [bulan, setBulan] = useState('Mei 2026');
  const jumlah = 50000; // Fixed nominal for Iuran Kas Santri (Rp 50.000 / bln)
  const [tglBayar, setTglBayar] = useState(new Date().toISOString().substring(0, 10));
  const [fileName, setFileName] = useState('');
  const [filePreview, setFilePreview] = useState<string | undefined>(undefined);
  const [catatan, setCatatan] = useState('');

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

  // Filter Kas Santri records (supports new 'kas_santri' and legacy 'uang_makan' gracefully)
  const allKasRecords = keuangans.filter(k => k.jenis === 'kas_santri' || k.jenis === 'uang_makan');
  const pendingKasAdmin = allKasRecords.filter(k => k.status === 'pending');

  // Records for current santri
  const myKasRecords = allKasRecords.filter(k => k.santriId === targetSantri.id);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(undefined);
      }
      showToast(`Bukti transfer ${file.name} terpilih`, 'info');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tglBayar || !fileName) {
      return showToast('Lengkapi tanggal transfer dan unggah file bukti transfer kas', 'error');
    }

    submitPembayaran({
      santriId: targetSantri.id,
      santriNama: targetSantri.name,
      kamar: targetSantri.kamar,
      jenis: 'kas_santri',
      bulan,
      jumlah,
      tglBayar,
      bukti: fileName,
      buktiUrl: filePreview,
      catatan
    });

    setFileName('');
    setFilePreview(undefined);
    setCatatan('');
    setActiveTab('riwayat-santri');
  };

  const handleQuickPay = (targetBulan: string) => {
    setBulan(targetBulan);
    setActiveTab('form-bayar');
  };

  const handleApprove = (id: string) => {
    verifyPembayaran(id, true, 'Pembayaran Iuran Kas Santri valid dan telah disetujui.');
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
  const kasMatrix = MONTHS_2026.map(m => {
    const payment = myKasRecords.find(k => k.bulan === m);
    const status = payment ? payment.status : 'belum_bayar';
    return { bulan: m, payment, status };
  });

  const totalKasLunas = myKasRecords.filter(k => k.status === 'lunas').length;
  const totalKasNominalLunas = totalKasLunas * 50000;

  // Export CSV
  const handleExportCsv = () => {
    const headers = ["ID", "Santri", "Kamar", "Bulan Kas", "Nominal (Rp)", "Tanggal Bayar", "Status", "Bukti File", "Verifikator"];
    const recordsToExport = role === 'admin' ? allKasRecords : myKasRecords;
    const rows = recordsToExport.map(k => [
      k.id,
      `"${k.santriNama}"`,
      k.kamar,
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
    link.setAttribute("download", `rekap_iuran_kas_santri_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Rekap Iuran Kas Santri berhasil diexport ke CSV', 'success');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Coins className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-800">
              {role === 'admin' ? 'Verifikasi Iuran Kas Santri' : 'Iuran Kas Santri (Kas Asrama & Fasilitas Kamar)'}
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              Rp 50.000 / Bulan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {role === 'admin' 
              ? 'Menyetujui dan memverifikasi bukti setoran iuran kas kamar, kebersihan, listrik, dan fasilitas asrama dari santri/wali santri.'
              : 'Informasi tagihan iuran kas santri untuk kebersihan kamar, WiFi asrama, listrik, dan sarana bersama (Januari - Desember 2026).'}
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
            <p className="text-2xl font-extrabold text-amber-600">{pendingKasAdmin.length} Bukti Kas</p>
            <p className="text-xs text-slate-400 mt-1">Perlu dicek dan disetujui bendahara</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-700 uppercase">Iuran Kas Disetujui</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-extrabold text-amber-700">
              {allKasRecords.filter(k => k.status === 'lunas').length} Setoran
            </p>
            <p className="text-xs text-slate-400 mt-1">Telah dibukukan ke kas santri</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Total Santri Aktif</span>
              <Users className="w-4 h-4 text-slate-600" />
            </div>
            <p className="text-2xl font-extrabold text-slate-800">{santris.length} Santri</p>
            <p className="text-xs text-slate-400 mt-1">Kamar Asrama A, B, C, D</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950 text-white p-5 rounded-3xl shadow-lg">
            <span className="text-xs font-bold text-amber-200 uppercase block mb-1">Total Kas Terbayar (2026)</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">
              Rp {totalKasNominalLunas.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-amber-100/80 mt-2 font-medium">
              {totalKasLunas} dari 12 Bulan telah terbayar
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Status Kas Bulan Ini (Mei 2026)</span>
            <div className="flex items-center gap-2 mt-1">
              {myKasRecords.find(k => k.bulan === 'Mei 2026' && k.status === 'lunas') ? (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ✓ Lunas Terverifikasi
                </span>
              ) : myKasRecords.find(k => k.bulan === 'Mei 2026' && k.status === 'pending') ? (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                  ⌛ Menunggu Verifikasi
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                  ✕ Belum Bayar
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Tarif Iuran Kas: Rp 50.000 / bln</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Menunggu Verifikasi</span>
            <p className="text-2xl font-extrabold text-purple-700 mt-1">
              {myKasRecords.filter(k => k.status === 'pending').length} Bukti
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
                  ? 'bg-white text-amber-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Persetujuan Kas Santri Masuk ({pendingKasAdmin.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('matriks-admin')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition ${
                activeTab === 'matriks-admin'
                  ? 'bg-white text-amber-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Rekap Kas 12 Bulan (Semua Santri)</span>
            </button>

            <button
              onClick={() => setActiveTab('riwayat-admin')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition ${
                activeTab === 'riwayat-admin'
                  ? 'bg-white text-amber-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Semua Riwayat Setoran Kas</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('kartu-kas')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition ${
                activeTab === 'kartu-kas'
                  ? 'bg-white text-amber-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Kartu Kas Santri Bulanan (2026)</span>
            </button>

            <button
              onClick={() => setActiveTab('form-bayar')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition ${
                activeTab === 'form-bayar'
                  ? 'bg-white text-amber-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Bayar / Unggah Bukti Kas</span>
            </button>

            <button
              onClick={() => setActiveTab('riwayat-santri')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold transition ${
                activeTab === 'riwayat-santri'
                  ? 'bg-white text-amber-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Riwayat Setoran Kas Saya ({myKasRecords.length})</span>
            </button>
          </>
        )}
      </div>

      {/* ADMIN TAB 1: PERSETUJUAN BUKTI TRANSFER KAS MASUK */}
      {role === 'admin' && activeTab === 'verifikasi' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <h3 className="font-extrabold text-sm text-slate-800 pb-1 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Daftar Bukti Transfer Iuran Kas Santri Menunggu Persetujuan Bendahara</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Periksa kesesuaian struk transfer iuran kas kamar/asrama santri, lalu setujui atau tolak verifikasi.
            </p>

            {pendingKasAdmin.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                <p className="font-bold text-slate-700 text-sm">Tidak ada bukti setoran kas yang menunggu persetujuan.</p>
                <p className="text-xs text-slate-400 mt-0.5">Semua pengajuan bukti transfer kas santri telah tuntas diproses.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingKasAdmin.map(k => (
                  <div key={k.id} className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-amber-200/60">
                      <div>
                        <span className="font-extrabold text-sm text-slate-900">{k.santriNama}</span>
                        <span className="text-xs text-slate-500 ml-2 font-mono">(Kamar: {k.kamar})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-200 font-mono">
                          Kas {k.bulan} &bull; Rp {k.jumlah.toLocaleString('id-ID')}
                        </span>
                        <span className="text-xs text-slate-400">{k.tglBayar}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-slate-500">Bukti Transfer:</span>
                          <button
                            type="button"
                            onClick={() => setSelectedBuktiRecord(k)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs transition"
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
                          <span>Setujui Iuran Kas</span>
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

      {/* ADMIN TAB 2: REKAP MATRIKS KAS 12 BULAN SELURUH SANTRI */}
      {role === 'admin' && activeTab === 'matriks-admin' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800">📊 Rekapitulasi Iuran Kas Santri (Tahun 2026)</h3>
              <p className="text-xs text-slate-500">Matriks status pelunasan uang kas kamar/asrama per santri per bulan (Rp 50.000 / bln)</p>
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
                        const payment = allKasRecords.find(k => k.santriId === s.id && k.bulan === m);
                        if (payment && payment.status === 'lunas') {
                          lunasCount++;
                          return (
                            <td key={m} className="p-2 text-center" title={`${m}: Lunas`}>
                              <span className="inline-block w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold leading-6">✓</span>
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
                      <td className="p-3 text-right font-bold text-amber-700">
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

      {/* ADMIN TAB 3: SEMUA RIWAYAT SETORAN KAS */}
      {role === 'admin' && activeTab === 'riwayat-admin' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-800">Semua Catatan Iuran Kas Santri Masuk</h3>
            <span className="text-xs font-bold text-slate-500">{allKasRecords.length} Total Data</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Santri</th>
                  <th className="p-3">Kamar</th>
                  <th className="p-3">Bulan Kas</th>
                  <th className="p-3 text-right">Nominal</th>
                  <th className="p-3">Tgl Transfer</th>
                  <th className="p-3">Bukti</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Verifikator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allKasRecords.map(k => (
                  <tr key={k.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800">{k.santriNama}</td>
                    <td className="p-3 font-mono text-slate-500">{k.kamar}</td>
                    <td className="p-3 font-semibold text-slate-700">{k.bulan}</td>
                    <td className="p-3 text-right font-bold text-slate-900 font-mono">
                      Rp {k.jumlah.toLocaleString('id-ID')}
                    </td>
                    <td className="p-3 text-slate-500">{k.tglBayar}</td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => setSelectedBuktiRecord(k)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-[11px] transition"
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

      {/* SANTRI / WALI TAB 1: KARTU KAS SANTRI BULANAN (2026) */}
      {role !== 'admin' && activeTab === 'kartu-kas' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">🗓️ Kartu Iuran Kas Santri (Tahun 2026)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Iuran kas santri untuk kebersihan, fasilitas kamar & sarpras asrama (Rp 50.000 / bulan).</p>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
              Santri: {targetSantri.name}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {kasMatrix.map(item => {
              const isLunas = item.status === 'lunas';
              const isPending = item.status === 'pending';
              const payment = item.payment;

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
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          ✓ Lunas
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

                    <p className="text-xs text-slate-500 font-medium">Tarif Iuran Kas: Rp 50.000</p>

                    {payment && (
                      <div className="mt-2 text-[11px] text-slate-500 border-t border-slate-200/60 pt-2 space-y-1">
                        <p>Tgl Bayar: <span className="font-bold text-slate-700">{payment.tglBayar}</span></p>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className="text-slate-500">Bukti:</span>
                          <button
                            type="button"
                            onClick={() => setSelectedBuktiRecord(payment)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-900 underline"
                            title="Klik untuk membuka bukti transfer"
                          >
                            <Eye className="w-3 h-3" />
                            <span className="truncate max-w-[130px]">{payment.bukti}</span>
                          </button>
                        </div>
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
                        <span>Sedang Diverifikasi</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleQuickPay(item.bulan)}
                        className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
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
      )}

      {/* SANTRI / WALI TAB 2: FORM UPLOAD BUKTI KAS SANTRI */}
      {role !== 'admin' && activeTab === 'form-bayar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-700" />
              <span>Formulir Setor Bukti Transfer Iuran Kas Santri</span>
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-slate-900 block text-xs">{targetSantri.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">NIS: {targetSantri.nis} &bull; Kamar: {targetSantri.kamar}</span>
                </div>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                  Santri Aktif
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Bulan Kas yang Dibayar</label>
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

              <div>
                <label className="block mb-1">Nominal Iuran Kas Santri</label>
                <input
                  type="text"
                  disabled
                  value="Rp 50.000 (Iuran Kas & Fasilitas Kamar)"
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl outline-none font-bold text-slate-700 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block mb-1">Upload Foto / Resi Struk Transfer</label>
                <div className="border-2 border-dashed border-slate-200 hover:border-amber-500 rounded-2xl p-4 text-center bg-slate-50 transition cursor-pointer relative">
                  <input
                    type="file"
                    required
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-6 h-6 text-amber-700 mx-auto mb-2" />
                  <span className="text-xs font-extrabold text-amber-700 block">Pilih File Foto Bukti</span>
                  <span className="text-[10px] text-slate-400 block mt-1">JPG, PNG atau PDF (Max 5MB)</span>
                  {fileName && (
                    <div className="mt-2 p-2 bg-amber-100 text-amber-900 rounded-lg text-[11px] font-bold truncate">
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
                  placeholder="Misal: Iuran kas kamar Mei via BSI a.n. David"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('kartu-kas')}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-lg shadow-amber-600/25 transition flex items-center gap-2 text-xs"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Kirim Bukti Pembayaran Kas</span>
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <h4 className="font-extrabold text-sm">Rekening Pembayaran Kas Santri</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Silakan melakukan transfer iuran kas kamar ke rekening operasional asrama pesantren di bawah ini:
              </p>

              <div className="space-y-2 bg-white/10 p-4 rounded-2xl border border-white/10 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">BANK SYARIAH INDONESIA (BSI)</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">7980-123-456</span>
                  <span className="block text-[11px] text-slate-300">a.n. Kas Asrama PPM Darut Thalibin</span>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <span className="text-slate-400 block text-[10px]">QRIS / E-WALLET ASRAMA</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">0821-3456-7890</span>
                  <span className="block text-[11px] text-slate-300">Bendahara Asrama Santri</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SANTRI / WALI TAB 3: RIWAYAT PEMBAYARAN KAS SAYA */}
      {role !== 'admin' && activeTab === 'riwayat-santri' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-800">Riwayat Setoran Kas Santri Saya</h3>
            <span className="text-xs font-bold text-slate-500">{myKasRecords.length} Bukti Kas Terdaftar</span>
          </div>

          {myKasRecords.length === 0 ? (
            <div className="p-12 text-center text-slate-400">Belum ada riwayat pembayaran kas yang diunggah.</div>
          ) : (
            <div className="space-y-3">
              {myKasRecords.map(k => (
                <div key={k.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900">Iuran Kas Bulan {k.bulan}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        k.status === 'lunas' ? 'bg-emerald-100 text-emerald-800' : k.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {k.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-slate-500">Tanggal Bayar: {k.tglBayar}</span>
                      <span className="text-slate-300">&bull;</span>
                      <button
                        type="button"
                        onClick={() => setSelectedBuktiRecord(k)}
                        className="inline-flex items-center gap-1 font-bold text-amber-700 hover:text-amber-900 underline text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Bukti ({k.bukti})</span>
                      </button>
                    </div>
                    {k.catatan && <p className="text-slate-600 italic mt-0.5">&ldquo;{k.catatan}&rdquo;</p>}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-amber-700 font-mono">Rp {k.jumlah.toLocaleString('id-ID')}</span>
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
            <h3 className="font-bold text-base text-slate-800">Tolak Setoran Iuran Kas</h3>
            <p className="text-xs text-slate-500">
              Tuliskan alasan penolakan bukti transfer iuran kas santri.
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alasan Penolakan</label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Contoh: Bukti transfer buram, mutasi rekening tidak masuk..."
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
