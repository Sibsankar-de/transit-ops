import { apiSlice } from "../apiSlice";
import { Role, ApiResponse, CreateRoleInput, UpdateRoleInput } from "@/types/api";

export const rolesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<ApiResponse<Role[]>, void>({
      query: () => "/roles",
      providesTags: ["Role"],
    }),
    getRoleById: builder.query<ApiResponse<Role>, string>({
      query: (id) => `/roles/${id}`,
      providesTags: (result, error, id) => [{ type: "Role", id }],
    }),
    createRole: builder.mutation<ApiResponse<Role>, CreateRoleInput>({
      query: (roleData) => ({
        url: "/roles",
        method: "POST",
        body: roleData,
      }),
      invalidatesTags: ["Role"],
    }),
    updateRole: builder.mutation<ApiResponse<Role>, { id: string; data: UpdateRoleInput }>({
      query: ({ id, data }) => ({
        url: `/roles/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ["Role", { type: "Role", id }],
    }),
    deleteRole: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Role"],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = rolesApiSlice;
