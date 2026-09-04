-- ------------------------------------------------------------------
-- convocatoria_content: columna updated_at
-- ------------------------------------------------------------------
-- Objetivo: guardar la última modificación real de la convocatoria por
-- torneo, para mostrarla en la página pública igual que "Actualizado"
-- en Estadísticas por categoría.
--
-- Idempotente: sólo agrega la columna si no existe.
-- ------------------------------------------------------------------

SET @has_col := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME   = 'convocatoria_content'
    AND COLUMN_NAME  = 'updated_at'
);

SET @sql := IF(@has_col = 0,
  'ALTER TABLE convocatoria_content
     ADD COLUMN updated_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP
       ON UPDATE CURRENT_TIMESTAMP',
  'SELECT "convocatoria_content.updated_at ya existe" AS nota');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Semilla inicial: filas previas sin fecha quedan con la fecha actual.
UPDATE convocatoria_content SET updated_at = NOW() WHERE updated_at IS NULL;
