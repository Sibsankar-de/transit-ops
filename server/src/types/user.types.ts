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
};

export type SafeUser = Omit<UserModel, "passwordHash" | "refreshToken">;

