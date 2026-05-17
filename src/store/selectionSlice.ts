import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { MAX_SELECTED_COINS } from "../constants";
import { loadSelectedCoinIds, saveSelectedCoinIds } from "./localStorage";

interface SelectionState {
  selectedIds: string[];
  pendingCoinId: string | null;
}

const initialState: SelectionState = {
  selectedIds: loadSelectedCoinIds(),
  pendingCoinId: null
};

const persist = (state: SelectionState) => {
  saveSelectedCoinIds(state.selectedIds);
};

const selectionSlice = createSlice({
  name: "selection",
  initialState,
  reducers: {
    toggleCoin(state, action: PayloadAction<string>) {
      const coinId = action.payload;
      const isSelected = state.selectedIds.includes(coinId);

      if (isSelected) {
        state.selectedIds = state.selectedIds.filter((id) => id !== coinId);

        if (state.selectedIds.length < MAX_SELECTED_COINS) {
          state.pendingCoinId = null;
        }

        persist(state);
        return;
      }

      if (state.selectedIds.length >= MAX_SELECTED_COINS) {
        state.pendingCoinId = coinId;
        return;
      }

      state.selectedIds.push(coinId);
      persist(state);
    },
    replaceSelectedCoin(state, action: PayloadAction<{ removeId: string; addId: string }>) {
      state.selectedIds = state.selectedIds.filter((id) => id !== action.payload.removeId);

      if (!state.selectedIds.includes(action.payload.addId)) {
        state.selectedIds.push(action.payload.addId);
      }

      state.pendingCoinId = null;
      persist(state);
    },
    dismissPendingSelection(state) {
      state.pendingCoinId = null;
    }
  }
});

export const { dismissPendingSelection, replaceSelectedCoin, toggleCoin } =
  selectionSlice.actions;
export default selectionSlice.reducer;
