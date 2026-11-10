import React, { useState } from 'react';
import { useSimkas } from '../context/SimkasContext';
import { Database, Download, Upload, RotateCcw, Copy, Check, FileText, Server, AlertTriangle } from 'lucide-react';

export const DatabaseModal: React.FC = () => {
  const { isDbModalOpen, setIsDbModalOpen, resetDatabase, exportDatabaseJson, importDatabaseJson, getMysqlSchemaSql, showToast } = useSimkas();
  const [activeTab, setActiveTab] = useState<'status' | 'sql' | 'backup'>('status');
  const [copiedSql, setCopiedSql] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  if (!isDbModalOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(getMysqlSchemaSql());
    setCopiedSql(true);
    showToast('Script SQL disalin ke clipboard!', 'success');
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleDownloadSql = () => {
    const element = document.createElement("a");
    const file = new Blob([getMysqlSchemaSql()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "db_simkas_pondok.sql";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast('File db_simkas_pondok.sql berhasil diunduh', 'success');
  };

  const handleDownloadJson = () => {
    const element = document.createElement("a");
    const file = new Blob([exportDatabaseJson()], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = "simkas_backup_data.json";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast('Backup JSON berhasil diunduh', 'success');
  };

  const handleImportJson = () => {
    if (!jsonInput.trim()) return showToast('Masukkan teks JSON terlebih dahulu', 'error');
    if (importDatabaseJson(jsonInput)) {
      setJsonInput('');
      setIsDbModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-scaleUp">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold flex items-center gap-2">
                <span>SIMKAS Database Center & MySQL Simulator</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Online (Connected)
                </span>
              </h2>
              <p className="text-xs text-slate-400">Pusat sinkronisasi tabel, backup, dan ekspor SQL phpMyAdmin</p>
            </div>
          </div>

          <button
            onClick={() => setIsDbModalOpen(false)}
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-800 px-6 flex gap-2 border-b border-slate-700 shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'status' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Status Server & Reset</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'sql' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Skema SQL (MySQL)</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`py-3 px-4 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'backup' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-300 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Backup & Import JSON</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {activeTab === 'status' && (
            <div className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                <Server className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-emerald-900 text-sm">Informasi Koneksi Database Server</h3>
                  <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                    Aplikasi saat ini mensimulasikan koneksi aktif ke server lokal (127.0.0.1) dengan database <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-emerald-900">db_simkas_pondok</code>. Seluruh penambahan santri, absensi, persetujuan izin, dan verifikasi keuangan akan langsung tersimpan di LocalStorage browser secara persisten.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <Download className="w-4 h-4 text-slate-600" />
                      <span>Unduh File Skema SQL</span>
                    </h4>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      Download file <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono text-[11px]">.sql</code> lengkap dengan pembuatan tabel (Santri, Kegiatan, Absensi, Perizinan, Keuangan) dan data awal untuk langsung diimpor ke MySQL / phpMyAdmin di laptop dosen atau mahasiswa.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadSql}
                    className="mt-4 w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download db_simkas_pondok.sql</span>
                  </button>
                </div>

                <div className="border border-rose-200 rounded-2xl p-5 bg-rose-50/50 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-rose-900 text-sm flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-rose-600" />
                      <span>Reset Database ke Default SKPL</span>
                    </h4>
                    <p className="text-xs text-rose-700 mt-2 leading-relaxed">
                      Mengembalikan seluruh data santri, absensi, perizinan, dan keuangan ke kondisi awal sesuai dengan spesifikasi dokumen SKPL Kelompok 9 (David Febrianto, Moh. Yusuf Ardiansyah, Sulhan Humaidi, Anas, Yoga Andrian Febriyanto).
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('Anda yakin ingin mereset seluruh data kembali ke kondisi awal demo SKPL?')) {
                        resetDatabase();
                      }
                    }}
                    className="mt-4 w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-rose-600/20 transition"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Reset Data Sekarang</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <span className="text-xs font-bold text-slate-700">Skema & DDL Tabel MySQL (db_simkas_pondok)</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopySql}
                    className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'Tersalin!' : 'Salin Script SQL'}</span>
                  </button>
                  <button
                    onClick={handleDownloadSql}
                    className="py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh .SQL</span>
                  </button>
                </div>
              </div>
              <textarea
                readOnly
                value={getMysqlSchemaSql()}
                className="w-full flex-1 min-h-[300px] p-4 font-mono text-xs bg-slate-900 text-emerald-400 rounded-2xl outline-none leading-relaxed border border-slate-800"
              />
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Export State JSON Saat Ini</h4>
                  <p className="text-xs text-slate-600 mt-1">Unduh seluruh data yang ada di LocalStorage Anda menjadi file JSON untuk dipindahkan ke komputer/browser lain.</p>
                </div>
                <button
                  onClick={handleDownloadJson}
                  className="py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 shadow-sm transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup JSON</span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-2xl p-5 bg-white space-y-3">
                <h4 className="font-bold text-slate-800 text-sm">Import / Restore Data dari JSON</h4>
                <p className="text-xs text-slate-600">Tempel (paste) isi teks JSON yang sebelumnya Anda download untuk memulihkan seluruh data secara instan:</p>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder="Paste isi file simkas_backup_data.json di sini..."
                  className="w-full h-40 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
                <button
                  onClick={handleImportJson}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Jalankan Impor & Pulihkan Data</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
