-- ===========================================================================
-- categorias.sistemaprev — Sistema previo al Match Play
-- ---------------------------------------------------------------------------
-- Categorías que arrancan en STROKE PLAY o STABLEFORD y, tras el corte, se
-- cambian a MATCH PLAY. Esta columna FIJA cuál era el sistema de la fase de
-- clasificación, para que /resultados y la tarjeta del jugador muestren ese
-- sistema (encabezados, puntos Stableford, orden de posiciones) en lugar de
-- adivinarlo.
--
-- Valores esperados: 'STROKE PLAY' | 'STABLEFORD' | NULL/'' (auto-detectar).
-- ===========================================================================
ALTER TABLE `categorias`
  ADD COLUMN IF NOT EXISTS `sistemaprev` VARCHAR(20) NULL;
