import { api } from "../../app/api";

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUserList: builder.query({
      query: ({ search = "", page = 1, pageSize = 20 } = {}) => ({
        url: "/api/admin/users",
        params: { search, page, pageSize },
      }),
      providesTags: (result) =>
        result
          ? [...result.items.map(({ id }) => ({ type: "User", id })), { type: "User", id: "LIST" }]
          : [{ type: "User", id: "LIST" }],
    }),

    assignRoles: builder.mutation({
      query: ({ userId, roleIds }) => ({
        url: `/api/admin/users/${userId}/roles`,
        method: "PUT",
        body: { roleIds },
      }),
      invalidatesTags: (_, __, { userId }) => [{ type: "User", id: userId }, { type: "User", id: "LIST" }],
    }),
  }),
});

export const { useGetUserListQuery, useAssignRolesMutation } = usersApi;
