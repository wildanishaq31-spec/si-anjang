---
title: "Log Sesi Diskusi: Format Pesan WA Blast, Persistent Auth PWA, & Setup Subdomain Cloudflare (SI-ANJANG V.10.5)"
date: 2026-10-01
tags:
  - si-anjang
  - log-sesi
  - wa-blast
  - pwa-authentication
  - persistent-session
  - localstorage
  - cloudflare-dns
  - vercel-domain
  - puskesmas-cermee
status: Completed
aliases:
  - "Log Sesi Auth PWA & Subdomain Cloudflare 2026-10-01"
  - "Log Perbaikan Login & WA Blast SI-ANJANG V.10.5"
---

# 📋 Log Sesi: Format Pesan WA Blast, Persistent Session PWA, & Panduan Subdomain Cloudflare

> **Tanggal Sesi:** 01 Oktober 2026  
> **Aplikasi:** SI-ANJANG (Sistem Informasi Anjangsana) V.10.5 — UPTD Puskesmas Cermee  
> **Master Note:** [[SI_ANJANG_CATATAN_PENGEMBANGAN_OBSIDIAN]]

---

## 📌 Ringkasan Masalah & Solusi yang Diselesaikan

### 1. Penyesuaian Format Teks WhatsApp Blast Tagihan
- **Permintaan:**
  - Menghapus keterangan jabatan dari daftar anggota yang belum membayar pada pesan siaran WhatsApp Blast (sebelumnya berformat `1. [Nama] ([Jabatan])`, contoh: `1. Agung Siswoyo (PPPKPW)`).
  - Diubah agar hanya menampilkan nomor urut dan nama lengkap saja: `1. [Nama]`.
- **Implementasi:**
  - Memperbarui pemetaan `unpaidMembers` pada `useMemo` di `src/pages/Rekap.jsx`:
    ```javascript
    const listStr = unpaidMembers.length === 0
      ? '(Tidak ada - semua anggota telah lunas)'
      : unpaidMembers.map((u, i) => `${i + 1}. ${u.nama}`).join('\n');
    ```
  - Telah di-commit dan di-push ke GitHub (`commit: f83b29c`).

---

### 2. Penanganan Masalah Login PWA & Delay Sinkronisasi Akun
- **Gejala Masalah:**
  - Saat aplikasi PWA ditutup (*swipe close*) dan dibuka kembali, sesi login terputus dan pengguna dipaksa untuk login ulang.
  - Saat baru dibuka dan langsung mencoba login, muncul pesan error *"Username atau Password salah!"*. Namun jika ditunggu beberapa saat lalu dicoba lagi, login berhasil.
- **Analisis Penyebab:**
  1. **Session Scope:** Sesi sebelumnya disimpan di `sessionStorage`, yang otomatis dihapus oleh browser/OS saat aplikasi PWA ditutup.
  2. **Cold Start & Local Cache:** Akun kustom (`admin`, `fitri`, `daru`) tersimpan di Google Spreadsheet. Ketika PWA baru dibuka, server Google Apps Script mengalami *cold start handshake*. Karena sinkronisasi latar belakang belum sempat mengisi `localStorage`, percobaan login instan gagal mencocokkan kredensial. Setelah menunggu beberapa detik, background sync selesai mengunduh data `Users` ke cache lokal sehingga login berikutnya berhasil.
  3. **Auto-Kapitalisasi Keyboard HP:** Keyboard smartphone otomatis mengkapitalkan huruf pertama saat mengetik username (misal `Admin` alih-alih `admin`).
- **Solusi Arsitektur:**
  1. **Persistent Session:** Mengubah penyimpanan sesi aktif dari `sessionStorage` ke `localStorage` (`src/App.jsx`). Pengguna tidak perlu login ulang saat PWA dibuka kembali.
  2. **Preload Sync saat Startup:** Memanggil `syncServerData()` langsung saat komponen `App` pertama kali di-mount, sehingga Google Apps Script langsung *warm-up* dan data user tersinkronisasi lebih awal.
  3. **Pencegahan Auto-Kapitalisasi:** Menambahkan atribut `autoCapitalize="none"`, `autoCorrect="off"`, dan `spellCheck="false"` pada input username dan password di `src/pages/Login.jsx`.
  4. **Fleksibilitas Pencocokan Akun:** Memperbarui fungsi fallback `api.login` di `src/services/api.js` agar pencocokan username bersifat *case-insensitive* serta mendukung validasi password hash SHA-256 maupun plaintext.
  - Telah di-commit dan di-push ke GitHub (`commit: d41d494`).

---

### 3. Konfigurasi Subdomain Cloudflare & Vercel (`si-anjangsana.pkmcermee.my.id`)
- **Permintaan:** Panduan menghubungkan subdomain `si-anjangsana.pkmcermee.my.id` melalui Cloudflare DNS ke deployment Vercel.
- **Langkah-Langkah:**
  1. **Vercel Settings:** Menambahkan `si-anjangsana.pkmcermee.my.id` pada tab **Settings > Domains**.
  2. **Cloudflare DNS:** Menambahkan DNS Record baru:
     - **Type:** `CNAME`
     - **Name:** `si-anjangsana`
     - **Target:** `cname.vercel-dns.com`
     - **Proxy status:** *DNS only (Awan Abu-abu)* saat verifikasi awal, kemudian dapat diaktifkan ke *Proxied (Awan Oranye)*.
     - **TTL:** `Auto`
  3. **Verifikasi SSL:** Menunggu sertifikat SSL otomatis diterbitkan hingga berstatus *Valid Configuration* (Centang Hijau).

---

## 🔗 Navigasi Catatan Terkait
- Kembali ke Master Note: [[SI_ANJANG_CATATAN_PENGEMBANGAN_OBSIDIAN]]
- Log Sesi Sebelumnya: [[LOG_SESI_CHAT_OBSIDIAN_2026-09-23]]
