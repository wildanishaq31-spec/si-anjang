import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Share2,
  Filter,
  Send,
  Calendar,
  DollarSign,
  AlertCircle,
  Copy,
  Check,
  X
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

export default function Rekap({ iuranList, karyawanList, waTemplate, loading }) {
  const [filterBulan, setFilterBulan] = useState(() => {
    const m = String(new Date().getMonth() + 1).padStart(2, '0');
    return m;
  });

  const [filterTahun, setFilterTahun] = useState(() => {
    return String(new Date().getFullYear());
  });

  const [modalWa, setModalWa] = useState(false);
  const [copied, setCopied] = useState(false);

  const namaBulanIndo = {
    '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April',
    '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Agustus',
    '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember'
  };

  const formatRp = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num || 0);
  };

  // Process rows per employee
  const rekapData = useMemo(() => {
    // Map employee IDs to their cash & transfer totals in selected period
    const map = {};
    (karyawanList || []).forEach(k => {
      map[k.id] = {
        id: k.id,
        nama: k.nama,
        jabatan: k.jabatan,
        cash: 0,
        transfer: 0
      };
    });

    (iuranList || []).forEach(i => {
      const tgl = String(i.tanggal || '');
      if (tgl.length >= 7) {
        const y = tgl.substring(0, 4);
        const m = tgl.substring(5, 7);

        const matchYear = filterTahun === 'Semua' || y === filterTahun;
        const matchMonth = filterBulan === 'Semua' || m === filterBulan;

        if (matchYear && matchMonth) {
          const kId = String(i.id_karyawan);
          if (map[kId]) {
            const nom = parseFloat(i.nominal) || 0;
            const isCash = (i.metode_pembayaran || '').toLowerCase().includes('cash') ||
                           (i.metode_pembayaran || '').toLowerCase().includes('tunai');
            if (isCash) {
              map[kId].cash += nom;
            } else {
              map[kId].transfer += nom;
            }
          }
        }
      }
    });

    return Object.values(map).sort((a, b) => a.nama.localeCompare(b.nama));
  }, [karyawanList, iuranList, filterBulan, filterTahun]);

  // Calculations
  const totalCash = rekapData.reduce((acc, r) => acc + r.cash, 0);
  const totalTransfer = rekapData.reduce((acc, r) => acc + r.transfer, 0);
  const grandTotal = totalCash + totalTransfer;

  // Unpaid list in this filter
  const unpaidMembers = useMemo(() => {
    return rekapData.filter(r => (r.cash + r.transfer) === 0);
  }, [rekapData]);

  // Export Excel
  const handleExportExcel = () => {
    const periodLabel = filterBulan === 'Semua'
      ? `Semua Bulan ${filterTahun}`
      : `${namaBulanIndo[filterBulan]} ${filterTahun}`;

    const rows = rekapData.map((r, idx) => ({
      'No': idx + 1,
      'Nama Karyawan': r.nama,
      'Jabatan': r.jabatan,
      'Cash / Tunai (Rp)': r.cash,
      'Transfer (Rp)': r.transfer,
      'Total (Rp)': r.cash + r.transfer,
      'Status': (r.cash + r.transfer) > 0 ? 'LUNAS' : 'BELUM BAYAR'
    }));

    // Add Total Row
    rows.push({
      'No': '',
      'Nama Karyawan': 'TOTAL KESELURUHAN',
      'Jabatan': '',
      'Cash / Tunai (Rp)': totalCash,
      'Transfer (Rp)': totalTransfer,
      'Total (Rp)': grandTotal,
      'Status': ''
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap_Iuran');
    XLSX.writeFile(wb, `Rekap_Iuran_${periodLabel.replace(/\s+/g, '_')}.xlsx`);

    Swal.fire({
      icon: 'success',
      title: 'File Excel Diunduh',
      text: `Rekap_${periodLabel}.xlsx berhasil disimpan.`,
      timer: 1500,
      showConfirmButton: false
    });
  };

  // Generate WA Blast text
  const generatedWaText = useMemo(() => {
    const listStr = unpaidMembers.length === 0
      ? '(Tidak ada - semua anggota telah lunas)'
      : unpaidMembers.map((u, i) => `${i + 1}. ${u.nama} (${u.jabatan})`).join('\n');

    const defaultTpl = `*PEMBERITAHUAN IURAN ANJANGSANA*
UPTD Puskesmas Cermee

Berikut daftar anggota yang belum menyelesaikan iuran anjangsana:

[DAFTAR_NAMA]

Mohon untuk segera melakukan pembayaran tunai atau transfer. Terima kasih.`;

    const rawTpl = waTemplate || defaultTpl;
    return rawTpl.replace('[DAFTAR_NAMA]', listStr);
  }, [unpaidMembers, waTemplate]);

  const handleCopyWa = () => {
    navigator.clipboard.writeText(generatedWaText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWaWeb = () => {
    const encoded = encodeURIComponent(generatedWaText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Rekapitulasi Iuran</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Laporan rekap pembayaran cash & transfer seluruh anggota
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Excel</span>
          </button>

          <button
            onClick={() => setModalWa(true)}
            className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow-md shadow-green-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>WA Blast ({unpaidMembers.length})</span>
          </button>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Filter Bulan
          </label>
          <select
            value={filterBulan}
            onChange={(e) => setFilterBulan(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="Semua">Semua Bulan</option>
            <option value="01">Januari</option>
            <option value="02">Februari</option>
            <option value="03">Maret</option>
            <option value="04">April</option>
            <option value="05">Mei</option>
            <option value="06">Juni</option>
            <option value="07">Juli</option>
            <option value="08">Agustus</option>
            <option value="09">September</option>
            <option value="10">Oktober</option>
            <option value="11">November</option>
            <option value="12">Desember</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Filter Tahun
          </label>
          <select
            value={filterTahun}
            onChange={(e) => setFilterTahun(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="Semua">Semua Tahun</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
            <option value="2028">2028</option>
            <option value="2029">2029</option>
            <option value="2030">2030</option>
          </select>
        </div>

        <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-4 p-2 bg-blue-50/60 rounded-xl border border-blue-100">
          <div className="text-right">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Total Terkumpul</span>
            <span className="text-lg font-extrabold text-blue-900">{formatRp(grandTotal)}</span>
          </div>
          <div className="text-right pl-4 border-l border-blue-200/80">
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Belum Bayar</span>
            <span className="text-lg font-extrabold text-rose-600">{unpaidMembers.length} Orang</span>
          </div>
        </div>
      </div>

      {/* Rekap Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 shadow-xs">
              <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4 text-center w-12 bg-slate-50">No</th>
                <th className="py-3.5 px-4 bg-slate-50">Nama Karyawan</th>
                <th className="py-3.5 px-4 bg-slate-50">Jabatan</th>
                <th className="py-3.5 px-4 text-right bg-slate-50">Cash / Tunai</th>
                <th className="py-3.5 px-4 text-right bg-slate-50">Transfer</th>
                <th className="py-3.5 px-4 text-right bg-slate-50">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {rekapData.map((r, idx) => {
                const totalItem = r.cash + r.transfer;
                const isUnpaid = totalItem === 0;

                return (
                  <tr key={r.id} className={`hover:bg-slate-50/60 transition-colors ${isUnpaid ? 'bg-rose-50/30' : ''}`}>
                    <td className="py-3 px-4 text-center text-slate-400 font-bold">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {r.nama}
                      {isUnpaid && (
                        <span className="ml-2 text-[10px] font-extrabold text-rose-500 bg-rose-100 px-1.5 py-0.5 rounded-sm">
                          Belum
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-semibold">{r.jabatan}</td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">
                      {r.cash > 0 ? formatRp(r.cash) : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-blue-600">
                      {r.transfer > 0 ? formatRp(r.transfer) : '-'}
                    </td>
                    <td className={`py-3 px-4 text-right font-extrabold ${isUnpaid ? 'text-slate-300' : 'text-slate-900'}`}>
                      {formatRp(totalItem)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="sticky bottom-0 z-10 bg-slate-900 text-white font-extrabold text-xs shadow-lg">
              <tr>
                <td colSpan="3" className="py-4 px-4 text-right uppercase tracking-wider text-slate-300">
                  TOTAL KESELURUHAN
                </td>
                <td className="py-4 px-4 text-right text-emerald-300">{formatRp(totalCash)}</td>
                <td className="py-4 px-4 text-right text-blue-300">{formatRp(totalTransfer)}</td>
                <td className="py-4 px-4 text-right text-amber-300 text-sm">{formatRp(grandTotal)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* WA Blast Modal */}
      {modalWa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">WhatsApp Blast Tagihan</h3>
                  <p className="text-xs text-slate-400 font-medium">Kirim tagihan ke grup anjangsana</p>
                </div>
              </div>

              <button
                onClick={() => setModalWa(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600">
                  Anggota Belum Bayar: <span className="text-rose-600">{unpaidMembers.length} Orang</span>
                </span>
                <button
                  onClick={handleCopyWa}
                  className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Pesan'}</span>
                </button>
              </div>

              <textarea
                value={generatedWaText}
                readOnly
                rows={10}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-800 leading-relaxed focus:outline-none"
              />

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalWa(false)}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleOpenWaWeb}
                  className="w-2/3 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-md shadow-green-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim ke WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
