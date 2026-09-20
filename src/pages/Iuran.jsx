import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Coins,
  Search,
  CheckCircle2,
  Trash2,
  Edit3,
  Calendar,
  CreditCard,
  Banknote,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  X
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function Iuran({ iuranList, karyawanList, onSave, onDelete, loading }) {
  const dropdownRef = useRef(null);

  // Form State
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState('');
  const [searchKaryawan, setSearchKaryawan] = useState('');
  const [selectedKaryawan, setSelectedKaryawan] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const [tanggal, setTanggal] = useState(() => {
    const d = new Date();
    return d.toISOString().substring(0, 10);
  });

  const [periode, setPeriode] = useState(() => {
    const d = new Date();
    const bln = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${bln[d.getMonth()]} ${d.getFullYear()}`;
  });

  const [nominal, setNominal] = useState(0);
  const [metode, setMetode] = useState('Cash / Tunai');
  const [uangDiterima, setUangDiterima] = useState('');
  const [kembalian, setKembalian] = useState(0);

  // Table Search & Pagination
  const [tableSearch, setTableSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const formatRp = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num || 0);
  };

  // Close dropdown on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Normalize string helper
  const normalize = (str) => String(str || '').trim().toLowerCase();

  // Set of employees who have already paid for the current active period
  const paidEmployeeMap = useMemo(() => {
    const map = new Set();
    const targetPeriod = normalize(periode);

    const now = new Date();
    const blnIndo = ['januari', 'februari', 'maret', 'april', 'mei', 'juni', 'juli', 'agustus', 'september', 'oktober', 'november', 'desember'];
    const curMonthName = blnIndo[now.getMonth()];
    const yearStr = String(now.getFullYear());
    const monthStr = String(now.getMonth() + 1).padStart(2, '0');
    const datePrefix = `${yearStr}-${monthStr}`;

    (iuranList || []).forEach(item => {
      // When editing an existing transaction, do not exclude the item being edited
      if (isEdit && String(item.id) === String(editId)) {
        return;
      }

      const itemPeriode = normalize(item.periode);
      const itemTanggal = String(item.tanggal || '');

      const isSamePeriod =
        (itemPeriode && itemPeriode === targetPeriod) ||
        (itemPeriode && itemPeriode.includes(curMonthName) && itemPeriode.includes(yearStr)) ||
        (itemTanggal.startsWith(datePrefix));

      if (isSamePeriod) {
        if (item.id_karyawan) {
          map.add(`id:${String(item.id_karyawan).trim()}`);
        }
        if (item.nama_karyawan) {
          map.add(`name:${normalize(item.nama_karyawan)}`);
        }
      }
    });

    return map;
  }, [iuranList, periode, isEdit, editId]);

  // Check if an employee has already paid
  const isKaryawanPaid = useCallback((k) => {
    if (!k) return false;
    return paidEmployeeMap.has(`id:${String(k.id).trim()}`) ||
           paidEmployeeMap.has(`name:${normalize(k.nama)}`);
  }, [paidEmployeeMap]);

  // Available employees: ONLY those who have NOT yet paid this period
  const unpaidKaryawanList = useMemo(() => {
    return (karyawanList || []).filter(k => !isKaryawanPaid(k));
  }, [karyawanList, isKaryawanPaid]);

  // Autocomplete matching: search only among unpaid employees
  const matchingKaryawan = useMemo(() => {
    if (!searchKaryawan.trim()) {
      return unpaidKaryawanList.slice(0, 8);
    }
    const query = normalize(searchKaryawan);
    return unpaidKaryawanList.filter(k =>
      normalize(k.nama).includes(query)
    ).slice(0, 8);
  }, [searchKaryawan, unpaidKaryawanList]);

  // Detect if user typed someone who already paid
  const alreadyPaidMatch = useMemo(() => {
    if (!searchKaryawan.trim() || isEdit) return null;
    const query = normalize(searchKaryawan);
    const hasUnpaid = unpaidKaryawanList.some(k => normalize(k.nama) === query);
    if (hasUnpaid) return null;

    return (karyawanList || []).find(k =>
      isKaryawanPaid(k) && normalize(k.nama).includes(query)
    );
  }, [searchKaryawan, isEdit, unpaidKaryawanList, karyawanList, isKaryawanPaid]);

  // Select employee from dropdown
  const handleSelectKaryawan = (k) => {
    setSelectedKaryawan(k);
    setSearchKaryawan(k.nama);
    setShowDropdown(false);
    const nom = Number(k.nominal_iuran) || 25000;
    setNominal(nom);

    if (metode === 'Transfer') {
      setUangDiterima(nom);
      setKembalian(0);
    } else {
      setUangDiterima(nom);
      setKembalian(0);
    }
  };

  const handleClearSelected = () => {
    setSelectedKaryawan(null);
    setSearchKaryawan('');
    setNominal(0);
    setUangDiterima('');
    setKembalian(0);
    setShowDropdown(true);
  };

  // Calculate change
  const handleUangDiterimaChange = (val) => {
    setUangDiterima(val);
    const diterimaNum = parseFloat(val) || 0;
    const diff = diterimaNum - nominal;
    setKembalian(diff >= 0 ? diff : 0);
  };

  const handleMetodeChange = (newMetode) => {
    setMetode(newMetode);
    if (newMetode === 'Transfer') {
      setUangDiterima(nominal);
      setKembalian(0);
    }
  };

  const resetForm = () => {
    setIsEdit(false);
    setEditId('');
    setSearchKaryawan('');
    setSelectedKaryawan(null);
    setNominal(0);
    setUangDiterima('');
    setKembalian(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedKaryawan && !searchKaryawan.trim()) {
      Swal.fire({ icon: 'warning', title: 'Pilih Karyawan', text: 'Silakan cari dan pilih anggota karyawan!' });
      return;
    }

    // Double check duplicate prevention for non-edit mode
    let targetKaryawan = selectedKaryawan;
    if (!targetKaryawan && searchKaryawan.trim()) {
      targetKaryawan = unpaidKaryawanList.find(k => normalize(k.nama) === normalize(searchKaryawan));
    }

    if (!isEdit) {
      if (targetKaryawan && isKaryawanPaid(targetKaryawan)) {
        Swal.fire({
          icon: 'warning',
          title: 'Sudah Membayar',
          text: `${targetKaryawan.nama} sudah tercatat membayar iuran pada periode ${periode}!`
        });
        return;
      }

      const alreadyPaid = (karyawanList || []).find(k =>
        normalize(k.nama) === normalize(searchKaryawan) && isKaryawanPaid(k)
      );
      if (alreadyPaid) {
        Swal.fire({
          icon: 'warning',
          title: 'Sudah Membayar',
          text: `${alreadyPaid.nama} sudah tercatat membayar iuran pada periode ${periode}!`
        });
        return;
      }
    }

    const now = new Date();
    const todayStr = now.toISOString().substring(0, 10);
    const bln = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const currentPeriode = `${bln[now.getMonth()]} ${now.getFullYear()}`;

    const payload = {
      isEdit: isEdit ? 'true' : 'false',
      dataId: editId,
      tanggal: isEdit && tanggal ? tanggal : todayStr,
      periode: isEdit && periode ? periode : currentPeriode,
      id_karyawan: targetKaryawan ? targetKaryawan.id : (editId || Date.now()),
      nama_karyawan: targetKaryawan ? targetKaryawan.nama : searchKaryawan,
      nominal: Number(nominal),
      metode_pembayaran: metode,
      uang_diterima: Number(uangDiterima || nominal),
      kembalian: Number(kembalian)
    };

    try {
      await onSave(payload);
      resetForm();
      Swal.fire({
        icon: 'success',
        title: isEdit ? 'Pembayaran Diperbarui' : 'Pembayaran Berhasil Disimpan',
        timer: 1200,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal Menyimpan', text: err.message });
    }
  };

  const handleEdit = (item) => {
    setIsEdit(true);
    setEditId(item.id);
    setSearchKaryawan(item.nama_karyawan);
    setSelectedKaryawan({ id: item.id_karyawan, nama: item.nama_karyawan });
    setTanggal(item.tanggal || new Date().toISOString().substring(0, 10));
    setPeriode(item.periode || '');
    setNominal(Number(item.nominal) || 0);
    setMetode(item.metode_pembayaran || 'Cash / Tunai');
    setUangDiterima(Number(item.uang_diterima) || Number(item.nominal));
    setKembalian(Number(item.kembalian) || 0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (item) => {
    Swal.fire({
      title: 'Hapus Transaksi?',
      text: `Batalkan pembayaran iuran untuk ${item.nama_karyawan} (${item.periode})?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(res => {
      if (res.isConfirmed) {
        onDelete(item.id);
        Swal.fire({ icon: 'success', title: 'Transaksi Dihapus', timer: 1200, showConfirmButton: false });
      }
    });
  };

  // Filter Table
  const filtered = useMemo(() => {
    return (iuranList || []).filter(item =>
      (item.nama_karyawan || '').toLowerCase().includes(tableSearch.toLowerCase()) ||
      (item.periode || '').toLowerCase().includes(tableSearch.toLowerCase()) ||
      (item.metode_pembayaran || '').toLowerCase().includes(tableSearch.toLowerCase())
    );
  }, [iuranList, tableSearch]);

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Manajemen Iuran</h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Pencatatan pembayaran kasir iuran anjangsana tunai maupun transfer
        </p>
      </div>

      {/* Input Kasir Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {isEdit ? 'Edit Transaksi Pembayaran' : 'Form Input Pembayaran Iuran'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Ketik nama anggota untuk kalkulasi nominal otomatis
              </p>
            </div>
          </div>

          {isEdit && (
            <button
              onClick={resetForm}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg bg-slate-100 cursor-pointer"
            >
              Batalkan Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Search Employee & Auto Nominal */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 relative" ref={dropdownRef}>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Cari Nama Karyawan <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-semibold text-slate-500">
                  Tersisa <span className="font-bold text-blue-600">{unpaidKaryawanList.length}</span> anggota belum bayar
                </span>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchKaryawan}
                  onChange={(e) => {
                    setSearchKaryawan(e.target.value);
                    if (selectedKaryawan && e.target.value !== selectedKaryawan.nama) {
                      setSelectedKaryawan(null);
                    }
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Ketik atau pilih nama anggota yang belum bayar..."
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  required
                />
                {searchKaryawan && (
                  <button
                    type="button"
                    onClick={handleClearSelected}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 cursor-pointer"
                    title="Hapus / Cari Ulang"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Dropdown Suggestions: ONLY unpaid employees */}
              {showDropdown && (
                <div className="absolute z-30 left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden divide-y divide-slate-100 max-h-64 overflow-y-auto">
                  {matchingKaryawan.length > 0 ? (
                    matchingKaryawan.map(k => (
                      <button
                        key={k.id}
                        type="button"
                        onClick={() => handleSelectKaryawan(k)}
                        className="w-full text-left p-3.5 hover:bg-blue-50/80 transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <span>{k.nama}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-50 text-amber-700 border border-amber-200">
                              Belum Bayar
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">Jabatan: <span className="font-semibold text-blue-600">{k.jabatan}</span></div>
                        </div>
                        <div className="text-sm font-extrabold text-blue-600">
                          {formatRp(k.nominal_iuran)}
                        </div>
                      </button>
                    ))
                  ) : alreadyPaidMatch ? (
                    <div className="p-4 bg-emerald-50/70">
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-emerald-900">
                            {alreadyPaidMatch.nama} Sudah Bayar Bulan Ini ({periode})
                          </div>
                          <p className="text-[11px] text-emerald-700 mt-1 leading-relaxed">
                            Nama otomatis disembunyikan untuk mencegah double input. Jika ada salah catat, hapus transaksinya pada tabel <b>Riwayat Pembayaran</b> di bawah agar nama muncul kembali.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : unpaidKaryawanList.length === 0 ? (
                    <div className="p-5 text-center text-slate-500 text-xs">
                      <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-1.5" />
                      <span className="font-bold text-slate-800 block text-sm">Semua Anggota Sudah Lunas!</span>
                      <span>Seluruh anggota telah membayar iuran periode {periode}.</span>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-slate-400 text-xs">
                      Tidak ditemukan anggota belum bayar dengan kata kunci "{searchKaryawan}".
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="lg:col-span-5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Nominal Iuran (Otomatis)
              </label>
              <div className="w-full px-4 py-3 bg-blue-50/70 border border-blue-100 rounded-xl text-lg font-extrabold text-blue-700 flex items-center justify-between">
                <span>{formatRp(nominal)}</span>
                <span className="text-xs font-semibold text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-md">
                  {selectedKaryawan ? selectedKaryawan.jabatan || 'Anggota' : 'Auto'}
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: Metode Pembayaran */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Metode Pembayaran
              </label>
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                Otomatis Periode: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <select
              value={metode}
              onChange={(e) => handleMetodeChange(e.target.value)}
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all cursor-pointer"
            >
              <option value="Cash / Tunai">Cash / Tunai</option>
              <option value="Transfer">Transfer Bank</option>
            </select>
          </div>

          {/* Row 3: Calculator Uang Diterima & Kembalian */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Uang Diterima (Rp)
              </label>
              <input
                type="number"
                value={uangDiterima}
                onChange={(e) => handleUangDiterimaChange(e.target.value)}
                placeholder="Jumlah uang diserahkan..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-base font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <div className="sm:text-right">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Kembalian
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-600">
                {formatRp(kembalian)}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{isEdit ? 'Perbarui Data Pembayaran' : 'Simpan Pembayaran Iuran'}</span>
          </button>
        </form>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900">Riwayat Pembayaran Iuran</h3>
            <p className="text-xs text-slate-400 font-medium">Data transaksi yang tercatat di database</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => { setTableSearch(e.target.value); setPage(1); }}
              placeholder="Cari transaksi..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 text-center w-12">No</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Nama Karyawan</th>
                <th className="py-3 px-4">Periode</th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4">Nominal</th>
                <th className="py-3 px-4">Diterima</th>
                <th className="py-3 px-4">Kembali</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-10 text-center text-slate-400">
                    Belum ada riwayat pembayaran iuran.
                  </td>
                </tr>
              ) : (
                paginated.map((item, idx) => {
                  const rowNo = (page - 1) * perPage + idx + 1;
                  const isTransfer = item.metode_pembayaran?.toLowerCase().includes('transfer');

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-center text-slate-400 font-bold">{rowNo}</td>
                      <td className="py-3 px-4 text-slate-600">{item.tanggal}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{item.nama_karyawan}</td>
                      <td className="py-3 px-4 font-semibold text-blue-600">{item.periode}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          isTransfer ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          {item.metode_pembayaran}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{formatRp(item.nominal)}</td>
                      <td className="py-3 px-4 text-slate-600">{formatRp(item.uang_diterima)}</td>
                      <td className="py-3 px-4 text-emerald-600 font-semibold">{formatRp(item.kembalian)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Menampilkan {(page - 1) * perPage + 1} - {Math.min(page * perPage, filtered.length)} dari {filtered.length} data
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-semibold text-slate-800">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
