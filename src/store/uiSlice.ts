import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  searchTerm: string;
}

const initialState: UiState = {
  searchTerm: ""
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSearchTerm(state, action: PayloadAction<string>) {
      state.searchTerm = action.payload;
    }
  }
});

export const { setSearchTerm } = uiSlice.actions;
export default uiSlice.reducer;
