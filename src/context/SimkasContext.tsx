import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role, User, Santri, Kegiatan, AbsensiRecord, Perizinan, Keuangan, Notifikasi, PelanggaranRecord, StatusHukuman, KasOperasional } from '../types/simkas';
import { INITIAL_SANTRI, INITIAL_KEGIATAN, INITIAL_ABSENSI, INITIAL_PERIZINAN, INITIAL_KEUANGAN, INITIAL_PELANGGARAN, INITIAL_KAS_OPERASIONAL } from '../data/initialData';

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface SimkasContextType {
  role: Role;
  currentUser: User;
  santris: Santri[];
  kegiatans: Kegiatan[];
  absensis: AbsensiRecord[];
  perizinans: Perizinan[];
  keuangans: Keuangan[];
  pelanggarans: PelanggaranRecord[];
  kasOperasionals: KasOperasional[];
  notifikasis: Notifikasi[];
  toasts: Toast[];
  currentView: string;
  isDbModalOpen: boolean;
  isLoginModalOpen: boolean;
  isLoggedIn: boolean;
  setRole: (role: Role) => void;
  setCurrentView: (view: string) => void;
  setIsDbModalOpen: (open: boolean) => void;
  setIsLoginModalOpen: (open: boolean) => void;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  
  // CRUD Santri
  addSantri: (santri: Omit<Santri, 'id'>) => void;
  updateSantri: (id: string, santri: Partial<Santri>) => void;
  deleteSantri: (id: string) => void;
  
  // Absensi
  addAbsensi: (record: Omit<AbsensiRecord, 'id' | 'timestamp'>) => void;
  quickScanRFID: (santriNis: string, kegiatanId: string) => boolean;
  
  // Perizinan
  submitIzin: (izin: Omit<Perizinan, 'id' | 'status' | 'tglPengajuan'>) => void;
  verifyIzin: (id: string, approve: boolean, catatan?: string) => void;
  
  // Keuangan Personal Santri
  submitPembayaran: (pembayaran: Omit<Keuangan, 'id' | 'status'>) => void;
  verifyPembayaran: (id: string, valid: boolean, catatan?: string) => void;

  // Kedisiplinan & Pelanggaran Santri
  addPelanggaran: (record: Omit<PelanggaranRecord, 'id'>) => void;
  updateStatusHukuman: (id: string, status: StatusHukuman, catatan?: string) => void;
  deletePelanggaran: (id: string) => void;

  // Buku Kas Operasional Pesantren
  addKasOperasional: (record: Omit<KasOperasional, 'id'>) => void;
  deleteKasOperasional: (id: string) => void;
  
  // Notifikasi
  markAllNotifRead: () => void;
  
  // DB & Demo Utilities
  resetDatabase: () => void;
  importDatabaseJson: (jsonString: string) => boolean;
  exportDatabaseJson: () => string;
  getMysqlSchemaSql: () => string;
}

const USERS: Record<Role, User> = {
  admin: {
    id: 'u-admin',
    name: 'Achmad Jauhari S.T., M.Kom',
    email: 'jauhari@trunojoyo.ac.id',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  },
  santri: {
    id: 's1',
    name: 'David Febrianto',
    email: 'david@santri.darutthalibin.id',
    role: 'santri',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    nis: '230411100062',
    kamar: 'A-01',
    angkatan: 2023,
    noHp: '081234567890',
    waliName: 'Bpk. Rahmat',
    waliHp: '082133445566'
  },
  ortu: {
    id: 'u-ortu',
    name: 'Bpk. Rahmat (Wali Santri David Febrianto)',
    email: 'rahmat.wali@gmail.com',
    role: 'ortu',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  }
};

const SimkasContext = createContext<SimkasContextType | undefined>(undefined);

