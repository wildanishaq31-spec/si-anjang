import React, { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  HardDrive,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  Award
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function DownloadPage({ onNavigate, currentUser }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [platform, setPlatform] = useState('android'); // 'android', 'ios', 'desktop'
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('android');

  useEffect(() => {
    // Check if already installed as standalone PWA
    const isPWA =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');
    setIsStandalone(isPWA);

    // Detect device platform
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      setPlatform('ios');
      setActiveTab('ios');
    } else if (/android/i.test(userAgent)) {
      setPlatform('android');
      setActiveTab('android');
    } else {
      setPlatform('desktop');
      setActiveTab('desktop');
    }

    // Listen for PWA beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        Swal.fire({
          icon: 'success',
          title: 'Aplikasi Terpasang!',
          text: 'SI-ANJANG berhasil ditambahkan ke layar utama HP Anda.',
          confirmButtonColor: '#2563eb'
        });
        setDeferredPrompt(null);
      }
    } else if (platform === 'ios') {
      Swal.fire({
        icon: 'info',
        title: 'Petunjuk iPhone / iPad (Safari)',
        html: `
          <div style="text-align: left; font-size: 13px; line-height: 1.6;">
            <p>1. Ketuk ikon <b>Bagikan (Share / Kotak panah atas 📤)</b> di bilah bawah Safari.</p>
            <p style="margin-top: 8px;">2. Gulir ke bawah lalu pilih <b>"Tambahkan ke Layar Utama" (Add to Home Screen ➕)</b>.</p>
            <p style="margin-top: 8px;">3. Ketuk <b>"Tambah" (Add)</b> di pojok kanan atas.</p>
          </div>
        `,
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'Saya Mengerti'
      });
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Pasang via Browser',
        html: `
          <div style="text-align: left; font-size: 13px; line-height: 1.6;">
            <p>1. Ketuk tombol <b>Titik Tiga (⋮)</b> di pojok kanan atas browser Chrome / Samsung Internet.</p>
            <p style="margin-top: 8px;">2. Pilih menu <b>"Install Aplikasi"</b> atau <b>"Tambahkan ke Layar Utama"</b>.</p>
            <p style="margin-top: 8px;">3. Ikon SI-ANJANG akan langsung muncul di menu aplikasi HP Anda.</p>
          </div>
        `,
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'Siap, Lanjutkan'
      });
    }
  };

  const copyUrl = () => {
    const url = `${window.location.origin}/download`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    Swal.fire({
      icon: 'success',
      title: 'Tautan Disalin!',
      text: 'Link halaman download aplikasi berhasil disalin.',
      toast: true,
      position: 'top-end',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const shareToWA = () => {
    const url = `${window.location.origin}/download`;
    const text = `*SI-ANJANG V.10.5 — UPTD Puskesmas Cermee*\n\nSilakan buka link berikut untuk langsung memasang aplikasi SI-ANJANG di HP Anda:\n${url}\n\n_Buka tautan lalu klik Tambahkan ke Layar Utama (PWA)._`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in-up pb-10 select-none">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-800 to-[#111536] text-white p-6 sm:p-10 shadow-xl shadow-blue-950/30 border border-blue-500/20">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 -mb-20 w-60 h-60 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 text-blue-200 text-xs font-semibold backdrop-blur-xs mb-4 border border-white/10 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Progressive Web App (PWA) Resmi</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Pasang Aplikasi <span className="text-amber-300">SI-ANJANG</span> di HP Anda
          </h1>

          <p className="mt-3 text-sm sm:text-base text-blue-100/90 leading-relaxed font-medium">
            Nikmati pengalaman seperti aplikasi bawaan (native app) yang cepat, full screen tanpa address bar, ringan, dan siap pakai kapan saja.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {isStandalone ? (
              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-sm font-bold backdrop-blur-xs shadow-md">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Aplikasi Sudah Terpasang di HP</span>
              </div>
            ) : (
              <button
                onClick={handleInstallClick}
                className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 text-slate-900 font-extrabold text-sm rounded-2xl shadow-lg shadow-amber-500/25 hover:shadow-xl transition-all flex items-center gap-2.5 cursor-pointer"
              >
                <Download className="w-5 h-5 stroke-[2.5]" />
                <span>Pasang / Install Aplikasi</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-3.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white font-bold text-sm rounded-2xl border border-white/20 backdrop-blur-xs shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Buka Dashboard</span>
              <ArrowRight className="w-4 h-4 text-blue-200" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Keunggulan PWA Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-interactive bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Akses Cepat 0 Detik</h3>
          <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
            Teknologi Cache-First membuat aplikasi terbuka instan seketika tanpa loading lama.
          </p>
        </div>

        <div className="card-interactive bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <HardDrive className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Sangat Ringan (&lt; 1 MB)</h3>
          <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
            Tidak memakan penyimpanan HP, hemat memori RAM, dan tidak memerlukan file APK besar.
          </p>
        </div>

        <div className="card-interactive bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <RefreshCw className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Update Otomatis</h3>
          <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
            Fitur dan data otomatis selalu mutakhir tanpa perlu download atau instalasi ulang.
          </p>
        </div>

        <div className="card-interactive bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
            <Smartphone className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Tampilan Full Screen</h3>
          <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
            Bebas dari bilah navigasi browser, terasa 100% seperti aplikasi Android / iOS native.
          </p>
        </div>
      </div>

      {/* Step by Step Install Guide Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Petunjuk Cara Pemasangan di HP</h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Pilih jenis perangkat HP Anda di bawah untuk melihat langkah mudahnya
            </p>
          </div>

          {/* Platform Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveTab('android')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'android'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Android (Chrome)
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ios'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              iPhone / iPad (Safari)
            </button>
            <button
              onClick={() => setActiveTab('desktop')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'desktop'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Laptop / PC
            </button>
          </div>
        </div>

        {/* Tab Content: Android */}
        {activeTab === 'android' && (
          <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 relative">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center mb-3 shadow-xs">
                1
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Buka di Google Chrome</h4>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Buka link website SI-ANJANG menggunakan browser Google Chrome atau Samsung Internet di HP Android Anda.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 relative">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center mb-3 shadow-xs">
                2
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Pilih "Install Aplikasi"</h4>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Ketuk tombol <b>Titik Tiga (⋮)</b> di kanan atas browser Chrome, lalu pilih <b>"Install Aplikasi"</b> atau <b>"Tambahkan ke Layar Utama"</b>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 relative">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center mb-3 shadow-xs">
                3
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Selesai & Siap Digunakan</h4>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Ikon aplikasi SI-ANJANG akan otomatis terpasang di menu HP. Buka aplikasi dan nikmati pengalaman native!
              </p>
            </div>
          </div>
        )}

        {/* Tab Content: iOS Safari */}
        {activeTab === 'ios' && (
          <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 relative">
              <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center mb-3 shadow-xs">
                1
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Buka di Browser Safari</h4>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Pastikan Anda membuka website SI-ANJANG melalui browser bawaan Apple Safari di iPhone atau iPad Anda.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 relative">
              <span className="w-7 h-7 rounded-full bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center mb-3 shadow-xs">
                2
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Ketuk Ikon Bagikan (Share)</h4>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Ketuk tombol <b>Bagikan (📤)</b> di bilah bawah Safari, lalu gulir dan pilih <b>"Tambahkan ke Layar Utama" (Add to Home Screen ➕)</b>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 relative">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center mb-3 shadow-xs">
                3
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Ketuk "Tambah" (Add)</h4>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Tekan tombol <b>"Tambah"</b> di pojok kanan atas. Ikon SI-ANJANG akan langsung tampil di Homescreen iPhone Anda.
              </p>
            </div>
          </div>
        )}

        {/* Tab Content: Desktop PC */}
        {activeTab === 'desktop' && (
          <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 relative">
              <span className="w-7 h-7 rounded-full bg-sky-600 text-white font-extrabold text-xs flex items-center justify-center mb-3 shadow-xs">
                1
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Gunakan Chrome / Edge</h4>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Buka website ini di Google Chrome, Microsoft Edge, atau Brave Browser pada laptop atau komputer Anda.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 relative">
              <span className="w-7 h-7 rounded-full bg-sky-600 text-white font-extrabold text-xs flex items-center justify-center mb-3 shadow-xs">
                2
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Klik Ikon Pasang di Address Bar</h4>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Lihat di ujung kanan kolom alamat URL browser (address bar), klik ikon <b>Install Aplikasi (Komputer dengan panah bawah)</b>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 relative">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center mb-3 shadow-xs">
                3
              </span>
              <h4 className="font-bold text-slate-900 text-sm">Aplikasi Desktop Siap</h4>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                Aplikasi akan terbuka dalam jendela tersendiri dan pintasan dibuat di Desktop / Taskbar Windows Anda.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Share / Bagikan Section */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-bold text-white flex items-center justify-center sm:justify-start gap-2">
            <Share2 className="w-5 h-5 text-blue-400" />
            <span>Bagikan Tautan ke Anggota Puskesmas</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            Permudah anggota lain untuk memasang aplikasi SI-ANJANG di HP mereka
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
          <button
            onClick={copyUrl}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin!' : 'Salin Link'}</span>
          </button>

          <button
            onClick={shareToWA}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-900/30"
          >
            <Share2 className="w-4 h-4" />
            <span>Kirim via WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
