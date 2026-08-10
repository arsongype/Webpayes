import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ADMIN } from '../constants/roles.constants';

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" />;
  if (!user?.roles?.includes(ADMIN)) return <Navigate to="/dashboard" />;
  return children;
};
export default AdminRoute;
