import React, { useState } from 'react';
import { useSimkas } from '../context/SimkasContext';
import { Download, Printer, Calendar } from 'lucide-react';

export const LaporanView: React.FC = () => {
  const { santris, perizinans, keuangans, absensis, pelanggarans, kasOperasionals, showToast } = useSimkas();
  const [selectedBulan, setSelectedBulan] = useState('Mei 2026');

  const totalSantri = santris.filter(s => s.statusAktif).length;
  const izinApproved = perizinans.filter(p => p.status === 'disetujui').length;
  const izinRejected = perizinans.filter(p => p.status === 'ditolak').length;
  const izinPending = perizinans.filter(p => p.status === 'pending').length;

  const totalPemasukan = keuangans
    .filter(k => k.status === 'lunas')
    .reduce((acc, curr) => acc + curr.jumlah, 0);

  const keuPendingCount = keuangans.filter(k => k.status === 'pending').length;

  // Kas Operasional Pesantren
  const kasMasuk = kasOperasionals.filter(k => k.tipe === 'masuk').reduce((a, b) => a + b.nominal, 0);
  const kasKeluar = kasOperasionals.filter(k => k.tipe === 'keluar').reduce((a, b) => a + b.nominal, 0);
  const saldoKasOperasional = kasMasuk - kasKeluar;

  // Kedisiplinan stats
  const totalPelanggaran = pelanggarans.length;
  const hukumanSelesai = pelanggarans.filter(p => p.statusHukuman === 'selesai').length;
  const hukumanAktif = pelanggarans.filter(p => p.statusHukuman !== 'selesai').length;
  const totalPoinPelanggaran = pelanggarans.reduce((a, b) => a + b.poin, 0);

  // Absensi stats
  const totalHadir = absensis.filter(a => a.status === 'hadir').length;
  const totalIzin = absensis.filter(a => a.status === 'izin').length;
  const totalSakit = absensis.filter(a => a.status === 'sakit').length;
  const totalAlpha = absensis.filter(a => a.status === 'alpha').length;
  const totalAbsensi = absensis.length || 1;
  const overallRate = Math.round((totalHadir / totalAbsensi) * 100);

  const handlePrint = () => {
    window.print();
    showToast('Mencetak dokumen laporan...', 'info');
  };

  const handleExportExcel = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "LAPORAN REKAPITULASI BULANAN SIMKAS PONDOK PESANTREN DARUT THALIBIN\n" +
      `Periode Bulan: ${selectedBulan}\n\n` +
      "KETERANGAN,JUMLAH\n" +
      `Total Santri Aktif,${totalSantri}\n` +
      `Izin Disetujui,${izinApproved}\n` +
      `Izin Ditolak,${izinRejected}\n` +
      `Izin Pending,${izinPending}\n` +
      `Total Absensi Tercatat,${totalAbsensi}\n` +
      `Persentase Kehadiran Wajib,${overallRate}%\n` +
      `Total Pemasukan Tagihan Santri (Lunas),Rp ${totalPemasukan.toLocaleString('id-ID')}\n` +
      `Tagihan SPP Menunggu Verifikasi,${keuPendingCount}\n` +
      `Total Kas Operasional Masuk,Rp ${kasMasuk.toLocaleString('id-ID')}\n` +
      `Total Kas Operasional Keluar,Rp ${kasKeluar.toLocaleString('id-ID')}\n` +
      `Saldo Riil Kas Operasional,Rp ${saldoKasOperasional.toLocaleString('id-ID')}\n` +
      `Total Kasus Pelanggaran Kedisiplinan,${totalPelanggaran}\n` +
      `Akumulasi Poin Pelanggaran,+${totalPoinPelanggaran} Poin\n` +
      `Sanksi/Ta'zir Dituntaskan,${hukumanSelesai}\n` +
      `Sanksi/Ta'zir Belum Tuntas,${hukumanAktif}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Bulanan_SIMKAS_${selectedBulan.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan Excel / CSV berhasil diunduh!', 'success');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              SKPL Laporan Bulanan
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-800">📊 Laporan Rekapitulasi Pondok Pesantren</h2>
          <p className="text-xs text-slate-500 mt-1">
            Laporan eksekutif untuk pengurus pondok pesantren mencakup kehadiran, perizinan, dan sirkulasi keuangan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-slate-100 rounded-xl p-1 flex items-center border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-500 ml-2 mr-1" />
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none border-0 py-1 pr-2 cursor-pointer"
            >
              <option value="Mei 2026">Mei 2026</option>
              <option value="April 2026">April 2026</option>
              <option value="Maret 2026">Maret 2026</option>
            </select>
          </div>

          <button
            onClick={handleExportExcel}
            className="py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-700/20 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV / Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Report Document Box */}
      <div id="printableArea" className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-sm space-y-8">
        {/* Document Header */}
        <div className="text-center pb-6 border-b-2 border-slate-900 space-y-2">
          <div className="w-16 h-16 bg-emerald-800 rounded-2xl mx-auto flex items-center justify-center text-white font-extrabold text-2xl shadow-md mb-2">
            DT
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">
            PONDOK PESANTREN MAHASISWA DARUT THALIBIN
          </h1>
          <p className="text-xs text-slate-600 font-semibold">
            Jalan Raya Telang, Perumahan Dosen UTM, Bangkalan - Madura (Jawa Timur)
          </p>
          <div className="pt-2">
            <span className="inline-block px-4 py-1 rounded-full text-xs font-black bg-slate-900 text-white tracking-widest uppercase">
              LAPORAN ADMINISTRASI BULANAN ({selectedBulan})
            </span>
          </div>
        </div>

        {/* 3 Columns Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase block">Total Santri Asrama</span>
            <span className="text-3xl font-extrabold text-slate-900 block">{totalSantri} Santri</span>
            <p className="text-[11px] text-slate-400 font-medium">Terdaftar di 4 kamar gedung</p>
          </div>

          <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
            <span className="text-[11px] font-extrabold text-emerald-800 uppercase block">Pemasukan Lunas</span>
            <span className="text-3xl font-extrabold text-emerald-900 block">Rp {totalPemasukan.toLocaleString('id-ID')}</span>
            <p className="text-[11px] text-emerald-700 font-medium">SPP bulanan & uang katering</p>
          </div>

          <div className="p-5 bg-blue-50 rounded-2xl border border-blue-200 space-y-1">
            <span className="text-[11px] font-extrabold text-blue-800 uppercase block">Tingkat Disiplin Hadir</span>
            <span className="text-3xl font-extrabold text-blue-900 block">{overallRate}% Rata-rata</span>
            <p className="text-[11px] text-blue-700 font-medium">Jamaah & Kajian wajib</p>
          </div>
        </div>

        {/* Detailed Breakdown Tables */}
        <div className="space-y-6">
          {/* Section 1: Kehadiran */}
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 uppercase mb-3 pb-2 border-b border-slate-200 flex items-center justify-between">
              <span>1. Rekapitulasi Absensi Kegiatan Santri</span>
              <span className="text-xs text-slate-500 normal-case font-bold">Total: {totalAbsensi} Log</span>
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-xs text-slate-500 font-bold block">Hadir Tepat Waktu</span>
                <span className="text-xl font-extrabold text-emerald-700 block mt-1">{totalHadir}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-xs text-slate-500 font-bold block">Izin Keluar / Pulang</span>
                <span className="text-xl font-extrabold text-amber-700 block mt-1">{totalIzin}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-xs text-slate-500 font-bold block">Sakit di Kamar</span>
                <span className="text-xl font-extrabold text-blue-700 block mt-1">{totalSakit}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-xs text-slate-500 font-bold block">Alpha / Tanpa Kabar</span>
                <span className="text-xl font-extrabold text-rose-700 block mt-1">{totalAlpha}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Perizinan */}
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 uppercase mb-3 pb-2 border-b border-slate-200 flex items-center justify-between">
              <span>2. Rekapitulasi Surat Izin Keluar & Pulang</span>
              <span className="text-xs text-slate-500 normal-case font-bold">Total Pengajuan: {perizinans.length}</span>
            </h3>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold">
                <tr>
                  <th className="py-2.5 px-4">Status Pengajuan</th>
                  <th className="py-2.5 px-4 text-right">Jumlah Santri</th>
                  <th className="py-2.5 px-4">Keterangan Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="py-3 px-4 font-bold text-emerald-800">✅ Disetujui (Approved)</td>
                  <td className="py-3 px-4 text-right font-extrabold text-emerald-700">{izinApproved}</td>
                  <td className="py-3 px-4 text-slate-600">Surat izin diterbitkan, telah dikonfirmasi dengan wali santri</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-rose-800">❌ Ditolak (Rejected)</td>
                  <td className="py-3 px-4 text-right font-extrabold text-rose-700">{izinRejected}</td>
                  <td className="py-3 px-4 text-slate-600">Alasan tidak mendesak atau bertentangan dengan jadwal wajib pondok</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-amber-800">⏳ Menunggu Verifikasi (Pending)</td>
                  <td className="py-3 px-4 text-right font-extrabold text-amber-700">{izinPending}</td>
                  <td className="py-3 px-4 text-slate-600">Sedang diproses oleh ketua keamanan dan pengurus harian</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Keuangan */}
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 uppercase mb-3 pb-2 border-b border-slate-200 flex items-center justify-between">
              <span>3. Rekapitulasi Aliran Pembayaran Administrasi</span>
              <span className="text-xs text-slate-500 normal-case font-bold">Total Transaksi: {keuangans.length}</span>
            </h3>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold">
                  <tr>
                    <th className="py-2.5 px-4">Kategori Tagihan</th>
                    <th className="py-2.5 px-4 text-center">Status Lunas</th>
                    <th className="py-2.5 px-4 text-right">Total Pemasukan (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-800">SPP Bulanan Pesantren</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Lunas</span>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                      Rp {keuangans.filter(k => k.jenis === 'spp' && k.status === 'lunas').reduce((a,b)=>a+b.jumlah,0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-800">Iuran Kas & Fasilitas Santri</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Lunas</span>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                      Rp {keuangans.filter(k => (k.jenis === 'kas_santri' || k.jenis === 'uang_makan') && k.status === 'lunas').reduce((a,b)=>a+b.jumlah,0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-800">Donasi & Infaq Perluasan Masjid</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Lunas</span>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                      Rp {keuangans.filter(k => k.jenis === 'donasi' && k.status === 'lunas').reduce((a,b)=>a+b.jumlah,0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                  <tr className="bg-emerald-50 font-black text-emerald-900 text-sm border-t-2 border-emerald-300">
                    <td colSpan={2} className="py-3.5 px-4 uppercase">Total Penerimaan Lunas Periode Ini</td>
                    <td className="py-3.5 px-4 text-right">Rp {totalPemasukan.toLocaleString('id-ID')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Kas Operasional */}
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 uppercase mb-3 pb-2 border-b border-slate-200 flex items-center justify-between">
              <span>4. Rekapitulasi Kas Arus Operasional Pesantren</span>
              <span className="text-xs text-slate-500 normal-case font-bold">Total Transaksi: {kasOperasionals.length}</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 text-center">
                <span className="text-xs text-emerald-800 font-bold block">Total Kas Masuk (Debit)</span>
                <span className="text-lg font-extrabold text-emerald-900 block mt-1">Rp {kasMasuk.toLocaleString('id-ID')}</span>
              </div>
              <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-200 text-center">
                <span className="text-xs text-rose-800 font-bold block">Total Kas Keluar (Kredit)</span>
                <span className="text-lg font-extrabold text-rose-900 block mt-1">Rp {kasKeluar.toLocaleString('id-ID')}</span>
              </div>
              <div className="bg-slate-900 text-white p-3.5 rounded-xl text-center">
                <span className="text-xs text-slate-300 font-bold block">Saldo Kas Operasional</span>
                <span className="text-lg font-extrabold text-emerald-400 block mt-1">Rp {saldoKasOperasional.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          {/* Section 5: Kedisiplinan & Pelanggaran */}
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 uppercase mb-3 pb-2 border-b border-slate-200 flex items-center justify-between">
              <span>5. Rekapitulasi Kedisiplinan & Pelanggaran Santri</span>
              <span className="text-xs text-slate-500 normal-case font-bold">Total Kasus: {totalPelanggaran}</span>
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-xs text-slate-500 font-bold block">Kasus Pelanggaran</span>
                <span className="text-lg font-extrabold text-slate-800 block mt-1">{totalPelanggaran} Kasus</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-xs text-slate-500 font-bold block">Akumulasi Bobot Poin</span>
                <span className="text-lg font-extrabold text-rose-700 block mt-1">+{totalPoinPelanggaran} Poin</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-xs text-slate-500 font-bold block">Ta'zir Selesai</span>
                <span className="text-lg font-extrabold text-emerald-700 block mt-1">{hukumanSelesai} Tuntas</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="text-xs text-slate-500 font-bold block">Hukuman Belum Tuntas</span>
                <span className="text-lg font-extrabold text-amber-700 block mt-1">{hukumanAktif} Kasus</span>
              </div>
            </div>
          </div>
        </div>

        {/* Signature Box */}
        <div className="pt-12 grid grid-cols-2 gap-4 text-xs text-center font-bold text-slate-800">
          <div>
            <p className="mb-12">Mengetahui,<br />Dosen Pengampu UTM</p>
            <p className="underline font-black">Achmad Jauhari S.T., M.Kom</p>
            <p className="text-[10px] text-slate-500 font-mono">NIP: 1981010920060410003</p>
          </div>
          <div>
            <p className="mb-12">Bangkalan, {new Date().toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}<br />Ketua Kelompok 9 (SKPL)</p>
            <p className="underline font-black">David Febrianto</p>
            <p className="text-[10px] text-slate-500 font-mono">NIM: 230411100062</p>
          </div>
        </div>
      </div>
    </div>
  );
};
