import { api } from "../../app/api";

export const menusApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMenuList: builder.query({ query: () => "/api/admin/menus", providesTags: ["Menu"] }),
    getMenuByKey: builder.query({ query: (key) => `/api/admin/menus/${key}`, providesTags: (_, __, key) => [{ type: "Menu", id: key }] }),
    upsertMenu: builder.mutation({ query: ({ key, items }) => ({ url: `/api/admin/menus/${key}`, method: "PUT", body: { itemsJson: JSON.stringify(items) } }), invalidatesTags: ["Menu"] }),
  }),
});

export const { useGetMenuListQuery, useGetMenuByKeyQuery, useUpsertMenuMutation } = menusApi;
