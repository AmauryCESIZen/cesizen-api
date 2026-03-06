import pool from "../config/db.js";

export const invalidateOldTokensForUser = async (userId) => {
  await pool.query(
    `UPDATE reset_tokens
     SET used_at = NOW()
     WHERE user_id = $1 AND used_at IS NULL`,
    [userId],
  );
};

export const createResetTokenService = async ({
  userId,
  tokenHash,
  expireAt,
}) => {
  const result = await pool.query(
    `INSERT INTO reset_tokens (user_id, token_hash, expire_at)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, expire_at, used_at, created_at`,
    [userId, tokenHash, expireAt],
  );
  return result.rows[0];
};

export const findValidResetTokenByHashService = async (tokenHash) => {
  const result = await pool.query(
    `SELECT id, user_id, token_hash, expire_at, used_at
     FROM reset_tokens
     WHERE token_hash = $1
       AND used_at IS NULL
       AND expire_at > NOW()
     LIMIT 1`,
    [tokenHash],
  );
  return result.rows[0];
};

export const markResetTokenUsedService = async (tokenId) => {
  const result = await pool.query(
    `UPDATE reset_tokens
     SET used_at = NOW()
     WHERE id = $1
     RETURNING id, used_at`,
    [tokenId],
  );
  return result.rows[0];
};
