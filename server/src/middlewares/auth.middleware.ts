import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { verifyAccessToken } from "../utils/token.utils";

export const verifyJWT = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token: string | undefined = req.cookies?.accessToken;

    if (!token) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Unauthorised – no access token provided",
      );
    }

    try {
      req.user = verifyAccessToken(token);
      next();
    } catch {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        "Unauthorised – invalid or expired token",
      );
    }
  },
);
