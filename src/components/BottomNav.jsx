import React from 'react';
import { LayoutDashboard, Coins, Shuffle, FileSpreadsheet, Menu } from 'lucide-react';

export default function BottomNav({ activePage, onNavigate, onOpenSidebar, unpaidCount = 0, isTamu = false }) {
  if (isTamu) return null; // Guest only uses Dashboard

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'iuran', label: 'Iuran', icon: Coins },
    { id: 'undian', label: 'Undian', icon: Shuffle },
    { id: 'rekap', label: 'Rekap', icon: FileSpreadsheet, badge: unpaidCount > 0 ? unpaidCount : null },
    { id: 'menu', label: 'Lainnya', icon: Menu }
  ];

  // Determine active index (0 to 4)
  let activeIndex = tabs.findIndex(t => t.id === activePage);
  if (activeIndex === -1) {
    // If on sub-pages like karyawan, setting, user
    activeIndex = 4; // 'Lainnya'
  }

  // Calculate SVG curve center for 5 tabs in a 500-unit viewBox
  // Each tab width is 100 units (500 / 5)
  const cx = activeIndex * 100 + 50;

  // Smooth SVG Path with upward curved arch / notch
  // Base line is y = 18, arch rises to y = 0
  const svgPath = `
    M 0,20
    L ${cx - 48},20
    C ${cx - 32},20 ${cx - 28},0 ${cx},0
    C ${cx + 28},0 ${cx + 32},20 ${cx + 48},20
    L 500,20
    L 500,82
    L 0,82
    Z
  `;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 select-none pointer-events-none">
      {/* Container with relative positioning */}
      <div className="relative w-full max-w-lg mx-auto pointer-events-auto filter drop-shadow-[0_-6px_20px_rgba(0,0,0,0.08)]">
        
        {/* SVG Background with animated curve */}
        <svg
          viewBox="0 0 500 82"
          preserveAspectRatio="none"
          className="w-full h-[78px] text-white transition-all duration-300 ease-out"
          style={{ display: 'block' }}
        >
          <path
            d={svgPath}
            fill="currentColor"
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {/* Floating Active Bulb / Circle Button */}
        <div
          className="absolute top-0 transition-all duration-300 ease-out pointer-events-none z-20"
          style={{
            left: `${activeIndex * 20 + 10}%`,
            transform: 'translate(-50%, -10px)'
          }}
        >
          <div className="w-13 h-13 rounded-full bg-white border-[3.5px] border-blue-600 shadow-xl shadow-blue-500/25 flex items-center justify-center text-blue-600 transform transition-transform duration-200 active:scale-95">
            {React.createElement(tabs[activeIndex].icon, {
              className: "w-6 h-6 stroke-[2.4]"
            })}
          </div>
        </div>

        {/* Tab Items Row */}
        <div className="absolute inset-x-0 bottom-0 top-[18px] flex items-center justify-around px-1 z-10">
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            const isActive = activeIndex === idx;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'menu') {
                    onOpenSidebar();
                  } else {
                    onNavigate(tab.id);
                  }
                }}
                className="flex-1 flex flex-col items-center justify-center py-1 relative cursor-pointer group focus:outline-none"
              >
                {/* Inactive Icon (Hidden when active because floating bulb is shown) */}
                <div
                  className={`transition-all duration-200 ${
                    isActive ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0 text-slate-400 group-hover:text-slate-600'
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2]" />
                  {tab.badge && !isActive && (
                    <span className="absolute top-0 right-1/4 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-ping"></span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-[11px] tracking-tight transition-all duration-200 mt-1 ${
                    isActive
                      ? 'font-extrabold text-slate-900 translate-y-0 scale-105'
                      : 'font-semibold text-slate-400 group-hover:text-slate-600 translate-y-0'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* iOS Home Indicator Bar */}
        <div className="absolute bottom-1 inset-x-0 flex justify-center pointer-events-none">
          <div className="w-28 h-1 bg-slate-200/80 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
