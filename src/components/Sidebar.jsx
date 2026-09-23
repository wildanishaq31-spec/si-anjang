import React from 'react';
import {
  LayoutDashboard,
  Users,
  Coins,
  Receipt,
  Shuffle,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  LogOut,
  Wallet,
  Smartphone,
  X
} from 'lucide-react';

export default function Sidebar({
  activePage,
  onNavigate,
  currentUser,
  onLogout,
  isOpen,
  onClose,
  unpaidCount = 0
}) {
  const role = currentUser?.role || 'Tamu';
  const isTamu = role === 'Tamu';
  const isAdmin = role === 'Superadmin';

  const fullName = currentUser?.fullname || currentUser?.username || 'User';
  const initial = fullName.charAt(0).toUpperCase();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, allow: true },
    { id: 'karyawan', label: 'Data Karyawan', icon: Users, allow: isAdmin },
    { id: 'iuran', label: 'Input Iuran', icon: Coins, allow: !isTamu },
    { id: 'pengeluaran', label: 'Pengeluaran', icon: Receipt, allow: !isTamu },
    { id: 'undian', label: 'Undian Anjangsana', icon: Shuffle, allow: !isTamu },
    {
      id: 'rekap',
      label: 'Rekap Iuran',
      icon: FileSpreadsheet,
      allow: !isTamu,
      badge: unpaidCount > 0 ? unpaidCount : null
    },
    { id: 'download', label: 'Install Aplikasi (PWA)', icon: Smartphone, allow: true },
    { id: 'setting', label: 'Pengaturan', icon: Settings, allow: isAdmin },
    { id: 'user', label: 'Data Akun User', icon: ShieldCheck, allow: isAdmin }
  ];

  const filteredItems = menuItems.filter(item => item.allow);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#111536] text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800/80 shadow-2xl`}
      >
        {/* Header Branding */}
        <div className="p-6 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 ring-4 ring-blue-500/10">
              <Wallet className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight text-white flex items-center gap-1.5">
                SI-ANJANGSANA
                <span className="text-[10px] font-extrabold bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-sm border border-blue-400/20">V.10.5</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">UPTD Puskesmas Cermee</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Menu Utama
          </div>

          {filteredItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-900/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-rose-100 bg-rose-500 rounded-full shadow-xs animate-pulse">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer / User Profile & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
          {/* User Profile Info Card */}
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-md">
              {currentUser?.photo ? (
                <img src={currentUser.photo} alt={fullName} className="w-full h-full object-cover rounded-full" />
              ) : (
                initial
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white truncate leading-tight">{fullName}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">{role}</span>
                <span className="text-slate-600">•</span>
                <span className="text-[10px] font-bold text-emerald-400">Online</span>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-400 hover:text-white hover:bg-rose-600/20 transition-all border border-rose-500/20 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Aplikasi</span>
          </button>
        </div>
      </aside>
    </>
  );
}
