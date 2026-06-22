-- ===========================================================================
-- banderas — agregar columna `fecha` para permitir pin sheets por día.
-- ---------------------------------------------------------------------------
-- Antes: una fila por (torneo_id, hoyo).
-- Después: una fila por (torneo_id, hoyo, fecha) — el admin puede precargar
-- la posición de banderas para los N días del torneo, y el jugador sólo
-- puede ver fechas <= hoy.
--
-- Las filas existentes adoptan CURDATE() como fecha (asumimos que el dato
-- cargado corresponde al día actual). Si necesitas otra fecha base, edítala
-- a mano antes de correr esta migración.
-- ===========================================================================

-- 1) Agregar columna nullable temporalmente.
ALTER TABLE `banderas`
  ADD COLUMN `fecha` DATE NULL AFTER `torneo_id`;

-- 2) Backfill: las filas existentes se asignan a la fecha de hoy.
UPDATE `banderas` SET `fecha` = CURDATE() WHERE `fecha` IS NULL;

-- 3) Forzar NOT NULL.
ALTER TABLE `banderas`
  MODIFY COLUMN `fecha` DATE NOT NULL;

-- 4) Reemplazar el unique key: ahora la clave es (torneo_id, hoyo, fecha).
ALTER TABLE `banderas`
  DROP INDEX `uniq_torneo_hoyo`,
  ADD UNIQUE KEY `uniq_torneo_fecha_hoyo` (`torneo_id`, `fecha`, `hoyo`),
  ADD KEY `idx_torneo_fecha` (`torneo_id`, `fecha`);