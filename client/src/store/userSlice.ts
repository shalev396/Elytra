import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User, AccessTokenPayload } from '@/types';
import type { RootState } from './index';

interface UserState {
  user: User | null;
  refreshToken: string | null;
}

const REFRESH_TOKEN_KEY = 'refreshToken';
const ACCESS_TOKEN_KEY = 'accessToken';

function isAccessTokenPayload(value: unknown): value is AccessTokenPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value &&
    'name' in value &&
    'isAuthenticated' in value &&
    typeof (value as AccessTokenPayload).isAuthenticated === 'boolean'
  );
}

const initialState: UserState = {
  user: null,
  refreshToken: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    setTokens: (
      state,
      action: PayloadAction<{
        accessToken: AccessTokenPayload;
        refreshToken: string;
      }>,
    ) => {
      const { accessToken, refreshToken } = action.payload;

      // Store user data from access token
      state.user = {
        id: accessToken.id,
        email: accessToken.email,
        name: accessToken.name,
      };

      // Store refresh token in state and localStorage
      state.refreshToken = refreshToken;
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

      // Store access token in sessionStorage
      sessionStorage.setItem(ACCESS_TOKEN_KEY, JSON.stringify(accessToken));
    },
    logout: (state) => {
      state.user = null;
      state.refreshToken = null;
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    },
    loadFromStorage: (state) => {
      // Load refresh token from localStorage
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        state.refreshToken = refreshToken;
      }

      // Load access token and user from sessionStorage
      const accessTokenStr = sessionStorage.getItem(ACCESS_TOKEN_KEY);
      if (accessTokenStr) {
        try {
          const parsed: unknown = JSON.parse(accessTokenStr);
          if (isAccessTokenPayload(parsed) && parsed.isAuthenticated) {
            state.user = {
              id: parsed.id,
              email: parsed.email,
              name: parsed.name,
            };
          }
        } catch {
          // Invalid token in storage, clear it
          sessionStorage.removeItem(ACCESS_TOKEN_KEY);
        }
      }
    },
  },
});

export const { setUser, setTokens, logout, loadFromStorage } = userSlice.actions;

// Selectors
export const selectUser = (state: RootState) => state.user.user;
export const selectIsAuthenticated = (state: RootState) => state.user.user !== null;
export const selectAccessToken = (): string | null => {
  const accessTokenStr = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  if (!accessTokenStr) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(accessTokenStr);
    if (!isAccessTokenPayload(parsed)) {
      return null;
    }
    // Return a simple token string representation
    // In real implementation, this would be the actual JWT token string
    return JSON.stringify(parsed);
  } catch {
    return null;
  }
};

export default userSlice.reducer;
