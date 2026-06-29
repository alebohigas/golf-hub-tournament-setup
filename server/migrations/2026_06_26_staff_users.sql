-- =============================================================
-- Staff temporal — usuarios con permisos por área y rango de fechas
-- =============================================================
-- Reutiliza la tabla `usuarios` existente. Aquí solo creamos las
-- tablas auxiliares para áreas permitidas y sesiones activas.
-- =============================================================

-- (La columna pwd_hash fue eliminada; ahora usamos `pwd` directamente.
--  Ver 2026_06_29_drop_pwd_hash.sql)

-- Marcador para distinguir staff temporal del resto (tipo=99).
SET @sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios'
      AND COLUMN_NAME = 'tipo') = 0,
  'ALTER TABLE usuarios ADD COLUMN tipo INT NOT NULL DEFAULT 0',
  'SELECT 1');
PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

CREATE TABLE IF NOT EXISTS usuario_areas (
  usuario_id INT NOT NULL,
  area VARCHAR(40) NOT NULL,
  PRIMARY KEY (usuario_id, area),
  KEY idx_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS usuario_sesion (
  id INT NOT NULL AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  token CHAR(64) NOT NULL,
  expira DATETIME NOT NULL,
  creado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_token (token),
  KEY idx_usuario (usuario_id),
  KEY idx_expira (expira)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;