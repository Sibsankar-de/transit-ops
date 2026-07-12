import { randomBytes } from "crypto";

export const generateSecureToken = (bits: number): string => {
  const bytes = bits / 8;
  return randomBytes(bytes).toString("hex");
};
