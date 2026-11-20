# Log Sesi Diskusi & Pembaruan Sistem SI-ANJANG V.10.5
**Tanggal:** 20 November 2026  
**Topik Utama:** Sinkronisasi Multi-User (Super Admin & 2 Bendahara), Pencegahan Double Input Berlapis (Server & Client), serta Kolom Petugas Input Iuran

---

## 📌 Ringkasan Latar Belakang Masalah
Terjadi insiden *double input* (pencatatan ganda) di tabel riwayat iuran:
1. **Dr. Putri Endah W:** Tercatat 2 kali pada tanggal 19 November 2026 via Transfer (nominal Rp 25.000) diselingi oleh transaksi lain (*Roayetur Rusdiyana*).
2. **Demas Tri Atmaja:** Tercatat 2 kali pada tanggal 20 November 2026, masing-masing dengan metode *Transfer* dan *Cash / Tunai*.

### Analisis Akar Masalah:
* Pencegahan sebelumnya hanya bersifat filter lokal di browser (client-side in-memory).
* Ketiadaan sinkronisasi berkala (*polling / focus sync*) membuat Bendahara 2 tidak mengetahui apa yang baru saja diinput oleh Bendahara 1 jika layarnya belum di-refresh.
* Backend Google Apps Script (`Code.gs`) belum memiliki validasi duplikat pada fungsi `saveIuran()`, sehingga server langsung menulis baris duplikat ke spreadsheet.
* Tidak ada jejak identitas siapa user yang menginput transaksi tersebut.

---

## 🚀 Perubahan & Solusi yang Diimplementasikan

### 1. Backend Google Apps Script (`gas/Code.gs`)
* **Validasi Anti-Duplikat Otoritatif Server:**
  - Ditambahkan pengecekan ketat menggunakan `LockService.getScriptLock()` untuk mencegah race condition.
  - Memeriksa sheet `Iuran`: Jika `id_karyawan` atau nama karyawan sudah pernah dicatat lunas pada periode aktif yang sama, request ditolak seketika dengan respon `{ success: false, isDuplicate: true, message: "Ditolak: [Nama] sudah diinput untuk periode [Periode] oleh [Petugas]!" }`.
* **Kolom Baru `petugas` di Sheet `Iuran`:**
  - Otomatis ditambahkan via `checkHeaders()`: `['id', 'tanggal', 'id_karyawan', 'nama_karyawan', 'periode', 'nominal', 'metode_pembayaran', 'uang_diterima', 'kembalian', 'petugas']`.
  - Fungsi `getIuran()` dan `saveIuran()` otomatis membaca dan menulis nama petugas pembuat transaksi.
* **Akun Default Seeding:**
  - Ditambahkan akun default `bendahara1` dan `bendahara2` di samping `admin`.

### 2. Frontend Sinkronisasi Multi-User (`src/App.jsx`)
* **Auto-Sync Latar Belakang (Polling 30 Detik):** Mengambil data terbaru dari server secara berkala saat tab aplikasi aktif.
* **Focus & Visibility Sync:** Otomatis sinkronisasi seketika saat bendahara membuka kembali tab aplikasi atau beralih dari aplikasi lain di HP.
* **Page Navigation Sync:** Menyinkronkan data langsung begitu bendahara mengklik menu **Iuran**, **Dashboard**, atau **Rekap**.
* **Rollback & Error Catching:** Jika server menolak simpan (misal karena duplikat), data lokal seketika di-rollback dan disinkronkan kembali.

### 3. Halaman Manajemen Iuran (`src/pages/Iuran.jsx`)
* **Badge Petugas Input di Form:** Menampilkan nama user yang sedang login (Super Admin, Bendahara 1, atau Bendahara 2).
* **Kolom "Petugas Input" di Tabel Riwayat:** Menampilkan badge khusus role/nama petugas yang menginput transaksi.
* **Kunci Tombol Simpan (*Anti-Double-Click*):** Tombol simpan otomatis di-disable dengan indikator loading saat proses penyimpanan berjalan.
* **Tombol Sinkron Manual:** Tersedia tombol *Sinkronkan* cepat di atas tabel riwayat.

### 4. Layanan Data & Pengguna (`src/services/api.js`)
* Memperbarui `SEED_USERS` dengan `bendahara1` dan `bendahara2`.
* Menyimpan dan memulihkan kolom `petugas` di local storage.
