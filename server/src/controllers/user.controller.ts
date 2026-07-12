import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { validateBody } from "../utils/validate.utils";
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  cookieOptions,
} from "../utils/cookie-utils";
import {
  createUserSchema,
  loginSchema,
  updateUserSchema,
  updatePasswordSchema,
  listUsersQuerySchema,
} from "../schemas/user.schema";
import {
  createUser,
  loginUser,
  logoutUser,
  updateUser,
  updatePassword,
  getUsers,
} from "../service/user.service";

export const createUserHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const data = validateBody(createUserSchema, req.body);
    const user = await createUser(data);

    return res
      .status(StatusCodes.CREATED)
      .json(
        new ApiResponse(StatusCodes.CREATED, user, "User created successfully"),
      );
  },
);

export const loginHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const data = validateBody(loginSchema, req.body);
    const { accessToken, refreshToken, user } = await loginUser(data);

    return res
      .cookie("accessToken", accessToken, accessTokenCookieOptions)
      .cookie("refreshToken", refreshToken, refreshTokenCookieOptions)
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, user, "Login successful"));
  },
);

export const logoutHandler = asyncHandler(
  async (req: Request, res: Response) => {
    await logoutUser(req.user!.userId);

    return res
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, null, "Logout successful"));
  },
);

export const updateUserHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const data = validateBody(updateUserSchema, req.body);
    const user = await updateUser(req.user!.userId, data);

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, user, "User updated successfully"));
  },
);

export const updatePasswordHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const data = validateBody(updatePasswordSchema, req.body);
    await updatePassword(req.user!.userId, data);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, null, "Password updated successfully"),
      );
  },
);

export const getUsersHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const query = validateBody(listUsersQuerySchema, req.query);
    const result = await getUsers(query);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, result, "Users fetched successfully"),
      );
  },
);
