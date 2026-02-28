-- =========================
-- USERS
-- =========================
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'USER',
  statut        VARCHAR(20) NOT NULL DEFAULT 'ACTIF',
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT users_role_check CHECK (role IN ('USER', 'ADMIN')),
  CONSTRAINT users_statut_check CHECK (statut IN ('ACTIF', 'DESACTIVE'))
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_statut ON users(statut);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================
-- RESET TOKENS
-- =========================
CREATE TABLE IF NOT EXISTS reset_tokens (
  id            SERIAL PRIMARY KEY,
  user_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash    VARCHAR(255) UNIQUE NOT NULL,
  expire_at     TIMESTAMP NOT NULL,
  used_at       TIMESTAMP NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reset_tokens_user_id ON reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_expire_at ON reset_tokens(expire_at);

-- =========================
-- CATEGORIES
-- =========================
CREATE TABLE IF NOT EXISTS categories (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_categories_updated_at ON categories;
CREATE TRIGGER trg_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================
-- CONTENTS
-- =========================
CREATE TABLE IF NOT EXISTS contents (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  body        TEXT NOT NULL,
  status      VARCHAR(20) NOT NULL DEFAULT 'BROUILLON',
  author_id   INT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT contents_status_check CHECK (status IN ('BROUILLON', 'PUBLIE'))
);

CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status);
CREATE INDEX IF NOT EXISTS idx_contents_author_id ON contents(author_id);

DROP TRIGGER IF EXISTS trg_contents_updated_at ON contents;
CREATE TRIGGER trg_contents_updated_at
BEFORE UPDATE ON contents
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================
-- CONTENTS <-> CATEGORIES (N..N)
-- =========================
CREATE TABLE IF NOT EXISTS contents_categories (
  content_id  INT NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, category_id)
);

-- =========================
-- BREATHING PRESETS
-- =========================
CREATE TABLE IF NOT EXISTS breathing_presets (
  id            SERIAL PRIMARY KEY,
  code          VARCHAR(10) UNIQUE NOT NULL,   -- ex: 748, 55, 46
  inspiration_s INT NOT NULL CHECK (inspiration_s > 0),
  apnee_s       INT NOT NULL CHECK (apnee_s >= 0),
  expiration_s  INT NOT NULL CHECK (expiration_s > 0),
  actif         BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_breathing_presets_updated_at ON breathing_presets;
CREATE TRIGGER trg_breathing_presets_updated_at
BEFORE UPDATE ON breathing_presets
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================
-- SEEDS
-- =========================

-- ⚠️ Remplace les hashes par de vrais bcrypt hashes
-- (tu peux générer avec un petit script Node ou un site bcrypt)
INSERT INTO users (email, password_hash, role, statut)
VALUES
  ('admin@cesizen.fr', '$2b$12$MDq5AJ24AotE1K0DUMEsz.obZ4KpsZ5bDQq6nUglTnmZutW7LMwhK', 'ADMIN', 'ACTIF'),
  ('user@cesizen.fr',  '$2b$12$0dRjb.43.fX7hr.LUm7VkuzNxTYOVSWCeinaNHPdTS7jtCyn.wiyS',  'USER',  'ACTIF')
ON CONFLICT (email) DO NOTHING;

INSERT INTO categories (name)
VALUES ('Stress'), ('Sommeil')
ON CONFLICT DO NOTHING;

INSERT INTO contents (title, body, status, author_id)
VALUES
  ('Comprendre le stress', 'Contenu de démonstration...', 'PUBLIE', (SELECT id FROM users WHERE email='admin@cesizen.local')),
  ('Améliorer son sommeil', 'Contenu de démonstration...', 'BROUILLON', (SELECT id FROM users WHERE email='admin@cesizen.local'));

INSERT INTO contents_categories (content_id, category_id)
SELECT c.id, cat.id
FROM contents c, categories cat
WHERE c.title='Comprendre le stress' AND cat.name='Stress'
ON CONFLICT DO NOTHING;

INSERT INTO breathing_presets (code, inspiration_s, apnee_s, expiration_s)
VALUES
  ('748', 7, 4, 8),
  ('55',  5, 0, 5),
  ('46',  4, 0, 6)
ON CONFLICT (code) DO NOTHING;