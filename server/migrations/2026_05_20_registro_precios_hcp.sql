-- ===========================================================================
-- registro_precios — añadir filtros por rango de handicap
-- ---------------------------------------------------------------------------
-- Permite que una regla de precio aplique sólo a un rango de handicap
-- (ej. categoría AAA = hcp -6..5, A = 6..14, B = 15..24…). NULL = comodín.
-- ===========================================================================
ALTER TABLE `registro_precios`
  ADD COLUMN IF NOT EXISTS `hcp_min` DECIMAL(4,1) NULL AFTER `edad_max`,
  ADD COLUMN IF NOT EXISTS `hcp_max` DECIMAL(4,1) NULL AFTER `hcp_min`;

-- (Compatibilidad) Añadir columna reg_edad a registro si aún no existe.
-- El admin puede activarla como campo del formulario; se autocompleta de
-- la fecha de nacimiento o el jugador la captura manualmente.
ALTER TABLE `registro`
  ADD COLUMN IF NOT EXISTS `reg_edad` INT(11) NULL AFTER `reg_fechanac`;