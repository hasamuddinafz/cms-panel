import { api } from "../../app/api";

export const subscribersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSubscribers: builder.query({
      query: ({ search = "", isActive, page = 1, pageSize = 20, sortBy = "subscribedAt", sortDir = "desc" } = {}) => ({
        url: "/api/admin/subscribers",
        params: { search, isActive, page, pageSize, sortBy, sortDir },
      }),
      providesTags: [{ type: "Subscriber", id: "LIST" }],
    }),
    deleteSubscriber: builder.mutation({
      query: (id) => ({ url: `/api/admin/subscribers/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Subscriber", id: "LIST" }],
    }),
  }),
});

export const { useGetSubscribersQuery, useDeleteSubscriberMutation } = subscribersApi;
