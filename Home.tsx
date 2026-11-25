import { useStore } from '../lib/store';
import ProductCard from '../components/ProductCard';
import Cart from '../components/Cart';
import CheckoutForm from '../components/CheckoutForm';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function Home() {
  const { products } = useStore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <header className="bg-amber-500 text-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍌</span>
            <div>
              <h1 className="font-extrabold text-lg leading-tight">BananaMoo</h1>
              <p className="text-xs text-amber-100">A Little Cup of Happiness</p>
            </div>
          </div>
          <Link
            to="/login"
            className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full"
          >
            <ShieldCheck size={14} /> Admin
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        {/* Hero mini */}
        <section className="text-center">
          <h2 className="text-2xl font-extrabold text-amber-900">OUR SWEET MENU</h2>
          <p className="text-sm text-amber-700 mt-1">
            Temukan rasa favoritmu dalam setiap sendok!
          </p>
        </section>

        {/* Produk */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} variant={p.variant} />
          ))}
        </section>

        {/* Keranjang + Checkout */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Cart />
          <CheckoutForm />
        </section>

        <footer className="text-center text-xs text-amber-600 pb-8">
          🍌 BananaMoo © 2026 — Dibuat dengan cinta & pisang manis.
        </footer>
      </main>
    </div>
  );
}
