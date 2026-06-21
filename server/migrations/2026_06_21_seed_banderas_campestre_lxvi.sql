-- ===========================================================================
-- Seed: Pin sheet — LXVI Torneo Anual de Golf, Club Campestre Monterrey AC
-- Sábado 6 de junio 2026
-- ---------------------------------------------------------------------------
-- Antes de correr esta migración, asigna el torneo_id correcto del torneo
-- de Campestre. La variable @torneo_id se usa en todos los INSERTs.
--
-- IMPORTANTE: corre primero 2026_06_21_banderas_pin_sheet.sql para crear
-- las tablas. Esta migración es idempotente — borra cualquier pin sheet
-- previo del torneo antes de reinsertar.
-- ===========================================================================
SET @torneo_id := 0;  -- ⬅️  REEMPLAZA con el torneo_id correcto

DELETE FROM `banderas_pin_sheet` WHERE `torneo_id` = @torneo_id;

INSERT INTO `banderas_pin_sheet`
  (`torneo_id`, `hole_number`, `depth`, `pin_from_front`, `pin_from_side`, `pin_side`, `center_offset`)
VALUES
  (@torneo_id,  1, 36, 10, 12, 'L',  -6),
  (@torneo_id,  2, 35, 13, 26, 'L',   9),
  (@torneo_id,  3, 39,  8, 10, 'L', -10),
  (@torneo_id,  4, 27, 10, 19, 'L',   6),
  (@torneo_id,  5, 39, 10, 12, 'R',  -8),
  (@torneo_id,  6, 37,  9, 30, 'L',  12),
  (@torneo_id,  7, 43, 11, 32, 'L',  11),
  (@torneo_id,  8, 28, 10, 13, 'R',  -1),
  (@torneo_id,  9, 35,  8,  8, 'R', -10),
  (@torneo_id, 10, 36,  8, 26, 'L',   8),
  (@torneo_id, 11, 34,  7, 11, 'R',  -6),
  (@torneo_id, 12, 35,  7, 28, 'L',  11),
  (@torneo_id, 13, 33,  7, 13, 'L',  -4),
  (@torneo_id, 14, 38,  8, 11, 'R',  -8),
  (@torneo_id, 15, 34,  6,  7, 'L', -10),
  (@torneo_id, 16, 33, 16, 21, 'L',   5),
  (@torneo_id, 17, 33,  7, 27, 'R',  11),
  (@torneo_id, 18, 35,  8, 20, 'R',   3);

INSERT INTO `banderas_round` (`torneo_id`, `round_label`, `round_date`)
VALUES (@torneo_id,
        'LXVI Torneo Anual · Club Campestre Monterrey',
        'Sábado 6 de junio 2026')
ON DUPLICATE KEY UPDATE
  `round_label` = VALUES(`round_label`),
  `round_date`  = VALUES(`round_date`);