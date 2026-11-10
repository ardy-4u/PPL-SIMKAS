import React, { useState } from 'react';
import { Keuangan } from '../types/simkas';
import { X, CheckCircle2, Printer, ShieldCheck, Building2, Check, Eye, ZoomIn } from 'lucide-react';

interface BuktiPembayaranModalProps {
  record: Keuangan | null;
  onClose: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  role?: string;
}

export const BuktiPembayaranModal: React.FC<BuktiPembayaranModalProps> = ({
  record,
  onClose,
  onApprove,
  onReject,
  role = 'admin'
}) => {
  const [zoomImage, setZoomImage] = useState(false);

  if (!record) return null;

  // Determine bank style based on file name or notes
  const textInfo = `${record.bukti} ${record.catatan || ''}`.toLowerCase();
  let bankName = 'BANK NEGARA INDONESIA (BNI)';
  let bankColor = 'from-teal-700 to-emerald-900';

  if (textInfo.includes('bsi')) {
    bankName = 'BANK SYARIAH INDONESIA (BSI)';
    bankColor = 'from-emerald-700 to-teal-800';
  } else if (textInfo.includes('bca')) {
    bankName = 'BANK CENTRAL ASIA (BCA)';
    bankColor = 'from-blue-700 to-indigo-900';
  } else if (textInfo.includes('bri')) {
    bankName = 'BANK RAKYAT INDONESIA (BRI)';
    bankColor = 'from-blue-800 to-sky-950';
  } else if (textInfo.includes('mandiri')) {
    bankName = 'BANK MANDIRI (LIVIN)';
    bankColor = 'from-amber-600 to-blue-900';
  }

  const handlePrint = () => {
    window.print();
  };

  const refNumber = `TRX-${record.id.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-slate-100 overflow-hidden animate-scaleUp">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                Verifikasi Bukti Transfer Pembayaran
              </h3>
              <p className="text-[11px] text-slate-500">
                Santri: <strong className="text-slate-700">{record.santriNama}</strong> ({record.kamar}) &bull; Ref: <span className="font-mono">{refNumber}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition font-bold text-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* LEFT COLUMN: STRUK DIGITAL RESMI / GAMBAR BUKTI */}
            <div className="md:col-span-7 flex flex-col items-center">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-2 self-start">
                DOKUMEN RESI / STRUK TRANSFER RESMI
              </span>

              {record.buktiUrl ? (
                /* Jika ada file gambar asli yang diunggah santri */
                <div className="w-full bg-slate-50 rounded-2xl p-2 border border-slate-200 relative group">
                  <img
                    src={record.buktiUrl}
                    alt="Bukti Transfer Asli"
                    className={`w-full rounded-xl object-contain transition-all duration-300 ${zoomImage ? 'max-h-[500px]' : 'max-h-72'}`}
                  />
                  <button
                    onClick={() => setZoomImage(!zoomImage)}
                    className="absolute bottom-4 right-4 bg-slate-900/80 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs opacity-90 hover:opacity-100"
                  >
                    <ZoomIn className="w-3 h-3" />
                    <span>{zoomImage ? 'Perkecil' : 'Perbesar'}</span>
                  </button>
                </div>
              ) : (
                /* Struk Digital Mobile Banking High-Fidelity */
                <div className="w-full bg-gradient-to-b from-white to-slate-50 rounded-3xl border-2 border-slate-200 p-5 shadow-md relative overflow-hidden font-sans">
                  {/* Bank Header Banner */}
                  <div className={`-mx-5 -mt-5 p-4 bg-gradient-to-r ${bankColor} text-white flex items-center justify-between mb-4 shadow-xs`}>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-amber-300" />
                      <span className="font-extrabold text-xs tracking-wider">{bankName}</span>
                    </div>
                    <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">M-Banking</span>
                  </div>

                  {/* Transfer Success Status */}
                  <div className="text-center my-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 ring-4 ring-emerald-50">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h4 className="font-black text-slate-800 text-sm tracking-wide">TRANSFER BERHASIL</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {record.tglBayar} &bull; 08:34:21 WIB
                    </p>
                  </div>

                  {/* Total Nominal */}
                  <div className="text-center my-4 py-3 bg-slate-100/80 rounded-2xl border border-slate-200/80">
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block mb-0.5">
                      Jumlah Transfer
                    </span>
                    <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                      Rp {record.jumlah.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Detail Transaksi List */}
                  <div className="space-y-2 text-xs divide-y divide-slate-100 text-slate-600">
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-400">Pengirim:</span>
                      <span className="font-bold text-slate-800 text-right">{record.santriNama}</span>
                    </div>

                    <div className="flex justify-between pt-2">
                      <span className="text-slate-400">Tujuan:</span>
                      <span className="font-bold text-slate-800 text-right">PPM Darut Thalibin Telang</span>
                    </div>

                    <div className="flex justify-between pt-2">
                      <span className="text-slate-400">Rekening Tujuan:</span>
                      <span className="font-mono font-bold text-slate-700">1234-5678-90 (BNI/BSI)</span>
                    </div>

                    <div className="flex justify-between pt-2">
                      <span className="text-slate-400">Jenis Tagihan:</span>
                      <span className="font-extrabold text-emerald-800 capitalize">
                        {record.jenis === 'spp' ? 'SPP Santri' : 'Iuran Kas Santri'} ({record.bulan})
                      </span>
                    </div>

                    <div className="flex justify-between pt-2">
                      <span className="text-slate-400">No. Referensi:</span>
                      <span className="font-mono font-bold text-slate-800">{refNumber}</span>
                    </div>

                    {record.catatan && (
                      <div className="flex justify-between pt-2">
                        <span className="text-slate-400">Catatan:</span>
                        <span className="font-medium text-slate-700 italic text-right max-w-[200px]">
                          &ldquo;{record.catatan}&rdquo;
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Stempel Digital Pesantren */}
                  <div className="mt-5 pt-3 border-t-2 border-dashed border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex items-center gap-1 text-emerald-700 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>E-RECEIPT RESMI TERVALIDASI</span>
                    </div>
                    <span className="font-mono">PPM-DT-2026</span>
                  </div>
                </div>
              )}

              <div className="mt-2 text-center">
                <span className="text-[11px] text-slate-400 font-mono">
                  Nama Berkas: <strong className="text-slate-600">{record.bukti}</strong>
                </span>
              </div>
            </div>

            {/* RIGHT COLUMN: INFORMASI DETAIL ADMINISTRASI SANTRI */}
            <div className="md:col-span-5 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                  DATA ADMINISTRASI & VERIFIKASI
                </span>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Nama Santri:</span>
                    <span className="font-extrabold text-slate-900 text-sm">{record.santriNama}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Kamar Asrama:</span>
                      <span className="font-bold text-slate-800 font-mono">{record.kamar}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Tanggal Bayar:</span>
                      <span className="font-bold text-slate-800">{record.tglBayar}</span>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-slate-200">
                    <span className="text-[10px] text-slate-400 block">Kategori / Paket:</span>
                    <span className="font-bold text-slate-800">
                      {record.paket === 'semester'
                        ? '1 Semester (6 Bulan)'
                        : record.paket === '3_bulan'
                        ? '3 Bulan (Triwulan)'
                        : '1 Bulan'}
                    </span>
                  </div>

                  {record.cakupanBulan && record.cakupanBulan.length > 1 && (
                    <div className="pt-1 border-t border-slate-200">
                      <span className="text-[10px] text-purple-700 block font-bold">Mencakup {record.cakupanBulan.length} Bulan:</span>
                      <p className="text-[11px] text-slate-700 font-semibold">{record.cakupanBulan.join(', ')}</p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-slate-500 font-bold">Status Bukti:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        record.status === 'lunas'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : record.status === 'pending'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {record.status === 'lunas' ? '✓ Lunas Terverifikasi' : record.status === 'pending' ? '⌛ Menunggu Persetujuan' : '✕ Ditolak'}
                    </span>
                  </div>

                  {record.verifikator && (
                    <div className="pt-1 text-[11px] text-slate-400">
                      Disetujui oleh <strong className="text-slate-600">{record.verifikator}</strong>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 text-[11px] text-emerald-900 leading-relaxed">
                  <div className="flex items-center gap-1.5 font-bold mb-0.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Petunjuk Pengurus:</span>
                  </div>
                  Pastikan nominal pada struk (<strong>Rp {record.jumlah.toLocaleString('id-ID')}</strong>) cocok dengan mutasi rekening bank pondok sebelum menekan tombol persetujuan.
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                {role === 'admin' && record.status === 'pending' && onApprove && onReject && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onApprove(record.id);
                        onClose();
                      }}
                      className="py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20"
                    >
                      <Check className="w-4 h-4" />
                      <span>Setujui Pembayaran</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onReject(record.id);
                      }}
                      className="py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <X className="w-4 h-4" />
                      <span>Tolak Bukti</span>
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Struk</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

