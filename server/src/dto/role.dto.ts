import { RoleModel } from "../types/role.types";

export function toSafeRole(role: RoleModel): RoleModel {
  return {
    id: role.id,
    name: role.name,
    permissions: role.permissions as string[],
  };
}
