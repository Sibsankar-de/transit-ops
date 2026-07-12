import jwt from "jsonwebtoken";
import { env } from "../configs/env";
import { TokenPayload } from "../types/user.types";

export const generateAccessToken = (payload: TokenPayload): string =>
  jwt.sign(payload, env.ACCESS_TOKEN_SECRET!, {
    expiresIn: env.ACCESS_TOKEN_EXPIRY as unknown as number,
  });

export const generateRefreshToken = (payload: TokenPayload): string =>
  jwt.sign(payload, env.REFRESH_TOKEN_SECRET!, {
    expiresIn: env.REFRESH_TOKEN_EXPIRY as unknown as number,
  });

export const verifyAccessToken = (token: string): TokenPayload =>
  jwt.verify(token, env.ACCESS_TOKEN_SECRET!) as TokenPayload;
