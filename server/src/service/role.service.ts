import { StatusCodes } from "http-status-codes";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import { toSafeRole } from "../dto/role.dto";
import { RoleModel } from "../types/role.types";
import { CreateRoleInput, UpdateRoleInput } from "../schemas/role.schema";

export async function createRole(data: CreateRoleInput): Promise<RoleModel> {
  const existing = await prisma.role.findUnique({ where: { name: data.name } });

  if (existing) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      "A role with this name already exists",
    );
  }

  const role = await prisma.role.create({ data });
  return toSafeRole(role as unknown as RoleModel);
}

export async function getRoles(): Promise<RoleModel[]> {
  const roles = await prisma.role.findMany();
  return roles.map((r) => toSafeRole(r as unknown as RoleModel));
}

export async function getRoleById(id: string): Promise<RoleModel> {
  const role = await prisma.role.findUnique({ where: { id } });

  if (!role) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Role not found");
  }

  return toSafeRole(role as unknown as RoleModel);
}

export async function updateRole(
  id: string,
  data: UpdateRoleInput,
): Promise<RoleModel> {
  const role = await prisma.role.findUnique({ where: { id } });

  if (!role) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Role not found");
  }

  if (data.name && data.name !== role.name) {
    const nameConflict = await prisma.role.findUnique({
      where: { name: data.name },
    });
    if (nameConflict) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        "A role with this name already exists",
      );
    }
  }

  const updated = await prisma.role.update({ where: { id }, data });
  return toSafeRole(updated as unknown as RoleModel);
}

export async function deleteRole(id: string): Promise<void> {
  const role = await prisma.role.findUnique({ where: { id } });

  if (!role) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Role not found");
  }

  await prisma.role.delete({ where: { id } });
}
