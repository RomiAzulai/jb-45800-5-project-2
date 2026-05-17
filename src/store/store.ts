import { configureStore } from "@reduxjs/toolkit";
import coinsReducer from "./coinsSlice";
import selectionReducer from "./selectionSlice";
import uiReducer from "./uiSlice";

export const store = configureStore({
  reducer: {
    coins: coinsReducer,
    selection: selectionReducer,
    ui: uiReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
