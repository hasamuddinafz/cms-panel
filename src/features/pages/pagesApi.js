import { api } from "../../app/api";

export const pagesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPageInstanceList: builder.query({
      query: ({ search = "", page = 1, pageSize = 20, sortBy = "", sortDir = "desc", modelKey = "", status = "" } = {}) => ({
        url: "/api/admin/page-instances",
        params: { search, page, pageSize, sortBy, sortDir, modelKey, status },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: "PageInstance", id })),
              { type: "PageInstance", id: "LIST" },
            ]
          : [{ type: "PageInstance", id: "LIST" }],
    }),

    getPageInstanceById: builder.query({
      query: (id) => `/api/admin/page-instances/${id}`,
      providesTags: (_, __, id) => [{ type: "PageInstance", id }],
    }),

    createPageInstance: builder.mutation({
      query: (body) => ({ url: "/api/admin/page-instances", method: "POST", body }),
      invalidatesTags: [{ type: "PageInstance", id: "LIST" }],
    }),

    updatePageInstance: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/api/admin/page-instances/${id}`, method: "PUT", body }),
      invalidatesTags: (_, __, { id }) => [{ type: "PageInstance", id }, { type: "PageInstance", id: "LIST" }],
    }),

    deletePageInstance: builder.mutation({
      query: (id) => ({ url: `/api/admin/page-instances/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "PageInstance", id: "LIST" }],
    }),

    changePageStatus: builder.mutation({
      query: ({ id, action }) => ({
        url: `/api/admin/page-instances/${id}/status`,
        method: "PUT",
        body: { action },
      }),
      invalidatesTags: (_, __, { id }) => [{ type: "PageInstance", id }, { type: "PageInstance", id: "LIST" }],
    }),
  }),
});

export const {
  useGetPageInstanceListQuery,
  useGetPageInstanceByIdQuery,
  useCreatePageInstanceMutation,
  useUpdatePageInstanceMutation,
  useDeletePageInstanceMutation,
  useChangePageStatusMutation,
} = pagesApi;
