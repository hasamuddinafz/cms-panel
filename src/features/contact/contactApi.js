import { api } from "../../app/api";

export const contactApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getContactMessages: builder.query({
      query: ({ search = "", isRead, page = 1, pageSize = 20, sortBy = "createdAt", sortDir = "desc" } = {}) => ({
        url: "/api/admin/contact",
        params: { search, isRead, page, pageSize, sortBy, sortDir },
      }),
      providesTags: [{ type: "Contact", id: "LIST" }],
    }),
    markContactRead: builder.mutation({
      query: ({ id, isRead }) => ({ url: `/api/admin/contact/${id}/read`, method: "PUT", body: { isRead } }),
      invalidatesTags: [{ type: "Contact", id: "LIST" }],
    }),
    replyContact: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/api/admin/contact/${id}/reply`, method: "POST", body }),
      invalidatesTags: [{ type: "Contact", id: "LIST" }],
    }),
    deleteContactMessage: builder.mutation({
      query: (id) => ({ url: `/api/admin/contact/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Contact", id: "LIST" }],
    }),
  }),
});

export const {
  useGetContactMessagesQuery,
  useMarkContactReadMutation,
  useReplyContactMutation,
  useDeleteContactMessageMutation,
} = contactApi;
