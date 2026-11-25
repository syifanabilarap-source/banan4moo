import { useState } from 'react';
import { loadHpp, saveHpp } from './store';

export type HppKey = 'Original|Kecil' | 'Original|Besar' | 'Tiramisu|Kecil' | 'Tiramisu|Besar';

export const HPP_KEYS: HppKey[] = [
  'Original|Kecil',
  'Original|Besar',
  'Tiramisu|Kecil',
  'Tiramisu|Besar',
];

export type HppMap = Record<string, number>;

export function useHpp() {
  const [hpp, setHppState] = useState<HppMap>(() => loadHpp());
  const setHpp = (key: string, nilai: number) => {
    setHppState((prev) => {
      const next = { ...prev, [key]: nilai };
      saveHpp(next);
      return next;
    });
  };
  return { hpp, setHpp };
}

export const hppLabel = (key: string) => {
  const [produk, ukuran] = key.split('|');
  return `${produk} — Cup ${ukuran}`;
};
