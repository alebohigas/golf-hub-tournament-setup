-- ===========================================================================
-- registro_precios — Tabla de reglas de precio para Pre-Registro
-- ---------------------------------------------------------------------------
-- Una fila = una regla. El frontend / endpoint elige la regla más específica
-- (mayor prioridad y menos campos NULL) según los datos del jugador
-- (categoría, tipo de socio, género, edad).
--
-- Todos los filtros (categoria, tipo_socio, genero, edad_min, edad_max)
-- son OPCIONALES: NULL = "aplica a todos".
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `registro_precios` (
  `id`          INT(11)        NOT NULL AUTO_INCREMENT,
  `torneo_id`   INT(11)        NOT NULL,
  `etiqueta`    VARCHAR(120)   NULL,             -- Texto humano: "Socio Titular Caballero", etc.
  `categoria`   VARCHAR(120)   NULL,             -- Nombre de categoría exacto (o NULL = cualquiera)
  `tipo_socio` ENUM('SOCIO','NO_SOCIO','TITULAR','EMERITO','DEPENDIENTE','INVITADO','FORANEO') NULL,
  `genero`      ENUM('M','F')  NULL,
  `edad_min`    INT(11)        NULL,
  `edad_max`    INT(11)        NULL,
  `precio`      DECIMAL(10,2)  NOT NULL DEFAULT 0,
  `moneda`      VARCHAR(3)     NOT NULL DEFAULT 'MXN',
  `incluye`     TEXT           NULL,             -- "Incluye carrito, comida, kit, etc."
  `prioridad`   INT(11)        NOT NULL DEFAULT 0,  -- Tie-breaker manual; mayor = gana
  `display_order` INT(11)      NOT NULL DEFAULT 0,
  `is_active`   TINYINT(1)     NOT NULL DEFAULT 1,
  `updated_at`  TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_torneo` (`torneo_id`),
  KEY `idx_match`  (`torneo_id`, `is_active`, `prioridad`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Campo en `registro` para guardar el precio que se mostró al jugador
-- al momento del envío (referencia/auditoría — no se recalcula después).
ALTER TABLE `registro`
  ADD COLUMN IF NOT EXISTS `torneoid` INT(11) NULL,
  ADD COLUMN IF NOT EXISTS `reg_precio_estimado` DECIMAL(10,2) NULL AFTER `reg_categoria`,
  ADD COLUMN IF NOT EXISTS `reg_precio_moneda`   VARCHAR(3)    NULL AFTER `reg_precio_estimado`,
  ADD COLUMN IF NOT EXISTS `reg_precio_regla_id` INT(11)       NULL AFTER `reg_precio_moneda`;
