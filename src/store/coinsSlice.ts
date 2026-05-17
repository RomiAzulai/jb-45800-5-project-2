import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchCoinPrices, fetchMarketCoins } from "../services/cryptoApi";
import type { Coin, CoinPriceInfo, LoadingStatus } from "../types";

interface CoinsState {
  coins: Coin[];
  status: LoadingStatus;
  error: string | null;
  moreInfo: Record<string, CoinPriceInfo>;
  moreInfoStatus: Record<string, LoadingStatus>;
}

const initialState: CoinsState = {
  coins: [],
  status: "idle",
  error: null,
  moreInfo: {},
  moreInfoStatus: {}
};

export const loadCoins = createAsyncThunk("coins/loadCoins", fetchMarketCoins);

export const loadMoreInfo = createAsyncThunk(
  "coins/loadMoreInfo",
  async (coinId: string, { getState }) => {
    const state = getState() as { coins: CoinsState };

    if (state.coins.moreInfo[coinId]) {
      return { coinId, prices: state.coins.moreInfo[coinId] };
    }

    const prices = await fetchCoinPrices(coinId);
    return { coinId, prices };
  }
);

const coinsSlice = createSlice({
  name: "coins",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCoins.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadCoins.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.coins = action.payload;
      })
      .addCase(loadCoins.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Could not load coins.";
      })
      .addCase(loadMoreInfo.pending, (state, action) => {
        state.moreInfoStatus[action.meta.arg] = "loading";
      })
      .addCase(loadMoreInfo.fulfilled, (state, action) => {
        state.moreInfoStatus[action.payload.coinId] = "succeeded";
        state.moreInfo[action.payload.coinId] = action.payload.prices;
      })
      .addCase(loadMoreInfo.rejected, (state, action) => {
        state.moreInfoStatus[action.meta.arg] = "failed";
      });
  }
});

export default coinsSlice.reducer;
