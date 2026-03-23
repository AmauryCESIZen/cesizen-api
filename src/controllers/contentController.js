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

const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({ status, message, data });
};

// Public
export const getPublishedContents = async (_req, res, next) => {
  try {
    const rows = await getPublishedContentsService();
    handleResponse(res, 200, "Contents fetched successfully", rows);
  } catch (err) {
    next(err);
  }
};

export const getPublishedContentById = async (req, res, next) => {
  try {
    const content = await getPublishedContentByIdService(req.params.id);
    if (!content) return handleResponse(res, 404, "Content not found");
    const categories = await getCategoriesForContentService(content.id);
    handleResponse(res, 200, "Content fetched successfully", {
      ...content,
      categories,
    });
  } catch (err) {
    next(err);
  }
};

// Admin
export const getAllContentsAdmin = async (_req, res, next) => {
  try {
    const rows = await getAllContentsAdminService();

    const contentsWithCategories = await Promise.all(
      rows.map(async (content) => {
        const categories = await getCategoriesForContentService(content.id);
        return {
          ...content,
          categories,
        };
      }),
    );

    handleResponse(
      res,
      200,
      "Contents fetched successfully",
      contentsWithCategories,
    );
  } catch (err) {
    next(err);
  }
};

export const getContentByIdAdmin = async (req, res, next) => {
  try {
    const content = await getContentByIdAdminService(req.params.id);
    if (!content) return handleResponse(res, 404, "Content not found");
    const categories = await getCategoriesForContentService(content.id);
    handleResponse(res, 200, "Content fetched successfully", {
      ...content,
      categories,
    });
  } catch (err) {
    next(err);
  }
};

export const createContent = async (req, res, next) => {
  try {
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

export const updateContent = async (req, res, next) => {
  try {
    const { title, body, status, categoryIds } = req.body;

    const updated = await updateContentService(req.params.id, {
      title,
      body,
      status,
    });
    if (!updated) return handleResponse(res, 404, "Content not found");

    if (Array.isArray(categoryIds)) {
      await setContentCategoriesService(updated.id, categoryIds);
    }

    const categories = await getCategoriesForContentService(updated.id);
    handleResponse(res, 200, "Content updated successfully", {
      ...updated,
      categories,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteContent = async (req, res, next) => {
  try {
    const deleted = await deleteContentService(req.params.id);
    if (!deleted) return handleResponse(res, 404, "Content not found");
    handleResponse(res, 200, "Content deleted successfully", deleted);
  } catch (err) {
    next(err);
  }
};
