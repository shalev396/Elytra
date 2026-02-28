import { useParams, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectIsRestoringSession } from '@/store/userSlice';
import { pathTo, ROUTES } from '@/router/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isRestoring = useSelector(selectIsRestoringSession);
  const { lng } = useParams<{ lng: string }>();
  const language = lng ?? 'en';

  // App.tsx is performing a silent token refresh (new tab with refresh token)
  if (isRestoring) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to={pathTo(ROUTES.AUTH.LOGIN, language)} replace />;
  }

  return <>{children}</>;
}
