import React, { useState, useEffect, useMemo } from 'react';
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
  CheckCircle2,
  Search,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Swal from 'sweetalert2';

export default function Undian({ undianList, karyawanList, onSave, onDelete, loading }) {
  const [isRolling, setIsRolling] = useState(false);
  const [displayName, setDisplayName] = useState('? ? ? ? ?');
  const [selectedWinner, setSelectedWinner] = useState(null);

  // Manual Request Modal State
  const [modalManual, setModalManual] = useState(false);
  const [searchKaryawan, setSearchKaryawan] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [manualKaryawanId, setManualKaryawanId] = useState('');

  // Sisa bulan kosong yang belum terisi di daftar undian
  const availablePeriods = useMemo(() => {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const now = new Date();
    const curYear = now.getFullYear();
    const usedPeriods = new Set((undianList || []).map(u => (u.periode || '').trim().toLowerCase()));

    const list = [];
    // Periksa tahun sekarang dan tahun depan
    [curYear, curYear + 1].forEach(year => {
      months.forEach((m) => {
        const p = `${m} ${year}`;
        if (!usedPeriods.has(p.toLowerCase())) {
          list.push(p);
        }
      });
    });

    return list.length > 0 ? list : [`${months[now.getMonth()]} ${curYear}`];
  }, [undianList]);

  const [manualPeriode, setManualPeriode] = useState(() => availablePeriods[0] || 'September 2026');

  // Update default period when availablePeriods updates
  useEffect(() => {
    if (availablePeriods.length > 0 && !availablePeriods.includes(manualPeriode)) {
      setManualPeriode(availablePeriods[0]);
    }
  }, [availablePeriods]);

  // Eligible candidates: HANYA YANG BERSTATUS 'BELUM'
  const eligibleCandidates = useMemo(() => {
    return (karyawanList || []).filter(k => k.status === 'Belum');
  }, [karyawanList]);

  // Autocomplete matching untuk modal manual (HANYA YANG BELUM)
  const matchingManualCandidates = useMemo(() => {
    if (!searchKaryawan.trim()) {
      return eligibleCandidates.slice(0, 8);
    }
    return eligibleCandidates.filter(k =>
      k.nama.toLowerCase().includes(searchKaryawan.toLowerCase())
    ).slice(0, 8);
  }, [eligibleCandidates, searchKaryawan]);

  const openManualModal = () => {
    setSearchKaryawan('');
    setSelectedCandidate(null);
    setManualKaryawanId('');
    setShowDropdown(false);
    if (availablePeriods.length > 0) {
      setManualPeriode(availablePeriods[0]);
    }
    setModalManual(true);
  };

  const handleSelectCandidate = (k) => {
    setSelectedCandidate(k);
    setSearchKaryawan(k.nama);
    setManualKaryawanId(k.id);
    setShowDropdown(false);
  };

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
    const candidate = eligibleCandidates.find(k => String(k.id) === String(manualKaryawanId));
    if (!candidate) {
      Swal.fire({ icon: 'warning', title: 'Pilih Anggota', text: 'Silakan cari dan pilih anggota karyawan yang berstatus belum!' });
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
      setSearchKaryawan('');
      setSelectedCandidate(null);

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
              onClick={openManualModal}
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

      {/* Modal Manual Request (SEARCHABLE DENGAN FILTER HANYA YG BELUM) */}
      {modalManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Request Tuan Rumah Manual</h3>
              <button
                onClick={() => setModalManual(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4 pt-4">
              {/* Searchable Karyawan Input (Hanya Yg Belum) */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-700 tracking-tight mb-1.5">
                  Cari Karyawan (Hanya Yg Belum) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchKaryawan}
                    onChange={(e) => {
                      setSearchKaryawan(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Ketik & pilih nama karyawan..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                    required
                  />
                </div>

                {/* Dropdown Suggestions (Hanya Yg Belum) */}
                {showDropdown && matchingManualCandidates.length > 0 && (
                  <div className="absolute z-30 left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
                    {matchingManualCandidates.map(k => (
                      <button
                        key={k.id}
                        type="button"
                        onClick={() => handleSelectCandidate(k)}
                        className="w-full text-left p-3 hover:bg-blue-50/80 transition-colors flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <div className="text-sm font-bold text-slate-800">{k.nama}</div>
                          <div className="text-xs text-slate-400">
                            Jabatan: <span className="font-semibold text-blue-600">{k.jabatan}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          Belum
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Pilih Periode Tuan Rumah */}
              <div>
                <label className="block text-xs font-bold text-slate-700 tracking-tight mb-1.5">
                  Pilih Periode Tuan Rumah
                </label>
                <select
                  value={manualPeriode}
                  onChange={(e) => setManualPeriode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-blue-600 focus:bg-white focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  {availablePeriods.map(p => (
                    <option key={p} value={p} className="text-slate-800 font-semibold">
                      {p}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5 font-medium">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Otomatis menampilkan daftar sisa bulan kosong yang belum terisi.</span>
                </div>
              </div>

              {/* Catatan Kuning */}
              <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-xs text-amber-800 leading-relaxed font-medium flex items-start gap-2">
                <span className="text-sm">💡</span>
                <span>
                  Anggota yang ditetapkan manual akan otomatis ditandai statusnya menjadi <b>Sudah</b> dalam siklus undian.
                </span>
              </div>

              {/* Tombol Aksi */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalManual(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 cursor-pointer transition-all"
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
