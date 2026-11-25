import { useState } from 'react';
import { useStore } from '../lib/store';
import { rupiah } from '../lib/format';
import { submitOrder } from '../lib/api';
import QrisCard from './QrisCard';

// Kompres gambar bukti bayar agar ukuran ringan & tersimpan aman di Google Sheets
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format gambar tidak didukung.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 480;
        const scale = img.width > maxW ? maxW / img.width : 1;
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(reader.result as string);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function CheckoutForm() {
  const { cart, addOrder, clearCart } = useStore();
  const [nama, setNama] = useState('');
  const [wa, setWa] = useState('');
  const [bukti, setBukti] = useState<string | null>(null);
  const [buktiNama, setBuktiNama] = useState('');
  const [metode, setMetode] = useState<'pickup' | 'delivery'>('pickup');
  const [jarak, setJarak] = useState('');
  const [alamat, setAlamat] = useState('');
  const [catatan, setCatatan] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<{ id: string; total: number } | null>(null);

  const subtotal = cart.reduce((s, i) => s + i.hargaSatuan * i.jumlah, 0);
  const jarakNum = parseFloat(jarak.replace(',', '.'));
  const ongkir = metode === 'delivery' && jarakNum > 1 ? 2000 : 0;
  const total = subtotal + ongkir;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setError('Ukuran bukti maksimal 5 MB.');
      return;
    }
    try {
      const compressed = await compressImage(f);
      setBukti(compressed);
      setBuktiNama(f.name);
      setError('');
    } catch {
      setError('Gagal memproses gambar bukti pembayaran.');
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    if (!nama.trim()) return setError('Nama pelanggan wajib diisi.');
    if (!/^[0-9+\-\s]{9,16}$/.test(wa.trim())) return setError('Nomor WhatsApp tidak valid.');
    if (cart.length === 0) return setError('Keranjang masih kosong.');
    if (!bukti) return setError('Unggah bukti pembayaran QRIS terlebih dahulu.');
    if (metode === 'delivery' && (!jarak.trim() || isNaN(jarakNum) || jarakNum <= 0))
      return setError('Isi perkiraan jarak pengiriman (km) terlebih dahulu.');
    if (metode === 'delivery' && !alamat.trim())
      return setError('Isi lokasi pengantaran terlebih dahulu.');

    setSending(true);
    setError('');

    const order = addOrder({
      namaPembeli: nama.trim(),
      nomorWhatsApp: wa.trim(),
      items: cart,
      buktiBayar: bukti,
      buktiNama,
      metode,
      ongkir,
      alamat: metode === 'delivery' ? alamat : '',
      catatan,
    });

    // Kirim ke database pusat (Google Sheets) dan tunggu konfirmasi server
    const result = await submitOrder(order);
    setSending(false);

    if (!result.ok) {
      setError(
        (result.error || 'Gagal mengirim pesanan.') +
          ' Silakan periksa koneksi internet dan tekan tombol Konfirmasi Pesanan lagi.'
      );
      return;
    }

    // Kosongkan keranjang setelah server mengonfirmasi pesanan tersimpan
    clearCart();
    setSuccess({ id: order.id, total: order.totalPembayaran ?? total });
    setNama('');
    setWa('');
    setBukti(null);
    setBuktiNama('');
    setMetode('pickup');
    setJarak('');
    setAlamat('');
    setCatatan('');
    setError('');
  };

  if (success) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
        <div className="text-4xl mb-2">✅</div>
        <h3 className="font-bold text-green-800 text-lg">Pesanan Berhasil Disimpan!</h3>
        <p className="text-sm text-green-700 mt-1">
          ID Pesanan: <span className="font-mono font-semibold">{success.id}</span>
        </p>
        <p className="text-sm text-green-700">Total: {rupiah(success.total)}</p>
        <p className="text-xs text-green-700/70 mt-2">
          Server telah mengonfirmasi pesanan Anda tersimpan di database pusat. Kami akan konfirmasi pembayaran via
          WhatsApp. Simpan ID pesanan Anda.
        </p>
        <button
          onClick={() => setSuccess(null)}
          className="mt-4 px-4 py-2 rounded-full bg-green-600 text-white text-sm font-medium hover:bg-green-700"
        >
          Pesan Lagi
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-amber-100 bg-white shadow-sm p-5 space-y-4">
      <h3 className="font-bold text-amber-900">Data & Pembayaran</h3>

      <div>
        <label className="block text-sm font-medium text-amber-900 mb-1">Nama Pelanggan</label>
        <input
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          placeholder="Nama Anda"
          className="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-amber-900 mb-1">Nomor WhatsApp</label>
        <input
          value={wa}
          onChange={(e) => setWa(e.target.value)}
          placeholder="08xxxxxxxxxx"
          inputMode="tel"
          className="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      <div>
        <span className="block text-sm font-medium text-amber-900 mb-1">Metode Pengambilan</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMetode('pickup')}
            className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
              metode === 'pickup'
                ? 'border-amber-500 bg-amber-500 text-white'
                : 'border-amber-200 text-amber-800 hover:bg-amber-50'
            }`}
          >
            Pick Up
          </button>
          <button
            type="button"
            onClick={() => setMetode('delivery')}
            className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
              metode === 'delivery'
                ? 'border-amber-500 bg-amber-500 text-white'
                : 'border-amber-200 text-amber-800 hover:bg-amber-50'
            }`}
          >
            Delivery
          </button>
        </div>
        {metode === 'pickup' ? (
          <p className="text-xs text-amber-700/70 mt-2">
            Pick up di daerah Cikoneng.
          </p>
        ) : (
          <div className="mt-2">
            <label className="block text-xs font-medium text-amber-800 mb-1">
              Perkiraan jarak dari Telkom (km)
            </label>
            <input
              value={jarak}
              onChange={(e) => setJarak(e.target.value)}
              inputMode="decimal"
              placeholder="mis. 2.5"
              className="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <p className="text-xs text-amber-700/70 mt-1">
              {ongkir > 0
                ? `Jarak lebih dari 1 km: biaya antar ${rupiah(ongkir)} (sudah termasuk di total).`
                : 'Jarak 1 km atau kurang: gratis antar.'}
            </p>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-amber-900 mb-1">
          Lokasi Pengantaran {metode === 'delivery' ? '(wajib)' : '(opsional)'}
        </label>
        <input
          value={alamat}
          onChange={(e) => setAlamat(e.target.value)}
          placeholder="mis. Kos Melati, Jl. Telekomunikasi No. 5"
          className="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-amber-900 mb-1">Catatan (opsional)</label>
        <textarea
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          rows={2}
          placeholder="mis. pedas, tanpa keju, antar sore"
          className="w-full rounded-xl border border-amber-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
        <p className="font-semibold mb-1">Pembayaran QRIS</p>
        <p className="text-xs leading-relaxed">
          Scan QRIS BananaMoo di bawah ini dengan aplikasi e-wallet / m-banking Anda, bayar sesuai total di atas, lalu
          unggah bukti pembayaran Anda di bawah ini.
        </p>
      </div>

      <QrisCard />

      <div>
        <label className="block text-sm font-medium text-amber-900 mb-1">Bukti Pembayaran</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="w-full text-sm text-amber-800 file:mr-3 file:px-3 file:py-1.5 file:rounded-full file:border-0 file:bg-amber-600 file:text-white file:text-xs"
        />
        {bukti && <p className="text-xs text-green-700 mt-1">✔ {buktiNama} siap diunggah</p>}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={cart.length === 0 || sending}
        className="w-full py-3 rounded-full bg-amber-600 text-white font-semibold hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {sending ? 'Menyimpan ke database…' : 'Konfirmasi Pesanan'}
      </button>
    </form>
  );
}
