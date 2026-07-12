import { SafeUser } from "../types/user.types";
import { toSafeRole } from "./role.dto";

export function toSafeUser(user: any): SafeUser {
  const { passwordHash: _ph, refreshToken: _rt, role, ...safe } = user;
  return {
    ...safe,
    role: role ? toSafeRole(role) : null,
  };
}
