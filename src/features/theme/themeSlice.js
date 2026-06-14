import { createSlice } from "@reduxjs/toolkit";

const saved = localStorage.getItem("nexus-theme");

const themeSlice = createSlice({
  name: "theme",
  initialState: { mode: saved === "dark" ? "dark" : "light" },
  reducers: {
    toggleTheme(state) {
      state.mode = state.mode === "dark" ? "light" : "dark";
      localStorage.setItem("nexus-theme", state.mode);
    },
    setTheme(state, { payload }) {
      state.mode = payload;
      localStorage.setItem("nexus-theme", payload);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
export const selectTheme = (s) => s.theme.mode;
