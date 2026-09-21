---
title: "SI-ANJANG — Catatan Arsitektur & Pengembangan Sistem (UPTD Puskesmas Cermee)"
date: 2026-09-21
tags:
  - si-anjang
  - puskesmas-cermee
  - arsitektur-sistem
  - pwa
  - react-vite
  - google-sheets-database
  - swr-cache-first
status: Active
aliases:
  - "Master Note SI-ANJANG"
  - "Dokumentasi Arsitektur SI-ANJANG V.10.5"
---

# 🏛️ Master Note: Sistem Informasi Anjangsana (SI-ANJANG) V.10.5

## 🎯 Ringkasan Eksekutif
Aplikasi **SI-ANJANG V.10.5** adalah sistem manajemen iuran, kas, dan pengundian tuan rumah anjangsana bagi pegawai dan tenaga kesehatan di **UPTD Puskesmas Cermee**. Sistem ini dibangun menggunakan **React 19 + Vite 8 + Tailwind CSS + Progressive Web App (PWA)** dengan arsitektur **Ultra-Fast Cache-First (SWR - Stale While Revalidate)** dan tetap menggunakan **Google Spreadsheet** sebagai pusat database *live*.

- **URL Repository:** [https://github.com/wildanishaq31-spec/si-anjang](https://github.com/wildanishaq31-spec/si-anjang)
- **Target Domain:** `anjangsana.pkmcermee.my.id`
- **Catatan Sesi Diskusi:**
  - [[LOG_SESI_CHAT_OBSIDIAN_2026-09-20]] (Migrasi Awal React PWA)
  - [[LOG_SESI_CHAT_OBSIDIAN_2026-09-21]] (Deployment Vercel, Optimasi 0ms, Bugfix Grid & Branding V.10.5)

---

## 🗄️ Skema Database Google Spreadsheet

Sistem beroperasi di atas spreadsheet yang memiliki sheet-sheet berikut:
1. **`Users`**: Otentikasi pengguna (`username`, `password` [SHA-256], `fullname`, `role`, `photo`, `token`).
2. **`Karyawan`**: Data induk pegawai (`id`, `nama`, `jabatan`, `nominal_iuran`, `status`).
3. **`Iuran`**: Transaksi masuk (`id`, `tanggal`, `id_karyawan`, `nama_karyawan`, `periode`, `nominal`, `metode_pembayaran`, `uang_diterima`, `kembalian`).
4. **`Pengeluaran`**: Transaksi keluar (`id`, `tanggal`, `keterangan`, `nominal`, `kategori`).
5. **`Undian`**: Riwayat pemenang tuan rumah (`id`, `tanggal`, `id_karyawan`, `nama_pemenang`, `periode`).
6. **`Settings`**: Konfigurasi info dashboard dan template broadcast WhatsApp.

---

## ⚡ Fitur Utama & Arsitektur Performa

### 1. Ultra-Fast Cache-First & Optimistic UI (0ms Response)
- **Instant Rendering:** Data dimuat seketika dari `localStorage` saat aplikasi dibuka. Tidak ada delay, tidak ada layar kosong, dan Dashboard langsung menampilkan angka riil.
- **Background Sync:** Sinkronisasi dengan Google Apps Script berjalan di latar belakang tanpa mengunci antarmuka.
- **Optimistic CRUD:** Operasi input/edit/hapus langsung mengupdate UI seketika dalam waktu sub-50ms sebelum request jaringan selesai.

### 2. Filter Iuran Anti-Double Input
- Dropdown pencarian kasir **hanya memuat pegawai yang belum lunas** pada periode aktif.
- Begitu data disimpan, nama pegawai langsung hilang dari daftar saran pembayaran.

### 3. Sistem Undian Tuan Rumah Otomatis & Manual
- **Mode Otomatis:** Mengacak kandidat berstatus `Belum`, efek putar cepat (*rolling animation*), dan perayaan confetti.
- **Mode Manual:** Pencarian hanya kandidat berstatus `Belum` dengan kalkulasi sisa bulan siklus secara otomatis.

### 4. Rekapitulasi & Ekspor
- Pemisahan penerimaan tunai (*cash*) vs transfer bank.
- Ekspor spreadsheet ke format `.xlsx` (SheetJS).
- Broadcast otomatis daftar anggota belum bayar ke grup WhatsApp.

---

## 🔗 Referensi File & Log Sesi
- [[LOG_SESI_CHAT_OBSIDIAN_2026-09-20]] — Log Sesi Diskusi 20 Sept 2026
- [[LOG_SESI_CHAT_OBSIDIAN_2026-09-21]] — Log Sesi Diskusi 21 Sept 2026
