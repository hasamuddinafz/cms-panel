import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  accessToken: null,
  user: null,         // { id, email, fullName }
  permissions: [],    // string[]
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
    },
    logout(state) {
      state.accessToken = null;
      state.user        = null;
      state.permissions = [];
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
