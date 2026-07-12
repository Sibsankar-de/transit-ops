import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "../utils/ApiError";
import { Permission } from "../enums/permission.enum";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";

export const requirePermission = (permission: Permission) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        throw new ApiError(
          StatusCodes.UNAUTHORIZED,
          "Unauthorized – User is not authenticated",
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: { role: true },
      });

      if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
      }

      if (user.status !== "ACTIVE") {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          "Forbidden – User account is inactive or suspended",
        );
      }

      if (!user.role) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          "Forbidden – No role assigned to user",
        );
      }

      const permissions = user.role.permissions as string[];

      if (user.role.name === "Admin" || permissions.includes(permission)) {
        return next();
      }

      throw new ApiError(
        StatusCodes.FORBIDDEN,
        `Forbidden – Missing required permission: ${permission}`,
      );
    },
  );
};
