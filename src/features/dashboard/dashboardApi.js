import { api } from "../../app/api";

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => "/api/admin/dashboard/stats",
      providesTags: ["Dashboard"],
    }),
    getViewTrend: builder.query({
      query: (days = 30) => ({ url: "/api/admin/dashboard/trend", params: { days } }),
      providesTags: ["Dashboard"],
    }),
    getTopPages: builder.query({
      query: (take = 10) => ({ url: "/api/admin/dashboard/top-pages", params: { take } }),
      providesTags: ["Dashboard"],
    }),
    getRecentActivity: builder.query({
      query: (take = 15) => ({ url: "/api/admin/dashboard/recent-activity", params: { take } }),
      providesTags: ["Dashboard"],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetViewTrendQuery,
  useGetTopPagesQuery,
  useGetRecentActivityQuery,
} = dashboardApi;
