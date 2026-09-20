import React, { useState, useEffect } from 'react';

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Memulai aplikasi...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Check if on mobile screen or standalone PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator?.standalone === true;
    const isMobileWidth = window.innerWidth <= 768;
    const isTouch = ('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.innerWidth < 1024;

    const isMobileOrPWA = isStandalone || isMobileWidth || isTouch;

    if (!isMobileOrPWA) {
      // If desktop, skip splash screen immediately
      onFinish();
      return;
    }

    // Progress animation to 100% over ~2 seconds
    const intervalTime = 20; // 20ms * 100 = 2000ms
    let current = 0;

    const timer = setInterval(() => {
      current += 1;
      if (current <= 100) {
        setProgress(current);

        if (current === 25) setStatusText('Menghubungkan layanan Puskesmas Cermee...');
        if (current === 60) setStatusText('Sinkronisasi database iuran...');
        if (current === 90) setStatusText('Menyiapkan antarmuka...');
        if (current === 100) setStatusText('Siap!');
      } else {
        clearInterval(timer);
        // Pause briefly at 100%, then trigger smooth fade out
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            onFinish();
          }, 450);
        }, 250);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col justify-between overflow-hidden bg-slate-950 select-none transition-opacity duration-500 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Poster Image */}
      <img
        src="/splash-pkm.jpg"
        alt="SI-ANJANG Puskesmas Cermee"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
      />

      {/* Subtle Dark Vignette for Bottom Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />

      {/* Top spacer */}
      <div className="relative z-10 pt-8 px-6 text-center"></div>

      {/* Bottom Progress Bar & Counter Card */}
      <div className="relative z-10 p-6 pb-10 sm:pb-12 max-w-md w-full mx-auto space-y-3">
        {/* Glassmorphic Indicator Container */}
        <div className="bg-slate-900/75 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-2xl space-y-2.5">
          {/* Status & Percentage Text */}
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <span className="text-emerald-300 flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              {statusText}
            </span>
            <span className="font-mono text-amber-300 text-sm">{progress}%</span>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full h-2.5 bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-green-500 rounded-full transition-all duration-75 ease-out shadow-sm shadow-emerald-400/50"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Footer Note */}
          <div className="text-[10px] text-slate-400 text-center font-medium tracking-wide">
            E-ANJANGSANA V.10 • KELUARGA BESAR PKM CERMEE
          </div>
        </div>
      </div>
    </div>
  );
}
