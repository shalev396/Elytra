import { lazy } from 'react';
import { Route } from 'react-router-dom';
import { ProtectedRoute } from '@/router/ProtectedRoute';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { ROUTES } from '@/router/routes';

const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));

export const appRoutes = (
  <Route
    path={ROUTES.DASHBOARD}
    element={
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    }
  >
    <Route index element={<DashboardPage />} />
    <Route path={ROUTES.PROFILE_SEGMENT} element={<ProfilePage />} />
  </Route>
);
