import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import SplashScreen from './components/SplashScreen';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Karyawan from './pages/Karyawan';
import Iuran from './pages/Iuran';
import Pengeluaran from './pages/Pengeluaran';
import Undian from './pages/Undian';
import Rekap from './pages/Rekap';
import Setting from './pages/Setting';
import UserManagement from './pages/User';
import DownloadPage from './pages/Download';
import { api, SEED_KARYAWAN, SEED_USERS, SEED_SETTINGS, calculateLocalDashboardStats } from './services/api';
import Swal from 'sweetalert2';

export default function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('anjangsana_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [activePage, setActivePage] = useState(() => {
    try {
      const path = window.location.pathname.replace(/^\/+/, '').toLowerCase();
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
      if (path === 'download' || hash === 'download') return 'download';
    } catch (e) {}
    return 'dashboard';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  // Sync URL changes with activePage
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname.replace(/^\/+/, '').toLowerCase();
      const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
      if (path === 'download' || hash === 'download') {
        setActivePage('download');
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const handleNavigate = (page) => {
    setActivePage(page);
    try {
      if (page === 'download') {
        window.history.pushState(null, '', '/download');
      } else {
        window.history.pushState(null, '', '/');
      }
    } catch (e) {}
  };

  // Data states initialized IMMEDIATELY from Cache (0ms Instant Load)
  const [karyawanList, setKaryawanList] = useState(() => api.getLocal('karyawan', SEED_KARYAWAN));
  const [iuranList, setIuranList] = useState(() => api.getLocal('iuran', []));
  const [pengeluaranList, setPengeluaranList] = useState(() => api.getLocal('pengeluaran', []));
  const [undianList, setUndianList] = useState(() => api.getLocal('undian', []));
  const [userList, setUserList] = useState(() => api.getLocal('users', SEED_USERS));
  const [settings, setSettings] = useState(() => api.getLocal('settings', SEED_SETTINGS));

  // Pre-calculate instant dashboard stats immediately
  const [dashboardStats, setDashboardStats] = useState(() => api.getLocalDashboardStats());

  // Auto recalculate local dashboard stats whenever local lists change
  const refreshLocalDashboard = useCallback((customData = {}) => {
    const freshStats = calculateLocalDashboardStats({
      karyawan: customData.karyawan || karyawanList,
      iuran: customData.iuran || iuranList,
      pengeluaran: customData.pengeluaran || pengeluaranList,
      settings: customData.settings || settings
    });
    setDashboardStats(freshStats);
  }, [karyawanList, iuranList, pengeluaranList, settings]);

  // Auto Logout Idle Timer (15 Menit)
  useEffect(() => {
    if (!currentUser || currentUser.role === 'Tamu') return;

    let timeout;
    const idleDuration = 15 * 60 * 1000; // 15 menit

    const handleIdleLogout = () => {
      Swal.fire({
        icon: 'warning',
        title: 'Sesi Berakhir',
        text: 'Anda otomatis keluar karena tidak ada aktivitas selama 15 menit.',
        confirmButtonColor: '#2563eb'
      });
      handleLogout();
    };

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(handleIdleLogout, idleDuration);
    };

    resetTimer();

    const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'];
    events.forEach(ev => window.addEventListener(ev, resetTimer));

    return () => {
      clearTimeout(timeout);
      events.forEach(ev => window.removeEventListener(ev, resetTimer));
    };
  }, [currentUser]);

  // Background SWR Data Synchronizer (Non-blocking)
  const syncServerData = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await api.syncAllData();
      if (res?.success && res.data) {
        if (res.data.karyawan) setKaryawanList(res.data.karyawan);
        if (res.data.iuran) setIuranList(res.data.iuran);
        if (res.data.pengeluaran) setPengeluaranList(res.data.pengeluaran);
        if (res.data.undian) setUndianList(res.data.undian);
        if (res.data.settings) setSettings(res.data.settings);
        if (res.data.users) setUserList(res.data.users);
        if (res.data.stats) setDashboardStats(res.data.stats);
      }
    } catch (err) {
      console.warn('Silent sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      // Immediate local computation
      refreshLocalDashboard();
      // Background non-blocking sync
      syncServerData();
    }
  }, [currentUser]);

  // Login handler (Instant redirect)
  const handleLogin = async (username, password) => {
    const res = await api.login(username, password);
    if (res.success) {
      setCurrentUser(res.user);
      sessionStorage.setItem('anjangsana_session', JSON.stringify(res.user));
      setActivePage('dashboard');
      // Trigger background sync immediately after login
      setTimeout(syncServerData, 100);
    }
    return res;
  };

  // Guest login
  const handleLoginGuest = () => {
    const guestUser = {
      username: 'tamu',
      fullname: 'Pengunjung (Tamu)',
      role: 'Tamu',
      photo: '',
      token: 'guest-token'
    };
    setCurrentUser(guestUser);
    sessionStorage.setItem('anjangsana_session', JSON.stringify(guestUser));
    setActivePage('dashboard');

    Swal.fire({
      icon: 'info',
      title: 'Mode Pantau Tamu',
      text: 'Anda masuk dalam mode pantau (hanya melihat Dashboard).',
      toast: true,
      position: 'top-end',
      timer: 2000,
      showConfirmButton: false
    });
  };

  // Logout handler
  const handleLogout = async () => {
    if (currentUser && currentUser.role !== 'Tamu') {
      api.logout(currentUser.username);
    }
    setCurrentUser(null);
    sessionStorage.removeItem('anjangsana_session');
    setActivePage('dashboard');
  };

  // Calculate unpaid members for badge
  const unpaidCount = useMemo(() => {
    if (!karyawanList.length || !iuranList.length) return 0;
    const now = new Date();
    const curYear = String(now.getFullYear());
    const curMonth = String(now.getMonth() + 1).padStart(2, '0');

    const paidMap = {};
    iuranList.forEach(i => {
      const tgl = String(i.tanggal || '');
      if (tgl.startsWith(`${curYear}-${curMonth}`)) {
        paidMap[i.id_karyawan] = (paidMap[i.id_karyawan] || 0) + (Number(i.nominal) || 0);
      }
    });

    let count = 0;
    karyawanList.forEach(k => {
      if (!paidMap[k.id] || paidMap[k.id] <= 0) {
        count++;
      }
    });
    return count;
  }, [karyawanList, iuranList]);

  // Optimistic Instant CRUD Dispatchers (0ms response)
  const handleSaveKaryawan = async (payload) => {
    let nextList = [...karyawanList];
    if (payload.isEdit === 'true' || payload.isEdit === true) {
      const idx = nextList.findIndex(k => String(k.id) === String(payload.dataId));
      if (idx !== -1) {
        nextList[idx] = { ...nextList[idx], nama: payload.nama, jabatan: payload.jabatan, nominal_iuran: Number(payload.nominal_iuran), status: payload.status };
      }
    } else {
      nextList.push({
        id: payload.id || String(Date.now()),
        nama: payload.nama,
        jabatan: payload.jabatan,
        nominal_iuran: Number(payload.nominal_iuran),
        status: payload.status || 'Belum'
      });
    }
    setKaryawanList(nextList);
    refreshLocalDashboard({ karyawan: nextList });
    api.saveKaryawan(payload);
  };

  const handleDeleteKaryawan = async (id) => {
    const nextList = karyawanList.filter(k => String(k.id) !== String(id));
    setKaryawanList(nextList);
    refreshLocalDashboard({ karyawan: nextList });
    api.deleteKaryawan(id);
  };

  const handleResetStatusKaryawan = async () => {
    const nextList = karyawanList.map(k => ({ ...k, status: 'Belum' }));
    setKaryawanList(nextList);
    refreshLocalDashboard({ karyawan: nextList });
    api.resetStatusKaryawan();
  };

  const handleSaveIuran = async (payload) => {
    const newItem = {
      id: payload.dataId || Date.now(),
      tanggal: payload.tanggal,
      id_karyawan: payload.id_karyawan,
      nama_karyawan: payload.nama_karyawan,
      periode: payload.periode,
      nominal: Number(payload.nominal),
      metode_pembayaran: payload.metode_pembayaran,
      uang_diterima: Number(payload.uang_diterima),
      kembalian: Number(payload.kembalian)
    };

    let nextList = [...iuranList];
    if (payload.isEdit === 'true' || payload.isEdit === true) {
      const idx = nextList.findIndex(i => String(i.id) === String(payload.dataId));
      if (idx !== -1) nextList[idx] = newItem;
    } else {
      nextList = [newItem, ...nextList];
    }
    setIuranList(nextList);
    refreshLocalDashboard({ iuran: nextList });
    api.saveIuran(payload);
    return { success: true };
  };

  const handleDeleteIuran = async (id) => {
    const nextList = iuranList.filter(i => String(i.id) !== String(id));
    setIuranList(nextList);
    refreshLocalDashboard({ iuran: nextList });
    api.deleteIuran(id);
    return { success: true };
  };

  const handleSavePengeluaran = async (payload) => {
    const newItem = {
      id: payload.dataId || Date.now(),
      tanggal: payload.tanggal,
      keterangan: payload.keterangan,
      nominal: Number(payload.nominal),
      kategori: payload.kategori
    };

    let nextList = [...pengeluaranList];
    if (payload.isEdit === 'true' || payload.isEdit === true) {
      const idx = nextList.findIndex(p => String(p.id) === String(payload.dataId));
      if (idx !== -1) nextList[idx] = newItem;
    } else {
      nextList = [newItem, ...nextList];
    }
    setPengeluaranList(nextList);
    refreshLocalDashboard({ pengeluaran: nextList });
    api.savePengeluaran(payload);
  };

  const handleDeletePengeluaran = async (id) => {
    const nextList = pengeluaranList.filter(p => String(p.id) !== String(id));
    setPengeluaranList(nextList);
    refreshLocalDashboard({ pengeluaran: nextList });
    api.deletePengeluaran(id);
  };

  const handleSaveUndian = async (payload) => {
    const nextUndian = [
      {
        id: Date.now(),
        tanggal: payload.tanggal,
        id_karyawan: payload.id_karyawan,
        nama_pemenang: payload.nama_pemenang,
        periode: payload.periode
      },
      ...undianList
    ];
    setUndianList(nextUndian);

    const nextKaryawan = karyawanList.map(k =>
      String(k.id) === String(payload.id_karyawan) ? { ...k, status: 'Sudah' } : k
    );
    setKaryawanList(nextKaryawan);
    refreshLocalDashboard({ undian: nextUndian, karyawan: nextKaryawan });
    api.saveUndian(payload);
  };

  const handleDeleteUndian = async (id) => {
    const item = undianList.find(u => String(u.id) === String(id));
    const nextUndian = undianList.filter(u => String(u.id) !== String(id));
    setUndianList(nextUndian);

    if (item && item.id_karyawan) {
      const nextKaryawan = karyawanList.map(k =>
        String(k.id) === String(item.id_karyawan) ? { ...k, status: 'Belum' } : k
      );
      setKaryawanList(nextKaryawan);
      refreshLocalDashboard({ undian: nextUndian, karyawan: nextKaryawan });
    }
    api.deleteUndian(id);
  };

  const handleSaveUser = async (payload) => {
    const res = await api.saveUser(payload);
    const updated = await api.getUsers();
    if (updated?.data) setUserList(updated.data);
    return res;
  };

  const handleDeleteUser = async (username) => {
    await api.deleteUser(username);
    const updated = await api.getUsers();
    if (updated?.data) setUserList(updated.data);
  };

  const handleSaveInfo = async (infoText) => {
    setSettings(prev => ({ ...prev, info_dashboard: infoText }));
    setDashboardStats(prev => prev ? ({ ...prev, info: infoText }) : prev);
    api.saveSettingInfo(infoText);
  };

  const handleSaveWA = async (templateText) => {
    setSettings(prev => ({ ...prev, wa_template: templateText }));
    api.saveSettingWA(templateText);
  };

  // If not logged in:
  if (!currentUser) {
    if (activePage === 'download') {
      return (
        <div className="min-h-screen bg-[#0b1120] text-slate-100 p-4 sm:p-8 flex flex-col justify-between">
          <div className="max-w-4xl w-full mx-auto my-auto">
            <DownloadPage onNavigate={handleNavigate} currentUser={null} />
          </div>
          <div className="text-center pt-4">
            <button
              onClick={() => handleNavigate('login')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              Kembali ke Halaman Masuk (Login)
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
        <Login
          onLoginSuccess={handleLogin}
          onLoginGuest={handleLoginGuest}
          onNavigate={handleNavigate}
        />
      </>
    );
  }

  const isTamu = currentUser.role === 'Tamu';
  const isAdmin = currentUser.role === 'Superadmin';

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unpaidCount={unpaidCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <Navbar
          isSyncing={isSyncing}
          onSync={syncServerData}
          onNavigate={handleNavigate}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
          {activePage === 'dashboard' && (
            <Dashboard
              stats={dashboardStats}
              loading={false}
              onNavigate={handleNavigate}
              currentUser={currentUser}
            />
          )}

          {activePage === 'download' && (
            <DownloadPage
              onNavigate={handleNavigate}
              currentUser={currentUser}
            />
          )}

          {!isTamu && isAdmin && activePage === 'karyawan' && (
            <Karyawan
              karyawanList={karyawanList}
              onSave={handleSaveKaryawan}
              onDelete={handleDeleteKaryawan}
              onResetAllStatus={handleResetStatusKaryawan}
              loading={false}
            />
          )}

          {!isTamu && activePage === 'iuran' && (
            <Iuran
              iuranList={iuranList}
              karyawanList={karyawanList}
              onSave={handleSaveIuran}
              onDelete={handleDeleteIuran}
              loading={false}
            />
          )}

          {!isTamu && activePage === 'pengeluaran' && (
            <Pengeluaran
              pengeluaranList={pengeluaranList}
              onSave={handleSavePengeluaran}
              onDelete={handleDeletePengeluaran}
              loading={false}
            />
          )}

          {!isTamu && activePage === 'undian' && (
            <Undian
              undianList={undianList}
              karyawanList={karyawanList}
              onSave={handleSaveUndian}
              onDelete={handleDeleteUndian}
              loading={false}
            />
          )}

          {!isTamu && activePage === 'rekap' && (
            <Rekap
              iuranList={iuranList}
              karyawanList={karyawanList}
              waTemplate={settings?.wa_template}
              loading={false}
            />
          )}

          {!isTamu && isAdmin && activePage === 'setting' && (
            <Setting
              settings={settings}
              onSaveInfo={handleSaveInfo}
              onSaveWA={handleSaveWA}
              apiService={api}
              loading={false}
            />
          )}

          {!isTamu && isAdmin && activePage === 'user' && (
            <UserManagement
              userList={userList}
              onSave={handleSaveUser}
              onDelete={handleDeleteUser}
              loading={false}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation for PWA */}
        <BottomNav
          activePage={activePage}
          onNavigate={handleNavigate}
          onOpenSidebar={() => setSidebarOpen(true)}
          unpaidCount={unpaidCount}
          isTamu={isTamu}
        />
      </div>
    </div>
    </>
  );
}
