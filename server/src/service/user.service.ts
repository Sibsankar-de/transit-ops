import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/token.utils";
import { generateSecureToken } from "../utils/tokenGenerator";
import { TokenPayload, SafeUser } from "../types/user.types";
import {
  CreateUserInput,
  LoginInput,
  UpdateUserInput,
  UpdatePasswordInput,
} from "../schemas/user.schema";
import { toSafeUser } from "../dto/user.dto";
import { sendUserInviteEmail } from "./email.service";
import { RoleName } from "../enums/role.enum";
import { Permission } from "../enums/permission.enum";
import { env } from "../configs/env";

const SALT_ROUNDS = 12;

export async function createUser(data: CreateUserInput): Promise<SafeUser> {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      "A user with this email already exists",
    );
  }

  const plainPassword = generateSecureToken(128);
  const passwordHash = await bcrypt.hash(plainPassword, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
    },
  });

  const safeUser = toSafeUser(user);

  sendUserInviteEmail({
    name: safeUser.name,
    email: safeUser.email,
    password: plainPassword,
    role: safeUser.role?.name ?? "User",
  }).catch((err) => {
    console.error("[email.service] Failed to enqueue invite email:", err);
  });

  return safeUser;
}

export async function loginUser(data: LoginInput): Promise<{
  accessToken: string;
  refreshToken: string;
  user: SafeUser;
}> {
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  const passwordMatch = await bcrypt.compare(data.password, user.passwordHash);

  if (!passwordMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  const payload: TokenPayload = { userId: user.id, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const hashedRefreshToken = await bcrypt.hash(refreshToken, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefreshToken },
  });

  return { accessToken, refreshToken, user: toSafeUser(user) };
}

export async function logoutUser(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
}

export async function updateUser(
  userId: string,
  data: UpdateUserInput,
): Promise<SafeUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { name: data.name },
  });

  return toSafeUser(updated);
}

export async function updatePassword(
  userId: string,
  data: UpdatePasswordInput,
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  const passwordMatch = await bcrypt.compare(
    data.currentPassword,
    user.passwordHash,
  );

  if (!passwordMatch) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "Current password is incorrect",
    );
  }

  const passwordHash = await bcrypt.hash(data.newPassword, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}

export async function seedDefaultAdmin(): Promise<void> {
  const { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } = env;
  if (!DEFAULT_ADMIN_EMAIL || !DEFAULT_ADMIN_PASSWORD) {
    return;
  }

  // 1. Ensure the "Admin" role exists
  let adminRole = await prisma.role.findUnique({
    where: { name: RoleName.ADMIN },
  });

  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        name: RoleName.ADMIN,
        permissions: Object.values(Permission),
      },
    });
  }

  // 2. Ensure the admin user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: DEFAULT_ADMIN_EMAIL },
  });

  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, SALT_ROUNDS);

  if (!existingUser) {
    await prisma.user.create({
      data: {
        name: "Default Admin",
        email: DEFAULT_ADMIN_EMAIL,
        passwordHash,
        roleId: adminRole.id,
        status: "ACTIVE",
      },
    });
  } else {
    // Update the password and ensure they have the Admin role
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        passwordHash,
        roleId: adminRole.id,
      },
    });
  }
}

