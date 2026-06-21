-- ===========================================================================
-- banderas_pin_sheet — Posición oficial de banderas (pin sheet) por torneo
-- ---------------------------------------------------------------------------
-- Una fila por (torneo_id, hole_number). Reemplaza por completo la versión
-- hard-codeada que vivía en el frontend: ahora la /banderas se alimenta
-- de esta tabla y el admin la captura desde /admin → Banderas.
--
-- Campos por hoyo (todos derivados del PDF oficial del comité):
--   depth          → profundidad total del green (frente → fondo).
--   pin_from_front → distancia vertical desde el frente del green hasta la
--                    bandera (número vertical en el sheet).
--   pin_from_side  → distancia horizontal desde el lado indicado hasta la
--                    bandera (número horizontal en el sheet).
--   pin_side       → 'L' o 'R': desde qué lado se mide pin_from_side.
--   center_offset  → número en el cuadrito superior. Posición de la bandera
--                    respecto al centro del green (positivo = hacia el
--                    fondo, negativo = hacia el frente).
--
-- Pasos / yardas se mantienen como números enteros — el campo no impone
-- unidad porque cada club publica su sheet en pasos.
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `banderas_pin_sheet` (
  `torneo_id`      INT(11)      NOT NULL,
  `hole_number`    TINYINT(3)   NOT NULL,
  `depth`          SMALLINT(5)  NOT NULL,
  `pin_from_front` SMALLINT(5)  NOT NULL,
  `pin_from_side`  SMALLINT(5)  NOT NULL,
  `pin_side`       ENUM('L','R') NOT NULL DEFAULT 'L',
  `center_offset`  SMALLINT(6)  NOT NULL DEFAULT 0,
  `updated_at`     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                                ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`torneo_id`, `hole_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================================================
-- banderas_round — Metadatos del round publicado (label, fecha visible)
-- ---------------------------------------------------------------------------
-- Una fila por torneo. Permite mostrar "Sábado 6 de junio 2026" arriba
-- de la grid sin meter ese texto en cada hoyo.
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `banderas_round` (
  `torneo_id`   INT(11)      NOT NULL,
  `round_label` VARCHAR(255) NULL,
  `round_date`  VARCHAR(64)  NULL,
  `updated_at`  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                             ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`torneo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;