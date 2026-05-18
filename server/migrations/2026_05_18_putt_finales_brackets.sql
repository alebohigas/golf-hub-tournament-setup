-- ============================================================================
-- Migration: Putt Finales Brackets (Match Play final por sexo)
-- ============================================================================
-- Reemplaza el sistema viejo de brackets genéricos (`is_bracket` por premio)
-- por dos brackets fijos por torneo:
--   - prize_table = 'putt_finales', prize_id = 1, sexo = 'M' → Caballero
--   - prize_table = 'putt_finales', prize_id = 2, sexo = 'F' → Dama
--
-- IMPORTANT: La tabla legacy `bracket_config` ya trae estas columnas:
--   id, torneoid, prize_table (ENUM), prize_id, bracket_size, seed_source,
--   seed_categoriaid, seed_premio, seed_hoyo, seed_campo, advance_mode,
--   status (ENUM 'pending','seeded','in_progress','completed'),
--   created_at, updated_at.
--
-- El nuevo flujo NO usa: bracket_size se reutiliza tal cual (NO crear `size`),
-- status usa 'pending' inicial y 'seeded' tras generar, NO crear `advancement`.
--
-- Lo único que hay que AÑADIR a la tabla legacy es:
--   1. La columna `sexo` (M / F) para distinguir Caballero / Dama.
--   2. La columna `visible` (0/1) para el toggle público desde admin.
--   3. Extender el ENUM `prize_table` para aceptar 'putt_finales'.
-- ============================================================================

-- 1) Extender ENUM prize_table para incluir 'putt_finales'.
ALTER TABLE bracket_config
  MODIFY COLUMN prize_table
    ENUM('oyes','oyesx','approach','putt','driver','driverp','putt_finales')
    NOT NULL;

-- 2) Añadir columnas sexo + visible (si aún no existen).
ALTER TABLE bracket_config
  ADD COLUMN sexo    CHAR(1)    NULL              AFTER prize_id,
  ADD COLUMN visible TINYINT(1) NOT NULL DEFAULT 0 AFTER status;

-- NOTA: NO se crean columnas `size` ni `advancement` — el backend usa
-- `bracket_size` (legacy) aliaseada en los SELECT como `size` para el front.

-- Opcional: apagar flags is_bracket viejos para que ya no aparezcan
-- como brackets en /competicion. Descomenta si quieres limpiar de una.
-- UPDATE oyes     SET is_bracket = 0;
-- UPDATE oyesx    SET is_bracket = 0;
-- UPDATE approach SET is_bracket = 0;
-- UPDATE putt     SET is_bracket = 0;
-- UPDATE driver   SET is_bracket = 0;
-- UPDATE driverp  SET is_bracket = 0;
