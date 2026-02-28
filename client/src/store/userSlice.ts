import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types';
import type { RootState } from './index';

// ---------------------------------------------------------------------------
// Storage keys (tokens only -- user is always decoded from the idToken)
// ---------------------------------------------------------------------------
const ID_TOKEN_KEY = 'idToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function decodeUserFromIdToken(idToken: string): User | null {
  try {
    const parts = idToken.split('.');
    const payload = parts[1];
    if (!payload) {
      return null;
    }
    const decoded = JSON.parse(atob(payload)) as {
      sub?: string;
      email?: string;
      name?: string;
    };
    if (!decoded.sub) {
      return null;
    }
    return {
      id: decoded.sub,
      email: decoded.email ?? '',
      name: decoded.name ?? '',
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
interface UserState {
  user: User | null;
  isRestoringSession: boolean;
}

const initialState: UserState = {
  user: null,
  isRestoringSession: false,
};

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    /**
     * Called after a successful login.
     * Stores tokens in their respective storage and decodes user from idToken.
     */
    setAuthData: (
      state,
      action: PayloadAction<{
        idToken: string;
        refreshToken: string;
      }>,
    ) => {
      const { idToken, refreshToken } = action.payload;

      sessionStorage.setItem(ID_TOKEN_KEY, idToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

      state.user = decodeUserFromIdToken(idToken);
      state.isRestoringSession = false;
    },

    /**
     * Called after a silent token refresh (401 interceptor or new-tab restore).
     * Updates the idToken in sessionStorage and re-decodes the user.
     */
    updateTokens: (
      state,
      action: PayloadAction<{
        idToken: string;
      }>,
    ) => {
      sessionStorage.setItem(ID_TOKEN_KEY, action.payload.idToken);
      state.user = decodeUserFromIdToken(action.payload.idToken);
      state.isRestoringSession = false;
    },

    /**
     * Clears all auth state and storage.
     */
    logout: (state) => {
      state.user = null;
      state.isRestoringSession = false;
      sessionStorage.removeItem(ID_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    },

    /**
     * On app mount: if idToken exists in sessionStorage (same-tab reload),
     * decode the user from it. If only refreshToken exists in localStorage
     * (new tab), mark isRestoringSession so App.tsx performs a silent refresh.
     */
    loadFromStorage: (state) => {
      const idToken = sessionStorage.getItem(ID_TOKEN_KEY);
      if (idToken) {
        const user = decodeUserFromIdToken(idToken);
        if (user) {
          state.user = user;
          return;
        }
        sessionStorage.removeItem(ID_TOKEN_KEY);
      }

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        state.isRestoringSession = true;
      }
    },

    setRestoringSession: (state, action: PayloadAction<boolean>) => {
      state.isRestoringSession = action.payload;
    },
  },
});

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
export const { setAuthData, updateTokens, logout, loadFromStorage, setRestoringSession } =
  userSlice.actions;

export const selectUser = (state: RootState) => state.user.user;
export const selectIsAuthenticated = (state: RootState) => state.user.user !== null;
export const selectIsRestoringSession = (state: RootState) => state.user.isRestoringSession;

// Direct storage selectors (used by the axios interceptor outside of React)
export function selectIdToken(): string | null {
  return sessionStorage.getItem(ID_TOKEN_KEY);
}

export function selectRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export default userSlice.reducer;
