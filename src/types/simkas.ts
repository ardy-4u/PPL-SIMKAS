export type Role = 'admin' | 'santri' | 'ortu';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  nis?: string;
  kamar?: string;
  angkatan?: number;
  noHp?: string;
  waliName?: string;
  waliHp?: string;
}

export interface Santri {
  id: string;
  nis: string;
  name: string;
  kamar: string;
  angkatan: number;
  tempatLahir: string;
  tanggalLahir: string;
  noHp: string;
  waliName: string;
  waliHp: string;
  statusAktif: boolean;
  fakultasUtm: string;
  prodiUtm: string;
}

export interface Kegiatan {
  id: string;
  nama: string;
  hari: string;
  waktu: string;
  durasi: string;
  tempat: string;
  pengampu: string;
  wajib: boolean;
  kategori: 'jamaah' | 'kajian' | 'khidmah' | 'lainnya';
}

export type AbsensiStatus = 'hadir' | 'izin' | 'sakit' | 'alpha';

export interface AbsensiRecord {
  id: string;
  kegiatanId: string;
  kegiatanNama: string;
  tanggal: string;
  santriId: string;
  santriNama: string;
  status: AbsensiStatus;
  keterangan?: string;
  dicatatOleh: string;
  timestamp: string;
}

export type IzinStatus = 'pending' | 'disetujui' | 'ditolak';

export interface Perizinan {
  id: string;
  santriId: string;
  santriNama: string;
  kamar: string;
  jenis: 'keluar' | 'pulang';
  tglBerangkat: string;
  tglKembali: string;
  alasan: string;
  status: IzinStatus;
  catatanAdmin?: string;
  tglPengajuan: string;
  diverifikasiOleh?: string;
}

export type KeuanganStatus = 'pending' | 'lunas' | 'gagal';

export interface Keuangan {
  id: string;
  santriId: string;
  santriNama: string;
  kamar: string;
  jenis: 'spp' | 'kas_santri' | 'uang_makan' | 'donasi' | 'daftar_ulang';
  bulan: string; // e.g., 'Mei 2026' or 'Semester Genap (Jan - Jun 2026)'
  jumlah: number;
  tglBayar: string;
  bukti: string; // File name or URL
  buktiUrl?: string; // Base64 data URL or image URL for viewing
  status: KeuanganStatus;
  catatan?: string;
  verifikator?: string;
  tglVerifikasi?: string;
  paket?: '1_bulan' | '3_bulan' | 'semester';
  cakupanBulan?: string[];
  periodeLabel?: string;
}

export interface Notifikasi {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

// 6. KEDISIPLINAN & PELANGGARAN SANTRI
export type KategoriPelanggaran = 'ringan' | 'sedang' | 'berat';
export type StatusHukuman = 'belum' | 'proses' | 'selesai';

export interface PelanggaranRecord {
  id: string;
  santriId: string;
  santriNama: string;
  nis: string;
  kamar: string;
  jenisPelanggaran: string;
  kategori: KategoriPelanggaran;
  poin: number;
  tanggal: string;
  bentukHukuman: string;
  statusHukuman: StatusHukuman;
  catatan?: string;
  dicatatOleh: string;
  tglSelesai?: string;
}

// 7. ARUS KAS OPERASIONAL PESANTREN
export type TipeKas = 'masuk' | 'keluar';
export type KategoriKas = 
  | 'listrik_air_wifi'
  | 'konsumsi_dapur'
  | 'kebersihan_sarpras'
  | 'honor_asatidz'
  | 'pemeliharaan_gedung'
  | 'infaq_donasi'
  | 'kegiatan_pondok'
  | 'lainnya';

export interface KasOperasional {
  id: string;
  tanggal: string;
  tipe: TipeKas;
  kategori: KategoriKas;
  nominal: number;
  keterangan: string;
  penanggungJawab: string;
  nomorBukti?: string;
}

