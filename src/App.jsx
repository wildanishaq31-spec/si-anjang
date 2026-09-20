import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Karyawan from './pages/Karyawan';
import Iuran from './pages/Iuran';
import Pengeluaran from './pages/Pengeluaran';
import Undian from './pages/Undian';
import Rekap from './pages/Rekap';
import Setting from './pages/Setting';
import UserManagement from './pages/User';
import { api } from './services/api';
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

  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Data states
  const [dashboardStats, setDashboardStats] = useState(null);
  const [karyawanList, setKaryawanList] = useState([]);
  const [iuranList, setIuranList] = useState([]);
  const [pengeluaranList, setPengeluaranList] = useState([]);
  const [undianList, setUndianList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [settings, setSettings] = useState(null);

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

  // Load all core data
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, karRes, iurRes, outRes, undRes, setRes] = await Promise.all([
        api.getDashboardStats(),
        api.getKaryawan(),
        api.getIuran(),
        api.getPengeluaran(),
        api.getUndian(),
        api.getSettings()
      ]);

      if (statsRes?.success) setDashboardStats(statsRes.data);
      if (karRes?.success) setKaryawanList(karRes.data);
      if (iurRes?.success) setIuranList(iurRes.data);
      if (outRes?.success) setPengeluaranList(outRes.data);
      if (undRes?.success) setUndianList(undRes.data);
      if (setRes?.success) setSettings(setRes.data);

      if (currentUser?.role === 'Superadmin') {
        const usersRes = await api.getUsers();
        if (usersRes?.success) setUserList(usersRes.data);
      }
    } catch (err) {
      console.warn('Data load error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser, loadAllData]);

  // Login handler
  const handleLogin = async (username, password) => {
    const res = await api.login(username, password);
    if (res.success) {
      setCurrentUser(res.user);
      sessionStorage.setItem('anjangsana_session', JSON.stringify(res.user));
      setActivePage('dashboard');
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
      timer: 3000,
      showConfirmButton: false
    });
  };

  // Logout handler
  const handleLogout = async () => {
    if (currentUser && currentUser.role !== 'Tamu') {
      await api.logout(currentUser.username);
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

  // CRUD Dispatchers
  const handleSaveKaryawan = async (payload) => {
    await api.saveKaryawan(payload);
    await loadAllData();
  };

  const handleDeleteKaryawan = async (id) => {
    await api.deleteKaryawan(id);
    await loadAllData();
  };

  const handleResetStatusKaryawan = async () => {
    await api.resetStatusKaryawan();
    await loadAllData();
  };

  const handleSaveIuran = async (payload) => {
    await api.saveIuran(payload);
    await loadAllData();
  };

  const handleDeleteIuran = async (id) => {
    await api.deleteIuran(id);
    await loadAllData();
  };

  const handleSavePengeluaran = async (payload) => {
    await api.savePengeluaran(payload);
    await loadAllData();
  };

  const handleDeletePengeluaran = async (id) => {
    await api.deletePengeluaran(id);
    await loadAllData();
  };

  const handleSaveUndian = async (payload) => {
    await api.saveUndian(payload);
    await loadAllData();
  };

  const handleDeleteUndian = async (id) => {
    await api.deleteUndian(id);
    await loadAllData();
  };

  const handleSaveUser = async (payload) => {
    const res = await api.saveUser(payload);
    if (res.success) {
      const usersRes = await api.getUsers();
      if (usersRes?.success) setUserList(usersRes.data);
    }
    return res;
  };

  const handleDeleteUser = async (username) => {
    await api.deleteUser(username);
    const usersRes = await api.getUsers();
    if (usersRes?.success) setUserList(usersRes.data);
  };

  const handleSaveInfo = async (infoText) => {
    await api.saveSettingInfo(infoText);
    setSettings(prev => ({ ...prev, info_dashboard: infoText }));
    setDashboardStats(prev => prev ? ({ ...prev, info: infoText }) : prev);
  };

  const handleSaveWA = async (templateText) => {
    await api.saveSettingWA(templateText);
    setSettings(prev => ({ ...prev, wa_template: templateText }));
  };

  // If not logged in, render Login
  if (!currentUser) {
    return <Login onLoginSuccess={handleLogin} onLoginGuest={handleLoginGuest} />;
  }

  const isTamu = currentUser.role === 'Tamu';
  const isAdmin = currentUser.role === 'Superadmin';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unpaidCount={unpaidCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <Navbar
          currentUser={currentUser}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onLogout={handleLogout}
          onNavigate={setActivePage}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
          {activePage === 'dashboard' && (
            <Dashboard
              stats={dashboardStats}
              loading={loading}
              onNavigate={setActivePage}
              currentUser={currentUser}
            />
          )}

          {!isTamu && isAdmin && activePage === 'karyawan' && (
            <Karyawan
              karyawanList={karyawanList}
              onSave={handleSaveKaryawan}
              onDelete={handleDeleteKaryawan}
              onResetAllStatus={handleResetStatusKaryawan}
              loading={loading}
            />
          )}

          {!isTamu && activePage === 'iuran' && (
            <Iuran
              iuranList={iuranList}
              karyawanList={karyawanList}
              onSave={handleSaveIuran}
              onDelete={handleDeleteIuran}
              loading={loading}
            />
          )}

          {!isTamu && activePage === 'pengeluaran' && (
            <Pengeluaran
              pengeluaranList={pengeluaranList}
              onSave={handleSavePengeluaran}
              onDelete={handleDeletePengeluaran}
              loading={loading}
            />
          )}

          {!isTamu && activePage === 'undian' && (
            <Undian
              undianList={undianList}
              karyawanList={karyawanList}
              onSave={handleSaveUndian}
              onDelete={handleDeleteUndian}
              loading={loading}
            />
          )}

          {!isTamu && activePage === 'rekap' && (
            <Rekap
              iuranList={iuranList}
              karyawanList={karyawanList}
              waTemplate={settings?.wa_template}
              loading={loading}
            />
          )}

          {!isTamu && isAdmin && activePage === 'setting' && (
            <Setting
              settings={settings}
              onSaveInfo={handleSaveInfo}
              onSaveWA={handleSaveWA}
              apiService={api}
              loading={loading}
            />
          )}

          {!isTamu && isAdmin && activePage === 'user' && (
            <UserManagement
              userList={userList}
              onSave={handleSaveUser}
              onDelete={handleDeleteUser}
              loading={loading}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation for PWA */}
        <BottomNav
          activePage={activePage}
          onNavigate={setActivePage}
          onOpenSidebar={() => setSidebarOpen(true)}
          unpaidCount={unpaidCount}
          isTamu={isTamu}
        />
      </div>
    </div>
  );
}
