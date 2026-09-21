---
title: "Log Sesi Diskusi & Pemecahan Masalah Deployment Vercel & Optimasi Kecepatan (SI-ANJANG V.10.5)"
date: 2026-09-21
tags:
  - si-anjang
  - log-sesi
  - vercel-deployment
  - optimasi-kecepatan
  - swr-cache-first
  - bugfix
  - puskesmas-cermee
status: Completed
aliases:
  - "Log Sesi Vercel & Optimasi Kecepatan 2026-09-21"
  - "Log Bugfix SI-ANJANG V.10.5"
---

# 📋 Log Sesi: Pemecahan Masalah Vercel, Optimasi Kecepatan 0ms, & Upgrade SI-ANJANG V.10.5

> **Tanggal Sesi:** 21 September 2026  
> **Aplikasi:** SI-ANJANG (Sistem Informasi Anjangsana) V.10.5 — UPTD Puskesmas Cermee  
> **Master Note:** [[SI_ANJANG_CATATAN_PENGEMBANGAN_OBSIDIAN]]

---

## 📌 Ringkasan Masalah & Solusi yang Diselesaikan

### 1. Error Build Vercel: `[UNRESOLVED_ENTRY] Cannot resolve entry module index.html`
- **Penyebab:**
  1. Pada `.gitignore`, terdapat baris `Index.html` (ditambahkan di bawah kategori file Apps Script). Hal ini menyebabkan file HTML utama Vite tidak ter-track dan tidak ikut ter-push ke repository GitHub.
  2. Huruf kapital pada nama file `Index.html` tidak cocok dengan sistem operasi Linux Vercel yang *case-sensitive*.
- **Solusi:**
  - Menghapus aturan `Index.html` dari `.gitignore`.
  - Mengubah nama file menjadi `index.html` (huruf kecil standar).
  - Melakukan staging, commit, dan push `index.html` ke GitHub.

---

### 2. Aturan Environment Variable Vercel: Peringatan Prefix Publik `VITE_`
- **Penyebab:**
  - Pada dashboard Vercel, variabel `VITE_GAS_API_URL` diset bertipe **Secret**.
  - Vercel menolak karena variabel dengan prefix `VITE_` atau `NEXT_PUBLIC_` adalah variabel untuk frontend browser (*client-side*), sehingga Vercel mewajibkan tipenya diset ke **Config**.
- **Solusi:**
  - Menghapus variabel bertipe *Secret* yang terkunci.
  - Membuat ulang variabel `VITE_GAS_API_URL` dengan tipe **Config**, lalu melakukan redeploy.

---

### 3. Optimasi Performa Ekstrem: Loading 0ms (Cache-First SWR & Optimistic UI)
- **Penyebab Kelambatan:**
  - Sebelumnya frontend menunggu respon Google Apps Script (GAS) secara sinkron (butuh waktu 2–5 detik) sebelum membuka dashboard, menyebabkan layar sempat 0 dan tombol terasa lambat.
  - Terdapat pemanggilan 6 request HTTP terpisah secara bersamaan yang menyebabkan antrian di server Apps Script.
- **Solusi Arsitektur:**
  1. **Instant State Load (0ms):** State awal langsung dimuat dari `localStorage` dan dihitung secara lokal via `calculateLocalDashboardStats()`. Dashboard langsung menampilkan angka riil tanpa jeda.
  2. **Non-Blocking Background Sync:** Sinkronisasi dengan Google Spreadsheet berjalan di balik layar (*background*) tanpa membekukan tampilan.
  3. **Optimistic CRUD:** Penambahan iuran, pengeluaran, dan undian langsung mengupdate tampilan secara instan dalam sub-50ms sebelum dikirim ke Google Sheets di latar belakang.
  4. **Single-Request Sync (`getAllData`):** Menambahkan fungsi konsolidasi di `Code.gs` untuk mengambil seluruh tabel dalam 1 kali roundtrip.

---

### 4. Perbaikan Otentikasi Live Spreadsheet & Sinkronisasi User
- **Penyebab:**
  - Timeout login yang terlalu pendek (2.5 detik) menyebabkan akun kustom dari Google Spreadsheet terputus sebelum server selesai memverifikasi hash password.
- **Solusi:**
  - Mengatur timeout login ke 12 detik dengan verifikasi langsung ke database sheet `Users`.
  - Menambahkan penarikan sheet `Users` secara otomatis saat aplikasi melakukan sinkronisasi latar belakang.

---

### 5. Perbaikan Tata Letak Card Dashboard Desktop / Laptop
- **Penyebab:**
  - Elemen grid menggunakan `lg:grid-cols-12` tanpa `col-span`, sehingga di layar laptop/desktop card Belum Bayar dan Riwayat Mutasi menyusut hanya 1/12 lebar (8%) dan meninggalkan ruang kosong besar di sebelah kanan.
- **Solusi:**
  - Mengubah pembagian kolom menjadi `grid-cols-1 lg:grid-cols-2 gap-6`, sehingga pada layar HP tampil penuh 100% dan pada laptop terbagi rapi 50% - 50%.

---

### 6. Branding Upgrade ke "SI-ANJANG V.10.5"
- Mengubah seluruh penyebutan nama dan badge dari `E-Anjangsana V.10` menjadi **`SI-ANJANG V.10.5`** pada:
  - Sidebar navigasi desktop & mobile
  - Splash screen progress bar
  - Form login dan banner hero
  - Header Navbar desktop
  - Dashboard info banner & subtitle
  - Tab title browser (`index.html`) & manifest PWA (`vite.config.js`)
  - Icon SVG label (`public/icon.svg`)
  - Google Apps Script HTML page title (`Code.gs`)

---

## 🔗 Navigasi Catatan Terkait
- Kembali ke Master Note: [[SI_ANJANG_CATATAN_PENGEMBANGAN_OBSIDIAN]]
- Log Sesi Sebelumnya (Migrasi Awal): [[LOG_SESI_CHAT_OBSIDIAN_2026-09-20]]
