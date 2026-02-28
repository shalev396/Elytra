import { lazy } from 'react';
import { Route } from 'react-router-dom';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { GuestRoute } from '@/router/GuestRoute';
import { ROUTES } from '@/router/routes';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const SignUpPage = lazy(() => import('@/pages/auth/SignUpPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const ConfirmSignUpPage = lazy(() => import('@/pages/auth/ConfirmSignUpPage'));

export const authRoutes = (
  <Route
    path={ROUTES.AUTH.BASE}
    element={
      <GuestRoute>
        <AuthLayout />
      </GuestRoute>
    }
  >
    <Route path={ROUTES.AUTH.SEGMENTS.LOGIN} element={<LoginPage />} />
    <Route path={ROUTES.AUTH.SEGMENTS.SIGNUP} element={<SignUpPage />} />
    <Route path={ROUTES.AUTH.SEGMENTS.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
    <Route path={ROUTES.AUTH.SEGMENTS.RESET_PASSWORD} element={<ResetPasswordPage />} />
    <Route path={ROUTES.AUTH.SEGMENTS.CONFIRM_SIGNUP} element={<ConfirmSignUpPage />} />
  </Route>
);
