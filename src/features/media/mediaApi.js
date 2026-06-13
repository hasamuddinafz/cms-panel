import { api } from "../../app/api";

export const mediaApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFileList: builder.query({
      query: ({ search = "", page = 1, pageSize = 20, fileType } = {}) => ({
        url: "/api/admin/files",
        params: { search, page, pageSize, ...(fileType ? { fileType } : {}) },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: "File", id })),
              { type: "File", id: "LIST" },
            ]
          : [{ type: "File", id: "LIST" }],
    }),

    getFileById: builder.query({
      query: (id) => `/api/admin/files/${id}`,
      providesTags: (_, __, id) => [{ type: "File", id }],
    }),

    uploadFile: builder.mutation({
      query: (formData) => ({
        url: "/api/admin/files/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "File", id: "LIST" }],
    }),

    deleteFile: builder.mutation({
      query: (id) => ({ url: `/api/admin/files/${id}`, method: "DELETE" }),
      invalidatesTags: (_, __, id) => [{ type: "File", id }, { type: "File", id: "LIST" }],
    }),

    updateAltText: builder.mutation({
      query: ({ id, altTextJson }) => ({
        url: `/api/admin/files/${id}/alt-text`,
        method: "PUT",
        body: { altTextJson },
      }),
      invalidatesTags: (_, __, { id }) => [{ type: "File", id }],
    }),
  }),
});

export const {
  useGetFileListQuery,
  useGetFileByIdQuery,
  useUploadFileMutation,
  useDeleteFileMutation,
  useUpdateAltTextMutation,
} = mediaApi;
