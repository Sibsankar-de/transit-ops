import { apiSlice } from "../apiSlice";
import { 
  Role, 
  ApiResponse, 
  PaginatedResponse,
  CreateRoleInput, 
  UpdateRoleInput,
  ListRolesParams
} from "@/types/api";

export const rolesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<ApiResponse<PaginatedResponse<Role>>, ListRolesParams | void>({
      query: (params = {}) => ({
        url: "/roles",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          ...(params?.search && { search: params.search }),
          ...(params?.sortBy && { sortBy: params.sortBy }),
          ...(params?.sortOrder && { sortOrder: params.sortOrder }),
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.docs.map(({ id }) => ({ type: "Role" as const, id })),
              { type: "Role" as const, id: "LIST" },
            ]
          : [{ type: "Role" as const, id: "LIST" }],
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
      invalidatesTags: [{ type: "Role", id: "LIST" }],
    }),
    updateRole: builder.mutation<ApiResponse<Role>, { id: string; data: UpdateRoleInput }>({
      query: ({ id, data }) => ({
        url: `/roles/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Role", id },
        { type: "Role", id: "LIST" },
      ],
    }),
    deleteRole: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Role", id: "LIST" }],
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
