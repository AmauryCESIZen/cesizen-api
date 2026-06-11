import prisma from "../config/prisma.js";
import { toSnakeCase } from "../utils/toSnakeCase.js";

export const invalidateOldTokensForUser = async (userId: number) => {
  await prisma.resetToken.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  });
};

interface CreateResetTokenInput {
  userId: number;
  tokenHash: string;
  expireAt: Date;
}

export const createResetTokenService = async ({
  userId,
  tokenHash,
  expireAt,
}: CreateResetTokenInput) => {
  const token = await prisma.resetToken.create({
    data: { userId, tokenHash, expireAt },
    select: {
      id: true,
      userId: true,
      expireAt: true,
      usedAt: true,
      createdAt: true,
    },
  });
  return toSnakeCase(token);
};

export const findValidResetTokenByHashService = async (tokenHash: string) => {
  const token = await prisma.resetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expireAt: { gt: new Date() },
    },
    select: {
      id: true,
      userId: true,
      tokenHash: true,
      expireAt: true,
      usedAt: true,
    },
  });
  return token ? toSnakeCase(token) : undefined;
};

export const markResetTokenUsedService = async (tokenId: number) => {
  const token = await prisma.resetToken.update({
    where: { id: tokenId },
    data: { usedAt: new Date() },
    select: { id: true, usedAt: true },
  });
  return toSnakeCase(token);
};
