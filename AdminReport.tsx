import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, LogOut, Pencil } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useOrders, mergeRemoteOrders, logoutSession } from '../lib/store';
import { fetchOrders } from '../lib/api';
import { formatIDR } from '../lib/format';
import { buildReport } from '../lib/report';
import { useHpp, HPP_KEYS } from '../lib/hpp';
import type { Product } from '../lib/types';

export default function AdminReport() {
  const { orders } = useOrders();
  const { hpp, setHpp } = useHpp();
  const navigate = useNavigate();
  const [editing, setEditing] = useState<Product | null>(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    fetchOrders().then((remote) => {
      if (remote) mergeRemoteOrders(remote);
    });
  }, []);

  const report = useMemo(() => buildReport(orders, hpp), [orders, hpp]);

  const saveHpp = () => {
    if (editing) {
      const n = parseInt(draft.replace(/\D/g, ''), 10);
      setHpp(editing, isNaN(n) ? 0 : n);
      setEditing(null);
    }
  };

  const stats = [
    { label: 'Omzet (dibayar)', value: formatIDR(report.omzet) },
    { label: 'Transaksi berhasil', value: String(report.successCount) },
    { label: 'Total HPP', value: formatIDR(report.totalHpp) },
    { label: 'Laba kotor', value: formatIDR(report.grossProfit) },
    { label: 'Cup Original terjual', value: String(report.soldOriginal) },
    { label: 'Cup Tiramisu terjual', value: String(report.soldTiramisu) },
  ];

  return (
    <div className="min-h-screen bg-amber-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')} className="p-2 hover:bg-amber-50 rounded-lg">
              <ArrowLeft size={18} />
            </button>
            <h1 className="font-bold text-amber-900 flex items-center gap-2">
              <BarChart3 size={18} /> Laporan Penjualan
            </h1>
          </div>
          <button
            onClick={() => {
              logoutSession();
              navigate('/login');
            }}
            className="text-sm text-amber-700 hover:underline flex items-center gap-1"
          >
            <LogOut size={14} /> Keluar
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-amber-600">{s.label}</p>
              <p className="text-lg font-bold text-amber-900">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-amber-900 mb-3">HPP per Produk (diisi admin)</h2>
          <div className="space-y-2">
            {HPP_KEYS.map((p) => (
              <div key={p} className="flex items-center justify-between bg-amber-50 rounded-xl px-4 py-3">
                <span className="text-sm text-amber-900">{p}</span>
                {editing === p ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveHpp()}
                      className="border border-amber-300 rounded-lg px-2 py-1 text-sm w-32 text-right"
                      placeholder="0"
                    />
                    <button onClick={saveHpp} className="text-sm bg-amber-600 text-white rounded-lg px-3 py-1">
                      Simpan
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditing(p); setDraft(String(hpp[p] ?? '')); }}
                    className="text-sm text-amber-700 hover:underline flex items-center gap-1"
                  >
                    {formatIDR(hpp[p] ?? 0)} <Pencil size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-amber-900 mb-3">Tren Penjualan Harian</h2>
          {report.daily.length === 0 ? (
            <p className="text-sm text-amber-600 py-6 text-center">Belum ada penjualan.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fde68a" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000)}rb`} />
                  <Tooltip formatter={(v: number) => formatIDR(v)} />
                  <Bar dataKey="omzet" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Omzet" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <h2 className="font-bold text-amber-900 p-4 pb-2">Rekap Harian</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-amber-50 text-amber-800">
                <tr>
                  <th className="text-left px-4 py-2">Tanggal</th>
                  <th className="text-right px-4 py-2">Pesanan</th>
                  <th className="text-right px-4 py-2">Original</th>
                  <th className="text-right px-4 py-2">Tiramisu</th>
                  <th className="text-right px-4 py-2">Omzet</th>
                </tr>
              </thead>
              <tbody>
                {report.daily.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-amber-600">Belum ada data.</td></tr>
                ) : (
                  report.daily.map((d) => (
                    <tr key={d.date} className="border-t border-amber-100">
                      <td className="px-4 py-2">{d.date}</td>
                      <td className="px-4 py-2 text-right">{d.orders}</td>
                      <td className="px-4 py-2 text-right">{d.original}</td>
                      <td className="px-4 py-2 text-right">{d.tiramisu}</td>
                      <td className="px-4 py-2 text-right font-semibold">{formatIDR(d.omzet)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <h2 className="font-bold text-amber-900 p-4 pb-2">Rekap Bulanan</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-amber-50 text-amber-800">
                <tr>
                  <th className="text-left px-4 py-2">Bulan</th>
                  <th className="text-right px-4 py-2">Pesanan</th>
                  <th className="text-right px-4 py-2">Original</th>
                  <th className="text-right px-4 py-2">Tiramisu</th>
                  <th className="text-right px-4 py-2">Omzet</th>
                </tr>
              </thead>
              <tbody>
                {report.monthly.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-amber-600">Belum ada data.</td></tr>
                ) : (
                  report.monthly.map((m) => (
                    <tr key={m.month} className="border-t border-amber-100">
                      <td className="px-4 py-2">{m.month}</td>
                      <td className="px-4 py-2 text-right">{m.orders}</td>
                      <td className="px-4 py-2 text-right">{m.original}</td>
                      <td className="px-4 py-2 text-right">{m.tiramisu}</td>
                      <td className="px-4 py-2 text-right font-semibold">{formatIDR(m.omzet)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
