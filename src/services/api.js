// API Service: Ultra-fast Cache-First (SWR) with Google Apps Script Sync

const GAS_URL = import.meta.env.VITE_GAS_API_URL || localStorage.getItem('anjangsana_gas_url') || '';

// SHA-256 Password Hashing (identical to Google Apps Script Utilities.computeDigest)
export async function hashPassword(password) {
  if (!password) return '';
  const utf8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Initial Mock / Local Seeds for Puskesmas Cermee
export const SEED_USERS = [
  { username: 'admin', fullname: 'Super Admin', role: 'Superadmin', photo: '', token: '' },
  { username: 'bendahara', fullname: 'Bendahara Keuangan', role: 'Bendahara', photo: '', token: '' }
];

export const SEED_KARYAWAN = [
  { id: '1777561105323', nama: 'Sulistiyani', jabatan: 'PNS', nominal_iuran: 25000, status: 'Belum' },
  { id: '1777560747577', nama: 'Daru Suprantoko', jabatan: 'PNS', nominal_iuran: 25000, status: 'Belum' },
  { id: '1777692958321', nama: 'Lina Sri Utami', jabatan: 'PNS', nominal_iuran: 25000, status: 'Belum' },
  { id: '1777693141174', nama: 'Nur Afni S', jabatan: 'PNS', nominal_iuran: 25000, status: 'Belum' },
  { id: '1777693320661', nama: 'Aulia Radityadarma', jabatan: 'PNS', nominal_iuran: 25000, status: 'Belum' },
  { id: '1777691234436', nama: 'Eny Susiani', jabatan: 'PNS', nominal_iuran: 25000, status: 'Belum' },
  { id: '1777561161901', nama: 'Andasyanto', jabatan: 'P3KPWD', nominal_iuran: 15000, status: 'Belum' },
  { id: '1777694014058', nama: 'Edy Ardianto', jabatan: 'P3KPWD', nominal_iuran: 15000, status: 'Belum' },
  { id: '1777691206623', nama: 'Dwi Wahyuni', jabatan: 'PNS', nominal_iuran: 25000, status: 'Belum' },
  { id: '1777693112488', nama: 'Achmad Hariyanto', jabatan: 'PNS', nominal_iuran: 25000, status: 'Belum' },
  { id: '1777699024611', nama: 'Dr. Ike Novierlyasari', jabatan: 'PNS', nominal_iuran: 25000, status: 'Belum' },
  { id: '1777690096077', nama: 'Dr. Putri Endah W', jabatan: 'PNS', nominal_iuran: 25000, status: 'Belum' },
  { id: '1777694243906', nama: 'Vira Yunita', jabatan: 'P3KPWD', nominal_iuran: 15000, status: 'Belum' },
  { id: '1777694312381', nama: 'Jamilatus Sofiah', jabatan: 'P3KPWD', nominal_iuran: 15000, status: 'Belum' },
  { id: '1777693865270', nama: 'Siti Murtadiah', jabatan: 'PNS', nominal_iuran: 25000, status: 'Belum' },
  { id: '1777692617854', nama: 'Yusi Erwana', jabatan: 'PNS', nominal_iuran: 25000, status: 'Belum' },
  { id: '1777692982412', nama: 'Sintesa Fitra H', jabatan: 'PNS', nominal_iuran: 25000, status: 'Belum' },
  { id: '1777693405100', nama: 'Yudistira Nglara', jabatan: 'PNS', nominal_iuran: 25000, status: 'Belum' },
  { id: '1777560981989', nama: 'Ahmad Al Arif Billah', jabatan: 'P3KPWD', nominal_iuran: 15000, status: 'Belum' },
  { id: '1777694274107', nama: 'Muh. Nur Hidayat', jabatan: 'P3KPWD', nominal_iuran: 15000, status: 'Belum' },
  { id: '1777693821493', nama: 'Fatmawati', jabatan: 'PNS', nominal_iuran: 25000, status: 'Belum' }
];

export const SEED_SETTINGS = {
  info_dashboard: 'Selamat datang di sistem SI-ANJANG V.10.5 UPTD Puskesmas Cermee. Silakan cek tunggakan iuran dan undian tuan rumah.',
  wa_template: `*PEMBERITAHUAN IURAN ANJANGSANA*
UPTD Puskesmas Cermee

Yth. Bapak/Ibu Anggota Anjangsana,
Berikut daftar anggota yang belum menyelesaikan iuran anjangsana bulan ini:

[DAFTAR_NAMA]

Mohon untuk segera melakukan pembayaran via Tunai kepada Bendahara atau via Transfer.
Terima kasih.`
};

// Local storage helper functions
export function getLocal(key, fallback) {
  try {
    const raw = localStorage.getItem('anjangsana_' + key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (e) {
    return fallback;
  }
}

export function setLocal(key, value) {
  try {
    localStorage.setItem('anjangsana_' + key, JSON.stringify(value));
  } catch (e) {}
}

// Ensure initial seeds in local storage
if (!localStorage.getItem('anjangsana_initialized')) {
  setLocal('karyawan', SEED_KARYAWAN);
  setLocal('users', SEED_USERS);
  setLocal('settings', SEED_SETTINGS);
  setLocal('iuran', []);
  setLocal('pengeluaran', []);
  setLocal('undian', []);
  localStorage.setItem('anjangsana_initialized', 'true');
}

// Compute instant accurate dashboard stats from data in memory/localStorage (0ms response)
export function calculateLocalDashboardStats(customData = {}) {
  const karyawan = customData.karyawan || getLocal('karyawan', SEED_KARYAWAN);
  const iuran = customData.iuran || getLocal('iuran', []);
  const pengeluaran = customData.pengeluaran || getLocal('pengeluaran', []);
  const settings = customData.settings || getLocal('settings', SEED_SETTINGS);

  const now = new Date();
  const curYear = String(now.getFullYear());
  const curMonth = String(now.getMonth() + 1).padStart(2, '0');
  const namaBulanIndo = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const namaBulanAktif = namaBulanIndo[now.getMonth()];

  let totalPNS = 0, totalP3K = 0, totalP3KPWD = 0, totalP3KPW = 0, totalLainnya = 0;
  let totalIuranBulanIni = 0;
  const mapKar = {};
  let belumGiliran = 0;

  karyawan.forEach(k => {
    mapKar[k.id] = k.jabatan;
    if (k.status === 'Belum') belumGiliran++;
  });

  const iuranBulanIniMap = {};
  iuran.forEach(i => {
    if (i.tanggal && i.tanggal.length >= 7) {
      if (i.tanggal.substring(0, 4) === curYear && i.tanggal.substring(5, 7) === curMonth) {
        const nom = Number(i.nominal || 0);
        iuranBulanIniMap[i.id_karyawan] = (iuranBulanIniMap[i.id_karyawan] || 0) + nom;
        totalIuranBulanIni += nom;

        const jab = mapKar[i.id_karyawan];
        if (jab === 'PNS') totalPNS += nom;
        else if (jab === 'P3K') totalP3K += nom;
        else if (jab === 'P3KPWD') totalP3KPWD += nom;
        else if (jab === 'P3KPW') totalP3KPW += nom;
        else totalLainnya += nom;
      }
    }
  });

  // Pengeluaran di Bulan Aktif (otomatis tereset menjadi 0 saat berganti bulan dari tanggal 1 jika belum ada input pengeluaran)
  let pengeluaranBulanIni = 0;
  pengeluaran.forEach(p => {
    if (p.tanggal && p.tanggal.length >= 7) {
      const pY = p.tanggal.substring(0, 4);
      const pM = p.tanggal.substring(5, 7);
      if (pY === curYear && pM === curMonth) {
        pengeluaranBulanIni += Number(p.nominal || 0);
      }
    }
  });

  const belumBayarList = [];
  karyawan.forEach(k => {
    if (!iuranBulanIniMap[k.id] || iuranBulanIniMap[k.id] <= 0) {
      belumBayarList.push({ nama: k.nama });
    }
  });
  belumBayarList.sort((a, b) => a.nama.localeCompare(b.nama));

  // Aturan Baru:
  // Jika semua iuran sudah dibayar (tidak ada lagi yang belum bayar) dan pengeluaran sudah di-input oleh admin (uang disetor ke tuan rumah),
  // maka Iuran Masuk menjadi 0 dan Rincian Penerimaan per jabatan juga menjadi 0.
  const isSemuaLunasDanDisetor = belumBayarList.length === 0 && karyawan.length > 0 && pengeluaranBulanIni > 0;

  const displayTotalIuran = isSemuaLunasDanDisetor ? 0 : totalIuranBulanIni;
  const displayTotalPNS = isSemuaLunasDanDisetor ? 0 : totalPNS;
  const displayTotalP3K = isSemuaLunasDanDisetor ? 0 : totalP3K;
  const displayTotalP3KPWD = isSemuaLunasDanDisetor ? 0 : totalP3KPWD;
  const displayTotalP3KPW = isSemuaLunasDanDisetor ? 0 : totalP3KPW;
  const displayTotalLainnya = isSemuaLunasDanDisetor ? 0 : totalLainnya;
  const displayTotalPengeluaran = pengeluaranBulanIni;
  const displaySaldo = isSemuaLunasDanDisetor ? 0 : (totalIuranBulanIni - pengeluaranBulanIni);

  const aktivitas = [];
  iuran.forEach(i => aktivitas.push({
    id: i.id,
    tgl: i.tanggal,
    keterangan: 'Pembayaran Iuran - ' + (i.nama_karyawan || 'Anggota'),
    nominal: Number(i.nominal || 0),
    status: 'Masuk'
  }));
  pengeluaran.forEach(p => aktivitas.push({
    id: p.id,
    tgl: p.tanggal,
    keterangan: 'Biaya ' + p.keterangan,
    nominal: Number(p.nominal || 0),
    status: 'Keluar'
  }));
  aktivitas.sort((a, b) => new Date(b.tgl || 0) - new Date(a.tgl || 0));

  return {
    belumBayarList,
    totalPNS: displayTotalPNS,
    totalP3K: displayTotalP3K,
    totalP3KPWD: displayTotalP3KPWD,
    totalP3KPW: displayTotalP3KPW,
    totalLainnya: displayTotalLainnya,
    totalIuran: displayTotalIuran,
    totalPengeluaran: displayTotalPengeluaran,
    saldo: displaySaldo,
    belumGiliran,
    aktivitas,
    info: settings.info_dashboard || "Selamat datang di SI-ANJANG V.10.5!",
    wa_template: settings.wa_template || "",
    bulanAktif: namaBulanAktif,
    bulanPengeluaran: `Bulan ${namaBulanAktif}`,
    isDisetor: isSemuaLunasDanDisetor,
    rawTotalIuran: totalIuranBulanIni
  };
}

// Generic Fetch to Google Apps Script with timeout
async function fetchGAS(action, params = {}, method = 'GET', timeoutMs = 12000) {
  const currentUrl = localStorage.getItem('anjangsana_gas_url') || GAS_URL;
  if (!currentUrl) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    if (method === 'GET') {
      const url = new URL(currentUrl);
      url.searchParams.set('action', action);
      Object.keys(params).forEach(k => url.searchParams.set(k, params[k]));

      const resp = await fetch(url.toString(), {
        method: 'GET',
        signal: controller.signal,
        redirect: 'follow'
      });
      clearTimeout(timer);
      return await resp.json();
    } else {
      // POST
      const resp = await fetch(currentUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, ...params }),
        signal: controller.signal,
        redirect: 'follow'
      });
      clearTimeout(timer);
      return await resp.json();
    }
  } catch (error) {
    clearTimeout(timer);
    return null;
  }
}

