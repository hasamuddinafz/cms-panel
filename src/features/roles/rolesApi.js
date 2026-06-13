import { api } from "../../app/api";

export const rolesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRoleList: builder.query({
      query: ({ search = "", page = 1, pageSize = 20 } = {}) => ({
        url: "/api/admin/roles",
        params: { search, page, pageSize },
      }),
      providesTags: (result) =>
        result
          ? [...result.items.map(({ id }) => ({ type: "Role", id })), { type: "Role", id: "LIST" }]
          : [{ type: "Role", id: "LIST" }],
    }),

    getAllPermissions: builder.query({
      query: () => "/api/admin/roles/permissions",
    }),

    getRoleById: builder.query({
      query: (id) => `/api/admin/roles/${id}`,
      providesTags: (_, __, id) => [{ type: "Role", id }],
    }),

    createRole: builder.mutation({
      query: (body) => ({ url: "/api/admin/roles", method: "POST", body }),
      invalidatesTags: [{ type: "Role", id: "LIST" }],
    }),

    updateRole: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/api/admin/roles/${id}`, method: "PUT", body }),
      invalidatesTags: (_, __, { id }) => [{ type: "Role", id }, { type: "Role", id: "LIST" }],
    }),

    deleteRole: builder.mutation({
      query: (id) => ({ url: `/api/admin/roles/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Role", id: "LIST" }],
    }),
  }),
});

export const {
  useGetRoleListQuery,
  useGetAllPermissionsQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = rolesApi;
