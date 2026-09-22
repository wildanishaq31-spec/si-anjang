import React, { useState, useEffect } from 'react';
import { Wallet, Eye, EyeOff, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Login({ onLoginSuccess, onLoginGuest, onNavigate }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('anjangsana_creds');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.u) setUsername(parsed.u);
        if (parsed.p) setPassword(parsed.p);
        setRememberMe(true);
      } catch (e) {}
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Input Tidak Lengkap',
        text: 'Silakan isi username dan password!',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    setLoading(true);
    try {
      const res = await onLoginSuccess(username.trim(), password);
      if (res.success) {
        if (rememberMe) {
          localStorage.setItem('anjangsana_creds', JSON.stringify({ u: username.trim(), p: password }));
        } else {
          localStorage.removeItem('anjangsana_creds');
        }

        Swal.fire({
          icon: 'success',
          title: 'Berhasil Masuk',
          text: `Selamat datang, ${res.user.fullname || res.user.username}!`,
          toast: true,
          position: 'top-end',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Masuk',
          text: res.message || 'Username atau password salah!',
          confirmButtonColor: '#2563eb'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Terjadi Kesalahan',
        text: err.message || 'Gagal menghubungi server.',
        confirmButtonColor: '#2563eb'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col justify-between relative overflow-hidden px-4 py-8 select-none">
      {/* Background Rings & Glows */}
      <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full border-[100px] border-indigo-900/15 pointer-events-none blur-sm"></div>
      <div className="absolute top-1/4 -right-40 w-[700px] h-[700px] rounded-full border-[120px] border-blue-600/10 pointer-events-none blur-sm"></div>
      <div className="absolute bottom-10 left-1/3 w-80 h-80 rounded-full bg-blue-500/5 blur-3xl pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-6xl mx-auto flex-1 flex items-center justify-center relative z-10 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          {/* Left Hero Column */}
          <div className="lg:col-span-6 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-950/60 border border-blue-500/20 text-blue-400 text-sm font-semibold shadow-inner">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/50">
                <Wallet className="w-4 h-4" />
              </div>
              <span>SI-ANJANG V.10.5 PKM Cermee</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Selamat datang <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-sky-400">
                sobat anjangsana
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
              Sistem Informasi Manajemen Iuran & Undian Tuan Rumah Anjangsana Keluarga Besar UPTD Puskesmas Cermee.
            </p>

            <div className="hidden lg:flex items-center gap-6 pt-4 text-xs font-semibold text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Terhubung Spreadsheet Real</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('download')}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
              >
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></div>
                <span>Pasang Aplikasi (PWA) 📱</span>
              </button>
            </div>
          </div>

          {/* Right Login Card */}
          <div className="lg:col-span-6 max-w-md w-full mx-auto">
            <div className="bg-white text-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-blue-950/40 border border-slate-100/10 relative">
              <div className="mb-6 text-center lg:text-left">
                <h2 className="text-2xl font-bold text-slate-900">Masuk Akun</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Masukkan username & password petugas
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Masukkan username"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-800"
                      required
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password"
                      className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all text-slate-800"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="text-xs font-semibold text-slate-600">Ingat saya di perangkat ini</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Masuk Sistem</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col gap-2.5 text-center">
                  <p className="text-xs text-slate-500 font-medium">
                    Bukan admin atau bendahara?{' '}
                    <button
                      type="button"
                      onClick={onLoginGuest}
                      className="font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      Masuk sebagai tamu
                    </button>
                  </p>

                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate('download')}
                    className="py-2 px-3 bg-slate-50 hover:bg-blue-50 text-blue-600 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>📱 Pasang Aplikasi di HP (PWA)</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 font-medium py-2 relative z-10">
        © 2026 Keluarga Besar UPTD Puskesmas Cermee. All Rights Reserved.
      </footer>
    </div>
  );
}
