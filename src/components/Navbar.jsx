import React, { useState, useEffect } from 'react';
import { Menu, Clock, LogOut, Settings, User as UserIcon, ShieldAlert } from 'lucide-react';

export default function Navbar({ currentUser, onToggleSidebar, onLogout, onNavigate }) {
  const [timeStr, setTimeStr] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  const fullName = currentUser?.fullname || currentUser?.username || 'User';
  const role = currentUser?.role || 'Tamu';
  const initial = fullName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-6 py-3 transition-all">
      <div className="flex items-center justify-between">
        {/* Left Side: Toggle & Clock */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            title="Menu Navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs md:text-sm font-semibold text-blue-700 bg-blue-50/80 px-3 py-1.5 rounded-full border border-blue-100/80 shadow-xs">
            <Clock className="w-4 h-4 text-blue-600 animate-pulse" />
            <span>{timeStr || 'Memuat waktu...'}</span>
          </div>
        </div>

        {/* Right Side: Profile & Dropdown */}
        <div className="relative flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <div className="text-sm font-bold text-slate-800 leading-tight">{fullName}</div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{role}</div>
          </div>

          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-base shadow-sm ring-2 ring-blue-500/20 hover:ring-blue-500/40 transition-all focus:outline-none"
          >
            {currentUser?.photo ? (
              <img src={currentUser.photo} alt={fullName} className="w-full h-full object-cover rounded-full" />
            ) : (
              initial
            )}
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)}></div>
              <div className="absolute right-0 top-12 z-50 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-2 border-b border-slate-100 sm:hidden">
                  <div className="text-sm font-bold text-slate-800">{fullName}</div>
                  <div className="text-xs text-slate-400">{role}</div>
                </div>

                {role === 'Superadmin' && (
                  <button
                    onClick={() => { setDropdownOpen(false); onNavigate('setting'); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Pengaturan</span>
                  </button>
                )}

                <button
                  onClick={() => { setDropdownOpen(false); onLogout(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Keluar Aplikasi</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
