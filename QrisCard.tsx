import { useRef, useState } from 'react';

const QRIS_KEY = 'bananamoo_qris_image_v1';
const QRIS_DEFAULT =
  'https://ai.zenhosta.com/api/media/web-ai/users/f69cd05e-3bd3-4813-b926-2c1107216e96/9e51c50d-3f5a-4e34-be8c-b29d707ed257.jpg';

function loadQris(): string | null {
  try {
    return localStorage.getItem(QRIS_KEY) || QRIS_DEFAULT;
  } catch {
    return QRIS_DEFAULT;
  }
}

export default function QrisCard({ admin = false }: { admin?: boolean }) {
  const [qris, setQris] = useState<string | null>(loadQris);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      localStorage.setItem(QRIS_KEY, data);
      setQris(data);
    };
    reader.readAsDataURL(f);
  };

  return (
    <div className="rounded-2xl border-2 border-red-500 overflow-hidden bg-white">
      {/* Header ala poster QRIS */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-red-100">
        <div className="flex items-center gap-2">
          <span className="font-display font-extrabold text-xl tracking-tight text-moo">
            QR<span className="text-red-600">IS</span>
          </span>
          <span className="text-[11px] leading-tight font-semibold text-moo">
            QR Code Standar
            <br />
            Pembayaran Nasional
          </span>
        </div>
        <span className="font-display font-extrabold text-red-600 text-lg">GPN</span>
      </div>

      <div className="px-4 py-4 text-center">
        <p className="font-bold text-moo">B4NANAMOO, Makanan</p>
        <p className="text-xs text-mooSoft">NMID: ID1026635244563</p>
        <p className="text-xs text-mooSoft mb-3">A01</p>

        {qris ? (
          <img
            src={qris}
            alt="QRIS BananaMoo"
            className="mx-auto w-56 h-56 object-contain rounded-lg border border-amber-100"
          />
        ) : admin ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mx-auto w-56 h-56 rounded-lg border-2 border-dashed border-red-300 bg-red-50 text-xs text-red-500 hover:bg-red-100 transition flex flex-col items-center justify-center gap-1"
          >
            <span className="text-2xl">📷</span>
            Unggah gambar QRIS di sini
            <span className="text-[10px] text-red-400">(sekali saja, tersimpan otomatis)</span>
          </button>
        ) : (
          <div className="mx-auto w-56 h-56 rounded-lg border-2 border-dashed border-red-200 bg-red-50 text-xs text-red-400 flex flex-col items-center justify-center gap-1 text-center px-4">
            <span className="text-2xl">📷</span>
            QRIS belum dipasang admin.
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />

        <p className="mt-3 text-sm font-semibold tracking-wide text-moo">SATU QRIS UNTUK SEMUA</p>
        <p className="text-[11px] text-mooSoft">
          Cek aplikasi penyelenggara di: www.aspi-qris.id
        </p>

        {qris && admin && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-2 text-[11px] text-red-600 hover:underline"
          >
            Ganti gambar QRIS
          </button>
        )}
      </div>

      {/* Footer cara bayar */}
      <div className="bg-red-600 text-white px-4 py-3">
        <p className="text-[11px] font-bold mb-2">Cara bayar dengan QRIS:</p>
        <div className="flex justify-around text-center text-[10px]">
          <div>
            <div className="mx-auto mb-1 h-8 w-8 rounded-full bg-white text-red-600 flex items-center justify-center text-sm">📱</div>
            Buka Aplikasi<br />Berlogo QRIS
          </div>
          <div>
            <div className="mx-auto mb-1 h-8 w-8 rounded-full bg-white text-red-600 flex items-center justify-center text-sm">🔍</div>
            Scan dan Cek
          </div>
          <div>
            <div className="mx-auto mb-1 h-8 w-8 rounded-full bg-white text-red-600 flex items-center justify-center text-sm">✅</div>
            Bayar
          </div>
        </div>
      </div>
    </div>
  );
}
