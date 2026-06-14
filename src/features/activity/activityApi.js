import { api } from "../../app/api";

export const activityApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getActivityList: builder.query({
      query: ({ search = "", page = 1, pageSize = 20, sortBy = "createdAt", sortDir = "desc" } = {}) => ({
        url: "/api/admin/activity",
        params: { search, page, pageSize, sortBy, sortDir },
      }),
      providesTags: ["Activity"],
    }),
  }),
});

export const { useGetActivityListQuery } = activityApi;
