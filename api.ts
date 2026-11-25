import type { Order } from './types';

// URL Web App Google Apps Script (DATABASE PENJUALAN BANANAMOO)
const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbzBilKusTlIs8EXUHwSNhgPjCvQJO-PhIMZ_XeHgryak2cSYtxA6TEuRRFl6mViSwev2g/exec';

const API_KEY = 'bananamoo_api_url_v1';

export function getApiUrl(): string {
  try {
    const saved = localStorage.getItem(API_KEY);
    if (saved && saved.startsWith('https://')) return saved;
  } catch {
    /* ignore */
  }
  return DEFAULT_API_URL.startsWith('https://') ? DEFAULT_API_URL.trim() : '';
}

export function setApiUrl(url: string) {
  try {
    localStorage.setItem(API_KEY, url.trim());
  } catch {
    /* ignore */
  }
}

export function hasApiUrl(): boolean {
  return getApiUrl().startsWith('https://');
}

// Kirim pesanan ke database pusat Google Sheets
export async function submitOrder(order: Order): Promise<{ ok: boolean; error?: string }> {
  const url = getApiUrl();
  if (!url) return { ok: false, error: 'Database belum terhubung.' };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'createOrder', order }),
    });
    if (!res.ok) return { ok: false, error: `Server menolak (HTTP ${res.status}).` };
    const data = await res.json().catch(() => null);
    if (data && data.ok === false) return { ok: false, error: data.error || 'Server menolak pesanan.' };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Tidak bisa menghubungi server. Periksa koneksi internet Anda.' };
  }
}

// Update status pembayaran / status pesanan dari Admin ke Google Sheets
export async function updateRemoteOrder(
  id: string,
  patch: Partial<Pick<Order, 'paymentStatus' | 'orderStatus'>>
): Promise<{ ok: boolean; error?: string }> {
  const url = getApiUrl();
  if (!url) return { ok: false, error: 'Database belum terhubung.' };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'updateOrder', id, patch }),
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const data = await res.json().catch(() => null);
    if (data && data.ok === false) return { ok: false, error: data.error };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Gagal menyinkronkan status ke server.' };
  }
}

// Ambil seluruh pesanan dari Google Sheets (dipakai dashboard admin)
export async function fetchOrders(): Promise<Order[] | null> {
  const url = getApiUrl();
  if (!url) return null;
  try {
    const res = await fetch(`${url}?action=getOrders&t=${Date.now()}`);
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data.orders) ? (data.orders as Order[]) : null;
  } catch {
    return null;
  }
}
