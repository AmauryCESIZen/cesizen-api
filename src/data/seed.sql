-- =========================
-- SEEDS
-- =========================
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