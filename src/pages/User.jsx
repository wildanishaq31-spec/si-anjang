import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Edit2,
  Lock,
  User,
  Shield,
  X
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function UserManagement({ userList, onSave, onDelete, loading }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [role, setRole] = useState('Bendahara');
  const [password, setPassword] = useState('');

  const openAddModal = () => {
    setIsEdit(false);
    setEditUsername('');
    setUsername('');
    setFullname('');
    setRole('Bendahara');
    setPassword('');
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setIsEdit(true);
    setEditUsername(item.username);
    setUsername(item.username);
    setFullname(item.fullname);
    setRole(item.role);
    setPassword('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !fullname.trim()) {
      Swal.fire({ icon: 'warning', title: 'Lengkapi Data' });
      return;
    }

    if (!isEdit && !password.trim()) {
      Swal.fire({ icon: 'warning', title: 'Password Wajib Diisi' });
      return;
    }

    try {
      const res = await onSave({
        isEdit: isEdit ? 'true' : 'false',
        dataId: editUsername,
        username: username.trim(),
        fullname: fullname.trim(),
        role,
        password: password.trim()
      });

      if (res.success) {
        setModalOpen(false);
        Swal.fire({
          icon: 'success',
          title: isEdit ? 'User Diperbarui' : 'User Berhasil Ditambahkan',
          timer: 1200,
          showConfirmButton: false
        });
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal', text: res.message || 'Gagal menyimpan akun.' });
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.message });
    }
  };

  const handleDelete = (item) => {
    if (item.username === 'admin') {
      Swal.fire({ icon: 'error', title: 'Akses Ditolak', text: 'Akun Super Admin utama tidak boleh dihapus!' });
      return;
    }

    Swal.fire({
      title: `Hapus user ${item.username}?`,
      text: `Akun ${item.fullname} tidak akan bisa login lagi.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(res => {
      if (res.isConfirmed) {
        onDelete(item.username);
        Swal.fire({ icon: 'success', title: 'User Dihapus', timer: 1200, showConfirmButton: false });
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Data Akun User</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Manajemen hak akses akun pengelola sistem SI-ANJANG V.10.5
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Akun User</span>
        </button>
      </div>

      <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-100 flex items-center gap-3 text-xs text-blue-900 font-medium">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
        <span>
          Halaman ini khusus hak akses <b>Superadmin</b>. Akun bendahara memiliki hak mengelola transaksi kas & undian.
        </span>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4 text-center w-12">No</th>
                <th className="py-3.5 px-4">Nama Lengkap & Username</th>
                <th className="py-3.5 px-4">Hak Akses (Role)</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {(userList || []).map((u, idx) => {
                const isAdmin = u.role === 'Superadmin';

                return (
                  <tr key={u.username} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-bold">{idx + 1}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center uppercase">
                          {u.fullname ? u.fullname.charAt(0) : u.username.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{u.fullname}</div>
                          <div className="text-[11px] text-slate-400 font-mono">@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-md font-bold text-[11px] ${
                        isAdmin ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {u.username !== 'admin' && (
                          <button
                            onClick={() => handleDelete(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit User */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {isEdit ? 'Edit Akun User' : 'Tambah Akun User Baru'}
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Lengkap Petugas
                </label>
                <input
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  placeholder="Contoh: Siti Aminah, S.Kep"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: bendahara2"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Hak Akses (Role)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:border-blue-600"
                >
                  <option value="Bendahara">Bendahara</option>
                  <option value="Superadmin">Superadmin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {isEdit ? 'Password Baru (Kosongkan jika tidak diganti)' : 'Password'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isEdit ? 'Ketik jika ingin mengganti...' : 'Password login akun...'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-blue-600"
                  required={!isEdit}
                />
              </div>

              <div className="pt-2 flex gap-2">
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
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
