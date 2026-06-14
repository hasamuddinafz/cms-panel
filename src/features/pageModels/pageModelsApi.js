import { api } from "../../app/api";

export const pageModelsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPageModelList: builder.query({
      query: ({ search = "", page = 1, pageSize = 20 } = {}) => ({ url: "/api/admin/page-models", params: { search, page, pageSize } }),
      providesTags: ["PageModel"],
    }),
    getPageModelById: builder.query({
      query: (id) => `/api/admin/page-models/${id}`,
      providesTags: (_, __, id) => [{ type: "PageModel", id }],
    }),
    createPageModel: builder.mutation({ query: (body) => ({ url: "/api/admin/page-models", method: "POST", body }), invalidatesTags: ["PageModel"] }),
    updatePageModel: builder.mutation({ query: ({ id, ...body }) => ({ url: `/api/admin/page-models/${id}`, method: "PUT", body: { id, ...body } }), invalidatesTags: ["PageModel"] }),
    deletePageModel: builder.mutation({ query: (id) => ({ url: `/api/admin/page-models/${id}`, method: "DELETE" }), invalidatesTags: ["PageModel"] }),
  }),
});

export const {
  useGetPageModelListQuery,
  useGetPageModelByIdQuery,
  useCreatePageModelMutation,
  useUpdatePageModelMutation,
  useDeletePageModelMutation,
} = pageModelsApi;
