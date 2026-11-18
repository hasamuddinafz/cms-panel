import { api } from "../../app/api";

/*
 * The API stores each settings group as a JSON string:
 *   GET  → { generalJson: "{...}", seoJson: "{...}", ... }
 *   PUT  ← { generalJson: "{...}" }
 * These helpers expose plain objects to the UI ({ general, seo, smtp, localization, theme }).
 */
function parse(json) {
  if (!json) return {};
  if (typeof json === "object") return json;
  try { return JSON.parse(json); } catch { return {}; }
}

function toUiSettings(dto) {
  return {
    general:      parse(dto?.generalJson),
    seo:          parse(dto?.seoJson),
    smtp:         parse(dto?.smtpJson),
    localization: parse(dto?.localizationJson),
    theme:        parse(dto?.themeJson),
    updatedAt:    dto?.updatedAt,
  };
}

const updateGroup = (path, jsonKey) => (builder) =>
  builder.mutation({
    query: (form) => ({ url: `/api/admin/settings/${path}`, method: "PUT", body: { [jsonKey]: JSON.stringify(form) } }),
    invalidatesTags: ["Settings"],
  });

export const settingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query({
      query: () => "/api/admin/settings",
      transformResponse: toUiSettings,
      providesTags: ["Settings"],
    }),
    updateGeneral:      updateGroup("general", "generalJson")(builder),
    updateSeo:          updateGroup("seo", "seoJson")(builder),
    updateSmtp:         updateGroup("smtp", "smtpJson")(builder),
    updateLocalization: updateGroup("localization", "localizationJson")(builder),
    updateTheme:        updateGroup("theme", "themeJson")(builder),
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
