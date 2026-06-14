import { api } from "../../app/api";

export const settingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query({ query: () => "/api/admin/settings", providesTags: ["Settings"] }),
    updateGeneral: builder.mutation({ query: (body) => ({ url: "/api/admin/settings/general", method: "PUT", body }), invalidatesTags: ["Settings"] }),
    updateSeo: builder.mutation({ query: (body) => ({ url: "/api/admin/settings/seo", method: "PUT", body }), invalidatesTags: ["Settings"] }),
    updateSmtp: builder.mutation({ query: (body) => ({ url: "/api/admin/settings/smtp", method: "PUT", body }), invalidatesTags: ["Settings"] }),
    updateLocalization: builder.mutation({ query: (body) => ({ url: "/api/admin/settings/localization", method: "PUT", body }), invalidatesTags: ["Settings"] }),
    updateTheme: builder.mutation({ query: (body) => ({ url: "/api/admin/settings/theme", method: "PUT", body }), invalidatesTags: ["Settings"] }),
  }),
});

export const {
  useGetSettingsQuery,
  useUpdateGeneralMutation,
  useUpdateSeoMutation,
  useUpdateSmtpMutation,
  useUpdateLocalizationMutation,
  useUpdateThemeMutation,
} = settingsApi;
