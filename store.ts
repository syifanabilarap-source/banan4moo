import { useSyncExternalStore } from 'react';
import type { CartItem, DeliveryMethod, Order, OrderItem, Variant } from './types';

const CART_KEY = 'bananamoo_cart_v1';
const ORDERS_KEY = 'bananamoo_orders_v1';
const HPP_KEY = 'bananamoo_hpp_v1';
const SESSION_KEY = 'bananamoo_admin_session_v1';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const PRODUCTS: { id: string; variant: Variant }[] = [
  { id: 'original', variant: 'Original' },
  { id: 'tiramisu', variant: 'Tiramisu' },
];

export function newOrderId(): string {
  const d = new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `BM-${stamp}-${rand}`;
}

// State keranjang bersama (satu sumber untuk semua komponen):
// ProductCard, Cart, dan CheckoutForm selalu membaca & menulis data yang sama.
function readCart(): CartItem[] {
  const raw = read<unknown>(CART_KEY, []);
  return Array.isArray(raw) ? (raw as CartItem[]) : [];
}

let sharedCart: CartItem[] = readCart();
const cartListeners = new Set<() => void>();

function setSharedCart(next: CartItem[]) {
  sharedCart = Array.isArray(next) ? next : [];
  write(CART_KEY, next);
  cartListeners.forEach((l) => l());
}

export function useStore() {
  const cart = useSyncExternalStore(
    (listener) => {
      cartListeners.add(listener);
      return () => cartListeners.delete(listener);
    },
    () => sharedCart,
    () => sharedCart
  );

  const addItem = (item: Omit<CartItem, 'id'>) => {
    const found = sharedCart.find((i) => i.produk === item.produk && i.ukuran === item.ukuran);
    if (found) {
      // Varian & ukuran sama: gabungkan jumlah, jangan buat baris duplikat.
      setSharedCart(
        sharedCart.map((i) =>
          i.id === found.id ? { ...i, jumlah: Math.min(99, i.jumlah + item.jumlah) } : i
        )
      );
    } else {
      setSharedCart([...sharedCart, { ...item, id: Math.random().toString(36).slice(2, 10) }]);
    }
  };

  const removeItem = (id: string) =>
    setSharedCart(sharedCart.filter((i) => i.id !== id));

  const updateQty = (id: string, jumlah: number) => {
    if (jumlah <= 0) {
      removeItem(id);
      return;
    }
    setSharedCart(sharedCart.map((i) => (i.id === id ? { ...i, jumlah: Math.min(99, jumlah) } : i)));
  };

  const clearCart = () => setSharedCart([]);

  const addOrder = (data: {
    namaPembeli: string;
    nomorWhatsApp: string;
    items: CartItem[];
    buktiBayar: string;
    buktiNama: string;
    metode?: DeliveryMethod;
    ongkir?: number;
    alamat?: string;
    catatan?: string;
  }): Order => {
    const items: OrderItem[] = data.items.map((i) => ({
      product: i.produk,
      size: i.ukuran,
      qty: i.jumlah,
      price: i.hargaSatuan,
    }));
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);
    const order: Order = {
      id: newOrderId(),
      createdAt: new Date().toISOString(),
      customerName: data.namaPembeli,
      whatsapp: data.nomorWhatsApp,
      items,
      total,
      paymentStatus: 'Menunggu',
      orderStatus: 'Diproses',
      paymentProof: data.buktiBayar,
      metode: data.metode ?? 'pickup',
      ongkir: data.ongkir ?? 0,
      totalPembayaran: total + (data.ongkir ?? 0),
      alamat: data.alamat?.trim() || undefined,
      catatan: data.catatan?.trim() || undefined,
    };
    setSharedOrders([order, ...sharedOrders]);
    return order;
  };

  return { products: PRODUCTS, cart, addItem, removeItem, updateQty, clearCart, addOrder };
}

// State pesanan bersama: halaman admin & laporan selalu membaca data yang sama
// dan ikut terupdate otomatis saat ada pesanan baru masuk.
let sharedOrders: Order[] = read<Order[]>(ORDERS_KEY, []);
const orderListeners = new Set<() => void>();

function setSharedOrders(next: Order[]) {
  sharedOrders = Array.isArray(next) ? next : [];
  write(ORDERS_KEY, sharedOrders);
  orderListeners.forEach((l) => l());
}

// Gabungkan data dari database pusat (Google Sheets) dengan data lokal.
// ID pesanan unik, jadi tidak ada duplikat; versi server menimpa versi lokal.
export function mergeRemoteOrders(remote: Order[]) {
  const map = new Map<string, Order>();
  for (const o of sharedOrders) map.set(o.id, o);
  for (const o of remote) if (o && o.id) map.set(o.id, { ...map.get(o.id), ...o });
  setSharedOrders([...map.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export function useOrders() {
  const orders = useSyncExternalStore(
    (listener) => {
      orderListeners.add(listener);
      return () => orderListeners.delete(listener);
    },
    () => sharedOrders,
    () => sharedOrders
  );
  const updateOrder = (id: string, patch: Partial<Order>) =>
    setSharedOrders(sharedOrders.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  return { orders, updateOrder };
}

// HPP per cup, diisi admin (default 0 = belum diisi)
export function loadHpp(): Record<string, number> {
  return read<Record<string, number>>(HPP_KEY, {});
}
export function saveHpp(hpp: Record<string, number>) {
  write(HPP_KEY, hpp);
}

// Sesi admin lokal (tanpa backend): PIN diset saat login pertama kali.
const PIN_KEY = 'bananamoo_admin_pin_hash';
function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return String(h);
}
export function hasAdminPin(): boolean {
  return !!localStorage.getItem(PIN_KEY);
}
export function setAdminPin(pin: string) {
  localStorage.setItem(PIN_KEY, hash(pin));
}
export function checkAdminPin(pin: string): boolean {
  const stored = localStorage.getItem(PIN_KEY);
  return !!stored && hash(pin) === stored;
}
export function loginSession() {
  sessionStorage.setItem(SESSION_KEY, '1');
}
export function logoutSession() {
  sessionStorage.removeItem(SESSION_KEY);
}
export function isLoggedIn(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}
