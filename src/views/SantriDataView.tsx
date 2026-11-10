import React, { useState } from 'react';
import { useSimkas } from '../context/SimkasContext';
import { Santri } from '../types/simkas';
import { Search, Plus, UserCheck, UserX, Edit3, Trash2, Eye, X, Filter, Download } from 'lucide-react';

export const SantriDataView: React.FC = () => {
  const { santris, addSantri, updateSantri, deleteSantri, showToast } = useSimkas();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKamar, setFilterKamar] = useState('Semua');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSantri, setEditingSantri] = useState<Santri | null>(null);
  const [viewingSantri, setViewingSantri] = useState<Santri | null>(null);

  // Form state
  const [formData, setFormData] = useState<Omit<Santri, 'id'>>({
    nis: '',
    name: '',
    kamar: 'A-01',
    angkatan: 2024,
    tempatLahir: '',
    tanggalLahir: '2006-01-01',
    noHp: '',
    waliName: '',
    waliHp: '',
    statusAktif: true,
    fakultasUtm: 'Fakultas Teknik',
    prodiUtm: 'Teknik Informatika'
  });

  const filteredSantris = santris.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.nis.includes(searchTerm);
    const matchesKamar = filterKamar === 'Semua' || s.kamar.startsWith(filterKamar.substring(0, 1));
    return matchesSearch && matchesKamar;
  });

  const handleOpenAdd = () => {
    setFormData({
      nis: `2404111${Math.floor(10000 + Math.random() * 90000)}`,
      name: '',
      kamar: 'A-01',
      angkatan: 2024,
      tempatLahir: 'Bangkalan',
      tanggalLahir: '2006-05-15',
      noHp: '0812',
      waliName: 'Bpk. Wali',
      waliHp: '0821',
      statusAktif: true,
      fakultasUtm: 'Fakultas Teknik',
      prodiUtm: 'Teknik Informatika'
    });
    setEditingSantri(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (s: Santri) => {
    setEditingSantri(s);
    setFormData({ ...s });
    setIsAddModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.nis) return showToast('Nama dan NIS wajib diisi', 'error');

    if (editingSantri) {
      updateSantri(editingSantri.id, formData);
    } else {
      // Check duplicate NIS
      if (santris.some(s => s.nis === formData.nis)) {
        return showToast('NIS sudah terdaftar di sistem!', 'error');
      }
      addSantri(formData);
    }
    setIsAddModalOpen(false);
  };

  const handleExportCsv = () => {
    const headers = ["ID", "NIS", "Nama", "Kamar", "Angkatan", "Tempat Lahir", "Tgl Lahir", "No HP", "Wali", "Wali HP", "Fakultas", "Prodi"];
    const rows = santris.map(s => [
      s.id, s.nis, `"${s.name}"`, s.kamar, s.angkatan, `"${s.tempatLahir}"`, s.tanggalLahir, s.noHp, `"${s.waliName}"`, s.waliHp, `"${s.fakultasUtm}"`, `"${s.prodiUtm}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "data_induk_santri_simkas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data CSV santri berhasil diexport!', 'success');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800">📋 Pengelolaan Data Induk Santri</h2>
          <p className="text-xs text-slate-500 mt-1">Mengelola profil, penempatan kamar, informasi wali, dan status keaktifan santri di pondok.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-700/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Santri Baru</span>
          </button>
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
            placeholder="Cari nama atau NIS santri..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-bold text-slate-600">Filter Kamar:</span>
          <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {['Semua', 'A (Gedung 1)', 'B (Gedung 2)', 'C (Gedung 3)'].map((k) => (
              <button
                key={k}
                onClick={() => setFilterKamar(k)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  filterKamar === k
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Santri Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">NIS</th>
                <th className="py-3.5 px-4">Nama Santri</th>
                <th className="py-3.5 px-4">Kamar</th>
                <th className="py-3.5 px-4">Angkatan</th>
                <th className="py-3.5 px-4">Prodi / Fakultas</th>
                <th className="py-3.5 px-4">Kontak Wali</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredSantris.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    Tidak ada santri yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                filteredSantris.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition group">
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">{s.nis}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="text-[11px] text-slate-400">{s.noHp}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-bold rounded-md border border-slate-200">
                        {s.kamar}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-semibold">{s.angkatan}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 truncate max-w-[180px]">{s.prodiUtm}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[180px]">{s.fakultasUtm}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold">{s.waliName}</div>
                      <div className="text-[10px] text-slate-400">{s.waliHp}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {s.statusAktif ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <UserCheck className="w-3 h-3" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                          <UserX className="w-3 h-3" /> Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => setViewingSantri(s)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Detail Profil Santri"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                          title="Edit Santri"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Hapus santri ${s.name}?`)) deleteSantri(s.id);
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Santri"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100 animate-scaleUp">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <span className="text-xl">👤</span>
                <span>{editingSantri ? 'Edit Data Santri' : 'Input Santri Baru (Pondok Darut Thalibin)'}</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Induk Santri (NIS / NIM UTM)</label>
                  <input
                    type="text"
                    required
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Santri</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Contoh: David Febrianto"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kamar Asrama</label>
                  <select
                    value={formData.kamar}
                    onChange={(e) => setFormData({ ...formData, kamar: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="A-01">A-01 (Gedung 1 - Lt 1)</option>
                    <option value="A-02">A-02 (Gedung 1 - Lt 1)</option>
                    <option value="B-01">B-01 (Gedung 2 - Lt 1)</option>
                    <option value="B-02">B-02 (Gedung 2 - Lt 2)</option>
                    <option value="C-01">C-01 (Gedung 3 - Lt 1)</option>
                    <option value="C-02">C-02 (Gedung 3 - Lt 2)</option>
                    <option value="D-01">D-01 (Gedung 4 - Khusus)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tahun Angkatan Masuk</label>
                  <input
                    type="number"
                    value={formData.angkatan}
                    onChange={(e) => setFormData({ ...formData, angkatan: parseInt(e.target.value) || 2024 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fakultas di UTM</label>
                  <input
                    type="text"
                    value={formData.fakultasUtm}
                    onChange={(e) => setFormData({ ...formData, fakultasUtm: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Program Studi UTM</label>
                  <input
                    type="text"
                    value={formData.prodiUtm}
                    onChange={(e) => setFormData({ ...formData, prodiUtm: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formData.tempatLahir}
                    onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formData.tanggalLahir}
                    onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp / HP Santri</label>
                  <input
                    type="text"
                    value={formData.noHp}
                    onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status Santri</label>
                  <div className="flex items-center gap-3 py-2">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.statusAktif === true}
                        onChange={() => setFormData({ ...formData, statusAktif: true })}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Aktif di Asrama</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.statusAktif === false}
                        onChange={() => setFormData({ ...formData, statusAktif: false })}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span>Nonaktif / Boyong</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Wali Santri</label>
                  <input
                    type="text"
                    value={formData.waliName}
                    onChange={(e) => setFormData({ ...formData, waliName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nomor WhatsApp Wali (Orang Tua)</label>
                  <input
                    type="text"
                    value={formData.waliHp}
                    onChange={(e) => setFormData({ ...formData, waliHp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-500/20"
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
                  className="py-2.5 px-6 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-700/25 transition"
                >
                  {editingSantri ? 'Simpan Perubahan' : 'Tambahkan Santri'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Viewing Details Modal */}
      {viewingSantri && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-scaleUp">
            <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 p-6 text-white text-center relative">
              <button onClick={() => setViewingSantri(null)} className="absolute top-4 right-4 text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-white/20 text-3xl">
                👳‍♂️
              </div>
              <h3 className="font-extrabold text-lg">{viewingSantri.name}</h3>
              <p className="text-xs text-emerald-200 font-mono mt-0.5">NIS: {viewingSantri.nis}</p>
            </div>

            <div className="p-6 space-y-4 text-xs font-medium text-slate-700">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-extrabold">Kamar Asrama</span>
                  <span className="font-bold text-slate-800 text-sm">{viewingSantri.kamar}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-extrabold">Angkatan Masuk</span>
                  <span className="font-bold text-slate-800">{viewingSantri.angkatan}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-extrabold">Fakultas & Prodi UTM</span>
                <span className="font-bold text-slate-800 block">{viewingSantri.fakultasUtm} - {viewingSantri.prodiUtm}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-extrabold">Tempat, Tanggal Lahir</span>
                <span className="font-bold text-slate-800 block">{viewingSantri.tempatLahir}, {viewingSantri.tanggalLahir}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-extrabold">Nomor Kontak Pribadi</span>
                <span className="font-bold text-emerald-700 block">{viewingSantri.noHp}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase font-extrabold mb-1">Informasi Wali Santri</span>
                <div className="font-bold text-slate-800">{viewingSantri.waliName}</div>
                <div className="text-slate-500 text-[11px] mt-0.5">WhatsApp: {viewingSantri.waliHp}</div>
              </div>

              <button
                onClick={() => setViewingSantri(null)}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold mt-4"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
