import React, { useState, useEffect } from 'react';

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Memulai aplikasi...');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Deteksi apakah sedang dibuka di perangkat HP atau mode PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator?.standalone === true;
    const isMobileWidth = window.innerWidth <= 768;
    const isTouch = ('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.innerWidth < 1024;

    const isMobileOrPWA = isStandalone || isMobileWidth || isTouch;

    if (!isMobileOrPWA) {
      // Jika dibuka di komputer/desktop, langsung lewati tanpa jeda
      onFinish();
      return;
    }

    let isCancelled = false;
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const runRealisticLoading = async () => {
      let cur = 0;

      // 1. Awal (0% - 22%)
      setStatusText('Memulai koneksi sistem...');
      while (cur < 22) {
        if (isCancelled) return;
        cur += Math.floor(Math.random() * 3) + 2;
        if (cur > 22) cur = 22;
        setProgress(cur);
        await sleep(35);
      }

      // 2. Menuju 45%
      setStatusText('Menghubungkan ke database...');
      while (cur < 45) {
        if (isCancelled) return;
        cur += Math.floor(Math.random() * 3) + 1;
        if (cur > 45) cur = 45;
        setProgress(cur);
        await sleep(50);
      }

      // Jeda di 45% (Simulasi koneksi handshake database)
      setStatusText('Menghubungkan ke database...');
      await sleep(500);

      // 3. Menuju 70%
      setStatusText('Mengambil data iuran & anggota...');
      while (cur < 70) {
        if (isCancelled) return;
        cur += Math.floor(Math.random() * 4) + 2;
        if (cur > 70) cur = 70;
        setProgress(cur);
        await sleep(40);
      }

      // 4. Menuju 90%
      setStatusText('Cek database & verifikasi data...');
      while (cur < 90) {
        if (isCancelled) return;
        cur += Math.floor(Math.random() * 3) + 1;
        if (cur > 90) cur = 90;
        setProgress(cur);
        await sleep(55);
      }

      // Jeda di 90% (Simulasi verifikasi akhir data)
      setStatusText('Cek database & verifikasi data...');
      await sleep(550);

      // 5. Final menuju 100%
      while (cur < 100) {
        if (isCancelled) return;
        cur += Math.floor(Math.random() * 3) + 2;
        if (cur > 100) cur = 100;
        setProgress(cur);
        await sleep(30);
      }

      // 6. Sukses 100%
      setStatusText('Database berhasil di-load!');
      await sleep(350);

      if (isCancelled) return;
      setIsFadingOut(true);
      await sleep(450);

      if (!isCancelled) {
        onFinish();
      }
    };

    runRealisticLoading();

    return () => {
      isCancelled = true;
    };
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
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/25 to-transparent pointer-events-none" />

      {/* Top spacer */}
      <div className="relative z-10 pt-8 px-6 text-center"></div>

      {/* Bottom Progress Bar & Counter Card */}
      <div className="relative z-10 p-6 pb-10 sm:pb-12 max-w-md w-full mx-auto space-y-3">
        {/* Glassmorphic Indicator Container */}
        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-2xl space-y-2.5">
          {/* Status & Percentage Text */}
          <div className="flex items-center justify-between text-xs font-bold text-white">
            <span className="text-emerald-300 flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
              <span className="truncate">{statusText}</span>
            </span>
            <span className="font-mono text-amber-300 text-sm font-extrabold">{progress}%</span>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full h-2.5 bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-green-500 rounded-full transition-all duration-100 ease-out shadow-sm shadow-emerald-400/50"
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
