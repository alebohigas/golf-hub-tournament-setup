-- Maquetación de impresión de tarjetas (Admin > Tarjetas):
-- { "sistema": "auto|stroke|stableford", "headerMm": 30, "marginMm": 8, "scale": 100 }
ALTER TABLE site_config
  ADD COLUMN tarjetas_config TEXT DEFAULT NULL
  COMMENT 'JSON object with Admin > Tarjetas print layout config';
