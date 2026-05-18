-- ============================================================================
-- Migration: Putt Finales Brackets (Match Play final por sexo)
-- ============================================================================
-- Reemplaza el sistema viejo de brackets genéricos (`is_bracket` por premio en
-- oyes/oyesx/approach/putt/driver/driverp) por dos brackets fijos por torneo:
--   - prize_table = 'putt_finales', prize_id = 1, sexo = 'M' → "Putt Finales Caballero"
--   - prize_table = 'putt_finales', prize_id = 2, sexo = 'F' → "Putt Finales Dama"
--
-- Estos brackets se siembran automáticamente desde el ranking acumulado de putt
-- (misma lógica que listado_ganadores_put-2.php, separada correctamente por sexo).
--
-- Cambios:
--   1. Añade columnas `sexo` y `visible` a `bracket_config` para soportar el
--      par M/F y el toggle público desde admin.
--   2. (Opcional) limpia los flags `is_bracket` viejos. Comentado por defecto
--      para que el admin lo haga manualmente si quiere.
-- ============================================================================

ALTER TABLE bracket_config
  ADD COLUMN sexo    CHAR(1)    NULL        AFTER prize_id,
  ADD COLUMN visible TINYINT(1) NOT NULL DEFAULT 0 AFTER status;

-- La tabla legacy bracket_config no tenía columna `size` (el tamaño se
-- guardaba en otra parte). El nuevo sistema la requiere para persistir
-- 8/16/32/64/128 por sexo.
ALTER TABLE bracket_config
  ADD COLUMN size INT NOT NULL DEFAULT 16 AFTER sexo;

-- Opcional: apagar todos los flags viejos para que ya no aparezcan como
-- brackets en /competicion. (Descomenta si quieres limpiar de una.)
-- UPDATE oyes      SET is_bracket = 0;
-- UPDATE oyesx     SET is_bracket = 0;
-- UPDATE approach  SET is_bracket = 0;
-- UPDATE putt      SET is_bracket = 0;
-- UPDATE driver    SET is_bracket = 0;
-- UPDATE driverp   SET is_bracket = 0;