import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function Navbar() {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][now.getDay()];
      const tgl = now.getDate();
      const bln = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][now.getMonth()];
      const thn = now.getFullYear();
      const jam = String(now.getHours()).padStart(2, '0');
      const mnt = String(now.getMinutes()).padStart(2, '0');
      const dtk = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${hari}, ${tgl} ${bln} ${thn} — ${jam}:${mnt}:${dtk} WIB`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    // Hanya tampil pada layar desktop (lg ke atas), tersembunyi sepenuhnya di mobile/tablet
    <header className="hidden lg:flex sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-3 transition-all items-center justify-between">
      <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-blue-700 bg-blue-50/80 px-3.5 py-1.5 rounded-full border border-blue-100/80 shadow-xs">
        <Clock className="w-4 h-4 text-blue-600 animate-pulse" />
        <span>{timeStr || 'Memuat waktu...'}</span>
      </div>

      <div className="text-xs font-semibold text-slate-400">
        E-Anjangsana • UPTD Puskesmas Cermee
      </div>
    </header>
  );
}
