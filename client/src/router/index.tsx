import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LanguageLayout } from '@/router/LanguageLayout';
import { RootRedirect } from '@/router/RootRedirect';
import { homeRoutes } from '@/router/HomeRouter';
import { authRoutes } from '@/router/AuthRouter';
import { appRoutes } from '@/router/AppRouter';
import { legalRoutes } from '@/router/LegalRouter';

const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function PageLoader() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="size-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export default function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/:lng" element={<LanguageLayout />}>
          {homeRoutes}
          {authRoutes}
          {appRoutes}
          {legalRoutes}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </Suspense>
  );
}
