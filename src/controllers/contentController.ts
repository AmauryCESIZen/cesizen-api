import type { Request, Response, NextFunction } from "express";
import {
  createContentService,
  deleteContentService,
  getAllContentsAdminService,
  getCategoriesForContentService,
  getContentByIdAdminService,
  getPublishedContentByIdService,
  getPublishedContentsService,
  setContentCategoriesService,
  updateContentService,
} from "../models/contentModel.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleResponse = (res: Response, status: number, message: string, data: any = null): void => {
  res.status(status).json({ status, message, data });
};

const isPrismaNotFoundError = (err: unknown): boolean => {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "P2025"
  );
};

// ── Public ────────────────────────────────────────────────────
export const getPublishedContents = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rows = await getPublishedContentsService();
    handleResponse(res, 200, "Contents fetched successfully", rows);
  } catch (err) {
    next(err);
  }
};

export const getPublishedContentById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const content = await getPublishedContentByIdService(Number(req.params.id));
    if (!content) {
      handleResponse(res, 404, "Content not found");
      return;
    }
    const categories = await getCategoriesForContentService(content.id);
    handleResponse(res, 200, "Content fetched successfully", {
      ...content,
      categories,
    });
  } catch (err) {
    next(err);
  }
};

// ── Admin ─────────────────────────────────────────────────────
export const getAllContentsAdmin = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rows = await getAllContentsAdminService();

    const contentsWithCategories = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rows.map(async (content: any) => {
        const categories = await getCategoriesForContentService(content.id);
        return { ...content, categories };
      }),
    );

    handleResponse(res, 200, "Contents fetched successfully", contentsWithCategories);
  } catch (err) {
    next(err);
  }
};

export const getContentByIdAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const content = await getContentByIdAdminService(Number(req.params.id));
    if (!content) {
      handleResponse(res, 404, "Content not found");
      return;
    }
    const categories = await getCategoriesForContentService(content.id);
    handleResponse(res, 200, "Content fetched successfully", {
      ...content,
      categories,
    });
  } catch (err) {
    next(err);
  }
};

export const createContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      handleResponse(res, 401, "Non authentifié.");
      return;
    }
    const { title, body, categoryIds } = req.body;

    const created = await createContentService({
      title,
      body,
      authorId: req.user.id,
    });

    if (Array.isArray(categoryIds)) {
      await setContentCategoriesService(created.id, categoryIds);
    }

    const categories = await getCategoriesForContentService(created.id);
    handleResponse(res, 201, "Content created successfully", {
      ...created,
      categories,
    });
  } catch (err) {
    next(err);
  }
};

export const updateContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, body, status, categoryIds } = req.body;

    const updated = await updateContentService(Number(req.params.id), {
      title,
      body,
      status,
    });
    if (!updated) {
      handleResponse(res, 404, "Content not found");
      return;
    }

    if (Array.isArray(categoryIds)) {
      await setContentCategoriesService(updated.id, categoryIds);
    }

    const categories = await getCategoriesForContentService(updated.id);
    handleResponse(res, 200, "Content updated successfully", {
      ...updated,
      categories,
    });
  } catch (err) {
    if (isPrismaNotFoundError(err)) {
      handleResponse(res, 404, "Content not found");
      return;
    }
    next(err);
  }
};

export const deleteContent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await deleteContentService(Number(req.params.id));
    if (!deleted) {
      handleResponse(res, 404, "Content not found");
      return;
    }
    handleResponse(res, 200, "Content deleted successfully", deleted);
  } catch (err) {
    if (isPrismaNotFoundError(err)) {
      handleResponse(res, 404, "Content not found");
      return;
    }
    next(err);
  }
};
