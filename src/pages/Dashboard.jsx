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
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="animate-fade-in-up card-interactive relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-800 to-[#111536] text-white p-6 sm:p-8 shadow-xl shadow-blue-950/20 hover:shadow-2xl hover:shadow-blue-950/40">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none transition-transform duration-500 group-hover:scale-110"></div>
        <div className="absolute bottom-0 right-1/4 -mb-20 w-60 h-60 bg-blue-500/10 rounded-full blur-xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-blue-200 text-xs font-semibold backdrop-blur-xs mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow" />
            <span>Puskesmas Cermee</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Halo, {currentUser?.fullname || currentUser?.username || 'Sobat Anjangsana'}! 👋
          </h2>

          <p className="mt-2 text-sm sm:text-base text-blue-100/90 leading-relaxed font-medium">
            {data.info || 'Selamat datang di sistem manajemen iuran & undian SI-ANJANGSANA V.10.5.'}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('iuran')}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-900 font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              <span>Input Iuran Baru</span>
            </button>
            <button
              onClick={() => onNavigate('rekap')}
              className="px-4 py-2 bg-white/15 hover:bg-white/25 active:scale-95 text-white font-semibold text-xs rounded-xl border border-white/20 backdrop-blur-xs shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
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
        <div className="animate-fade-in-up delay-100 card-interactive relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white p-5 shadow-lg shadow-rose-600/20 hover:shadow-2xl hover:shadow-rose-600/35 border border-rose-400/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-100 uppercase tracking-wider">Iuran Masuk</p>
              <h3 className="text-2xl font-extrabold mt-1 tracking-tight">{formatRp(data.totalIuran)}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-xs shadow-xs transition-transform duration-300 group-hover:scale-110">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-medium text-rose-100">
            <span>Bulan {bulanAktif}</span>
            {data.isDisetor && (
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold tracking-wide backdrop-blur-xs">
                Disetor ke Tuan Rumah
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Pengeluaran */}
        <div className="animate-fade-in-up delay-150 card-interactive relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white p-5 shadow-lg shadow-blue-600/20 hover:shadow-2xl hover:shadow-blue-600/35 border border-sky-400/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-sky-100 uppercase tracking-wider">Pengeluaran</p>
              <h3 className="text-2xl font-extrabold mt-1 tracking-tight">{formatRp(data.totalPengeluaran)}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-xs shadow-xs transition-transform duration-300 group-hover:scale-110">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-medium text-sky-100">
            <span>{bulanPengeluaran}</span>
            {data.totalPengeluaran > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold tracking-wide backdrop-blur-xs">
                {data.isDisetor ? 'Disetor ke Pemenang' : 'Tercatat'}
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Saldo Kas */}
        <div className="animate-fade-in-up delay-200 card-interactive relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 shadow-lg shadow-emerald-600/20 hover:shadow-2xl hover:shadow-emerald-600/35 border border-emerald-400/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">Saldo Kas Bulan Ini</p>
              <h3 className="text-2xl font-extrabold mt-1 tracking-tight">{formatRp(data.saldo)}</h3>
            </div>
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-xs shadow-xs transition-transform duration-300 group-hover:scale-110">
              <Wallet className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs font-medium text-emerald-100">
            <span>Mutasi Kas Bulan {bulanAktif}</span>
          </div>
        </div>

        {/* Card 4: Belum Giliran Undian */}
        <div className="animate-fade-in-up delay-250 card-interactive relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-5 shadow-lg shadow-indigo-600/20 hover:shadow-2xl hover:shadow-indigo-600/35 border border-indigo-400/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">Belum Giliran</p>
              <h3 className="text-2xl font-extrabold mt-1 tracking-tight">{data.belumGiliran || 0} <span className="text-base font-normal">Anggota</span></h3>
            </div>
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-xs shadow-xs transition-transform duration-300 group-hover:scale-110">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs font-medium text-indigo-200">
            <span>Siklus Anjangsana Aktif</span>
          </div>
        </div>
      </div>

      {/* Breakdown per Jabatan */}
      <div className="animate-fade-in-up delay-300 card-interactive bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-blue-200 transition-all">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Rincian Penerimaan Bulan {bulanAktif} Berdasarkan Jabatan
          </h4>
          {data.isDisetor && (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              ✓ Dana Telah Disetorkan ke Tuan Rumah
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="card-interactive-sm bg-slate-50 hover:bg-blue-50/50 rounded-xl p-3 border border-slate-200/60 hover:border-blue-300 hover:shadow-md transition-all">
            <span className="text-[11px] font-bold text-blue-600 uppercase">PNS</span>
            <div className="text-base font-extrabold text-slate-800 mt-0.5">{formatRp(data.totalPNS)}</div>
          </div>
          <div className="card-interactive-sm bg-slate-50 hover:bg-indigo-50/50 rounded-xl p-3 border border-slate-200/60 hover:border-indigo-300 hover:shadow-md transition-all">
            <span className="text-[11px] font-bold text-indigo-600 uppercase">P3K</span>
            <div className="text-base font-extrabold text-slate-800 mt-0.5">{formatRp(data.totalP3K)}</div>
          </div>
          <div className="card-interactive-sm bg-slate-50 hover:bg-purple-50/50 rounded-xl p-3 border border-slate-200/60 hover:border-purple-300 hover:shadow-md transition-all">
            <span className="text-[11px] font-bold text-purple-600 uppercase">P3KPWD</span>
            <div className="text-base font-extrabold text-slate-800 mt-0.5">{formatRp(data.totalP3KPWD)}</div>
          </div>
          <div className="card-interactive-sm bg-slate-50 hover:bg-teal-50/50 rounded-xl p-3 border border-slate-200/60 hover:border-teal-300 hover:shadow-md transition-all">
            <span className="text-[11px] font-bold text-teal-600 uppercase">P3KPW</span>
            <div className="text-base font-extrabold text-slate-800 mt-0.5">{formatRp(data.totalP3KPW)}</div>
          </div>
          <div className="card-interactive-sm bg-slate-50 hover:bg-amber-50/50 rounded-xl p-3 border border-slate-200/60 hover:border-amber-300 hover:shadow-md transition-all col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-amber-600 uppercase">Kontrak</span>
            <div className="text-base font-extrabold text-slate-800 mt-0.5">{formatRp(data.totalLainnya)}</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Belum Bayar & Aktivitas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Belum Bayar List */}
        <div className="animate-fade-in-up delay-350 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
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
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50/90 active:scale-[0.99] hover:pl-5 transition-all duration-200 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shadow-xs">
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
        <div className="animate-fade-in-up delay-400 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
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
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50/90 active:scale-[0.99] hover:pl-5 transition-all duration-200 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-110 ${
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
