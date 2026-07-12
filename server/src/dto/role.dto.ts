import { RoleModel } from "../types/role.types";

export function toSafeRole(role: any): any {
  if (!role) return null;
  return {
    id: role.id,
    name: role.name,
    permissions: role.permissions as string[],
  };
}
