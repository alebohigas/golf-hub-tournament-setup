-- =====================================================================
-- Registro Preferente
-- =====================================================================
-- Habilita una ventana previa al pre-registro público donde SOLO los
-- socios de clubes autorizados pueden registrarse. Los clubes autorizados
-- se guardan en la tabla existente `clubs_registro` (id, torneoid, clubid)
-- y ahora también pueden tener su propia ventana individual de fechas.
--
-- Además se crea `registro_preferente_config` con la ventana global y
-- el flag `same_range` (1 = todos los clubes usan la misma ventana global,
-- 0 = cada club usa sus propias fechas).
-- =====================================================================

-- 1) Columnas por-club en `clubs_registro` para ventanas individuales.
--    NULL = usa la ventana global (cuando same_range = 0 y NULL, se
--    considera que el club no tiene ventana propia).
ALTER TABLE `clubs_registro`
  ADD COLUMN IF NOT EXISTS `fecha_inicio` DATE NULL DEFAULT NULL AFTER `clubid`,
  ADD COLUMN IF NOT EXISTS `fecha_fin`    DATE NULL DEFAULT NULL AFTER `fecha_inicio`;

-- 2) Configuración global del registro preferente por torneo.
CREATE TABLE IF NOT EXISTS `registro_preferente_config` (
  `torneoid`    INT(11)    NOT NULL PRIMARY KEY,
  `fecha_inicio` DATE      NULL DEFAULT NULL,
  `fecha_fin`    DATE      NULL DEFAULT NULL,
  -- 1 = todos los clubes autorizados comparten fecha_inicio/fecha_fin
  -- 0 = cada club usa las columnas fecha_inicio/fecha_fin de clubs_registro
  `same_range`  TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3) "Sin club" — opción de fallback cuando el jugador no encuentra su
--    club en la lista. INSERT IGNORE evita duplicar si ya existe.
INSERT IGNORE INTO `clubs` (`nombre`) VALUES ('Sin club');