import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { toast } from "sonner";
import { logout, setCredentials } from "../features/auth/authSlice";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

/**
 * Base query with automatic JWT refresh.
 * 1. Attaches Authorization: Bearer <accessToken> to every request.
 * 2. On 401, attempts one silent refresh via /api/auth/refresh.
 * 3. If refresh fails, dispatches logout().
 */
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
  credentials: "include", // sends httpOnly refresh-token cookie
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    // Try to refresh
    const refreshResult = await baseQuery(
      { url: "/api/auth/refresh", method: "POST" },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      api.dispatch(setCredentials(refreshResult.data));
      // Retry the original request with new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      toast.error("Your session has expired. Please sign in again.");
      api.dispatch(logout());
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "PageModel",
    "PageInstance",
    "File",
    "Menu",
    "Language",
    "Settings",
    "User",
    "Role",
    "AuditLog",
    "Dashboard",
    "Contact",
    "Subscriber",
    "MailTemplate",
  ],
  endpoints: () => ({}),
});
