import { api } from "../../app/api";

export const languagesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLanguages: builder.query({ query: () => "/api/admin/languages", providesTags: ["Language"] }),
    createLanguage: builder.mutation({ query: (body) => ({ url: "/api/admin/languages", method: "POST", body }), invalidatesTags: ["Language"] }),
    updateLanguage: builder.mutation({ query: ({ id, ...body }) => ({ url: `/api/admin/languages/${id}`, method: "PUT", body }), invalidatesTags: ["Language"] }),
    deleteLanguage: builder.mutation({ query: (id) => ({ url: `/api/admin/languages/${id}`, method: "DELETE" }), invalidatesTags: ["Language"] }),
  }),
});

export const { useGetLanguagesQuery, useCreateLanguageMutation, useUpdateLanguageMutation, useDeleteLanguageMutation } = languagesApi;
