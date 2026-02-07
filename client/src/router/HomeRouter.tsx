import { lazy } from 'react';
import { Route } from 'react-router-dom';
import { LandingLayout } from '@/components/layouts/LandingLayout';
import { AppLayout } from '@/components/layouts/AppLayout';
import { ROUTES } from '@/router/routes';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const PricingPage = lazy(() => import('@/pages/PricingPage'));
const FeaturesPage = lazy(() => import('@/pages/FeaturesPage'));
const DocsPage = lazy(() => import('@/pages/DocsPage'));

export const homeRoutes = (
  <>
    <Route element={<LandingLayout />}>
      <Route index element={<LandingPage />} />
    </Route>
    <Route element={<AppLayout />}>
      <Route path={ROUTES.PRICING} element={<PricingPage />} />
      <Route path={ROUTES.FEATURES} element={<FeaturesPage />} />
      <Route path={ROUTES.DOCS} element={<DocsPage />} />
    </Route>
  </>
);
