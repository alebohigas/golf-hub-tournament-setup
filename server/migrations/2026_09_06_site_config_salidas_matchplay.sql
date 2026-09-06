-- ---------------------------------------------------------------
-- site_config.salidas_matchplay_config
-- Enfrentamientos manuales de MATCH PLAY definidos en
-- Admin > ALIEN SYSTEM > Match Play. Estructura JSON:
--   { "byCaljgoid": { "1234": { "enabled": true,
--                               "groups": { "987": ["JUG A","JUG B"] } } } }
-- Con esto la página pública de Salidas muestra "VS" y el separador por
-- match sin depender de `elimin_salidas_cat` ni de reportes externos.
--
-- Idempotente: site_config.php crea la columna sola si no existe, este
-- script sirve para hostings sin privilegios ALTER en tiempo de ejecución.
-- ---------------------------------------------------------------
ALTER TABLE site_config
  ADD COLUMN salidas_matchplay_config TEXT DEFAULT NULL
  COMMENT 'JSON object with manual MATCH PLAY pairings per caljuego';
