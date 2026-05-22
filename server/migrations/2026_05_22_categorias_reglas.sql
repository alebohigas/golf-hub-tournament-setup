-- ===========================================================================
-- categorias_reglas — Reglas de ELEGIBILIDAD de categoría para Pre-Registro
-- ---------------------------------------------------------------------------
-- Separa "quién puede inscribirse en qué categoría" de "cuánto cuesta".
-- Antes, ambas cosas vivían mezcladas en `registro_precios` y eso
-- provocaba que cambiar el tipo de socio o el handicap afectara qué
-- categorías aparecían en el dropdown.
--
-- Después de esta migración:
--   - `categorias_reglas`  → SOLO filtros de elegibilidad (edad/género/hcp)
--   - `registro_precios`   → SOLO costos por tipo de socio
--
-- Auto-poblamiento: el endpoint `categorias_reglas.php` migra al primer
-- GET las reglas existentes en `registro_precios` que tengan restricciones
-- de edad/género/hcp, agrupadas por (categoria, genero, edad_min,
-- edad_max, hcp_min, hcp_max). Esto preserva la configuración previa
-- del torneo sin que el admin tenga que rehacer el trabajo.
-- ===========================================================================
CREATE TABLE IF NOT EXISTS `categorias_reglas` (
  `id`             INT(11) NOT NULL AUTO_INCREMENT,
  `torneo_id`      INT(11) NOT NULL,
  /* Nombre EXACTO de la categoría (igual que en `categorias.categoria`). */
  `categoria`      VARCHAR(255) NOT NULL,
  /* 'M' | 'F' | NULL = ambos. */
  `genero`         VARCHAR(8) NULL,
  /* Rango de edad (años cumplidos). NULL = sin tope. */
  `edad_min`       INT(11) NULL,
  `edad_max`       INT(11) NULL,
  /* Rango de hándicap. NULL = sin tope. Decimales y negativos OK. */
  `hcp_min`        DECIMAL(4,1) NULL,
  `hcp_max`        DECIMAL(4,1) NULL,
  `display_order`  INT(11) NOT NULL DEFAULT 0,
  `is_active`      TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `idx_torneo` (`torneo_id`),
  KEY `idx_torneo_cat` (`torneo_id`, `categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;