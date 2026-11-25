import { useStore } from '../lib/store';
import { rupiah } from '../lib/format';

export default function Cart() {
  const { cart, removeItem, updateQty, clearCart } = useStore();
  const total = cart.reduce((s, i) => s + i.hargaSatuan * i.jumlah, 0);

  return (
    <div className="rounded-2xl border border-amber-100 bg-white shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-amber-900">Ringkasan Pesanan</h3>
        {cart.length > 0 && (
          <button onClick={clearCart} className="text-xs text-red-600 hover:underline">
            Kosongkan
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <p className="text-sm text-amber-700/60 py-6 text-center">Keranjang masih kosong. Pilih produk di atas.</p>
      ) : (
        <ul className="divide-y divide-amber-100">
          {cart.map((i) => (
            <li key={i.id} className="py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-amber-900 text-sm">
                  {i.produk} — Cup {i.ukuran}
                </p>
                <p className="text-xs text-amber-700/60">
                  {rupiah(i.hargaSatuan)} / cup × {i.jumlah} = {rupiah(i.hargaSatuan * i.jumlah)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQty(i.id, i.jumlah - 1)}
                  className="h-7 w-7 rounded-full border border-amber-200 text-amber-800"
                  aria-label={`Kurangi ${i.produk} Cup ${i.ukuran}`}
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-semibold">{i.jumlah}</span>
                <button
                  onClick={() => updateQty(i.id, i.jumlah + 1)}
                  className="h-7 w-7 rounded-full border border-amber-200 text-amber-800"
                  aria-label={`Tambah ${i.produk} Cup ${i.ukuran}`}
                >
                  +
                </button>
                <span className="w-24 text-right text-sm font-semibold text-amber-900">
                  {rupiah(i.hargaSatuan * i.jumlah)}
                </span>
                <button
                  onClick={() => removeItem(i.id)}
                  className="text-red-500 hover:text-red-700 text-xs ml-1"
                  aria-label={`Hapus ${i.produk} Cup ${i.ukuran}`}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 pt-3 border-t border-amber-200 flex justify-between items-center">
        <span className="font-semibold text-amber-900">Total</span>
        <span className="text-xl font-bold text-amber-900">{rupiah(total)}</span>
      </div>
    </div>
  );
}
