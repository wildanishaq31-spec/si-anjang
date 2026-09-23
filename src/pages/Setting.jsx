import React, { useState, useEffect } from 'react';
import {
  Settings,
  Megaphone,
  Share2,
  Database,
  Save,
  CheckCircle2,
  Link,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function Setting({ settings, onSaveInfo, onSaveWA, apiService, loading }) {
  const [infoText, setInfoText] = useState(settings?.info_dashboard || '');
  const [waTpl, setWaTpl] = useState(settings?.wa_template || '');
  const [isInfoDirty, setIsInfoDirty] = useState(false);
  const [isWaDirty, setIsWaDirty] = useState(false);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingWa, setSavingWa] = useState(false);
  const [gasUrl, setGasUrl] = useState('');
  const [testingGas, setTestingGas] = useState(false);

  useEffect(() => {
    if (settings) {
      if (!isInfoDirty && settings.info_dashboard !== undefined) {
        setInfoText(settings.info_dashboard);
      }
      if (!isWaDirty && settings.wa_template !== undefined) {
        setWaTpl(settings.wa_template);
      }
    }
    if (apiService) {
      setGasUrl(apiService.getGasUrl());
    }
  }, [settings, apiService, isInfoDirty, isWaDirty]);

  const handleSaveInfo = async () => {
    setSavingInfo(true);
    try {
      const res = await onSaveInfo(infoText);
      if (res && res.success === false) {
        throw new Error(res.message || 'Gagal menyimpan ke Google Spreadsheet');
      }
      setIsInfoDirty(false);
      Swal.fire({
        icon: 'success',
        title: 'Tersimpan di Spreadsheet! ✅',
        text: 'Pengumuman dashboard berhasil diperbarui ke Google Sheets.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal Menyimpan', text: err.message });
    } finally {
      setSavingInfo(false);
    }
  };

  const handleSaveWA = async () => {
    setSavingWa(true);
    try {
      const res = await onSaveWA(waTpl);
      if (res && res.success === false) {
        throw new Error(res.message || 'Gagal menyimpan ke Google Spreadsheet');
      }
      setIsWaDirty(false);
      Swal.fire({
        icon: 'success',
        title: 'Tersimpan di Spreadsheet! ✅',
        text: 'Template pesan WhatsApp berhasil diperbarui ke Google Sheets.',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal Menyimpan', text: err.message });
    } finally {
      setSavingWa(false);
    }
  };

  const handleSaveGasUrl = () => {
    if (apiService) {
      apiService.setGasUrl(gasUrl.trim());
      Swal.fire({
        icon: 'success',
        title: 'URL GAS Diperbarui',
        text: gasUrl.trim()
          ? 'Aplikasi kini terhubung ke backend Google Apps Script live.'
          : 'URL dikosongkan. Aplikasi menggunakan mode penyimpanan lokal.',
        timer: 1800,
        showConfirmButton: false
      });
    }
  };

  const handleTestConnection = async () => {
    if (!gasUrl.trim()) {
      Swal.fire({ icon: 'warning', title: 'URL Kosong', text: 'Silakan isi URL Web App Google Apps Script terlebih dahulu!' });
      return;
    }

    setTestingGas(true);
    try {
      const testUrl = new URL(gasUrl.trim());
      testUrl.searchParams.set('action', 'getDashboardStats');
      const resp = await fetch(testUrl.toString(), { redirect: 'follow' });
      const json = await resp.json();

      if (json && json.success) {
        Swal.fire({
          icon: 'success',
          title: 'Koneksi Berhasil! ✅',
          text: 'Backend Apps Script dan Google Spreadsheet terhubung dengan sempurna.',
          confirmButtonColor: '#2563eb'
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Respons Tidak Sesuai',
          text: json.message || 'Respons server tidak valid. Pastikan Web App di-deploy dengan akses Anyone.',
          confirmButtonColor: '#2563eb'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Koneksi Gagal',
        text: 'Pastikan URL Web App benar dan Deployment diset ke "Who has access: Anyone". Error: ' + err.message,
        confirmButtonColor: '#2563eb'
      });
    } finally {
      setTestingGas(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Pengaturan Sistem</h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Konfigurasi pesan pengumuman dashboard, template pesan WA, dan sinkronisasi database
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Info Dashboard */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Pengumuman Dashboard</h3>
                <p className="text-xs text-slate-400 font-medium">Teks yang ditampilkan pada kartu utama banner</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Teks Pengumuman
              </label>
              <textarea
                value={infoText}
                onChange={(e) => {
                  setInfoText(e.target.value);
                  setIsInfoDirty(true);
                }}
                rows={5}
                placeholder="Ketik pengumuman hari ini untuk anggota..."
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              onClick={handleSaveInfo}
              disabled={savingInfo}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {savingInfo ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan ke Spreadsheet...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Info Dashboard</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card 2: WA Blast Template */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Template WA Blast Tagihan</h3>
                <p className="text-xs text-slate-400 font-medium">Format pesan pengingat iuran</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Template Teks
                </label>
                <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded">
                  Wajib sertakan [DAFTAR_NAMA]
                </span>
              </div>
              <textarea
                value={waTpl}
                onChange={(e) => {
                  setWaTpl(e.target.value);
                  setIsWaDirty(true);
                }}
                rows={5}
                placeholder="Ketik format pesan WhatsApp..."
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-green-600"
              />
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              onClick={handleSaveWA}
              disabled={savingWa}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow-md shadow-green-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {savingWa ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyimpan ke Spreadsheet...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Template WA</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Card 3: Backend Database URL Bridge */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">Koneksi Backend Google Apps Script</h3>
            <p className="text-xs text-slate-400 font-medium">
              Hubungkan aplikasi React Vite ini dengan Deployment Web App Google Spreadsheet
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              URL Web App Deployment Google Apps Script
            </label>
            <div className="relative">
              <Link className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={gasUrl}
                onChange={(e) => setGasUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100/80 text-xs text-indigo-900 leading-relaxed space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-indigo-800">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Petunjuk Deploy Google Apps Script:
            </p>
            <ol className="list-decimal list-inside space-y-0.5 text-indigo-700/90 pl-1">
              <li>Buka Script Editor di Google Spreadsheet <code>SI-ANJANGSANA V.10.5</code>.</li>
              <li>Pastikan kode <code>gas/Code.gs</code> yang baru sudah Anda simpan.</li>
              <li>Klik tombol <b>Deploy</b> &gt; <b>Manage deployments</b> (Kelola penerapan) &gt; Edit versi terbaru.</li>
              <li>Pastikan <b>Who has access</b> (Siapa yang memiliki akses) disetel ke: <b>Anyone</b> (Siapa saja).</li>
              <li>Salin URL Web App dan tempelkan pada kolom di atas!</li>
            </ol>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleSaveGasUrl}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan URL GAS</span>
            </button>

            <button
              onClick={handleTestConnection}
              disabled={testingGas}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingGas ? 'animate-spin' : ''}`} />
              <span>{testingGas ? 'Menguji Koneksi...' : 'Tes Koneksi'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
