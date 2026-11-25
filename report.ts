import { useMemo } from 'react';
import type { Order } from './types';
import type { HppMap } from './hpp';

export type DailyRow = { date: string; orders: number; original: number; tiramisu: number; omzet: number };
export type MonthlyRow = { month: string; orders: number; original: number; tiramisu: number; omzet: number };

export type Report = {
  omzet: number;
  successCount: number;
  soldOriginal: number;
  soldTiramisu: number;
  totalHpp: number;
  grossProfit: number;
  daily: DailyRow[];
  monthly: MonthlyRow[];
};

export function buildReport(orders: Order[], hpp: HppMap): Report {
  const paid = orders.filter((o) => o.paymentStatus === 'Dibayar');
  let omzet = 0;
  let original = 0;
  let tiramisu = 0;
  let totalHpp = 0;
  const hariMap = new Map<string, DailyRow>();
  const bulanMap = new Map<string, MonthlyRow>();

  for (const o of paid) {
    omzet += o.total;
    const tgl = o.createdAt.slice(0, 10);
    const bulan = tgl.slice(0, 7);

    const h = hariMap.get(tgl) ?? { date: tgl, orders: 0, original: 0, tiramisu: 0, omzet: 0 };
    h.orders += 1;
    h.omzet += o.total;
    hariMap.set(tgl, h);

    const b = bulanMap.get(bulan) ?? { month: bulan, orders: 0, original: 0, tiramisu: 0, omzet: 0 };
    b.orders += 1;
    b.omzet += o.total;
    bulanMap.set(bulan, b);

    for (const d of o.items) {
      if (d.product === 'Original') {
        original += d.qty;
        h.original += d.qty;
        b.original += d.qty;
      } else {
        tiramisu += d.qty;
        h.tiramisu += d.qty;
        b.tiramisu += d.qty;
      }
      totalHpp += (hpp[`${d.product}|${d.size}`] ?? 0) * d.qty;
    }
  }

  const sortStr = (a: string, b: string) => a.localeCompare(b);
  return {
    omzet,
    successCount: paid.length,
    soldOriginal: original,
    soldTiramisu: tiramisu,
    totalHpp,
    grossProfit: omzet - totalHpp,
    daily: [...hariMap.values()].sort((a, b) => sortStr(a.date, b.date)),
    monthly: [...bulanMap.values()].sort((a, b) => sortStr(a.month, b.month)),
  };
}

export function useReport(orders: Order[], hpp: HppMap): Report {
  return useMemo(() => buildReport(orders, hpp), [orders, hpp]);
}
