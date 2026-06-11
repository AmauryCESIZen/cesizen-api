import prisma from "../config/prisma.js";
import { toSnakeCase } from "../utils/toSnakeCase.js";
import type { ContentStatus } from "@prisma/client";

const contentSelect = {
  id: true,
  title: true,
  body: true,
  status: true,
  authorId: true,
  createdAt: true,
  updatedAt: true,
};

// ── Public ────────────────────────────────────────────────────
export const getPublishedContentsService = async () => {
  const contents = await prisma.content.findMany({
    where: { status: "PUBLIE" },
    select: contentSelect,
    orderBy: { createdAt: "desc" },
  });
  return toSnakeCase(contents);
};

export const getPublishedContentByIdService = async (id: number) => {
  const content = await prisma.content.findFirst({
    where: { id, status: "PUBLIE" },
    select: contentSelect,
  });
  return content ? toSnakeCase(content) : undefined;
};

// ── Admin ─────────────────────────────────────────────────────
export const getAllContentsAdminService = async () => {
  const contents = await prisma.content.findMany({
    select: contentSelect,
    orderBy: { createdAt: "desc" },
  });
  return toSnakeCase(contents);
};

export const getContentByIdAdminService = async (id: number) => {
  const content = await prisma.content.findUnique({
    where: { id },
    select: contentSelect,
  });
  return content ? toSnakeCase(content) : undefined;
};

interface CreateContentInput {
  title: string;
  body: string;
  authorId: number;
}

export const createContentService = async ({
  title,
  body,
  authorId,
}: CreateContentInput) => {
  const content = await prisma.content.create({
    data: { title, body, status: "BROUILLON", authorId },
    select: contentSelect,
  });
  return toSnakeCase(content);
};

interface UpdateContentInput {
  title?: string | null;
  body?: string | null;
  status?: ContentStatus | null;
}

export const updateContentService = async (
  id: number,
  { title = null, body = null, status = null }: UpdateContentInput,
) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {};
  if (title !== null) data.title = title;
  if (body !== null) data.body = body;
  if (status !== null) data.status = status;

  const content = await prisma.content.update({
    where: { id },
    data,
    select: contentSelect,
  });
  return toSnakeCase(content);
};

export const deleteContentService = async (id: number) => {
  const content = await prisma.content.delete({
    where: { id },
    select: contentSelect,
  });
  return toSnakeCase(content);
};

// ── Categories relationship ──────────────────────────────────
// Transaction Prisma : remplace BEGIN/COMMIT manuel
export const setContentCategoriesService = async (
  contentId: number,
  categoryIds: number[],
) => {
  await prisma.$transaction([
    prisma.contentCategory.deleteMany({ where: { contentId } }),
    ...categoryIds.map((categoryId) =>
      prisma.contentCategory.upsert({
        where: { contentId_categoryId: { contentId, categoryId } },
        update: {},
        create: { contentId, categoryId },
      }),
    ),
  ]);
};

export const getCategoriesForContentService = async (contentId: number) => {
  const links = await prisma.contentCategory.findMany({
    where: { contentId },
    select: {
      category: {
        select: { id: true, name: true },
      },
    },
    orderBy: { category: { name: "asc" } },
  });
  return links.map((link) => link.category);
};
