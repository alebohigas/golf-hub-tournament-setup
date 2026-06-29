-- =============================================================
-- Consolidar columna pwd_hash dentro de pwd (la tabla usuarios ya usa pwd)
-- =============================================================
-- 1) Migra cualquier hash existente desde pwd_hash → pwd.
-- 2) Elimina la columna pwd_hash.
-- pwd debe poder almacenar un bcrypt (60 chars). Si fuera más chica, ampliarla.

UPDATE usuarios SET pwd = pwd_hash
  WHERE pwd_hash IS NOT NULL AND pwd_hash <> '';

SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios'
      AND COLUMN_NAME = 'pwd_hash') = 1,
  'ALTER TABLE usuarios DROP COLUMN pwd_hash',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

-- Asegura tamaño suficiente para bcrypt
SET @sql := IF(
  (SELECT CHARACTER_MAXIMUM_LENGTH FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios'
      AND COLUMN_NAME = 'pwd') < 255,
  'ALTER TABLE usuarios MODIFY COLUMN pwd VARCHAR(255) NULL',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;