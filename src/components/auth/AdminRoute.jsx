import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';
import { Spinner } from '../ui/Spinner.jsx';

export default function AdminRoute() {
  const { user, isAdmin, loading } = useAdminAuth();

  if (loading) {
    return <div className="container account-loading"><Spinner label="Checking staff access" /></div>;
  }
  if (!user || !isAdmin) return <Navigate replace to="/admin/login" />;
  return <Outlet />;
}
