import { SafeUser, UserModel } from "../types/user.types";

export function toSafeUser(user: UserModel): SafeUser {
  const { passwordHash: _ph, refreshToken: _rt, ...safe } = user;
  return safe;
}
