import { useParams, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  selectIsAuthenticated,
  selectIsRestoringSession,
  selectSignedOut,
} from '@/store/userSlice';
import { pathTo, ROUTES } from '@/router/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isRestoring = useSelector(selectIsRestoringSession);
  const signedOut = useSelector(selectSignedOut);
  const { lng } = useParams<{ lng: string }>();
  const language = lng ?? 'en';

  // App.tsx is performing a silent token refresh (new tab with refresh token)
  if (isRestoring) {
    return null;
  }

  if (!isAuthenticated) {
    // A user who just logged out or deleted their account goes home, not to the login page.
    const target = signedOut ? ROUTES.HOME : ROUTES.AUTH.LOGIN;
    return <Navigate to={pathTo(target, language)} replace />;
  }

  return <>{children}</>;
}
