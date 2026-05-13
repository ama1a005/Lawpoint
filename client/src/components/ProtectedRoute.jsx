import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute — wraps routes that require authentication and a specific role.
 *
 * Props:
 *   role (string) — the required role to access child routes ('citizen', 'admin', 'lawyer')
 *
 * Behaviour:
 *   - While auth is loading → show spinner
 *   - No user logged in   → redirect to /login
 *   - Wrong role          → redirect to /login
 *   - Correct role        → render <Outlet />
 */
const ProtectedRoute = ({ role }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
