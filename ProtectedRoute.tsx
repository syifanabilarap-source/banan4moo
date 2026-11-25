import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '../lib/store';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
