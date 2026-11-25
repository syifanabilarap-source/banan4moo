import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardList, LogOut, BarChart3 } from 'lucide-react';
import { logoutSession } from '../lib/store';

export default function AdminMenu() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-amber-50 px-4 py-10">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-amber-100 rounded-lg">
            <ArrowLeft size={18} />
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

        <div className="text-center">
          <span className="text-4xl">🍌</span>
          <h1 className="font-extrabold text-xl text-amber-900 mt-2">Menu Admin</h1>
          <p className="text-sm text-amber-700 mt-1">Pilih halaman admin yang ingin dibuka.</p>
        </div>

        <div className="space-y-3">
          <Link
            to="/admin/pesanan"
            className="flex items-center gap-4 bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition"
          >
            <span className="h-11 w-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <ClipboardList size={22} />
            </span>
            <span>
              <span className="block font-bold text-amber-900">Status Pesanan</span>
              <span className="block text-xs text-amber-700/70">
                Kelola pesanan masuk, pembayaran, dan status pengiriman.
              </span>
            </span>
          </Link>

          <Link
            to="/admin/laporan"
            className="flex items-center gap-4 bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition"
          >
            <span className="h-11 w-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <BarChart3 size={22} />
            </span>
            <span>
              <span className="block font-bold text-amber-900">Laporan Penjualan</span>
              <span className="block text-xs text-amber-700/70">
                Lihat omzet, HPP, laba kotor, dan rekap penjualan.
              </span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
