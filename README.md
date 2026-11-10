# SIMKAS - Sistem Informasi Manajemen Pondok Pesantren (PPM Darut Thalibin Telang)

Spesifikasi Kebutuhan Perangkat Lunak (SKPL) & Prototipe Sistem Manajemen Santri Berbasis Web.

## 👥 Anggota Kelompok 9 (PPL - Teknik Informatika UTM)
- **David Febrianto** (230411100062)
- **Moh. Yusuf Ardiansyah** (240411100050)
- **Sulhan Humaidi** (240411100058)
- **Anas** (240411100200)
- **Yoga Andrian Febriyanto** (240411100167)

**Dosen Pengampu:** Achmad Jauhari S.T., M.Kom

---

## 🚀 Fitur Utama Sistem
1. **Portal Utama & Profil Pesantren (Tanpa Login):**
   - Visi Misi, Sejarah, Fasilitas Pondok, Jadwal Kegiatan Harian, dan Struktur Pengurus.
2. **Dashboard & Multi-Role Authentication:**
   - Role Pengurus / Admin (Lurah Pondok & Bendahara) dan Role Santri / Wali Santri.
   - Portal login dengan validasi username & password.
3. **Presensi Kegiatan Santri Real-Time:**
   - Rekapitulasi absensi otomatis berbasis RFID / input manual pengurus.
   - Bar persentase kehadiran real-time.
4. **Perizinan Santri Digital (E-Izin):**
   - Pengajuan izin keluar / pulang santri dengan tracking status dan persetujuan pengurus.
5. **Kedisiplinan & Poin Pelanggaran:**
   - Pencatatan jenis pelanggaran, akumulasi bobot poin, kategori sanksi, dan monitoring status penyelesaian hukuman.
6. **Administrasi Keuangan & Pembayaran SPP Santri:**
   - Pilihan paket pembayaran fleksibel: **1 Bulan**, **3 Bulan (Triwulan)**, atau **1 Semester (6 Bulan)**.
   - Fitur upload struk bukti transfer dengan **Modal Inspeksi Bukti Pembayaran** interaktif (e-receipt resmi & validasi foto asli).
7. **Iuran Kas Santri:**
   - Iuran kebersihan kamar & asrama santri per bulan terpisah dari kebutuhan pribadi santri.
   - Rekap matriks 12 bulan dan verifikasi bukti transfer.
8. **Buku Kas Operasional Pesantren (BKU):**
   - Arus kas operasional pondok (Debit/Kredit di luar tagihan personal santri), klasifikasi kategori transaksi, dan saldo real-time.

---

## 🛠️ Panduan Menjalankan Project (Untuk Teman Kelompok)

### 1. Clone Repository
```bash
git clone <URL_REPOSITORY_GITHUB>
cd santri-management-system-specification
```

### 2. Install Dependencies
Pastikan [Node.js](https://nodejs.org/) sudah terinstal di komputer Anda, lalu jalankan:
```bash
npm install
```

### 3. Jalankan Server Development
```bash
npm run dev
```
Aplikasi dapat diakses di browser melalui: `http://localhost:5173`

### 4. Build untuk Production (Singlefile HTML)
```bash
npm run build
```
File hasil build akan berada di folder `dist/index.html`.