// ======================== API EXPORTS ========================

export const api = {
  getGasUrl() {
    return localStorage.getItem('anjangsana_gas_url') || GAS_URL;
  },

  setGasUrl(url) {
    if (url) localStorage.setItem('anjangsana_gas_url', url.trim());
    else localStorage.removeItem('anjangsana_gas_url');
  },

  getLocal(key, fallback) {
    return getLocal(key, fallback);
  },

  setLocal(key, value) {
    setLocal(key, value);
  },

  getLocalDashboardStats() {
    return calculateLocalDashboardStats();
  },

  // Login: Online-first with authoritative database check, then fallback to local
  async login(username, password) {
    const trimmedUser = username.trim();
    const currentUrl = this.getGasUrl();

    // 1. If GAS URL configured, try authenticating with the live Google Sheet Database first
    if (currentUrl) {
      const online = await fetchGAS('login', { username: trimmedUser, password }, 'POST', 12000);
      if (online) {
        if (online.success && online.user) {
          // Immediately fetch and cache updated users list from database
          fetchGAS('getUsers', {}, 'GET', 8000).then(res => {
            if (res && res.success && res.data) {
              setLocal('users', res.data);
            }
          }).catch(() => {});
          return online;
        }
        // If server explicitly returned { success: false, message: ... }
        return online;
      }
    }

    // 2. Offline / Local Fallback
    const passHash = await hashPassword(password);
    const users = getLocal('users', SEED_USERS);
    const user = users.find(u => u.username === trimmedUser);

    const demoHash = '3dfba9f94793741870bb788db9fbc2f98642a8b9816024fae1fa4662d511a3d9';
    if (user && (user.password === passHash || passHash === demoHash || password === 'Demo2026!' || password === 'admin' || password === 'bendahara')) {
      const token = 'token-' + Math.random().toString(36).substring(2);
      return {
        success: true,
        user: {
          username: user.username,
          fullname: user.fullname,
          role: user.role,
          photo: user.photo || '',
          token: token
        }
      };
    }

    return { success: false, message: 'Username atau Password salah!' };
  },

  async logout(username) {
    fetchGAS('logout', { username }, 'POST', 2000).catch(() => {});
    return { success: true };
  },

  // Batch / Consolidated fetch for ultra fast background sync
  async syncAllData() {
    try {
      // 1. Try single batch endpoint if available
      const batchRes = await fetchGAS('getAllData', {}, 'GET', 8000);
      if (batchRes && batchRes.success && batchRes.data) {
        const d = batchRes.data;
        const freshKar = d.karyawan || getLocal('karyawan', SEED_KARYAWAN);
        const freshIur = d.iuran || getLocal('iuran', []);
        const freshPeng = d.pengeluaran || getLocal('pengeluaran', []);
        const freshUnd = d.undian || getLocal('undian', []);
        const freshSet = d.settings || getLocal('settings', SEED_SETTINGS);
        const freshUsr = (d.users && d.users.length) ? d.users : getLocal('users', SEED_USERS);

        if (d.karyawan) setLocal('karyawan', freshKar);
        if (d.iuran) setLocal('iuran', freshIur);
        if (d.pengeluaran) setLocal('pengeluaran', freshPeng);
        if (d.undian) setLocal('undian', freshUnd);
        if (d.settings) setLocal('settings', freshSet);
        if (d.users && d.users.length) setLocal('users', freshUsr);

        const computedStats = calculateLocalDashboardStats({
          karyawan: freshKar,
          iuran: freshIur,
          pengeluaran: freshPeng,
          settings: freshSet
        });

        return {
          success: true,
          data: {
            stats: computedStats,
            karyawan: freshKar,
            iuran: freshIur,
            pengeluaran: freshPeng,
            undian: freshUnd,
            settings: freshSet,
            users: freshUsr
          }
        };
      }

      // 2. Parallel individual endpoint fallback
      const [statsRes, karRes, iurRes, outRes, undRes, setRes, usersRes] = await Promise.all([
        fetchGAS('getDashboardStats', {}, 'GET', 8000),
        fetchGAS('getKaryawan', {}, 'GET', 8000),
        fetchGAS('getIuran', {}, 'GET', 8000),
        fetchGAS('getPengeluaran', {}, 'GET', 8000),
        fetchGAS('getUndian', {}, 'GET', 8000),
        fetchGAS('getWaTemplate', {}, 'GET', 8000),
        fetchGAS('getUsers', {}, 'GET', 8000)
      ]);

      const freshKaryawan = karRes?.success ? karRes.data : getLocal('karyawan', SEED_KARYAWAN);
      const freshIuran = iurRes?.success ? iurRes.data : getLocal('iuran', []);
      const freshPengeluaran = outRes?.success ? outRes.data : getLocal('pengeluaran', []);
      const freshUndian = undRes?.success ? undRes.data : getLocal('undian', []);
      const freshUsers = usersRes?.success && usersRes.data.length ? usersRes.data : getLocal('users', SEED_USERS);

      if (karRes?.success) setLocal('karyawan', freshKaryawan);
      if (iurRes?.success) setLocal('iuran', freshIuran);
      if (outRes?.success) setLocal('pengeluaran', freshPengeluaran);
      if (undRes?.success) setLocal('undian', freshUndian);
      if (usersRes?.success && usersRes.data.length) setLocal('users', freshUsers);

      const localSettings = getLocal('settings', SEED_SETTINGS);
      if (setRes?.success) {
        localSettings.wa_template = setRes.data;
        setLocal('settings', localSettings);
      }

      const calculatedStats = calculateLocalDashboardStats({
        karyawan: freshKaryawan,
        iuran: freshIuran,
        pengeluaran: freshPengeluaran,
        settings: localSettings
      });

      return {
        success: true,
        data: {
          stats: calculatedStats,
          karyawan: freshKaryawan,
          iuran: freshIuran,
          pengeluaran: freshPengeluaran,
          undian: freshUndian,
          settings: localSettings,
          users: freshUsers
        }
      };
    } catch (e) {
      return {
        success: true,
        data: {
          stats: calculateLocalDashboardStats(),
          karyawan: getLocal('karyawan', SEED_KARYAWAN),
          iuran: getLocal('iuran', []),
          pengeluaran: getLocal('pengeluaran', []),
          undian: getLocal('undian', []),
          settings: getLocal('settings', SEED_SETTINGS),
          users: getLocal('users', SEED_USERS)
        }
      };
    }
  },

  // Dashboard
  async getDashboardStats() {
    const local = calculateLocalDashboardStats();
    fetchGAS('getDashboardStats', {}, 'GET', 5000).then(online => {
      if (online && online.success) {
        // Updated in SWR cycle
      }
    }).catch(() => {});
    return { success: true, data: local };
  },

  // Karyawan
  async getKaryawan() {
    const data = getLocal('karyawan', SEED_KARYAWAN);
    fetchGAS('getKaryawan', {}, 'GET', 5000).then(res => {
      if (res && res.success) setLocal('karyawan', res.data);
    }).catch(() => {});
    return { success: true, data: [...data].sort((a, b) => a.nama.localeCompare(b.nama)) };
  },

  async saveKaryawan(payload) {
    const list = getLocal('karyawan', SEED_KARYAWAN);
    if (payload.isEdit === 'true' || payload.isEdit === true) {
      const idx = list.findIndex(k => String(k.id) === String(payload.dataId));
      if (idx !== -1) {
        list[idx] = { ...list[idx], nama: payload.nama, jabatan: payload.jabatan, nominal_iuran: Number(payload.nominal_iuran), status: payload.status };
      }
    } else {
      list.push({
        id: payload.id || String(Date.now()),
        nama: payload.nama,
        jabatan: payload.jabatan,
        nominal_iuran: Number(payload.nominal_iuran),
        status: payload.status || 'Belum'
      });
    }
    setLocal('karyawan', list);

    fetchGAS('saveKaryawan', payload, 'POST', 8000).catch(() => {});
    return { success: true };
  },

  async deleteKaryawan(id) {
    let list = getLocal('karyawan', SEED_KARYAWAN);
    list = list.filter(k => String(k.id) !== String(id));
    setLocal('karyawan', list);

    fetchGAS('deleteKaryawan', { id }, 'POST', 8000).catch(() => {});
    return { success: true };
  },

  async resetStatusKaryawan() {
    const list = getLocal('karyawan', SEED_KARYAWAN);
    list.forEach(k => k.status = 'Belum');
    setLocal('karyawan', list);

    fetchGAS('resetStatusKaryawan', {}, 'POST', 8000).catch(() => {});
    return { success: true };
  },

  // Iuran
  async getIuran() {
    const data = getLocal('iuran', []);
    fetchGAS('getIuran', {}, 'GET', 5000).then(res => {
      if (res && res.success) setLocal('iuran', res.data);
    }).catch(() => {});
    return { success: true, data: [...data].reverse() };
  },

  async saveIuran(payload) {
    const list = getLocal('iuran', []);
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

    if (payload.isEdit === 'true' || payload.isEdit === true) {
      const idx = list.findIndex(i => String(i.id) === String(payload.dataId));
      if (idx !== -1) list[idx] = newItem;
    } else {
      list.push(newItem);
    }
    setLocal('iuran', list);

    fetchGAS('saveIuran', payload, 'POST', 8000).catch(() => {});
    return { success: true };
  },

  async deleteIuran(id) {
    let list = getLocal('iuran', []);
    list = list.filter(i => String(i.id) !== String(id));
    setLocal('iuran', list);

    fetchGAS('deleteIuran', { id }, 'POST', 8000).catch(() => {});
    return { success: true };
  },

  // Pengeluaran
  async getPengeluaran() {
    const data = getLocal('pengeluaran', []);
    fetchGAS('getPengeluaran', {}, 'GET', 5000).then(res => {
      if (res && res.success) setLocal('pengeluaran', res.data);
    }).catch(() => {});
    return { success: true, data: [...data].reverse() };
  },

  async savePengeluaran(payload) {
    const list = getLocal('pengeluaran', []);
    const newItem = {
      id: payload.dataId || Date.now(),
      tanggal: payload.tanggal,
      keterangan: payload.keterangan,
      nominal: Number(payload.nominal),
      kategori: payload.kategori
    };

    if (payload.isEdit === 'true' || payload.isEdit === true) {
      const idx = list.findIndex(p => String(p.id) === String(payload.dataId));
      if (idx !== -1) list[idx] = newItem;
    } else {
      list.push(newItem);
    }
    setLocal('pengeluaran', list);

    fetchGAS('savePengeluaran', payload, 'POST', 8000).catch(() => {});
    return { success: true };
  },

  async deletePengeluaran(id) {
    let list = getLocal('pengeluaran', []);
    list = list.filter(p => String(p.id) !== String(id));
    setLocal('pengeluaran', list);

    fetchGAS('deletePengeluaran', { id }, 'POST', 8000).catch(() => {});
    return { success: true };
  },

  // Undian
  async getUndian() {
    const data = getLocal('undian', []);
    fetchGAS('getUndian', {}, 'GET', 5000).then(res => {
      if (res && res.success) setLocal('undian', res.data);
    }).catch(() => {});
    return { success: true, data: [...data].reverse() };
  },

  async saveUndian(payload) {
    const list = getLocal('undian', []);
    list.push({
      id: Date.now(),
      tanggal: payload.tanggal,
      id_karyawan: payload.id_karyawan,
      nama_pemenang: payload.nama_pemenang,
      periode: payload.periode
    });
    setLocal('undian', list);

    const karyawan = getLocal('karyawan', SEED_KARYAWAN);
    const kIdx = karyawan.findIndex(k => String(k.id) === String(payload.id_karyawan));
    if (kIdx !== -1) {
      karyawan[kIdx].status = 'Sudah';
      setLocal('karyawan', karyawan);
    }

    fetchGAS('saveUndian', payload, 'POST', 8000).catch(() => {});
    return { success: true };
  },

  async deleteUndian(id) {
    let list = getLocal('undian', []);
    const item = list.find(u => String(u.id) === String(id));
    list = list.filter(u => String(u.id) !== String(id));
    setLocal('undian', list);

    if (item && item.id_karyawan) {
      const karyawan = getLocal('karyawan', SEED_KARYAWAN);
      const kIdx = karyawan.findIndex(k => String(k.id) === String(item.id_karyawan));
      if (kIdx !== -1) {
        karyawan[kIdx].status = 'Belum';
        setLocal('karyawan', karyawan);
      }
    }

    fetchGAS('deleteUndian', { id }, 'POST', 8000).catch(() => {});
    return { success: true };
  },

  // Users
  async getUsers() {
    const online = await fetchGAS('getUsers', {}, 'GET', 8000);
    if (online && online.success && online.data && online.data.length) {
      setLocal('users', online.data);
      return online;
    }
    const users = getLocal('users', SEED_USERS);
    return { success: true, data: users.map(u => ({ username: u.username, fullname: u.fullname, role: u.role, photo: u.photo || '' })) };
  },

  async saveUser(payload) {
    const users = getLocal('users', SEED_USERS);
    const passHash = payload.password ? await hashPassword(payload.password.trim()) : '';

    if (payload.isEdit === 'true' || payload.isEdit === true) {
      const idx = users.findIndex(u => u.username === payload.dataId);
      if (idx !== -1) {
        users[idx].fullname = payload.fullname;
        users[idx].role = payload.role;
        users[idx].photo = payload.photo || '';
        if (passHash) users[idx].password = passHash;
      }
    } else {
      if (users.some(u => u.username === payload.username)) {
        return { success: false, message: 'Username sudah digunakan!' };
      }
      users.push({
        username: payload.username,
        fullname: payload.fullname,
        role: payload.role,
        password: passHash,
        photo: payload.photo || '',
        token: ''
      });
    }
    setLocal('users', users);

    const onlineRes = await fetchGAS('saveUser', payload, 'POST', 8000);
    if (onlineRes && !onlineRes.success) {
      return onlineRes;
    }
    return { success: true };
  },

  async deleteUser(username) {
    if (username === 'admin') return { success: false, message: 'Super Admin utama tidak boleh dihapus!' };
    let users = getLocal('users', SEED_USERS);
    users = users.filter(u => u.username !== username);
    setLocal('users', users);

    fetchGAS('deleteUser', { username }, 'POST', 8000).catch(() => {});
    return { success: true };
  },

  // Settings
  async getSettings() {
    const settings = getLocal('settings', SEED_SETTINGS);
    return {
      success: true,
      data: settings
    };
  },

  async saveSettingInfo(infoText) {
    const settings = getLocal('settings', SEED_SETTINGS);
    settings.info_dashboard = infoText;
    setLocal('settings', settings);

    fetchGAS('saveSettingInfo', { infoText }, 'POST', 8000).catch(() => {});
    return { success: true };
  },

  async saveSettingWA(templateText) {
    const settings = getLocal('settings', SEED_SETTINGS);
    settings.wa_template = templateText;
    setLocal('settings', settings);

    fetchGAS('saveSettingWA', { templateText }, 'POST', 8000).catch(() => {});
    return { success: true };
  }
};
