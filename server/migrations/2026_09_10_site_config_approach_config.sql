-- ---------------------------------------------------------------------------
-- Approach Clasificados: configuración por dominio
-- Guarda si el reporte "Clasificados de Approach" se publica en /competicion
-- y en qué orden (ascendente/descendente por distancia).
-- Ejecutar en MySQL (IONOS) una sola vez.
-- ---------------------------------------------------------------------------
ALTER TABLE site_config
  ADD COLUMN approach_config TEXT DEFAULT NULL
  COMMENT 'JSON: { enabled: bool, orden: "asc"|"desc", title: string }';
