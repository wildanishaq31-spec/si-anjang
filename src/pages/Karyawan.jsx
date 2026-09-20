import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  RotateCcw,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function Karyawan({ karyawanList, onSave, onDelete, onResetAllStatus, loading }) {
  const [search, setSearch] = useState('');
  const [filterJabatan, setFilterJabatan] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState('');
  const [nama, setNama] = useState('');
  const [jabatan, setJabatan] = useState('PNS');
  const [nominal, setNominal] = useState(25000);
  const [status, setStatus] = useState('Belum');

  const formatRp = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num || 0);
  };

  // Jabatan change handler (sets default nominal)
  const handleJabatanChange = (val) => {
    setJabatan(val);
    if (val === 'PNS') {
      setNominal(25000);
    } else {
      setNominal(15000);
    }
  };

  const openAddModal = () => {
    setIsEdit(false);
    setEditId('');
    setNama('');
    setJabatan('PNS');
    setNominal(25000);
    setStatus('Belum');
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setIsEdit(true);
    setEditId(item.id);
    setNama(item.nama);
    setJabatan(item.jabatan);
    setNominal(item.nominal_iuran);
    setStatus(item.status);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nama.trim()) {
      Swal.fire({ icon: 'warning', title: 'Nama Wajib Diisi' });
      return;
    }

    try {
      await onSave({
        isEdit: isEdit ? 'true' : 'false',
        dataId: editId,
        nama: nama.trim(),
        jabatan,
        nominal_iuran: Number(nominal),
        status
      });
      setModalOpen(false);
      Swal.fire({
        icon: 'success',
        title: isEdit ? 'Data Karyawan Diperbarui' : 'Karyawan Berhasil Ditambahkan',
        timer: 1200,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal Menyimpan', text: err.message });
    }
  };

  const handleDelete = (item) => {
    Swal.fire({
      title: `Hapus ${item.nama}?`,
      text: 'Data karyawan ini akan dihapus dari daftar anggota.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then((res) => {
      if (res.isConfirmed) {
        onDelete(item.id);
        Swal.fire({ icon: 'success', title: 'Data Terhapus', timer: 1200, showConfirmButton: false });
      }
    });
  };

  const handleResetStatus = () => {
    Swal.fire({
      title: 'Reset Status Siklus?',
      text: 'Semua anggota akan diubah statusnya menjadi "Belum" untuk memulai siklus undian baru.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Reset Semua',
      cancelButtonText: 'Batal'
    }).then((res) => {
      if (res.isConfirmed) {
        onResetAllStatus();
        Swal.fire({ icon: 'success', title: 'Status Telah Direset', timer: 1500, showConfirmButton: false });
      }
    });
  };

  // Filter & Search
  const filtered = useMemo(() => {
    return (karyawanList || []).filter((item) => {
      const matchSearch = item.nama.toLowerCase().includes(search.toLowerCase());
      const matchJabatan = filterJabatan === 'Semua' || item.jabatan === filterJabatan;
      const matchStatus = filterStatus === 'Semua' || item.status === filterStatus;
      return matchSearch && matchJabatan && matchStatus;
    });
  }, [karyawanList, search, filterJabatan, filterStatus]);

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Data Karyawan</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Kelola master data anggota, nominal iuran, dan siklus anjangsana
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetStatus}
            className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl border border-amber-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Status</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Karyawan</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari nama karyawan..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filterJabatan}
            onChange={(e) => { setFilterJabatan(e.target.value); setPage(1); }}
            className="w-full md:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="Semua">Semua Jabatan</option>
            <option value="PNS">PNS</option>
            <option value="P3K">P3K</option>
            <option value="P3KPWD">P3KPWD</option>
            <option value="P3KPW">P3KPW</option>
            <option value="Lainnya">Kontrak</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="w-full md:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="Semua">Semua Status</option>
            <option value="Belum">Belum Giliran</option>
            <option value="Sudah">Sudah Dapat</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4 text-center w-12">No</th>
                <th className="py-3.5 px-4">Nama Lengkap</th>
                <th className="py-3.5 px-4">Jabatan</th>
                <th className="py-3.5 px-4">Nominal Iuran</th>
                <th className="py-3.5 px-4">Status Giliran</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    Tidak ada data karyawan yang cocok.
                  </td>
                </tr>
              ) : (
                paginated.map((k, idx) => {
                  const rowNo = (page - 1) * perPage + idx + 1;
                  const isSudah = k.status === 'Sudah';

                  return (
                    <tr key={k.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 text-center text-slate-400 font-bold">{rowNo}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{k.nama}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-100">
                          {k.jabatan}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {formatRp(k.nominal_iuran)}
                      </td>
                      <td className="py-3.5 px-4">
                        {isSudah ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Sudah
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-[11px] border border-amber-200">
                            <Clock className="w-3.5 h-3.5" />
                            Belum
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(k)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(k)}
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
              Menampilkan {(page - 1) * perPage + 1} - {Math.min(page * perPage, filtered.length)} dari {filtered.length} anggota
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

      {/* Modal Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {isEdit ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Nama Karyawan
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Dr. Budi Santoso"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Jabatan
                  </label>
                  <select
                    value={jabatan}
                    onChange={(e) => handleJabatanChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:border-blue-600"
                  >
                    <option value="PNS">PNS</option>
                    <option value="P3K">P3K</option>
                    <option value="P3KPWD">P3KPWD</option>
                    <option value="P3KPW">P3KPW</option>
                    <option value="Lainnya">Kontrak</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Nominal Iuran (Rp)
                  </label>
                  <input
                    type="number"
                    value={nominal}
                    onChange={(e) => setNominal(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-blue-600 focus:bg-white focus:outline-none focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Status Siklus Undian
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:border-blue-600"
                >
                  <option value="Belum">Belum Giliran</option>
                  <option value="Sudah">Sudah Pernah Dapat</option>
                </select>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
