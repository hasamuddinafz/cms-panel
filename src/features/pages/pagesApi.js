import { api } from "../../app/api";

export const pagesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPageInstanceList: builder.query({
      query: ({ search = "", page = 1, pageSize = 20, sortBy = "", sortDir = "desc", pageModelId = "", status = "" } = {}) => ({
        url: "/api/admin/pages",
        params: { search, page, pageSize, sortBy, sortDir, pageModelId, status },
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
      query: (id) => `/api/admin/pages/${id}`,
      providesTags: (_, __, id) => [{ type: "PageInstance", id }],
    }),

    createPageInstance: builder.mutation({
      query: (body) => ({ url: "/api/admin/pages", method: "POST", body }),
      invalidatesTags: [{ type: "PageInstance", id: "LIST" }],
    }),

    updatePageInstance: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/api/admin/pages/${id}`, method: "PUT", body: { id, ...body } }),
      invalidatesTags: (_, __, { id }) => [{ type: "PageInstance", id }, { type: "PageInstance", id: "LIST" }],
    }),

    deletePageInstance: builder.mutation({
      query: (id) => ({ url: `/api/admin/pages/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "PageInstance", id: "LIST" }],
    }),

    publishPage: builder.mutation({
      query: (id) => ({ url: `/api/admin/pages/${id}/publish`, method: "POST" }),
      invalidatesTags: (_, __, id) => [{ type: "PageInstance", id }, { type: "PageInstance", id: "LIST" }],
    }),

    archivePage: builder.mutation({
      query: (id) => ({ url: `/api/admin/pages/${id}/archive`, method: "POST" }),
      invalidatesTags: (_, __, id) => [{ type: "PageInstance", id }, { type: "PageInstance", id: "LIST" }],
    }),

    unpublishPage: builder.mutation({
      query: (id) => ({ url: `/api/admin/pages/${id}/unpublish`, method: "POST" }),
      invalidatesTags: (_, __, id) => [{ type: "PageInstance", id }, { type: "PageInstance", id: "LIST" }],
    }),
  }),
});

export const {
  useGetPageInstanceListQuery,
  useGetPageInstanceByIdQuery,
  useCreatePageInstanceMutation,
  useUpdatePageInstanceMutation,
  useDeletePageInstanceMutation,
  usePublishPageMutation,
  useArchivePageMutation,
  useUnpublishPageMutation,
} = pagesApi;
