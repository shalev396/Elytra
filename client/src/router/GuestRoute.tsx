import { useParams, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectIsRestoringSession } from '@/store/userSlice';
import { pathTo, ROUTES } from '@/router/routes';

interface GuestRouteProps {
  children: React.ReactNode;
}

export function GuestRoute({ children }: GuestRouteProps) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isRestoring = useSelector(selectIsRestoringSession);
  const { lng } = useParams<{ lng: string }>();
  const language = lng ?? 'en';

  if (isRestoring) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to={pathTo(ROUTES.DASHBOARD, language)} replace />;
  }

  return <>{children}</>;
}
