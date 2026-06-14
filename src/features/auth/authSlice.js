import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "nexus-auth";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

const saved = loadFromStorage();

const initialState = {
  accessToken: saved?.accessToken ?? null,
  user:        saved?.user ?? null,
  permissions: saved?.permissions ?? [],
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { accessToken, user, permissions } = action.payload;
      state.accessToken  = accessToken;
      state.user         = user;
      state.permissions  = permissions ?? [];
      saveToStorage({ accessToken, user, permissions: permissions ?? [] });
    },
    logout(state) {
      state.accessToken = null;
      state.user        = null;
      state.permissions = [];
      clearStorage();
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectCurrentUser        = (s) => s.auth.user;
export const selectAccessToken        = (s) => s.auth.accessToken;
export const selectIsAuthenticated    = (s) => !!s.auth.accessToken;
export const selectPermissions        = (s) => s.auth.permissions;
