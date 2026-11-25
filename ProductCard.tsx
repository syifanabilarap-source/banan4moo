import { useState } from 'react';
import { useStore } from '../lib/store';
import type { ProductVariant, CupSize } from '../lib/types';
import { rupiah } from '../lib/format';

const VARIANTS: ProductVariant[] = ['Original', 'Tiramisu'];
const SIZES: CupSize[] = ['Kecil', 'Besar'];
const PRICES: Record<CupSize, number> = { Kecil: 13000, Besar: 23000 };

export default function ProductCard({ variant }: { variant: ProductVariant }) {
  const { addItem } = useStore();
  const [size, setSize] = useState<CupSize>('Kecil');
  const [qty, setQty] = useState(1);

  return (
    <div className="rounded-2xl border border-amber-100 bg-white shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-amber-900">{variant}</h3>
          <p className="text-sm text-amber-700/70">
            {variant === 'Original'
              ? 'Lembut, creamy, dengan perpaduan pisang dan crumble yang bikin nagih.'
              : 'Sensasi creamy dengan sentuhan rasa tiramisu yang nikmat.'}
          </p>
        </div>
        <img
          src={
            variant === 'Original'
              ? 'https://ai.zenhosta.com/api/media/web-ai/users/f69cd05e-3bd3-4813-b926-2c1107216e96/d2ea2ceb-eb0b-4db1-a6a8-4297dd7b95bf.jpg'
              : 'https://ai.zenhosta.com/api/media/web-ai/users/f69cd05e-3bd3-4813-b926-2c1107216e96/0457dcf2-8db5-4bcf-87c4-33c1262ab62b.jpg'
          }
          alt={variant}
          className="h-20 w-20 rounded-xl object-cover"
        />
      </div>

      <div>
        <span className="text-xs font-semibold uppercase tracking-wide text-amber-700/70">Ukuran</span>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                size === s
                  ? 'border-amber-500 bg-amber-500 text-white'
                  : 'border-amber-200 text-amber-800 hover:bg-amber-50'
              }`}
            >
              Cup {s} — {rupiah(PRICES[s])}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="h-9 w-9 rounded-full border border-amber-200 text-amber-800 font-bold"
          >
            −
          </button>
          <span className="w-8 text-center font-semibold text-amber-900">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(99, q + 1))}
            className="h-9 w-9 rounded-full border border-amber-200 text-amber-800 font-bold"
          >
            +
          </button>
        </div>
        <button
          onClick={() => addItem({ produk: variant, ukuran: size, jumlah: qty, hargaSatuan: PRICES[size] })}
          className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
        >
          Tambah
        </button>
      </div>
    </div>
  );
}
