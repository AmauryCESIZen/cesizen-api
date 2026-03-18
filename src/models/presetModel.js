import pool from "../config/db.js";

const FIELDS =
  "id, code, inspiration_s, apnee_s, expiration_s, actif, created_at, updated_at";

// Public
export const getActivePresetsService = async () => {
  const result = await pool.query(
    `SELECT ${FIELDS}
     FROM breathing_presets
     WHERE actif = TRUE
     ORDER BY inspiration_s ASC, expiration_s ASC`,
  );
  return result.rows;
};

export const getActivePresetByIdService = async (id) => {
  const result = await pool.query(
    `SELECT ${FIELDS}
     FROM breathing_presets
     WHERE id = $1 AND actif = TRUE`,
    [id],
  );
  return result.rows[0];
};

// Admin
export const getAllPresetsAdminService = async () => {
  const result = await pool.query(
    `SELECT ${FIELDS}
     FROM breathing_presets
     ORDER BY created_at DESC`,
  );
  return result.rows;
};

export const getPresetByIdAdminService = async (id) => {
  const result = await pool.query(
    `SELECT ${FIELDS} FROM breathing_presets WHERE id = $1`,
    [id],
  );
  return result.rows[0];
};

export const createPresetService = async (data) => {
  const { code, inspiration_s, apnee_s, expiration_s, actif } = data;
  const result = await pool.query(
    `INSERT INTO breathing_presets (code, inspiration_s, apnee_s, expiration_s, actif)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${FIELDS}`,
    [code, inspiration_s, apnee_s, expiration_s, actif],
  );
  return result.rows[0];
};

export const updatePresetService = async (id, data) => {
  const {
    code = null,
    inspiration_s = null,
    apnee_s = null,
    expiration_s = null,
    actif = null,
  } = data;

  const result = await pool.query(
    `UPDATE breathing_presets
     SET code = COALESCE($1, code),
         inspiration_s = COALESCE($2, inspiration_s),
         apnee_s = COALESCE($3, apnee_s),
         expiration_s = COALESCE($4, expiration_s),
         actif = COALESCE($5, actif),
         updated_at = NOW()
     WHERE id = $6
     RETURNING ${FIELDS}`,
    [code, inspiration_s, apnee_s, expiration_s, actif, id],
  );
  return result.rows[0];
};

export const deletePresetService = async (id) => {
  const result = await pool.query(
    `DELETE FROM breathing_presets WHERE id = $1 RETURNING ${FIELDS}`,
    [id],
  );
  return result.rows[0];
};
