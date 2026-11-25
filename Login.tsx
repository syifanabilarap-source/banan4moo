import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { checkAdminPin, hasAdminPin, setAdminPin, loginSession } from '../lib/store';

export default function Login() {
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const firstTime = !hasAdminPin();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!/^[0-9]{4,8}$/.test(pin.trim())) {
      setError('PIN harus 4–8 angka.');
      return;
    }
    if (firstTime) {
      if (pin !== pin2) {
        setError('Konfirmasi PIN tidak sama.');
        return;
      }
      setAdminPin(pin.trim());
    } else if (!checkAdminPin(pin.trim())) {
      setError('PIN salah.');
      return;
    }
    loginSession();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50 px-4">
      <form
        onSubmit={submit}
        className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm space-y-4"
      >
        <div className="text-center">
          <span className="text-4xl">🍌</span>
          <h1 className="font-extrabold text-xl text-amber-900 mt-2">
            Login Admin BananaMoo
          </h1>
        </div>
        <div>
          <label htmlFor="pin" className="block text-sm font-medium text-amber-800 mb-1">
            {'PIN Admin'}
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-3 text-amber-400" />
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••••"
              className="w-full pl-9 pr-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>
        {firstTime && (
          <div>
            <label htmlFor="pin2" className="block text-sm font-medium text-amber-800 mb-1">
              Ulangi PIN
            </label>
            <input
              id="pin2"
              type="password"
              inputMode="numeric"
              value={pin2}
              onChange={(e) => setPin2(e.target.value)}
              placeholder="••••••"
              className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 rounded-lg"
        >
          {'Masuk'}
        </button>
      </form>
    </div>
  );
}
