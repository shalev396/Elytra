import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';

interface UiState {
  isGlobalLoading: boolean;
}

const initialState: UiState = {
  isGlobalLoading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.isGlobalLoading = action.payload;
    },
    showGlobalLoading: (state) => {
      state.isGlobalLoading = true;
    },
    hideGlobalLoading: (state) => {
      state.isGlobalLoading = false;
    },
  },
});

export const { setGlobalLoading, showGlobalLoading, hideGlobalLoading } = uiSlice.actions;

// Selectors
export const selectIsGlobalLoading = (state: RootState) => state.ui.isGlobalLoading;

export default uiSlice.reducer;
