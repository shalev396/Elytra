import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AppRouter from '@/router';
import { DirectionalToaster } from '@/components/shared/DirectionalToaster';
import {
  loadFromStorage,
  selectIsRestoringSession,
  selectRefreshToken,
  setAuthData,
  setRestoringSession,
  logout,
} from '@/store/userSlice';
import { refreshToken as refreshTokenService } from '@/api/services/authService';
import type { AppDispatch } from '@/store';
import { ThemeProvider } from '@/components/theme-provider';

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const isRestoringSession = useSelector(selectIsRestoringSession);

  useEffect(() => {
    dispatch(loadFromStorage());
  }, [dispatch]);

  // When loadFromStorage detects a refresh token but no session (new tab),
  // perform a silent token refresh to restore the session.
  useEffect(() => {
    if (!isRestoringSession) {
      return;
    }

    const storedRefreshToken = selectRefreshToken();
    if (!storedRefreshToken) {
      dispatch(setRestoringSession(false));
      return;
    }

    void (async () => {
      try {
        const response = await refreshTokenService(
          { refreshToken: storedRefreshToken },
          { suppressErrorToast: true },
        );
        const { idToken } = response.data;

        dispatch(setAuthData({ idToken, refreshToken: storedRefreshToken }));
      } catch {
        dispatch(logout());
      }
    })();
  }, [isRestoringSession, dispatch]);

  return (
    <ThemeProvider storageKey="elytra-ui-theme">
      <DirectionalToaster />
      <AppRouter />
    </ThemeProvider>
  );
}
