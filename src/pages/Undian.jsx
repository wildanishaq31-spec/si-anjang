import React, { useState, useEffect } from 'react';
import {
  Shuffle,
  Award,
  Sparkles,
  Trash2,
  Calendar,
  User,
  PlusCircle,
  Clock,
  X,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Swal from 'sweetalert2';

export default function Undian({ undianList, karyawanList, onSave, onDelete, loading }) {
  const [isRolling, setIsRolling] = useState(false);
  const [displayName, setDisplayName] = useState('? ? ? ? ?');
  const [selectedWinner, setSelectedWinner] = useState(null);

  // Manual Request Modal
  const [modalManual, setModalManual] = useState(false);
  const [manualKaryawanId, setManualKaryawanId] = useState('');
  const [manualPeriode, setManualPeriode] = useState(() => {
    const d = new Date();
    const bln = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${bln[d.getMonth()]} ${d.getFullYear()}`;
  });

  // Eligible candidates (status === 'Belum')
  const eligibleCandidates = (karyawanList || []).filter(k => k.status === 'Belum');

  const startKocok = () => {
    if (eligibleCandidates.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Siklus Telah Selesai',
        text: 'Semua anggota telah mendapatkan giliran tuan rumah! Silakan Reset Status di menu Data Karyawan untuk mengulang siklus.',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    setIsRolling(true);
    let counter = 0;
    const totalFlips = 35;
    const intervalTime = 60;

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * eligibleCandidates.length);
      setDisplayName(eligibleCandidates[randomIndex].nama);
      counter++;

      if (counter >= totalFlips) {
        clearInterval(interval);
        // Final winner
        const winnerIndex = Math.floor(Math.random() * eligibleCandidates.length);
        const winner = eligibleCandidates[winnerIndex];
        setDisplayName(winner.nama);
        setIsRolling(false);
        setSelectedWinner(winner);

        // Confetti celebration
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });

        // Prompt to confirm saving winner
        setTimeout(() => {
          const now = new Date();
          const bln = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
          const currentPeriode = `${bln[now.getMonth()]} ${now.getFullYear()}`;

          Swal.fire({
            title: '🎉 Selamat kepada Pemenang!',
            html: `Tuan rumah selanjutnya:<br><b style="font-size: 1.3rem; color: #2563eb;">${winner.nama}</b><br><small class="text-muted">Jabatan: ${winner.jabatan}</small>`,
            icon: 'success',
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Tetapkan Sebagai Tuan Rumah',
            cancelButtonText: 'Kocok Ulang'
          }).then(async (result) => {
            if (result.isConfirmed) {
              await onSave({
                isEdit: 'false',
                dataId: '',
                tanggal: now.toISOString().substring(0, 10),
                id_karyawan: winner.id,
                nama_pemenang: winner.nama,
                periode: currentPeriode
              });

              Swal.fire({
                icon: 'success',
                title: 'Tuan Rumah Berhasil Ditetapkan',
                text: `${winner.nama} telah tercatat dan statusnya otomatis diperbarui.`,
                timer: 1800,
                showConfirmButton: false
              });
            } else {
              setDisplayName('? ? ? ? ?');
            }
          });
        }, 500);
      }
    }, intervalTime);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const candidate = (karyawanList || []).find(k => String(k.id) === String(manualKaryawanId));
    if (!candidate) {
      Swal.fire({ icon: 'warning', title: 'Pilih Anggota', text: 'Silakan pilih karyawan yang mengajukan diri!' });
      return;
    }

    try {
      const now = new Date();
      await onSave({
        isEdit: 'false',
        dataId: '',
        tanggal: now.toISOString().substring(0, 10),
        id_karyawan: candidate.id,
        nama_pemenang: candidate.nama,
        periode: manualPeriode
      });

      setModalManual(false);
      setManualKaryawanId('');
      Swal.fire({
        icon: 'success',
        title: 'Tuan Rumah Ditetapkan',
        text: `${candidate.nama} telah dicatat sebagai tuan rumah periode ${manualPeriode}.`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal Menyimpan', text: err.message });
    }
  };

  const handleDelete = (item) => {
    Swal.fire({
      title: 'Hapus Tuan Rumah?',
      text: `Batalkan ${item.nama_pemenang} sebagai tuan rumah? Status karyawan ini akan otomatis dikembalikan menjadi "Belum".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Batalkan & Rollback',
      cancelButtonText: 'Batal'
    }).then(res => {
      if (res.isConfirmed) {
        onDelete(item.id);
        Swal.fire({
          icon: 'success',
          title: 'Dibatalkan',
          text: 'Data telah dihapus dan status anggota kembali menjadi "Belum".',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Undian Anjangsana</h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Pengundian tuan rumah pertemuan keluarga besar Puskesmas Cermee secara adil
        </p>
      </div>

      {/* Interactive Randomizer Card */}
      <div className="relative overflow-hidden rounded-3xl bg-[#111536] text-white p-8 sm:p-12 shadow-2xl border border-slate-800 text-center">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold backdrop-blur-xs mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pengacak Otomatis</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Undian Tuan Rumah
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
              Kocok untuk memilih salah satu dari{' '}
              <span className="text-amber-400 font-bold">{eligibleCandidates.length} anggota</span> yang belum giliran.
            </p>
          </div>

          {/* Display Name Box */}
          <div className="relative mx-auto max-w-xl p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-md shadow-inner flex items-center justify-center min-h-[120px]">
            <span className={`text-2xl sm:text-4xl font-extrabold tracking-wider transition-all duration-75 text-center ${
              isRolling ? 'text-amber-300 scale-105' : 'text-white'
            }`}>
              {displayName}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={startKocok}
              disabled={isRolling || eligibleCandidates.length === 0}
              className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Shuffle className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
              <span>{isRolling ? 'MENGACAK NAMA...' : 'KOCOK SEKARANG'}</span>
            </button>

            <button
              onClick={() => setModalManual(true)}
              className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/15 backdrop-blur-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-blue-300" />
              <span>Request Tuan Rumah</span>
            </button>
          </div>
        </div>
      </div>

      {/* Urutan Anjangsana / Riwayat Undian */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Daftar Urutan Anjangsana</h3>
              <p className="text-xs text-slate-400 font-medium">Riwayat pemenang dan tuan rumah terpilih</p>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Total {undianList?.length || 0} Pertemuan
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(undianList || []).length === 0 ? (
            <div className="md:col-span-2 bg-white rounded-2xl p-10 text-center text-slate-400 border border-slate-200/80">
              Belum ada data undian yang tersimpan. Silakan klik "Kocok Sekarang" di atas!
            </div>
          ) : (
            (undianList || []).map((item, idx) => {
              const nomorUrut = (undianList.length - idx);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">
                      #{nomorUrut}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.nama_pemenang}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-400 font-medium mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {item.periode}
                        </span>
                        <span>•</span>
                        <span>{item.tanggal}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(item)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Batalkan & Rollback"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Manual Request */}
      {modalManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Request Tuan Rumah Manual</h3>
              <button
                onClick={() => setModalManual(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Pilih Anggota Karyawan
                </label>
                <select
                  value={manualKaryawanId}
                  onChange={(e) => setManualKaryawanId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-none focus:border-blue-600"
                  required
                >
                  <option value="">-- Pilih Anggota --</option>
                  {(karyawanList || []).map(k => (
                    <option key={k.id} value={k.id}>
                      {k.nama} ({k.jabatan}) - Status: {k.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Periode Anjangsana
                </label>
                <input
                  type="text"
                  value={manualPeriode}
                  onChange={(e) => setManualPeriode(e.target.value)}
                  placeholder="Contoh: Juni 2026"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-800 leading-relaxed font-medium">
                💡 Anggota yang ditetapkan manual akan otomatis ditandai statusnya menjadi <b>Sudah</b> dalam siklus undian.
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalManual(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Tetapkan Tuan Rumah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
