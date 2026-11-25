export const rp = (n: number) =>
  'Rp' + Math.round(n).toLocaleString('id-ID');

export const rupiah = rp;
export const formatIDR = rp;

export const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export const dayKey = (iso: string) => iso.slice(0, 10);
export const monthKey = (iso: string) => iso.slice(0, 7);

export const monthLabel = (key: string) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
};

export const waLink = (num: string, text: string) =>
  `https://wa.me/${num.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
