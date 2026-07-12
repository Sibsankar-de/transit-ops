import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { validateBody } from "../utils/validate.utils";
import { createRoleSchema, updateRoleSchema } from "../schemas/role.schema";
import {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
} from "../service/role.service";

export const createRoleHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const data = validateBody(createRoleSchema, req.body);
    const role = await createRole(data);

    return res
      .status(StatusCodes.CREATED)
      .json(
        new ApiResponse(StatusCodes.CREATED, role, "Role created successfully"),
      );
  },
);

export const getRolesHandler = asyncHandler(
  async (_req: Request, res: Response) => {
    const roles = await getRoles();

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, roles, "Roles fetched successfully"),
      );
  },
);

export const getRoleByIdHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const role = await getRoleById(req.params.id as string);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, role, "Role fetched successfully"));
  },
);

export const updateRoleHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const data = validateBody(updateRoleSchema, req.body);
    const role = await updateRole(req.params.id as string, data);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, role, "Role updated successfully"));
  },
);

export const deleteRoleHandler = asyncHandler(
  async (req: Request, res: Response) => {
    await deleteRole(req.params.id as string);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, null, "Role deleted successfully"));
  },
);
