export type Variant = 'Original' | 'Tiramisu';
export type Size = 'Kecil' | 'Besar';
export type PaymentStatus = 'Menunggu' | 'Dibayar' | 'Dibatalkan';
export type OrderStatus = 'Diproses' | 'Dikemas' | 'Siap Diambil' | 'Dikirim' | 'Selesai' | 'Dibatalkan';

export interface CartItem {
  id: string;
  produk: Variant;
  ukuran: Size;
  jumlah: number;
  hargaSatuan: number;
}

export interface OrderItem {
  product: Variant;
  size: Size;
  qty: number;
  price: number;
}

export type DeliveryMethod = 'pickup' | 'delivery';

export interface Order {
  id: string;
  createdAt: string; // ISO
  customerName: string;
  whatsapp: string;
  items: OrderItem[];
  total: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentProof?: string; // dataURL bukti transfer
  metode?: DeliveryMethod;
  ongkir?: number;
  totalPembayaran?: number;
  alamat?: string;
  catatan?: string;
}

export type Product = Variant;

export const PRICES: Record<Size, number> = { Kecil: 13000, Besar: 23000 };
export const PAYMENT_STATUSES: PaymentStatus[] = ['Menunggu', 'Dibayar', 'Dibatalkan'];
export const ORDER_STATUSES: OrderStatus[] = ['Diproses', 'Dikemas', 'Siap Diambil', 'Dikirim', 'Selesai', 'Dibatalkan'];
export const VARIANTS: Variant[] = ['Original', 'Tiramisu'];
export const SIZES: Size[] = ['Kecil', 'Besar'];
