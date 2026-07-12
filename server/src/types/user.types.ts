import { RoleModel } from "./role.types";

export interface TokenPayload {
  userId: string;
  email: string;
}

export type UserModel = {
  id: string;
  name: string;
  email: string;
  status: string;
  passwordHash: string;
  refreshToken: string | null;
  createdAt: Date;
  updatedAt: Date;
  role: any;
};

export type SafeUser = Omit<UserModel, "passwordHash" | "refreshToken"> & {
  role: RoleModel;
};
