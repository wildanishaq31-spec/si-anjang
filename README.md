# E-Anjangsana (SI-ANJANG) — UPTD Puskesmas Cermee

Aplikasi Progressive Web App (PWA) Manajemen Kasir, Iuran, Pengeluaran, dan Undian Tuan Rumah Anjangsana untuk Pegawai UPTD Puskesmas Cermee.

---

## 🌟 Fitur Utama
- **Progressive Web App (PWA):** Dapat diinstall di HP Android / iOS layaknya aplikasi native, responsif dengan navigasi bottom bar melengkung.
- **Dashboard Interaktif:** Rekapitulasi mutasi kas riil, penerimaan per jabatan (PNS, P3K, P3KPWD, P3KPW, Kontrak), daftar tunggakan, dan riwayat aktivitas kas.
- **Manajemen Iuran Otomatis:**
  - Deteksi otomatis anggota yang belum bayar.
  - Filter pencarian cerdas untuk meminimalisir *double input*.
  - Kalkulator kembalian dan dukungan metode Tunai / Transfer Bank.
- **Manajemen Pengeluaran Kas:** Pencatatan uang keluar beserta kategori operasional anjangsana.
- **Sistem Undian Tuan Rumah:**
  - Pengacakan acak otomatis dengan animasi confetti perayaan pemenang.
  - Opsi penetapan manual untuk anggota berstatus *Belum* dengan filter periode bulan kosong otomatis.
- **Rekapitulasi & Broadcast WhatsApp:**
  - Pengelompokan iuran bulanan / tahunan per anggota.
  - Ekspor data rekapitulasi ke format Excel (`.xlsx`).
  - Template broadcast pengingat tunggakan langsung ke grup WhatsApp.
- **Kompatibilitas Google Spreadsheet & GAS Backend:** Menggunakan database live Google Spreadsheet dengan REST API Google Apps Script.

---

## 🚀 Panduan Instalasi Lokal

```bash
# Clone repository
git clone https://github.com/wildanishaq31-spec/si-anjang.git
cd si-anjang

# Install dependencies
npm install

# Jalankan server lokal
npm run dev
```

---

## 🌐 Deployment ke Vercel

1. Buka [vercel.com](https://vercel.com/) dan import repository **`wildanishaq31-spec/si-anjang`**.
2. Pada bagian **Environment Variables**, tambahkan:
   - `VITE_GAS_API_URL` : `[URL_WEB_APP_GOOGLE_APPS_SCRIPT_ANDA]`
3. Klik **Deploy**.
4. Hubungkan domain kustom Anda: `anjangsana.pkmcermee.my.id`.

