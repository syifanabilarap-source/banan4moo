import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, LogOut, RefreshCw } from 'lucide-react';
import { useOrders, mergeRemoteOrders, logoutSession } from '../lib/store';
import { fetchOrders, updateRemoteOrder } from '../lib/api';
import { formatIDR, dateTime } from '../lib/format';
import type { Order, PaymentStatus, OrderStatus } from '../lib/types';

const PAYMENT_STATUSES: PaymentStatus[] = ['Menunggu', 'Dibayar', 'Dibatalkan'];
const ORDER_STATUSES: OrderStatus[] = ['Diproses', 'Dikemas', 'Siap Diambil', 'Dikirim', 'Selesai', 'Dibatalkan'];

export default function AdminOrders() {
  const { orders, updateOrder } = useOrders();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Order | null>(null);
  const [syncing, setSyncing] = useState(false);

  const syncFromSheets = useCallback(async () => {
    setSyncing(true);
    const remote = await fetchOrders();
    if (remote) {
      mergeRemoteOrders(remote);
    }
    setSyncing(false);
  }, []);

  useEffect(() => {
    syncFromSheets();
    const timer = setInterval(syncFromSheets, 15000);
    return () => clearInterval(timer);
  }, [syncFromSheets]);

  const handleStatusChange = async (
    id: string,
    patch: Partial<Pick<Order, 'paymentStatus' | 'orderStatus'>>
  ) => {
    updateOrder(id, patch);
    await updateRemoteOrder(id, patch);
  };

  const sorted = useMemo(
    () => [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [orders]
  );

  const laporan = useMemo(() => {
    const bayar: Record<string, number> = { Menunggu: 0, Dibayar: 0, Dibatalkan: 0 };
    const status: Record<string, number> = {};
    ORDER_STATUSES.forEach((s) => (status[s] = 0));
    const cup: Record<string, number> = {
      'Original|Kecil': 0,
      'Original|Besar': 0,
      'Tiramisu|Kecil': 0,
      'Tiramisu|Besar': 0,
    };
    for (const o of orders) {
      bayar[o.paymentStatus] = (bayar[o.paymentStatus] ?? 0) + 1;
      status[o.orderStatus] = (status[o.orderStatus] ?? 0) + 1;
      for (const it of o.items) {
        const key = `${it.product}|${it.size}`;
        cup[key] = (cup[key] ?? 0) + it.qty;
      }
    }
    return { bayar, status, cup };
  }, [orders]);

  const badge = (s: string) => {
    if (s === 'Dibayar' || s === 'Selesai') return 'bg-green-100 text-green-700';
    if (s === 'Dibatalkan') return 'bg-red-100 text-red-700';
    if (s === 'Menunggu') return 'bg-yellow-100 text-yellow-700';
    return 'bg-amber-100 text-amber-700';
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')} className="p-2 hover:bg-amber-50 rounded-lg">
              <ArrowLeft size={18} />
            </button>
            <h1 className="font-bold text-amber-900 flex items-center gap-2">
              <ClipboardList size={18} /> Pesanan Masuk
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={syncFromSheets}
              disabled={syncing}
              className="text-xs bg-amber-100 text-amber-800 hover:bg-amber-200 px-3 py-1.5 rounded-full flex items-center gap-1"
            >
              <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Sinkronisasi...' : 'Segarkan'}
            </button>
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
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-6">
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-amber-600">Total pesanan masuk</p>
            <p className="text-lg font-bold text-amber-900">{orders.length}</p>
          </div>
          {(['Menunggu', 'Dibayar', 'Dibatalkan'] as PaymentStatus[]).map((s) => (
            <div key={s} className="bg-white rounded-2xl p-4 shadow-sm">
              <p className="text-xs text-amber-600">Pembayaran {s}</p>
              <p className="text-lg font-bold text-amber-900">{laporan.bayar[s] ?? 0}</p>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-amber-900 mb-3">Status Pesanan</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {ORDER_STATUSES.map((s) => (
              <div key={s} className="flex items-center justify-between bg-amber-50 rounded-xl px-4 py-2">
                <span className="text-sm text-amber-800">{s}</span>
                <span className="text-sm font-bold text-amber-900">{laporan.status[s] ?? 0}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-amber-900 mb-3">Cup Terjual</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(['Original|Kecil', 'Original|Besar', 'Tiramisu|Kecil', 'Tiramisu|Besar'] as const).map((k) => {
              const [produk, ukuran] = k.split('|');
              return (
                <div key={k} className="bg-amber-50 rounded-xl px-4 py-3 text-center">
                  <p className="text-xs text-amber-700">{produk} — Cup {ukuran}</p>
                  <p className="text-lg font-bold text-amber-900">{laporan.cup[k] ?? 0}</p>
                </div>
              );
            })}
          </div>
        </section>

        {sorted.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center text-amber-700">
            {syncing ? 'Memuat data dari Google Sheets...' : 'Belum ada pesanan.'}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-amber-50 text-amber-800">
                  <tr>
                    <th className="text-left px-4 py-3">ID</th>
                    <th className="text-left px-4 py-3">Tanggal</th>
                    <th className="text-left px-4 py-3">Nama</th>
                    <th className="text-left px-4 py-3">WhatsApp</th>
                    <th className="text-right px-4 py-3">Total</th>
                    <th className="text-left px-4 py-3">Pembayaran</th>
                    <th className="text-left px-4 py-3">Pesanan</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((o) => (
                    <tr key={o.id} className="border-t border-amber-100 hover:bg-amber-50/50">
                      <td className="px-4 py-3 font-mono text-xs">{o.id}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{dateTime(o.createdAt)}</td>
                      <td className="px-4 py-3">{o.customerName}</td>
                      <td className="px-4 py-3">{o.whatsapp}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatIDR(o.totalPembayaran ?? o.total)}</td>
                      <td className="px-4 py-3">
                        <select
                          value={o.paymentStatus}
                          onChange={(e) => handleStatusChange(o.id, { paymentStatus: e.target.value as PaymentStatus })}
                          className={`rounded-full px-2 py-1 text-xs font-medium border-0 ${badge(o.paymentStatus)}`}
                        >
                          {PAYMENT_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={o.orderStatus}
                          onChange={(e) => handleStatusChange(o.id, { orderStatus: e.target.value as OrderStatus })}
                          className={`rounded-full px-2 py-1 text-xs font-medium border-0 ${badge(o.orderStatus)}`}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelected(o)}
                          className="text-amber-700 hover:underline text-xs font-medium"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selected && (
          <div
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-amber-900">Detail {selected.id}</h2>
                <button onClick={() => setSelected(null)} className="text-amber-600 hover:underline text-sm">
                  Tutup
                </button>
              </div>
              <div className="text-sm space-y-1 text-amber-900">
                <p><b>Nama:</b> {selected.customerName}</p>
                <p><b>WhatsApp:</b> {selected.whatsapp}</p>
                <p><b>Tanggal:</b> {selected.createdAt.slice(0, 10)}</p>
                <p>
                  <b>Metode:</b>{' '}
                  {selected.metode === 'delivery'
                    ? `Delivery${selected.ongkir ? ` (ongkir ${formatIDR(selected.ongkir)})` : ''}`
                    : 'Pick Up di Cikoneng'}
                </p>
                {selected.alamat && (
                  <p><b>Lokasi Pengantaran:</b> {selected.alamat}</p>
                )}
                {selected.catatan && (
                  <p><b>Catatan:</b> {selected.catatan}</p>
                )}
              </div>
              <table className="w-full text-sm">
                <thead className="bg-amber-50 text-amber-800">
                  <tr>
                    <th className="text-left px-3 py-2">Produk</th>
                    <th className="text-left px-3 py-2">Ukuran</th>
                    <th className="text-right px-3 py-2">Jumlah</th>
                    <th className="text-right px-3 py-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.items.map((it, i) => (
                    <tr key={i} className="border-t border-amber-100">
                      <td className="px-3 py-2">{it.product}</td>
                      <td className="px-3 py-2">{it.size}</td>
                      <td className="px-3 py-2 text-right">{it.qty}</td>
                      <td className="px-3 py-2 text-right">{formatIDR(it.price * it.qty)}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-amber-200 font-semibold">
                    <td className="px-3 py-2" colSpan={3}>Total Pembayaran</td>
                    <td className="px-3 py-2 text-right">{formatIDR(selected.totalPembayaran ?? selected.total)}</td>
                  </tr>
                </tbody>
              </table>
              {selected.paymentProof ? (
                <div>
                  <p className="text-sm font-medium text-amber-800 mb-2">Bukti Pembayaran</p>
                  <img
                    src={selected.paymentProof}
                    alt="Bukti pembayaran"
                    className="rounded-lg border border-amber-200 max-h-64 object-contain w-full"
                  />
                </div>
              ) : (
                <p className="text-sm text-amber-600">Belum ada bukti pembayaran.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
