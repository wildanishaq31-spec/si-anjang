import React from 'react';
import { LayoutDashboard, Coins, Shuffle, FileSpreadsheet, Menu } from 'lucide-react';

export default function BottomNav({ activePage, onNavigate, onOpenSidebar, unpaidCount = 0, isTamu = false }) {
  if (isTamu) return null; // Guest only uses Dashboard

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#111536]/95 backdrop-blur-md border-t border-slate-800 px-3 py-2 flex items-center justify-around shadow-2xl safe-bottom">
      <button
        onClick={() => onNavigate('dashboard')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
          activePage === 'dashboard' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-[10px]">Dashboard</span>
      </button>

      <button
        onClick={() => onNavigate('iuran')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
          activePage === 'iuran' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Coins className="w-5 h-5" />
        <span className="text-[10px]">Iuran</span>
      </button>

      <button
        onClick={() => onNavigate('undian')}
        className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
          activePage === 'undian' ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Shuffle className="w-5 h-5" />
        <span className="text-[10px]">Undian</span>
      </button>

      <button
        onClick={() => onNavigate('rekap')}
        className={`relative flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
          activePage === 'rekap' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <FileSpreadsheet className="w-5 h-5" />
        <span className="text-[10px]">Rekap</span>
        {unpaidCount > 0 && (
          <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
        )}
      </button>

      <button
        onClick={onOpenSidebar}
        className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px]">Lainnya</span>
      </button>
    </div>
  );
}
