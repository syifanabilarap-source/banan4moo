import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminMenu from './pages/AdminMenu';
import AdminOrders from './pages/AdminOrders';
import AdminReport from './pages/AdminReport';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminMenu />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pesanan"
          element={
            <ProtectedRoute>
              <AdminOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/laporan"
          element={
            <ProtectedRoute>
              <AdminReport />
            </ProtectedRoute>
          }
        />
      </Routes>
    </HashRouter>
  );
}
