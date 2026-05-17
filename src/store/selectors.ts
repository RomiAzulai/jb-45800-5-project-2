import type { RootState } from "./store";

export const selectCoins = (state: RootState) => state.coins.coins;
export const selectSearchTerm = (state: RootState) => state.ui.searchTerm;
export const selectSelectedIds = (state: RootState) => state.selection.selectedIds;

export const selectFilteredCoins = (state: RootState) => {
  const query = state.ui.searchTerm.trim().toLowerCase();

  if (!query) {
    return state.coins.coins;
  }

  return state.coins.coins.filter(
    (coin) => coin.name.toLowerCase().includes(query) || coin.symbol.toLowerCase().includes(query)
  );
};

export const selectSelectedCoins = (state: RootState) => {
  const selectedIds = new Set(state.selection.selectedIds);
  return state.coins.coins.filter((coin) => selectedIds.has(coin.id));
};

export const selectPendingCoin = (state: RootState) => {
  if (!state.selection.pendingCoinId) {
    return null;
  }

  return state.coins.coins.find((coin) => coin.id === state.selection.pendingCoinId) ?? null;
};
