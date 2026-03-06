import pool from "../config/db.js";

const FIELDS = "id, title, body, status, author_id, created_at, updated_at";

// Public
export const getPublishedContentsService = async () => {
  const result = await pool.query(
    `SELECT ${FIELDS} FROM contents WHERE status = 'PUBLIE' ORDER BY created_at DESC`,
  );
  return result.rows;
};

export const getPublishedContentByIdService = async (id) => {
  const result = await pool.query(
    `SELECT ${FIELDS} FROM contents WHERE id = $1 AND status = 'PUBLIE'`,
    [id],
  );
  return result.rows[0];
};

// Admin
export const getAllContentsAdminService = async () => {
  const result = await pool.query(
    `SELECT ${FIELDS} FROM contents ORDER BY created_at DESC`,
  );
  return result.rows;
};

export const getContentByIdAdminService = async (id) => {
  const result = await pool.query(
    `SELECT ${FIELDS} FROM contents WHERE id = $1`,
    [id],
  );
  return result.rows[0];
};

export const createContentService = async ({ title, body, authorId }) => {
  const result = await pool.query(
    `INSERT INTO contents (title, body, status, author_id)
     VALUES ($1, $2, 'BROUILLON', $3)
     RETURNING ${FIELDS}`,
    [title, body, authorId],
  );
  return result.rows[0];
};

export const updateContentService = async (
  id,
  { title = null, body = null, status = null },
) => {
  const result = await pool.query(
    `UPDATE contents
     SET title = COALESCE($1, title),
         body = COALESCE($2, body),
         status = COALESCE($3, status),
         updated_at = NOW()
     WHERE id = $4
     RETURNING ${FIELDS}`,
    [title, body, status, id],
  );
  return result.rows[0];
};

export const deleteContentService = async (id) => {
  const result = await pool.query(
    `DELETE FROM contents WHERE id = $1 RETURNING ${FIELDS}`,
    [id],
  );
  return result.rows[0];
};

export const setContentCategoriesService = async (contentId, categoryIds) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `DELETE FROM contents_categories WHERE content_id = $1`,
      [contentId],
    );

    for (const catId of categoryIds) {
      await client.query(
        `INSERT INTO contents_categories (content_id, category_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [contentId, catId],
      );
    }

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};

export const getCategoriesForContentService = async (contentId) => {
  const result = await pool.query(
    `SELECT c.id, c.name
     FROM categories c
     JOIN contents_categories cc ON cc.category_id = c.id
     WHERE cc.content_id = $1
     ORDER BY c.name ASC`,
    [contentId],
  );
  return result.rows;
};
