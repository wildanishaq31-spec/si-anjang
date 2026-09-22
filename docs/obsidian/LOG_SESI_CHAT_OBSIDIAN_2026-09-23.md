---
title: "Log Sesi Diskusi: Migrasi Total Headless API Google Apps Script, Perbaikan Blank Screen, & Read-Write Spreadsheet (SI-ANJANG V.10.5)"
date: 2026-09-23
tags:
  - si-anjang
  - log-sesi
  - headless-gas-api
  - spreadsheet-crud
  - bugfix-blank-screen
  - service-worker-pwa
  - error-boundary
  - puskesmas-cermee
status: Completed
aliases:
  - "Log Sesi Headless API & Read-Write Spreadsheet 2026-09-23"
  - "Log Bugfix & Migrasi Total SI-ANJANG V.10.5"
---

# 📋 Log Sesi: Migrasi Total Headless Google Apps Script, Penanganan Blank Screen, & Sinkronisasi Read-Write Spreadsheet

> **Tanggal Sesi:** 23 September 2026  
> **Aplikasi:** SI-ANJANG (Sistem Informasi Anjangsana) V.10.5 — UPTD Puskesmas Cermee  
> **Master Note:** [[SI_ANJANG_CATATAN_PENGEMBANGAN_OBSIDIAN]]

---

## 📌 Ringkasan Masalah & Solusi yang Diselesaikan

### 1. Perbaikan Syntax Error Google Apps Script (`Unexpected token 'catch' baris 29`)
- **Penyebab:**
  - Pada baris 19–29 fungsi `doGet(e)` di `Code.gs`, blok pembuka `try {` terhapus saat penambahan endpoint `getAllData`, sehingga compiler Apps Script gagal menyimpan script karena token `} catch (err) {` tidak memiliki pasangan `try`.
- **Solusi:**
  - Memperbaiki penulisan sintaks dengan menyisipkan kembali `try {` pada routing REST API `doGet(e)` di `Code.gs` dan `gas/Code.gs`.
  - Melakukan validasi sintaks otomatis via engine Node.js `vm.Script`.

---

### 2. Perbaikan Layar Blank Hitam Saat Login (`sidebarOpen is not defined` & `setIsSyncing is not defined`)
- **Penyebab:**
  - Pada `src/App.jsx`, variabel state `sidebarOpen`, `setSidebarOpen`, `isSyncing`, dan `setIsSyncing` belum dideklarasikan.
  - Ketika otentikasi login berhasil dan React beralih merender antarmuka `Sidebar` dan `Navbar`, JavaScript melemparkan `ReferenceError: sidebarOpen is not defined` yang menyebabkan seluruh komponen React unmount/crash.
- **Solusi Arsitektur:**
  1. **Deklarasi State:** Menambahkan `const [sidebarOpen, setSidebarOpen] = useState(false);` dan `const [isSyncing, setIsSyncing] = useState(false);` di `src/App.jsx`.
  2. **React Error Boundary:** Membuat komponen `src/components/ErrorBoundary.jsx` dan membungkus `<App />` di `src/main.jsx`. Jika terjadi error runtime di masa mendatang, layar tidak akan blank hitam, melainkan menampilkan panel pemulihan dengan tombol *Muat Ulang* dan *Reset Sesi*.

---

### 3. Pembersihan Cache PWA Service Worker (`index-BTNCL3C_.js` vs `index-BYJ9c92-.js`)
- **Penyebab:**
  - Browser klien masih menjalankan bundle JavaScript versi lama (`index-BTNCL3C_.js`) dari cache Service Worker Workbox, meskipun kode di server Vercel telah diperbarui.
- **Solusi:**
  1. Mengonfigurasi `vite.config.js` dengan opsi:
     ```javascript
     workbox: {
       skipWaiting: true,
       clientsClaim: true,
       cleanupOutdatedCaches: true
     }
     ```
  2. Menambahkan aturan header `no-cache, no-store, must-revalidate` untuk file `sw.js`, `registerSW.js`, dan `index.html` pada `vercel.json`.

---

### 4. Migrasi Total: Penonaktifan `Index.html` di Google Apps Script (Murni Headless REST API)
- **Kebutuhan:**
  - Mematikan tampilan template HTML lama di Google Apps Script agar seluruh fokus sistem dialihkan ke frontend React Vite PWA di Vercel (`si-anjang-tau.vercel.app`).
- **Solusi:**
  - Menghapus pemanggilan `HtmlService.createTemplateFromFile('Index')` pada `doGet(e)` di `Code.gs`.
  - Mengubah default response `doGet(e)` menjadi respon JSON API Status & Health Check:
    ```json
    {
      "success": true,
      "status": "online",
      "app": "SI-ANJANG V.10.5 Backend API",
      "frontendUrl": "https://si-anjang-tau.vercel.app"
    }
    ```
  - File `Index.html` di dalam Google Apps Script tidak lagi dibutuhkan.

---

### 5. Penyelarasan Penuh Read & Write Google Spreadsheet (Pengumuman Dashboard, WA Template, & CRUD)
- **Penyebab Teks Berbalik saat Diedit:**
  1. Pada halaman Pengaturan (`src/pages/Setting.jsx`), hook `useEffect` menimpa (*overwrite*) nilai form `infoText` setiap kali *background sync* selesai berjalan di latar belakang sebelum pengguna sempat menekan tombol Simpan.
  2. Pada backend `Code.gs`, fungsi `saveSettingInfo`, `saveSettingWA`, `getSettings`, dan `getSettingValue` belum tersambung ke sheet `Settings`.
  3. Pada `saveDataGeneral`, perbandingan `payload.isEdit === 'true'` gagal mendeteksi boolean `true`, sehingga update baris spreadsheet tidak tersimpan dengan benar.
- **Solusi:**
  1. **Dirty-Lock Input State:** Menambahkan `isInfoDirty` dan `isWaDirty` di `src/pages/Setting.jsx` agar proses background sync tidak pernah menimpa teks yang sedang diketik oleh pengguna.
  2. **Live Saving Indicator:** Menambahkan animasi loading `Menyimpan ke Spreadsheet...` dan notifikasi sukses `Tersimpan di Spreadsheet! ✅`.
  3. **Backend Read-Write Implementation:** Mengimplementasikan fungsi `getSettings()`, `getSettingValue()`, `saveSettingInfo()`, `saveSettingWA()`, serta penanganan fleksibel `isEdit` (`isEdit === true || isEdit === 'true'`) pada `Code.gs`.
  4. **Frontend Async Dispatch:** Memastikan seluruh metode CRUD di `src/services/api.js` melakukan `await` terhadap `fetchGAS` sehingga perubahan tersimpan permanen ke cloud Google Spreadsheet.

---

## 🔗 Navigasi Catatan Terkait
- Kembali ke Master Note: [[SI_ANJANG_CATATAN_PENGEMBANGAN_OBSIDIAN]]
- Log Sesi Sebelumnya (Vercel & 0ms Loading): [[LOG_SESI_CHAT_OBSIDIAN_2026-09-21]]
- Log Sesi Awal (Migrasi React): [[LOG_SESI_CHAT_OBSIDIAN_2026-09-20]]
