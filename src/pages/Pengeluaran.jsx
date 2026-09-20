import React, { useState, useMemo } from 'react';
import {
  Receipt,
  PlusCircle,
  Trash2,
  Calendar,
  DollarSign,
  Tag,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function Pengeluaran({ pengeluaranList, onSave, onDelete, loading }) {
  const [keterangan, setKeterangan] = useState('');
  const [nominal, setNominal] = useState('');
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().substring(0, 10));
  const [kategori, setKategori] = useState('Konsumsi');
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

  const totalPengeluaranAll = useMemo(() => {
    return (pengeluaranList || []).reduce((acc, p) => acc + (parseFloat(p.nominal) || 0), 0);
  }, [pengeluaranList]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!keterangan.trim() || !nominal) {
      Swal.fire({ icon: 'warning', title: 'Lengkapi Data', text: 'Keterangan dan nominal wajib diisi!' });
      return;
    }

    try {
      await onSave({
        isEdit: 'false',
        dataId: '',
        keterangan: keterangan.trim(),
        nominal: Number(nominal),
        tanggal,
        kategori
      });

      setKeterangan('');
      setNominal('');
      Swal.fire({
        icon: 'success',
        title: 'Pengeluaran Dicatat',
        timer: 1200,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal Menyimpan', text: err.message });
    }
  };

  const handleDelete = (item) => {
    Swal.fire({
      title: 'Hapus Pengeluaran?',
      text: `Hapus biaya ${item.keterangan} sebesar ${formatRp(item.nominal)}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(res => {
      if (res.isConfirmed) {
        onDelete(item.id);
        Swal.fire({ icon: 'success', title: 'Pengeluaran Dihapus', timer: 1200, showConfirmButton: false });
      }
    });
  };

  const filtered = useMemo(() => {
    return (pengeluaranList || []).filter(item =>
      (item.keterangan || '').toLowerCase().includes(tableSearch.toLowerCase()) ||
      (item.kategori || '').toLowerCase().includes(tableSearch.toLowerCase())
    );
  }, [pengeluaranList, tableSearch]);

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Pengeluaran Kas</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Pencatatan seluruh biaya operasional, konsumsi, dan keperluan anjangsana
          </p>
        </div>

        <div className="px-4 py-2.5 bg-rose-50 border border-rose-200/80 rounded-2xl flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-600 text-white">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Total Pengeluaran</span>
            <span className="text-base font-extrabold text-rose-700">{formatRp(totalPengeluaranAll)}</span>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">Form Pencatatan Biaya</h3>
            <p className="text-xs text-slate-400 font-medium">Masukkan rincian pengeluaran dana</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Keterangan / Keperluan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Contoh: Beli kue & konsumsi rapat anjangsana"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Nominal (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                value={nominal}
                onChange={(e) => setNominal(e.target.value)}
                placeholder="Jumlah biaya..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-rose-600 focus:bg-white focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Kategori
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:border-blue-600"
              >
                <option value="Konsumsi">Konsumsi</option>
                <option value="Bingkisan">Bingkisan / Tali Asih</option>
                <option value="Perlengkapan">Perlengkapan</option>
                <option value="Lainnya">Lain-lain</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end pt-2">
            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Tanggal Pengeluaran
              </label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <div className="md:col-span-8">
              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Simpan Pengeluaran</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-slate-900">Riwayat Pengeluaran</h3>
            <p className="text-xs text-slate-400 font-medium">Daftar biaya yang telah dikeluarkan</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => { setTableSearch(e.target.value); setPage(1); }}
              placeholder="Cari pengeluaran..."
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
                <th className="py-3 px-4">Keterangan / Keperluan</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Nominal</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-slate-400">
                    Belum ada data pengeluaran kas.
                  </td>
                </tr>
              ) : (
                paginated.map((item, idx) => {
                  const rowNo = (page - 1) * perPage + idx + 1;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-center text-slate-400 font-bold">{rowNo}</td>
                      <td className="py-3 px-4 text-slate-600">{item.tanggal}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{item.keterangan}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-md font-bold text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                          {item.kategori || 'Biaya'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-extrabold text-rose-600">{formatRp(item.nominal)}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
