import pool from "../config/db.js";

const USER_SELECT_FIELDS = "id, email, role, statut, created_at, updated_at";
const USER_PUBLIC_FIELDS = "id, email, role, statut, created_at, updated_at";

export const getUserByEmailService = async (email) => {
  const result = await pool.query(
    `SELECT id, email, password_hash, role, statut, created_at, updated_at
     FROM users
     WHERE email = $1`,
    [email.toLowerCase()],
  );
  return result.rows[0];
};

export const createUserService = async (email, passwordHash) => {
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, role, statut)
     VALUES ($1, $2, 'USER', 'ACTIF')
     RETURNING ${USER_PUBLIC_FIELDS}`,
    [email.toLowerCase(), passwordHash],
  );
  return result.rows[0];
};

export const getUserPublicByIdService = async (id) => {
  const result = await pool.query(
    `SELECT ${USER_PUBLIC_FIELDS} FROM users WHERE id = $1`,
    [id],
  );
  return result.rows[0];
};

export const getAllUsersService = async () => {
  const result = await pool.query(
    `SELECT ${USER_SELECT_FIELDS} FROM users ORDER BY id ASC`,
  );
  return result.rows;
};

export const getUserByIdService = async (id) => {
  const result = await pool.query(
    `SELECT ${USER_SELECT_FIELDS} FROM users WHERE id = $1`,
    [id],
  );
  return result.rows[0];
};

export const updateUserService = async (
  id,
  { email = null, passwordHash = null, role = null, statut = null },
) => {
  const result = await pool.query(
    `UPDATE users
     SET email = COALESCE($1, email),
         password_hash = COALESCE($2, password_hash),
         role = COALESCE($3, role),
         statut = COALESCE($4, statut),
         updated_at = NOW()
     WHERE id = $5
     RETURNING ${USER_SELECT_FIELDS}`,
    [email ? email.toLowerCase() : null, passwordHash, role, statut, id],
  );
  return result.rows[0];
};

export const disableUserService = async (id) => {
  const result = await pool.query(
    `UPDATE users
     SET statut = 'DESACTIVE', updated_at = NOW()
     WHERE id = $1
     RETURNING ${USER_SELECT_FIELDS}`,
    [id],
  );
  return result.rows[0];
};

export const deleteUserService = async (id) => {
  const result = await pool.query(
    `DELETE FROM users WHERE id = $1
     RETURNING ${USER_SELECT_FIELDS}`,
    [id],
  );
  return result.rows[0];
};
