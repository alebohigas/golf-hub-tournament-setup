-- ===========================================================================
-- banderas — Pin sheet por torneo (hole-by-hole)
-- ---------------------------------------------------------------------------
-- Una fila por hoyo (1..18) por torneo. Editable desde /admin → Banderas.
-- Si no hay filas para un torneo, la página /banderas muestra mensaje de
-- disculpa y el admin puede ocultarla manualmente.
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `banderas` (
  `id`            INT(11) NOT NULL AUTO_INCREMENT,
  `torneo_id`     INT(11) NOT NULL,
  /* Número de hoyo (típicamente 1..18). */
  `hoyo`          INT(11) NOT NULL,
  /* Profundidad total del green (frente → fondo), en pasos / yardas. */
  `depth`         INT(11) NOT NULL,
  /* Distancia del FRENTE del green a la bandera. */
  `frente`        INT(11) NOT NULL,
  /* Distancia desde el lado indicado (L/R) a la bandera. */
  `lateral`       INT(11) NOT NULL,
  /* Lado desde el cual se midió `lateral`: 'L' (izquierdo) o 'R' (derecho). */
  `lateral_lado`  VARCHAR(1) NOT NULL DEFAULT 'L',
  /* Posición de la bandera respecto al CENTRO del green. Positivo = hacia
     el fondo, negativo = hacia el frente. */
  `desde_centro`  INT(11) NOT NULL DEFAULT 0,
  /* Texto opcional (notas, título visible en la card). */
  `titulo`        VARCHAR(255) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_torneo_hoyo` (`torneo_id`, `hoyo`),
  KEY `idx_torneo` (`torneo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
