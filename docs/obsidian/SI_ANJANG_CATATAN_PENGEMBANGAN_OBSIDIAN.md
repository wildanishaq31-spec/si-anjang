---
title: "SI-ANJANG — Catatan Arsitektur & Pengembangan Sistem (UPTD Puskesmas Cermee)"
date: 2026-09-20
tags:
  - si-anjang
  - puskesmas-cermee
  - arsitektur-sistem
  - pwa
  - react-vite
  - google-sheets-database
status: Active
aliases:
  - "Master Note SI-ANJANG"
  - "Dokumentasi Arsitektur E-Anjangsana"
---

# 🏛️ Master Note: Sistem Informasi Anjangsana (SI-ANJANG) V.10.0

## 🎯 Ringkasan Eksekutif
Aplikasi SI-ANJANG adalah sistem manajemen iuran, kas, dan pengundian tuan rumah anjangsana bagi pegawai dan tenaga kesehatan di **UPTD Puskesmas Cermee**. Sistem ini di-upgrade dari Google Apps Script HTML menjadi **React 19 + Vite 8 + Progressive Web App (PWA)** dengan tetap menggunakan **Google Spreadsheet** sebagai pusat data live.

- **URL Repository:** [https://github.com/wildanishaq31-spec/si-anjang](https://github.com/wildanishaq31-spec/si-anjang)
- **Target Domain:** `anjangsana.pkmcermee.my.id`
- **Catatan Sesi Diskusi:** [[LOG_SESI_CHAT_OBSIDIAN_2026-09-20]]

---

## 🗄️ Skema Database Google Spreadsheet

Sistem beroperasi di atas spreadsheet yang memiliki sheet-sheet berikut:
1. **`Users`**: Otentikasi pengguna (`username`, `password` [SHA-256], `fullname`, `role`, `photo`, `token`).
2. **`Karyawan`**: Data induk pegawai (`id`, `nama`, `jabatan`, `nominal_iuran`, `status`).
3. **`Iuran`**: Transaksi masuk (`id`, `tanggal`, `id_karyawan`, `nama_karyawan`, `periode`, `nominal`, `metode_pembayaran`, `uang_diterima`, `kembalian`).
4. **`Pengeluaran`**: Transaksi keluar (`id`, `tanggal`, `keterangan`, `nominal`, `kategori`).
5. **`Undian`**: Riwayat pemenang tuan rumah (`id`, `tanggal`, `id_karyawan`, `nama_pemenang`, `periode`).
6. **`Pengaturan`**: Konfigurasi running banner dan template pesan WhatsApp.

---

## ⚡ Fitur Utama & Logika Bisnis

### 1. Filter Iuran Anti-Double Input
- Dropdown pencarian kasir **hanya memuat pegawai yang belum lunas** pada periode aktif.
- Begitu data disimpan, nama pegawai langsung hilang dari daftar saran.
- Jika ada pembatalan/penghapusan data di tabel riwayat pembayaran, nama pegawai otomatis kembali tersedia.

### 2. Sistem Undian Tuan Rumah Otomatis & Manual
- **Mode Otomatis:** Mengacak hanya kandidat berstatus `Belum`, menampilkan nama bergerak cepat (*rolling effect*) dan perayaan confetti.
- **Mode Manual:** Kolom pencarian searchable yang hanya menampilkan anggota berstatus `Belum` dan otomatis menghitung sisa bulan yang belum terisi.

### 3. Rekapitulasi & Ekspor
- Pemisahan penerimaan tunai (*cash*) vs transfer bank.
- Ekspor spreadsheet ke format `.xlsx` (SheetJS).
- Broadcast otomatis daftar nama anggota yang belum melunasi iuran ke grup WhatsApp.

---

## 🔗 Referensi File Terkait
- Catatan Log Diskusi: [[LOG_SESI_CHAT_OBSIDIAN_2026-09-20]]
- Panduan Deployment Vercel & Konfigurasi Custom Domain: [[LOG_SESI_CHAT_OBSIDIAN_2026-09-20#5. Panduan Singkat Deployment Vercel]]
