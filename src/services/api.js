// API Service: Handles communication with Google Apps Script Web App or local persistent fallback

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
const SEED_USERS = [
  { username: 'admin', fullname: 'Super Admin', role: 'Superadmin', photo: '', token: '' },
  { username: 'bendahara', fullname: 'Bendahara Keuangan', role: 'Bendahara', photo: '', token: '' }
];

const SEED_KARYAWAN = [
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

const SEED_SETTINGS = {
  info_dashboard: 'Selamat datang di sistem E-Anjangsana UPTD Puskesmas Cermee. Silakan cek tunggakan iuran dan undian tuan rumah.',
  wa_template: `*PEMBERITAHUAN IURAN ANJANGSANA*
UPTD Puskesmas Cermee

Yth. Bapak/Ibu Anggota Anjangsana,
Berikut daftar anggota yang belum menyelesaikan iuran anjangsana bulan ini:

[DAFTAR_NAMA]

Mohon untuk segera melakukan pembayaran via Tunai kepada Bendahara atau via Transfer.
Terima kasih.`
};

// Local storage helper functions
function getLocal(key, fallback) {
  try {
    const raw = localStorage.getItem('anjangsana_' + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setLocal(key, value) {
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

// Generic Fetch to Google Apps Script
async function fetchGAS(action, params = {}, method = 'GET') {
  const currentUrl = localStorage.getItem('anjangsana_gas_url') || GAS_URL;
  if (!currentUrl) {
    return null; // Will trigger local fallback
  }

  try {
    if (method === 'GET') {
      const url = new URL(currentUrl);
      url.searchParams.set('action', action);
      Object.keys(params).forEach(k => url.searchParams.set(k, params[k]));

      const resp = await fetch(url.toString(), {
        method: 'GET',
        redirect: 'follow'
      });
      return await resp.json();
    } else {
      // POST
      const resp = await fetch(currentUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // avoids preflight CORS on GAS
        body: JSON.stringify({ action, ...params }),
        redirect: 'follow'
      });
      return await resp.json();
    }
  } catch (error) {
    console.warn(`[GAS Fetch Error for ${action}]:`, error);
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

  // Auth
  async login(username, password) {
    const online = await fetchGAS('login', { username, password }, 'POST');
    if (online) return online;

    // Fallback Offline/Mock
    const passHash = await hashPassword(password);
    const users = getLocal('users', SEED_USERS);
    const user = users.find(u => u.username === username);

    // Default password Demo2026! check
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
    return { success: false, message: 'Username atau Password salah! (Default: admin / Demo2026!)' };
  },

  async logout(username) {
    const online = await fetchGAS('logout', { username }, 'POST');
    if (online) return online;
    return { success: true };
  },

  // Dashboard
  async getDashboardStats() {
    const online = await fetchGAS('getDashboardStats', {}, 'GET');
    if (online && online.success) return online;

    // Local calculation
    const karyawan = getLocal('karyawan', SEED_KARYAWAN);
    const iuran = getLocal('iuran', []);
    const pengeluaran = getLocal('pengeluaran', []);
    const settings = getLocal('settings', SEED_SETTINGS);

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
          iuranBulanIniMap[i.id_karyawan] = (iuranBulanIniMap[i.id_karyawan] || 0) + Number(i.nominal || 0);
          totalIuranBulanIni += Number(i.nominal || 0);

          const jab = mapKar[i.id_karyawan];
          if (jab === 'PNS') totalPNS += Number(i.nominal || 0);
          else if (jab === 'P3K') totalP3K += Number(i.nominal || 0);
          else if (jab === 'P3KPWD') totalP3KPWD += Number(i.nominal || 0);
          else if (jab === 'P3KPW') totalP3KPW += Number(i.nominal || 0);
          else totalLainnya += Number(i.nominal || 0);
        }
      }
    });

    let pengeluaranBulanIni = 0;
    let totalPengeluaranLatest = 0;
    let namaBulanPengeluaran = "Belum Ada";

    if (pengeluaran.length > 0) {
      let latestDate = "0000-00-00";
      pengeluaran.forEach(p => {
        if (p.tanggal && p.tanggal > latestDate) latestDate = p.tanggal;
      });

      if (latestDate !== "0000-00-00") {
        const expY = latestDate.substring(0, 4);
        const expM = latestDate.substring(5, 7);
        const mIdx = parseInt(expM, 10) - 1;
        if (mIdx >= 0 && mIdx < 12) {
          namaBulanPengeluaran = namaBulanIndo[mIdx] + (expY !== curYear ? " " + expY : "");
        }
        pengeluaran.forEach(p => {
          if (p.tanggal && p.tanggal.length >= 7) {
            const pY = p.tanggal.substring(0, 4);
            const pM = p.tanggal.substring(5, 7);
            if (pY === expY && pM === expM) totalPengeluaranLatest += Number(p.nominal || 0);
            if (pY === curYear && pM === curMonth) pengeluaranBulanIni += Number(p.nominal || 0);
          }
        });
      }
    }

    const aktivitas = [];
    iuran.forEach(i => aktivitas.push({ id: i.id, tgl: i.tanggal, keterangan: 'Pembayaran Iuran - ' + (i.nama_karyawan || 'Anggota'), nominal: Number(i.nominal || 0), status: 'Masuk' }));
    pengeluaran.forEach(p => aktivitas.push({ id: p.id, tgl: p.tanggal, keterangan: 'Biaya ' + p.keterangan, nominal: Number(p.nominal || 0), status: 'Keluar' }));
    aktivitas.sort((a, b) => new Date(b.tgl) - new Date(a.tgl));

    const belumBayarList = [];
    karyawan.forEach(k => {
      if (!iuranBulanIniMap[k.id] || iuranBulanIniMap[k.id] <= 0) {
        belumBayarList.push({ nama: k.nama });
      }
    });
    belumBayarList.sort((a, b) => a.nama.localeCompare(b.nama));

    return {
      success: true,
      data: {
        belumBayarList,
        totalPNS,
        totalP3K,
        totalP3KPWD,
        totalP3KPW,
        totalLainnya,
        totalIuran: totalIuranBulanIni,
        totalPengeluaran: totalPengeluaranLatest,
        saldo: totalIuranBulanIni - pengeluaranBulanIni,
        belumGiliran,
        aktivitas,
        info: settings.info_dashboard || "Selamat datang di E-Anjangsana!",
        wa_template: settings.wa_template || "",
        bulanAktif: namaBulanAktif,
        bulanPengeluaran: namaBulanPengeluaran
      }
    };
  },

  // Karyawan
  async getKaryawan() {
    const online = await fetchGAS('getKaryawan', {}, 'GET');
    if (online && online.success) return online;
    const data = getLocal('karyawan', SEED_KARYAWAN);
    return { success: true, data: data.sort((a, b) => a.nama.localeCompare(b.nama)) };
  },

  async saveKaryawan(payload) {
    const online = await fetchGAS('saveKaryawan', payload, 'POST');
    if (online) return online;

    const list = getLocal('karyawan', SEED_KARYAWAN);
    if (payload.isEdit === 'true' || payload.isEdit === true) {
      const idx = list.findIndex(k => String(k.id) === String(payload.dataId));
      if (idx !== -1) {
        list[idx] = { ...list[idx], nama: payload.nama, jabatan: payload.jabatan, nominal_iuran: payload.nominal_iuran, status: payload.status };
      }
    } else {
      list.push({
        id: String(Date.now()),
        nama: payload.nama,
        jabatan: payload.jabatan,
        nominal_iuran: Number(payload.nominal_iuran),
        status: payload.status || 'Belum'
      });
    }
    setLocal('karyawan', list);
    return { success: true };
  },

  async deleteKaryawan(id) {
    const online = await fetchGAS('deleteKaryawan', { id }, 'POST');
    if (online) return online;
    let list = getLocal('karyawan', SEED_KARYAWAN);
    list = list.filter(k => String(k.id) !== String(id));
    setLocal('karyawan', list);
    return { success: true };
  },

  async resetStatusKaryawan() {
    const online = await fetchGAS('resetStatusKaryawan', {}, 'POST');
    if (online) return online;
    const list = getLocal('karyawan', SEED_KARYAWAN);
    list.forEach(k => k.status = 'Belum');
    setLocal('karyawan', list);
    return { success: true };
  },

  // Iuran
  async getIuran() {
    const online = await fetchGAS('getIuran', {}, 'GET');
    if (online && online.success) return online;
    const data = getLocal('iuran', []);
    return { success: true, data: [...data].reverse() };
  },

  async saveIuran(payload) {
    const online = await fetchGAS('saveIuran', payload, 'POST');
    if (online) return online;

    const list = getLocal('iuran', []);
    if (payload.isEdit === 'true' || payload.isEdit === true) {
      const idx = list.findIndex(i => String(i.id) === String(payload.dataId));
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          tanggal: payload.tanggal,
          id_karyawan: payload.id_karyawan,
          nama_karyawan: payload.nama_karyawan,
          periode: payload.periode,
          nominal: Number(payload.nominal),
          metode_pembayaran: payload.metode_pembayaran,
          uang_diterima: Number(payload.uang_diterima),
          kembalian: Number(payload.kembalian)
        };
      }
    } else {
      list.push({
        id: Date.now(),
        tanggal: payload.tanggal,
        id_karyawan: payload.id_karyawan,
        nama_karyawan: payload.nama_karyawan,
        periode: payload.periode,
        nominal: Number(payload.nominal),
        metode_pembayaran: payload.metode_pembayaran,
        uang_diterima: Number(payload.uang_diterima),
        kembalian: Number(payload.kembalian)
      });
    }
    setLocal('iuran', list);
    return { success: true };
  },

  async deleteIuran(id) {
    const online = await fetchGAS('deleteIuran', { id }, 'POST');
    if (online) return online;
    let list = getLocal('iuran', []);
    list = list.filter(i => String(i.id) !== String(id));
    setLocal('iuran', list);
    return { success: true };
  },

  // Pengeluaran
  async getPengeluaran() {
    const online = await fetchGAS('getPengeluaran', {}, 'GET');
    if (online && online.success) return online;
    const data = getLocal('pengeluaran', []);
    return { success: true, data: [...data].reverse() };
  },

  async savePengeluaran(payload) {
    const online = await fetchGAS('savePengeluaran', payload, 'POST');
    if (online) return online;

    const list = getLocal('pengeluaran', []);
    if (payload.isEdit === 'true' || payload.isEdit === true) {
      const idx = list.findIndex(p => String(p.id) === String(payload.dataId));
      if (idx !== -1) {
        list[idx] = {
          ...list[idx],
          tanggal: payload.tanggal,
          keterangan: payload.keterangan,
          nominal: Number(payload.nominal),
          kategori: payload.kategori
        };
      }
    } else {
      list.push({
        id: Date.now(),
        tanggal: payload.tanggal,
        keterangan: payload.keterangan,
        nominal: Number(payload.nominal),
        kategori: payload.kategori
      });
    }
    setLocal('pengeluaran', list);
    return { success: true };
  },

  async deletePengeluaran(id) {
    const online = await fetchGAS('deletePengeluaran', { id }, 'POST');
    if (online) return online;
    let list = getLocal('pengeluaran', []);
    list = list.filter(p => String(p.id) !== String(id));
    setLocal('pengeluaran', list);
    return { success: true };
  },

  // Undian
  async getUndian() {
    const online = await fetchGAS('getUndian', {}, 'GET');
    if (online && online.success) return online;
    const data = getLocal('undian', []);
    return { success: true, data: [...data].reverse() };
  },

  async saveUndian(payload) {
    const online = await fetchGAS('saveUndian', payload, 'POST');
    if (online) return online;

    const list = getLocal('undian', []);
    list.push({
      id: Date.now(),
      tanggal: payload.tanggal,
      id_karyawan: payload.id_karyawan,
      nama_pemenang: payload.nama_pemenang,
      periode: payload.periode
    });
    setLocal('undian', list);

    // Update status karyawan to 'Sudah'
    const karyawan = getLocal('karyawan', SEED_KARYAWAN);
    const kIdx = karyawan.findIndex(k => String(k.id) === String(payload.id_karyawan));
    if (kIdx !== -1) {
      karyawan[kIdx].status = 'Sudah';
      setLocal('karyawan', karyawan);
    }

    return { success: true };
  },

  async deleteUndian(id) {
    const online = await fetchGAS('deleteUndian', { id }, 'POST');
    if (online) return online;

    let list = getLocal('undian', []);
    const item = list.find(u => String(u.id) === String(id));
    list = list.filter(u => String(u.id) !== String(id));
    setLocal('undian', list);

    // Rollback status karyawan to 'Belum'
    if (item && item.id_karyawan) {
      const karyawan = getLocal('karyawan', SEED_KARYAWAN);
      const kIdx = karyawan.findIndex(k => String(k.id) === String(item.id_karyawan));
      if (kIdx !== -1) {
        karyawan[kIdx].status = 'Belum';
        setLocal('karyawan', karyawan);
      }
    }

    return { success: true };
  },

  // Users
  async getUsers() {
    const online = await fetchGAS('getUsers', {}, 'GET');
    if (online && online.success) return online;
    const users = getLocal('users', SEED_USERS);
    return { success: true, data: users.map(u => ({ username: u.username, fullname: u.fullname, role: u.role, photo: u.photo || '' })) };
  },

  async saveUser(payload) {
    const online = await fetchGAS('saveUser', payload, 'POST');
    if (online) return online;

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
    return { success: true };
  },

  async deleteUser(username) {
    if (username === 'admin') return { success: false, message: 'Super Admin utama tidak boleh dihapus!' };
    const online = await fetchGAS('deleteUser', { username }, 'POST');
    if (online) return online;
    let users = getLocal('users', SEED_USERS);
    users = users.filter(u => u.username !== username);
    setLocal('users', users);
    return { success: true };
  },

  // Settings
  async getSettings() {
    const onlineInfo = await fetchGAS('getDashboardStats', {}, 'GET');
    const onlineWa = await fetchGAS('getWaTemplate', {}, 'GET');

    const settings = getLocal('settings', SEED_SETTINGS);
    return {
      success: true,
      data: {
        info_dashboard: onlineInfo?.data?.info || settings.info_dashboard,
        wa_template: onlineWa?.data || settings.wa_template
      }
    };
  },

  async saveSettingInfo(infoText) {
    const online = await fetchGAS('saveSettingInfo', { infoText }, 'POST');
    if (online) return online;
    const settings = getLocal('settings', SEED_SETTINGS);
    settings.info_dashboard = infoText;
    setLocal('settings', settings);
    return { success: true };
  },

  async saveSettingWA(templateText) {
    const online = await fetchGAS('saveSettingWA', { templateText }, 'POST');
    if (online) return online;
    const settings = getLocal('settings', SEED_SETTINGS);
    settings.wa_template = templateText;
    setLocal('settings', settings);
    return { success: true };
  }
};
