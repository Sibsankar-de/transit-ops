import { apiSlice } from "../apiSlice";
import { 
  User, 
  ApiResponse, 
  PaginatedResponse,
  CreateUserInput, 
  LoginInput, 
  UpdateUserInput, 
  UpdatePasswordInput,
  ListUsersParams
} from "@/types/api";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<User>, LoginInput>({
      query: (credentials) => ({
        url: "/users/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User"],
    }),
    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: "/users/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
    createUser: builder.mutation<ApiResponse<User>, CreateUserInput>({
      query: (userData) => ({
        url: "/users/create-user",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),
    updateUser: builder.mutation<ApiResponse<User>, UpdateUserInput>({
      query: (profileData) => ({
        url: "/users/update",
        method: "PATCH",
        body: profileData,
      }),
      invalidatesTags: ["User"],
    }),
    updatePassword: builder.mutation<ApiResponse<null>, UpdatePasswordInput>({
      query: (passwordData) => ({
        url: "/users/update-password",
        method: "PATCH",
        body: passwordData,
      }),
    }),
    getUsers: builder.query<ApiResponse<PaginatedResponse<User>>, ListUsersParams | void>({
      query: (params = {}) => ({
        url: "/users",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          ...(params?.search && { search: params.search }),
          ...(params?.status && { status: params.status }),
          ...(params?.roleId && { roleId: params.roleId }),
          ...(params?.sortBy && { sortBy: params.sortBy }),
          ...(params?.sortOrder && { sortOrder: params.sortOrder }),
        },
      }),
      providesTags: ["User"],
    }),
    getCurrentUser: builder.query<ApiResponse<User>, void>({
      query: () => "/users/me", // TODO: backend missing GET /users/me
      providesTags: ["User"],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdatePasswordMutation,
  useGetUsersQuery,
  useGetCurrentUserQuery,
} = usersApiSlice;
