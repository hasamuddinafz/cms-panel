import { api } from "../../app/api";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/api/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    refresh: builder.mutation({
      query: () => ({
        url: "/api/auth/refresh",
        method: "POST",
      }),
    }),
    revokeToken: builder.mutation({
      query: () => ({
        url: "/api/auth/revoke",
        method: "POST",
      }),
    }),
  }),
});

export const { useLoginMutation, useRefreshMutation, useRevokeTokenMutation } = authApi;
