-- =====================================================================
-- Migration: Match por 3er lugar en /matchplay
-- =====================================================================
-- Agrega la columna `tl_grupo` (Third-Lugar grupo) a `elimin_salidas_cat`.
-- Cuando una fila (típicamente una semifinal) tiene `tl_grupo` != NULL,
-- el backend `matchplay_admin.php` propaga al PERDEDOR del match hacia el
-- match cuyo `matchx = tl_grupo`. Ese match destino usa la convención
-- `matchx = 199` (D1 3er lugar) para quedar fuera del rango contiguo
-- 1..N-1 y no romper la detección de tamaño del bracket en el frontend.
--
-- Toda la lógica sigue conviviendo con las columnas legacy `pl_grupo` /
-- `sl_grupo` (ganador). No se rompe nada existente.
-- =====================================================================

ALTER TABLE `elimin_salidas_cat`
  ADD COLUMN `tl_grupo` INT NULL DEFAULT NULL
  COMMENT '3er lugar: matchx destino del PERDEDOR de este match. Sólo se llena en semifinales de D1 cuando el admin habilita match por 3er lugar.';

-- Índice opcional para acelerar la propagación (self-join por catid+tl_grupo).
CREATE INDEX `idx_elimin_tl_grupo` ON `elimin_salidas_cat` (`catid`, `tl_grupo`);