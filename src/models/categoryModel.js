import pool from "../config/db.js";

const FIELDS = "id, name, created_at, updated_at";

export const getAllCategoriesService = async () => {
  const result = await pool.query(
    `SELECT ${FIELDS} FROM categories ORDER BY name ASC`,
  );
  return result.rows;
};

export const getCategoryByIdService = async (id) => {
  const result = await pool.query(
    `SELECT ${FIELDS} FROM categories WHERE id = $1`,
    [id],
  );
  return result.rows[0];
};

export const createCategoryService = async (name) => {
  const result = await pool.query(
    `INSERT INTO categories (name) VALUES ($1) RETURNING ${FIELDS}`,
    [name],
  );
  return result.rows[0];
};

export const updateCategoryService = async (id, name) => {
  const result = await pool.query(
    `UPDATE categories SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING ${FIELDS}`,
    [name, id],
  );
  return result.rows[0];
};

export const deleteCategoryService = async (id) => {
  const result = await pool.query(
    `DELETE FROM categories WHERE id = $1 RETURNING ${FIELDS}`,
    [id],
  );
  return result.rows[0];
};
