import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import AppRouter from '@/router';
import { DirectionalToaster } from '@/components/shared/DirectionalToaster';
import {
  loadFromStorage,
  selectIsRestoringSession,
  selectUser,
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
  const userId = useSelector(selectUser)?.id ?? null;
  const queryClient = useQueryClient();
  const previousUserIdRef = useRef(userId);

  // Private queries are cached with a staleTime, so drop them when the signed-in user changes
  // (logout, account deletion, or another account in the same tab) instead of showing the
  // previous user's data until they go stale.
  useEffect(() => {
    if (previousUserIdRef.current !== null && previousUserIdRef.current !== userId) {
      queryClient.clear();
    }
    previousUserIdRef.current = userId;
  }, [userId, queryClient]);

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
