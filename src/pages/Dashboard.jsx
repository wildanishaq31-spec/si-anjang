import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Dashboard({ stats, loading, onNavigate, currentUser }) {
  const [pageBelumBayar, setPageBelumBayar] = useState(1);
  const [pageAktivitas, setPageAktivitas] = useState(1);

  const formatRp = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num || 0);
  };

  const data = stats || {};
  const bulanAktif = data.bulanAktif || 'Bulan Ini';
  const bulanPengeluaran = data.bulanPengeluaran || 'Bulan Terakhir';

  // Pagination for Belum Bayar
  const belumBayarList = data.belumBayarList || [];
  const perPageBelumBayar = 5;
  const totalPageBelumBayar = Math.ceil(belumBayarList.length / perPageBelumBayar) || 1;
  const sliceBelumBayar = belumBayarList.slice(
    (pageBelumBayar - 1) * perPageBelumBayar,
    pageBelumBayar * perPageBelumBayar
  );

  // Pagination for Aktivitas
  const aktivitasList = data.aktivitas || [];
  const perPageAktivitas = 5;
  const totalPageAktivitas = Math.ceil(aktivitasList.length / perPageAktivitas) || 1;
  const sliceAktivitas = aktivitasList.slice(
    (pageAktivitas - 1) * perPageAktivitas,
    pageAktivitas * perPageAktivitas
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-800 to-[#111536] text-white p-6 sm:p-8 shadow-xl shadow-blue-950/20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 -mb-20 w-60 h-60 bg-blue-500/10 rounded-full blur-xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-blue-200 text-xs font-semibold backdrop-blur-xs mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Puskesmas Cermee</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Halo, {currentUser?.fullname || currentUser?.username || 'Sobat Anjangsana'}! 👋
          </h2>

          <p className="mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed font-medium">
            {data.info || 'Selamat datang di sistem manajemen iuran & undian E-Anjangsana.'}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('iuran')}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              <span>Input Iuran Baru</span>
            </button>
            <button
              onClick={() => onNavigate('rekap')}
              className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs rounded-xl border border-white/20 backdrop-blur-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-blue-300" />
              <span>Lihat Rekapitulasi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Iuran Masuk */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white p-5 shadow-lg shadow-rose-600/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-100 uppercase tracking-wider">Iuran Masuk</p>
              <h3 className="text-2xl font-extrabold mt-1">{formatRp(data.totalIuran)}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-xs">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs font-medium text-rose-100">
            <span>Bulan {bulanAktif}</span>
          </div>
        </div>

        {/* Card 2: Pengeluaran */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white p-5 shadow-lg shadow-blue-600/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-sky-100 uppercase tracking-wider">Pengeluaran</p>
              <h3 className="text-2xl font-extrabold mt-1">{formatRp(data.totalPengeluaran)}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-xs">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs font-medium text-sky-100">
            <span>{bulanPengeluaran}</span>
          </div>
        </div>

        {/* Card 3: Saldo Kas */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 shadow-lg shadow-emerald-600/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">Saldo Kas Bulan Ini</p>
              <h3 className="text-2xl font-extrabold mt-1">{formatRp(data.saldo)}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-xs">
              <Wallet className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs font-medium text-emerald-100">
            <span>Mutasi Kas Bulan {bulanAktif}</span>
          </div>
        </div>

        {/* Card 4: Belum Giliran Undian */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-5 shadow-lg shadow-indigo-600/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">Belum Giliran</p>
              <h3 className="text-2xl font-extrabold mt-1">{data.belumGiliran || 0} <span className="text-base font-normal">Anggota</span></h3>
            </div>
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-xs">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs font-medium text-indigo-200">
            <span>Siklus Anjangsana Aktif</span>
          </div>
        </div>
      </div>

      {/* Breakdown per Jabatan */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Rincian Penerimaan Bulan {bulanAktif} Berdasarkan Jabatan
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <span className="text-[11px] font-bold text-blue-600 uppercase">PNS</span>
            <div className="text-base font-extrabold text-slate-800 mt-0.5">{formatRp(data.totalPNS)}</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <span className="text-[11px] font-bold text-indigo-600 uppercase">P3K</span>
            <div className="text-base font-extrabold text-slate-800 mt-0.5">{formatRp(data.totalP3K)}</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <span className="text-[11px] font-bold text-purple-600 uppercase">P3KPWD</span>
            <div className="text-base font-extrabold text-slate-800 mt-0.5">{formatRp(data.totalP3KPWD)}</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <span className="text-[11px] font-bold text-teal-600 uppercase">P3KPW</span>
            <div className="text-base font-extrabold text-slate-800 mt-0.5">{formatRp(data.totalP3KPW)}</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-amber-600 uppercase">Kontrak</span>
            <div className="text-base font-extrabold text-slate-800 mt-0.5">{formatRp(data.totalLainnya)}</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Belum Bayar & Aktivitas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Belum Bayar List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Belum Bayar Bulan {bulanAktif}</h3>
                <p className="text-xs text-slate-400 font-medium">
                  Total {belumBayarList.length} anggota belum iuran
                </p>
              </div>
            </div>

            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-700">
              {belumBayarList.length} Orang
            </span>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {sliceBelumBayar.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                Semua anggota telah membayar iuran bulan ini!
              </div>
            ) : (
              sliceBelumBayar.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">
                      {(pageBelumBayar - 1) * perPageBelumBayar + idx + 1}
                    </div>
                    <span className="text-sm font-semibold text-slate-800">{item.nama}</span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-100">
                    Belum Lunas
                  </span>
                </div>
              ))
            )}
          </div>

          {totalPageBelumBayar > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Halaman {pageBelumBayar} dari {totalPageBelumBayar}</span>
              <div className="flex items-center gap-1">
                <button
                  disabled={pageBelumBayar <= 1}
                  onClick={() => setPageBelumBayar(p => Math.max(1, p - 1))}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={pageBelumBayar >= totalPageBelumBayar}
                  onClick={() => setPageBelumBayar(p => Math.min(totalPageBelumBayar, p + 1))}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Aktivitas Terkini */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Riwayat Mutasi & Aktivitas</h3>
                <p className="text-xs text-slate-400 font-medium">Transaksi masuk dan keluar kas</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {sliceAktivitas.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Belum ada catatan aktivitas transaksi.
              </div>
            ) : (
              sliceAktivitas.map((act, idx) => {
                const isMasuk = act.status === 'Masuk';
                return (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isMasuk ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {isMasuk ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800 line-clamp-1">{act.keterangan}</div>
                        <div className="text-[11px] text-slate-400 font-medium">{act.tgl}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-sm font-bold ${isMasuk ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isMasuk ? '+' : '-'}{formatRp(act.nominal)}
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                        isMasuk ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {act.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {totalPageAktivitas > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Halaman {pageAktivitas} dari {totalPageAktivitas}</span>
              <div className="flex items-center gap-1">
                <button
                  disabled={pageAktivitas <= 1}
                  onClick={() => setPageAktivitas(p => Math.max(1, p - 1))}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={pageAktivitas >= totalPageAktivitas}
                  onClick={() => setPageAktivitas(p => Math.min(totalPageAktivitas, p + 1))}
                  className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