export const SimkasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  const [role, setRoleState] = useState<Role>(() => {
    const saved = localStorage.getItem('simkas_role');
    return (saved as Role) || 'admin';
  });

  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [isDbModalOpen, setIsDbModalOpen] = useState<boolean>(false);
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('login') === '1') {
      // Hapus parameter dari URL agar refresh tidak buka modal lagi
      window.history.replaceState({}, '', '/');
      return true;
    }
    return false;
  });
  
  // Auto-migration to ensure all clients use updated roster (David Febrianto & Kelompok 9)
  const DATA_VERSION = 'v6_david_izin_wali';
  const savedVersion = localStorage.getItem('simkas_version');
  if (savedVersion !== DATA_VERSION) {
    localStorage.setItem('simkas_version', DATA_VERSION);
    localStorage.setItem('simkas_santris', JSON.stringify(INITIAL_SANTRI));
    localStorage.setItem('simkas_keuangans', JSON.stringify(INITIAL_KEUANGAN));
    localStorage.setItem('simkas_absensis', JSON.stringify(INITIAL_ABSENSI));
    localStorage.setItem('simkas_perizinans', JSON.stringify(INITIAL_PERIZINAN));
    localStorage.setItem('simkas_pelanggarans', JSON.stringify(INITIAL_PELANGGARAN));
    localStorage.setItem('simkas_kas_operasionals', JSON.stringify(INITIAL_KAS_OPERASIONAL));
  }

  const [santris, setSantris] = useState<Santri[]>(() => {
    const saved = localStorage.getItem('simkas_santris');
    const parsed: Santri[] = saved ? JSON.parse(saved) : INITIAL_SANTRI;
    return parsed.map(s => (s.id === 's1' && s.name === 'Muhammad Hanif') ? { ...s, name: 'David Febrianto', nis: '230411100062' } : s);
  });

  const [kegiatans, setKegiatans] = useState<Kegiatan[]>(() => {
    const saved = localStorage.getItem('simkas_kegiatans');
    return saved ? JSON.parse(saved) : INITIAL_KEGIATAN;
  });

  const [absensis, setAbsensis] = useState<AbsensiRecord[]>(() => {
    const saved = localStorage.getItem('simkas_absensis');
    return saved ? JSON.parse(saved) : INITIAL_ABSENSI;
  });

  const [perizinans, setPerizinans] = useState<Perizinan[]>(() => {
    const saved = localStorage.getItem('simkas_perizinans');
    return saved ? JSON.parse(saved) : INITIAL_PERIZINAN;
  });

  const [keuangans, setKeuangans] = useState<Keuangan[]>(() => {
    const saved = localStorage.getItem('simkas_keuangans');
    return saved ? JSON.parse(saved) : INITIAL_KEUANGAN;
  });

  const [pelanggarans, setPelanggarans] = useState<PelanggaranRecord[]>(() => {
    const saved = localStorage.getItem('simkas_pelanggarans');
    return saved ? JSON.parse(saved) : INITIAL_PELANGGARAN;
  });

  const [kasOperasionals, setKasOperasionals] = useState<KasOperasional[]>(() => {
    const saved = localStorage.getItem('simkas_kas_operasionals');
    return saved ? JSON.parse(saved) : INITIAL_KAS_OPERASIONAL;
  });

  const [notifikasis, setNotifikasis] = useState<Notifikasi[]>([
    {
      id: 'n1',
      title: 'Sistem Diperbarui',
      message: 'SIMKAS versi 2.0 (SKPL Kelompok 9) berhasil diluncurkan.',
      type: 'info',
      timestamp: 'Baru saja',
      read: false
    },
    {
      id: 'n2',
      title: 'Tagihan Baru Terbit',
      message: 'Tagihan SPP dan Uang Makan bulan Mei 2026 telah diterbitkan.',
      type: 'warning',
      timestamp: '2 jam lalu',
      read: false
    }
  ]);

  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    localStorage.setItem('simkas_santris', JSON.stringify(santris));
  }, [santris]);

  useEffect(() => {
    localStorage.setItem('simkas_kegiatans', JSON.stringify(kegiatans));
  }, [kegiatans]);

  useEffect(() => {
    localStorage.setItem('simkas_absensis', JSON.stringify(absensis));
  }, [absensis]);

  useEffect(() => {
    localStorage.setItem('simkas_perizinans', JSON.stringify(perizinans));
  }, [perizinans]);

  useEffect(() => {
    localStorage.setItem('simkas_keuangans', JSON.stringify(keuangans));
  }, [keuangans]);

  useEffect(() => {
    localStorage.setItem('simkas_pelanggarans', JSON.stringify(pelanggarans));
  }, [pelanggarans]);

  useEffect(() => {
    localStorage.setItem('simkas_kas_operasionals', JSON.stringify(kasOperasionals));
  }, [kasOperasionals]);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    localStorage.setItem('simkas_role', newRole);
    const roleNames: Record<Role, string> = {
      admin: 'Pengurus / Dosen',
      santri: 'Santri (David Febrianto)',
      ortu: 'Wali Santri (Bpk. Rahmat)'
    };
    showToast(`Beralih peran ke: ${roleNames[newRole]}`, 'success');
  };

  const login = (email: string, pass: string): boolean => {
    const trimEmail = email.trim().toLowerCase();
    
    if (trimEmail === 'jauhari@trunojoyo.ac.id' && pass === 'admin123') {
      setRoleState('admin');
      setIsLoggedIn(true);
      setIsLoginModalOpen(false);
      localStorage.setItem('simkas_is_logged_in', 'true');
      localStorage.setItem('simkas_role', 'admin');
      showToast('Berhasil login sebagai Pengurus / Dosen (Admin) ✅', 'success');
      return true;
    }
    if ((trimEmail === 'david@santri.darutthalibin.id' || trimEmail === 'hanif@santri.darutthalibin.id') && pass === 'santri123') {
      setRoleState('santri');
      setIsLoggedIn(true);
      setIsLoginModalOpen(false);
      localStorage.setItem('simkas_is_logged_in', 'true');
      localStorage.setItem('simkas_role', 'santri');
      showToast('Berhasil login sebagai Santri (David Febrianto) ✅', 'success');
      return true;
    }
    if ((trimEmail === 'rahmat.wali@gmail.com' || trimEmail === 'abdullah.wali@gmail.com') && pass === 'ortu123') {
      setRoleState('ortu');
      setIsLoggedIn(true);
      setIsLoginModalOpen(false);
      localStorage.setItem('simkas_is_logged_in', 'true');
      localStorage.setItem('simkas_role', 'ortu');
      showToast('Berhasil login sebagai Wali Santri (Bpk. Rahmat) ✅', 'success');
      return true;
    }

    showToast('❌ Login Gagal: Alamat email atau kata sandi tidak sesuai!', 'error');
    return false;
  };

  const logout = () => {
    window.location.href = '/dashboard.html';
  };

  const currentUser = USERS[role];

  // CRUD Santri
  const addSantri = (newSantriData: Omit<Santri, 'id'>) => {
    const id = `s-${Date.now()}`;
    const newSantri: Santri = { id, ...newSantriData };
    setSantris(prev => [newSantri, ...prev]);
    showToast(`Berhasil menambahkan santri ${newSantri.name}`, 'success');
  };

  const updateSantri = (id: string, data: Partial<Santri>) => {
    setSantris(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    showToast('Data santri berhasil diperbarui', 'success');
  };

  const deleteSantri = (id: string) => {
    const target = santris.find(s => s.id === id);
    setSantris(prev => prev.filter(s => s.id !== id));
    showToast(`Santri ${target?.name || ''} telah dihapus dari sistem`, 'warning');
  };

  // Absensi
  const addAbsensi = (record: Omit<AbsensiRecord, 'id' | 'timestamp'>) => {
    const id = `ab-${Date.now()}`;
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setAbsensis(prev => [{ id, timestamp, ...record }, ...prev]);
    showToast(`Absensi ${record.santriNama} (${record.status.toUpperCase()}) disimpan`, 'success');
  };

  const quickScanRFID = (santriNis: string, kegiatanId: string): boolean => {
    const targetSantri = santris.find(s => s.nis === santriNis || s.name.toLowerCase().includes(santriNis.toLowerCase()));
    if (!targetSantri) {
      showToast('Santri tidak ditemukan! Periksa NIS atau Nama.', 'error');
      return false;
    }
    const targetKegiatan = kegiatans.find(k => k.id === kegiatanId);
    if (!targetKegiatan) {
      showToast('Kegiatan tidak valid', 'error');
      return false;
    }

    const todayStr = new Date().toISOString().substring(0, 10);
    // Check if already present
    const exists = absensis.find(a => a.santriId === targetSantri.id && a.kegiatanId === kegiatanId && a.tanggal === todayStr);
    if (exists) {
      showToast(`${targetSantri.name} sudah tercatat hadir pada kegiatan ini hari ini!`, 'warning');
      return false;
    }

    addAbsensi({
      kegiatanId,
      kegiatanNama: targetKegiatan.nama,
      tanggal: todayStr,
      santriId: targetSantri.id,
      santriNama: targetSantri.name,
      status: 'hadir',
      dicatatOleh: 'RFID Scanner / QR Code',
    });
    
    // Add notif
    setNotifikasis(prev => [{
      id: `n-${Date.now()}`,
      title: 'Scan Absensi Berhasil',
      message: `${targetSantri.name} hadir pada ${targetKegiatan.nama}.`,
      type: 'success',
      timestamp: 'Baru saja',
      read: false
    }, ...prev]);

    return true;
  };

  // Perizinan
  const submitIzin = (izinData: Omit<Perizinan, 'id' | 'status' | 'tglPengajuan'>) => {
    const id = `iz-${Date.now()}`;
    const tglPengajuan = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newIzin: Perizinan = {
      id,
      ...izinData,
      status: 'pending',
      tglPengajuan
    };
    setPerizinans(prev => [newIzin, ...prev]);
    showToast('Surat izin berhasil diajukan! Menunggu persetujuan pengurus.', 'success');
  };

  const verifyIzin = (id: string, approve: boolean, catatan?: string) => {
    const status: 'disetujui' | 'ditolak' = approve ? 'disetujui' : 'ditolak';
    setPerizinans(prev => prev.map(iz => {
      if (iz.id === id) {
        return {
          ...iz,
          status,
          catatanAdmin: catatan || (approve ? 'Disetujui oleh pengurus pondok.' : 'Ditolak.'),
          diverifikasiOleh: currentUser.name
        };
      }
      return iz;
    }));
    showToast(`Pengajuan izin telah ${status.toUpperCase()}`, approve ? 'success' : 'error');
  };

  // Keuangan
  const submitPembayaran = (pembayaranData: Omit<Keuangan, 'id' | 'status'>) => {
    const id = `ke-${Date.now()}`;
    const newPem: Keuangan = {
      id,
      ...pembayaranData,
      status: 'pending'
    };
    setKeuangans(prev => [newPem, ...prev]);
    showToast('Bukti pembayaran berhasil diunggah! Menunggu verifikasi bendahara.', 'success');
  };

  const verifyPembayaran = (id: string, valid: boolean, catatan?: string) => {
    const status: 'lunas' | 'gagal' = valid ? 'lunas' : 'gagal';
    setKeuangans(prev => prev.map(ke => {
      if (ke.id === id) {
        return {
          ...ke,
          status,
          catatan: catatan || ke.catatan,
          verifikator: currentUser.name,
          tglVerifikasi: new Date().toISOString().replace('T', ' ').substring(0, 19)
        };
      }
      return ke;
    }));
    showToast(`Verifikasi pembayaran ${status === 'lunas' ? 'DITERIMA / LUNAS' : 'DITOLAK'}`, valid ? 'success' : 'error');
  };

  // Kedisiplinan & Pelanggaran Santri
  const addPelanggaran = (record: Omit<PelanggaranRecord, 'id'>) => {
    const id = `pel-${Date.now()}`;
    const newRecord: PelanggaranRecord = { id, ...record };
    setPelanggarans(prev => [newRecord, ...prev]);
    showToast(`Pelanggaran santri ${record.santriNama} (${record.poin} Poin) berhasil dicatat`, 'warning');

    // Notifikasi
    setNotifikasis(prev => [{
      id: `n-${Date.now()}`,
      title: 'Pelanggaran Kedisiplinan Dicatat',
      message: `${record.santriNama} melakukan pelanggaran "${record.jenisPelanggaran}" (+${record.poin} poin).`,
      type: 'warning',
      timestamp: 'Baru saja',
      read: false
    }, ...prev]);
  };

  const updateStatusHukuman = (id: string, status: StatusHukuman, catatan?: string) => {
    setPelanggarans(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          statusHukuman: status,
          catatan: catatan !== undefined ? catatan : p.catatan,
          tglSelesai: status === 'selesai' ? new Date().toISOString().substring(0, 10) : p.tglSelesai
        };
      }
      return p;
    }));
    showToast(`Status sanksi diubah menjadi: ${status.toUpperCase()}`, 'success');
  };

  const deletePelanggaran = (id: string) => {
    setPelanggarans(prev => prev.filter(p => p.id !== id));
    showToast('Catatan pelanggaran santri telah dihapus', 'info');
  };

  // Kas Operasional Pesantren
  const addKasOperasional = (record: Omit<KasOperasional, 'id'>) => {
    const id = `kas-${Date.now()}`;
    const newKas: KasOperasional = { id, ...record };
    setKasOperasionals(prev => [newKas, ...prev]);
    showToast(`Transaksi kas ${record.tipe === 'masuk' ? 'MASUK (Debit)' : 'KELUAR (Kredit)'} sebesar Rp ${record.nominal.toLocaleString('id-ID')} disimpan`, 'success');
  };

  const deleteKasOperasional = (id: string) => {
    setKasOperasionals(prev => prev.filter(k => k.id !== id));
    showToast('Transaksi kas operasional telah dihapus', 'info');
  };

  const markAllNotifRead = () => {
    setNotifikasis(prev => prev.map(n => ({ ...n, read: true })));
  };

  const resetDatabase = () => {
    setSantris(INITIAL_SANTRI);
    setKegiatans(INITIAL_KEGIATAN);
    setAbsensis(INITIAL_ABSENSI);
    setPerizinans(INITIAL_PERIZINAN);
    setKeuangans(INITIAL_KEUANGAN);
    setPelanggarans(INITIAL_PELANGGARAN);
    setKasOperasionals(INITIAL_KAS_OPERASIONAL);
    showToast('Database direset ke data awal demo SKPL (Kelompok 9)', 'warning');
  };

  const exportDatabaseJson = () => {
    const state = {
      santris,
      kegiatans,
      absensis,
      perizinans,
      keuangans,
      pelanggarans,
      kasOperasionals
    };
    return JSON.stringify(state, null, 2);
  };

  const importDatabaseJson = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.santris && Array.isArray(data.santris)) setSantris(data.santris);
      if (data.kegiatans && Array.isArray(data.kegiatans)) setKegiatans(data.kegiatans);
      if (data.absensis && Array.isArray(data.absensis)) setAbsensis(data.absensis);
      if (data.perizinans && Array.isArray(data.perizinans)) setPerizinans(data.perizinans);
      if (data.keuangans && Array.isArray(data.keuangans)) setKeuangans(data.keuangans);
      if (data.pelanggarans && Array.isArray(data.pelanggarans)) setPelanggarans(data.pelanggarans);
      if (data.kasOperasionals && Array.isArray(data.kasOperasionals)) setKasOperasionals(data.kasOperasionals);
      showToast('Database berhasil diimpor dari file JSON', 'success');
      return true;
    } catch (e) {
      showToast('Gagal mengimpor file JSON. Format tidak sesuai.', 'error');
      return false;
    }
  };

  const getMysqlSchemaSql = () => {
    return `-- ========================================================
-- SISTEM INFORMASI MANAJEMEN KEGIATAN & ADMINISTRASI SANTRI
-- DATABASE SCHEMA SIMULATOR (MySQL / MariaDB / phpMyAdmin)
-- Pondok Pesantren Mahasiswa Darut Thalibin Telang
-- ========================================================

CREATE DATABASE IF NOT EXISTS \`db_simkas_pondok\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE \`db_simkas_pondok\`;

-- 1. TABEL SANTRI
CREATE TABLE \`santri\` (
  \`id_santri\` VARCHAR(50) NOT NULL PRIMARY KEY,
  \`nis\` VARCHAR(20) NOT NULL UNIQUE,
  \`nama\` VARCHAR(100) NOT NULL,
  \`kamar\` VARCHAR(10) NOT NULL,
  \`angkatan\` INT(4) NOT NULL,
  \`tempat_lahir\` VARCHAR(50) NOT NULL,
  \`tanggal_lahir\` DATE NOT NULL,
  \`no_hp\` VARCHAR(20) NOT NULL,
  \`wali_nama\` VARCHAR(100) NOT NULL,
  \`wali_hp\` VARCHAR(20) NOT NULL,
  \`status_aktif\` TINYINT(1) DEFAULT 1,
  \`fakultas_utm\` VARCHAR(100) NOT NULL,
  \`prodi_utm\` VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. TABEL KEGIATAN
CREATE TABLE \`kegiatan\` (
  \`id_kegiatan\` VARCHAR(50) NOT NULL PRIMARY KEY,
  \`nama_kegiatan\` VARCHAR(150) NOT NULL,
  \`hari\` VARCHAR(30) NOT NULL,
  \`waktu\` VARCHAR(30) NOT NULL,
  \`durasi\` VARCHAR(30) NOT NULL,
  \`tempat\` VARCHAR(100) NOT NULL,
  \`pengampu\` VARCHAR(100) NOT NULL,
  \`is_wajib\` TINYINT(1) DEFAULT 1,
  \`kategori\` ENUM('jamaah','kajian','khidmah','lainnya') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. TABEL ABSENSI
CREATE TABLE \`absensi\` (
  \`id_absensi\` VARCHAR(50) NOT NULL PRIMARY KEY,
  \`id_kegiatan\` VARCHAR(50) NOT NULL,
  \`id_santri\` VARCHAR(50) NOT NULL,
  \`tanggal\` DATE NOT NULL,
  \`status\` ENUM('hadir','izin','sakit','alpha') NOT NULL,
  \`keterangan\` VARCHAR(255) NULL,
  \`dicatat_oleh\` VARCHAR(50) NOT NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`id_kegiatan\`) REFERENCES \`kegiatan\`(\`id_kegiatan\`) ON DELETE CASCADE,
  FOREIGN KEY (\`id_santri\`) REFERENCES \`santri\`(\`id_santri\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. TABEL PERIZINAN
CREATE TABLE \`perizinan\` (
  \`id_izin\` VARCHAR(50) NOT NULL PRIMARY KEY,
  \`id_santri\` VARCHAR(50) NOT NULL,
  \`jenis\` ENUM('keluar','pulang') NOT NULL,
  \`tgl_berangkat\` DATE NOT NULL,
  \`tgl_kembali\` DATE NOT NULL,
  \`alasan\` TEXT NOT NULL,
  \`status\` ENUM('pending','disetujui','ditolak') DEFAULT 'pending',
  \`catatan_admin\` VARCHAR(255) NULL,
  \`diverifikasi_oleh\` VARCHAR(100) NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`id_santri\`) REFERENCES \`santri\`(\`id_santri\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. TABEL KEUANGAN (PEMBAYARAN)
CREATE TABLE \`keuangan\` (
  \`id_bayar\` VARCHAR(50) NOT NULL PRIMARY KEY,
  \`id_santri\` VARCHAR(50) NOT NULL,
  \`jenis\` ENUM('spp','uang_makan','donasi','daftar_ulang') NOT NULL,
  \`bulan_tagihan\` VARCHAR(30) NOT NULL,
  \`jumlah\` DECIMAL(12,2) NOT NULL,
  \`tgl_bayar\` DATE NOT NULL,
  \`file_bukti\` VARCHAR(255) NOT NULL,
  \`status\` ENUM('pending','lunas','gagal') DEFAULT 'pending',
  \`verifikator\` VARCHAR(100) NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`id_santri\`) REFERENCES \`santri\`(\`id_santri\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. TABEL PELANGGARAN & KEDISIPLINAN
CREATE TABLE \`pelanggaran\` (
  \`id_pelanggaran\` VARCHAR(50) NOT NULL PRIMARY KEY,
  \`id_santri\` VARCHAR(50) NOT NULL,
  \`jenis_pelanggaran\` VARCHAR(150) NOT NULL,
  \`kategori\` ENUM('ringan','sedang','berat') NOT NULL,
  \`poin\` INT(3) NOT NULL,
  \`tanggal\` DATE NOT NULL,
  \`bentuk_hukuman\` TEXT NOT NULL,
  \`status_hukuman\` ENUM('belum','proses','selesai') DEFAULT 'belum',
  \`catatan\` TEXT NULL,
  \`dicatat_oleh\` VARCHAR(100) NOT NULL,
  \`tgl_selesai\` DATE NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`id_santri\`) REFERENCES \`santri\`(\`id_santri\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. TABEL BUKU KAS OPERASIONAL PESANTREN
CREATE TABLE \`kas_operasional\` (
  \`id_kas\` VARCHAR(50) NOT NULL PRIMARY KEY,
  \`tanggal\` DATE NOT NULL,
  \`tipe\` ENUM('masuk','keluar') NOT NULL,
  \`kategori\` VARCHAR(50) NOT NULL,
  \`nominal\` DECIMAL(14,2) NOT NULL,
  \`keterangan\` TEXT NOT NULL,
  \`penanggung_jawab\` VARCHAR(100) NOT NULL,
  \`nomor_bukti\` VARCHAR(50) NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- INSERT DATA CONTOH KELOMPOK 9 UTM
INSERT INTO \`santri\` (\`id_santri\`, \`nis\`, \`nama\`, \`kamar\`, \`angkatan\`, \`tempat_lahir\`, \`tanggal_lahir\`, \`no_hp\`, \`wali_nama\`, \`wali_hp\`, \`fakultas_utm\`, \`prodi_utm\`) VALUES
('s1', '230411100062', 'David Febrianto', 'A-01', 2023, 'Sampang', '2005-08-21', '081234567890', 'Bpk. Rahmat', '082133445566', 'Fakultas Teknik', 'Teknik Informatika'),
('s2', '240411100050', 'Moh. Yusuf Ardiansyah', 'A-02', 2024, 'Bangkalan', '2006-03-12', '081298765432', 'Bpk. Ardiansyah', '082177889900', 'Fakultas Teknik', 'Teknik Informatika'),
('s3', '240411100058', 'Sulhan Humaidi', 'B-01', 2024, 'Pamekasan', '2006-05-18', '085712345678', 'Bpk. Humaidi', '085799887766', 'Fakultas Teknik', 'Teknik Informatika'),
('s4', '240411100200', 'Anas', 'B-02', 2024, 'Sumenep', '2006-07-22', '081344556677', 'Bpk. Mansur', '081322334455', 'Fakultas Teknik', 'Teknik Informatika'),
('s5', '240411100167', 'Yoga Andrian Febriyanto', 'C-01', 2024, 'Gresik', '2006-09-14', '081988776655', 'Bpk. Febriyanto', '081911223344', 'Fakultas Teknik', 'Teknik Informatika');
`;
  };

  return (
    <SimkasContext.Provider value={{
      role,
      currentUser,
      santris,
      kegiatans,
      absensis,
      perizinans,
      keuangans,
      pelanggarans,
      kasOperasionals,
      notifikasis,
      toasts,
      currentView,
      isDbModalOpen,
      isLoginModalOpen,
      isLoggedIn,
      setRole,
      setCurrentView,
      setIsDbModalOpen,
      setIsLoginModalOpen,
      login,
      logout,
      showToast,
      addSantri,
      updateSantri,
      deleteSantri,
      addAbsensi,
      quickScanRFID,
      submitIzin,
      verifyIzin,
      submitPembayaran,
      verifyPembayaran,
      addPelanggaran,
      updateStatusHukuman,
      deletePelanggaran,
      addKasOperasional,
      deleteKasOperasional,
      markAllNotifRead,
      resetDatabase,
      importDatabaseJson,
      exportDatabaseJson,
      getMysqlSchemaSql
    }}>
      {children}
    </SimkasContext.Provider>
  );
};

export const useSimkas = () => {
  const context = useContext(SimkasContext);
  if (!context) throw new Error('useSimkas must be used within SimkasProvider');
  return context;
};
